import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Check status of async video generation jobs
// GET /api/nova-reel/status?invocationArn=arn:aws:bedrock:...

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invocationArn = searchParams.get('invocationArn');

    if (!invocationArn) {
      return NextResponse.json(
        { 
          error: 'invocationArn is required',
          details: 'Please provide the full invocation ARN from the video generation response'
        },
        { status: 400 }
      );
    }

    // Extract jobId from ARN for reference
    const jobId = invocationArn.split('/').pop();

    // Get AWS credentials
    const region = process.env.AWS_REGION || 'us-east-1';
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured',
          details: 'Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env.local file'
        },
        { status: 500 }
      );
    }

    // Initialize Bedrock client
    const bedrockClient = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      }
    });

    // Get job status using the full invocation ARN
    const command = new GetAsyncInvokeCommand({
      invocationArn: invocationArn
    });

    const response = await bedrockClient.send(command);
    
    const status = response.status; // "InProgress", "Completed", or "Failed"
    const submitTime = response.submitTime;
    const endTime = response.endTime;

    console.log(`Job ${jobId} status:`, status);

    // Calculate elapsed time
    let elapsedSeconds = 0;
    if (submitTime) {
      const now = endTime || new Date();
      elapsedSeconds = Math.floor((now.getTime() - submitTime.getTime()) / 1000);
    }

    // Base response
    const responseData: any = {
      jobId,
      status,
      submitTime: submitTime?.toISOString(),
      endTime: endTime?.toISOString(),
      elapsedSeconds,
      elapsedTime: `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`
    };

    // If completed, try to get the video URL from S3
    if (status === 'Completed') {
      const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_VIDEO_BUCKET;
      
      if (s3Bucket) {
        try {
          // Initialize S3 client
          const s3Client = new S3Client({
            region,
            credentials: {
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
            }
          });

          // Generate presigned URL for the output video
          const videoKey = `nova-reel-videos/${jobId}/output.mp4`;
          const s3Command = new GetObjectCommand({
            Bucket: s3Bucket,
            Key: videoKey
          });

          const videoUrl = await getSignedUrl(s3Client, s3Command, { expiresIn: 3600 }); // 1 hour expiry

          responseData.videoUrl = videoUrl;
          responseData.s3Location = `s3://${s3Bucket}/${videoKey}`;
          responseData.message = 'Video generation completed successfully';

          // Try to get individual shots
          const shots = [];
          for (let i = 1; i <= 20; i++) { // Max 20 shots for 120s video
            try {
              const shotKey = `nova-reel-videos/${jobId}/shot_${String(i).padStart(4, '0')}.mp4`;
              const shotCommand = new GetObjectCommand({
                Bucket: s3Bucket,
                Key: shotKey
              });
              const shotUrl = await getSignedUrl(s3Client, shotCommand, { expiresIn: 3600 });
              shots.push({
                shotNumber: i,
                url: shotUrl,
                s3Key: shotKey
              });
            } catch (err) {
              // No more shots available
              break;
            }
          }

          if (shots.length > 0) {
            responseData.shots = shots;
            responseData.totalShots = shots.length;
          }

        } catch (s3Error: any) {
          console.error('Error fetching video from S3:', s3Error);
          responseData.s3Error = s3Error.message;
          responseData.message = 'Video generated but could not retrieve from S3';
        }
      } else {
        responseData.message = 'Video completed but S3 bucket not configured';
      }
    } else if (status === 'InProgress') {
      responseData.message = 'Video generation in progress...';
    } else if (status === 'Failed') {
      responseData.message = 'Video generation failed';
      responseData.failureMessage = response.failureMessage;
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Status check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check job status',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}
