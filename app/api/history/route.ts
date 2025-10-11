import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// API to fetch history of generated images and videos

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'image', 'video', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get S3 bucket
    const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_VIDEO_BUCKET;
    
    if (!s3Bucket) {
      return NextResponse.json(
        { 
          error: 'S3 bucket not configured',
          details: 'History feature requires S3 bucket configuration'
        },
        { status: 500 }
      );
    }

    // Get AWS credentials
    const region = process.env.AWS_REGION || 'us-east-1';
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured'
        },
        { status: 500 }
      );
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      }
    });

    const items: any[] = [];

    // Fetch images if requested
    if (type === 'image' || type === 'all' || !type) {
      console.log('Fetching image history from S3...');
      
      const imageCommand = new ListObjectsV2Command({
        Bucket: s3Bucket,
        Prefix: 'nova-canvas-images/',
        MaxKeys: limit
      });

      const imageResponse = await s3Client.send(imageCommand);

      if (imageResponse.Contents && imageResponse.Contents.length > 0) {
        for (const obj of imageResponse.Contents) {
          if (obj.Key && obj.Key.endsWith('.png')) {
            try {
              // Get metadata
              const headCommand = new HeadObjectCommand({
                Bucket: s3Bucket,
                Key: obj.Key
              });
              const headResponse = await s3Client.send(headCommand);

              // Generate presigned URL
              const url = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                  Bucket: s3Bucket,
                  Key: obj.Key
                }),
                { expiresIn: 604800 } // 7 days
              );

              items.push({
                type: 'image',
                url: url,
                s3Key: obj.Key,
                s3Url: `s3://${s3Bucket}/${obj.Key}`,
                size: obj.Size,
                lastModified: obj.LastModified,
                timestamp: headResponse.Metadata?.timestamp || obj.LastModified?.getTime(),
                metadata: {
                  prompt: headResponse.Metadata?.prompt || 'No prompt available',
                  resolution: headResponse.Metadata?.resolution || 'Unknown',
                  seed: headResponse.Metadata?.seed,
                  model: headResponse.Metadata?.model || 'amazon-nova-canvas'
                }
              });
            } catch (err) {
              console.error(`Error processing ${obj.Key}:`, err);
            }
          }
        }
      }
    }

    // Fetch videos if requested
    if (type === 'video' || type === 'all' || !type) {
      console.log('Fetching video history from S3...');
      
      const videoCommand = new ListObjectsV2Command({
        Bucket: s3Bucket,
        Prefix: 'nova-reel-videos/',
        MaxKeys: limit
      });

      const videoResponse = await s3Client.send(videoCommand);

      if (videoResponse.Contents && videoResponse.Contents.length > 0) {
        // Group files by job ID
        const jobGroups: { [key: string]: any } = {};

        for (const obj of videoResponse.Contents) {
          if (obj.Key && obj.Key.endsWith('output.mp4')) {
            // Extract job ID from path: nova-reel-videos/{jobId}/output.mp4
            const match = obj.Key.match(/nova-reel-videos\/([^\/]+)\/output\.mp4/);
            if (match) {
              const jobId = match[1];
              
              try {
                // Get metadata from status file
                let metadata: any = {};
                try {
                  const statusKey = `nova-reel-videos/${jobId}/video-generation-status.json`;
                  const headCommand = new HeadObjectCommand({
                    Bucket: s3Bucket,
                    Key: obj.Key
                  });
                  const headResponse = await s3Client.send(headCommand);
                  metadata = headResponse.Metadata || {};
                } catch (err) {
                  // Status file might not exist
                }

                // Generate presigned URL for main video
                const url = await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: s3Bucket,
                    Key: obj.Key
                  }),
                  { expiresIn: 604800 } // 7 days
                );

                items.push({
                  type: 'video',
                  url: url,
                  s3Key: obj.Key,
                  s3Url: `s3://${s3Bucket}/${obj.Key}`,
                  size: obj.Size,
                  lastModified: obj.LastModified,
                  timestamp: obj.LastModified?.getTime(),
                  jobId: jobId,
                  metadata: {
                    prompt: metadata.prompt || 'No prompt available',
                    resolution: metadata.resolution || '1280x720',
                    duration: metadata.duration,
                    model: 'amazon-nova-reel'
                  }
                });
              } catch (err) {
                console.error(`Error processing video ${obj.Key}:`, err);
              }
            }
          }
        }
      }
    }

    // Sort by timestamp (newest first)
    items.sort((a, b) => {
      const timeA = a.timestamp || a.lastModified?.getTime() || 0;
      const timeB = b.timestamp || b.lastModified?.getTime() || 0;
      return timeB - timeA;
    });

    // Limit results
    const limitedItems = items.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: limitedItems.length,
      items: limitedItems,
      s3Bucket: s3Bucket
    });

  } catch (error: any) {
    console.error('History fetch error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch history',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}
