import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, StartAsyncInvokeCommand, GetAsyncInvokeCommand } from '@aws-sdk/client-bedrock-runtime';

// Amazon Nova Reel API Integration
// Direct AWS SDK calls to Amazon Bedrock
// Text-to-Video and Image-to-Video Generation
// ALL video generation uses async invocation (AWS requirement)

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const prompt = formData.get('prompt') as string;
    const duration = formData.get('duration') as string || '6s';
    const resolution = formData.get('resolution') as string || '1280x720';
    const seed = formData.get('seed') as string;
    const imageFile = formData.get('image') as File;

    // Validate required fields
    if (!prompt && !imageFile) {
      return NextResponse.json(
        { error: 'Either prompt or image is required' },
        { status: 400 }
      );
    }

    // Parse duration (remove 's' suffix if present)
    const durationSeconds = parseInt(duration.replace('s', ''));
    
    // Validate duration: must be 6 or a multiple of 6, between 6 and 120 seconds
    if (isNaN(durationSeconds)) {
      return NextResponse.json(
        { error: 'Invalid duration format' },
        { status: 400 }
      );
    }
    
    if (durationSeconds < 6 || durationSeconds > 120) {
      return NextResponse.json(
        { error: 'Duration must be between 6 and 120 seconds' },
        { status: 400 }
      );
    }
    
    if (durationSeconds % 6 !== 0) {
      return NextResponse.json(
        { error: 'Duration must be a multiple of 6 seconds (6, 12, 18, 24, ..., 120)' },
        { status: 400 }
      );
    }

    // Parse resolution
    const [width, height] = resolution.split('x').map(Number);
    if (!width || !height) {
      return NextResponse.json(
        { error: 'Invalid resolution format. Use format like "1280x720"' },
        { status: 400 }
      );
    }

    console.log('Generating video with Amazon Nova Reel via AWS Bedrock...');

    // Check if AWS credentials are configured
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error('AWS credentials not configured');
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured',
          details: 'Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment variables. See AWS_SETUP_GUIDE.md for instructions.'
        },
        { status: 500 }
      );
    }

    // Initialize AWS Bedrock Runtime client
    const region = process.env.AWS_REGION || 'us-east-1';
    const client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      }
    });

    // Prepare request body for Amazon Nova Reel
    const randomSeed = seed ? parseInt(seed) : Math.floor(Math.random() * 1000000);
    let requestBody: any;

    // For single 6-second shot, use TEXT_VIDEO or IMAGE_VIDEO
    if (durationSeconds === 6) {
      requestBody = {
        taskType: imageFile ? "IMAGE_VIDEO" : "TEXT_VIDEO",
        videoGenerationConfig: {
          durationSeconds: 6,
          fps: 24,
          dimension: `${width}x${height}`,
          seed: randomSeed,
        }
      };

      // If image is provided, convert to base64 and add to request
      if (imageFile) {
        console.log('Converting image to base64 for image-to-video...');
        const base64Image = await fileToBase64(imageFile);
        const imageFormat = imageFile.type.split('/')[1] || 'png';
        
        requestBody.imageToVideoParams = {
          images: [{
            format: imageFormat,
            source: {
              bytes: base64Image
            }
          }],
          text: prompt || "Generate a video from this image"
        };
      } else {
        // Text-to-Video
        requestBody.textToVideoParams = {
          text: prompt
        };
      }
    } else {
      // For multi-shot videos (12-120 seconds), use MULTI_SHOT_AUTOMATED
      requestBody = {
        taskType: "MULTI_SHOT_AUTOMATED",
        multiShotAutomatedParams: {
          text: prompt || "Generate a video"
        },
        videoGenerationConfig: {
          durationSeconds: durationSeconds,
          fps: 24,
          dimension: `${width}x${height}`,
          seed: randomSeed,
        }
      };

      // Note: MULTI_SHOT_AUTOMATED does not support input images
      if (imageFile) {
        return NextResponse.json(
          { 
            error: 'Image-to-video is only supported for 6-second videos. For longer videos, use text-only prompts.',
            details: 'Multi-shot videos (12-120 seconds) currently only support text-to-video generation.'
          },
          { status: 400 }
        );
      }
    }

    console.log('Request parameters:', {
      model: 'amazon.nova-reel-v1:0',
      taskType: requestBody.taskType,
      prompt: (prompt || 'Image to video').substring(0, 50) + '...',
      duration: durationSeconds,
      resolution: `${width}x${height}`,
      seed: randomSeed,
      has_image: !!imageFile
    });

    // Get S3 bucket from environment or use default
    // ALL Nova Reel videos require async invocation and S3 storage
    const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_VIDEO_BUCKET;
    
    if (!s3Bucket) {
      return NextResponse.json(
        { 
          error: 'S3 bucket not configured',
        details: 'Nova Reel video generation requires an S3 bucket. Please set S3_BUCKET or AWS_S3_VIDEO_BUCKET in your environment variables.',
        requiredEnvVar: 'S3_BUCKET',
          setupGuide: 'See S3_SETUP_GUIDE.md for instructions'
        },
        { status: 500 }
      );
    }

    // Start async invocation (required for ALL Nova Reel videos)
    console.log('Starting async invocation for Nova Reel video generation');
    const asyncCommand = new StartAsyncInvokeCommand({
      modelId: 'amazon.nova-reel-v1:1',
      modelInput: requestBody,
      outputDataConfig: {
        s3OutputDataConfig: {
          s3Uri: `s3://${s3Bucket}/nova-reel-videos/` // Trailing slash required!
        }
      }
    });

    const asyncResponse = await client.send(asyncCommand);
    const invocationArn = asyncResponse.invocationArn!;
    const jobId = invocationArn.split('/').pop();

    console.log('Async video generation job started:', jobId);

    // Estimate completion time based on duration
    let estimatedTime;
    if (durationSeconds === 6) {
      estimatedTime = '90 seconds';
    } else if (durationSeconds <= 30) {
      estimatedTime = '3-5 minutes';
    } else if (durationSeconds <= 60) {
      estimatedTime = '7-9 minutes';
    } else {
      estimatedTime = '14-17 minutes';
    }

    // Return job information immediately
    return NextResponse.json({
      success: true,
      async: true,
      jobId: jobId,
      invocationArn: invocationArn,
      s3Location: `s3://${s3Bucket}/nova-reel-videos/${jobId}/`,
      estimatedTime: estimatedTime,
      message: 'Video generation started. Polling for status...',
      metadata: {
        model: 'amazon-nova-reel',
        provider: 'Amazon Bedrock',
        prompt: (prompt || 'Generate video').substring(0, 100),
        resolution: `${width}x${height}`,
        duration: `${durationSeconds}s`,
        seed: randomSeed,
        taskType: requestBody.taskType,
        shots: Math.ceil(durationSeconds / 6)
      }
    });

  } catch (error: any) {
    console.error('Nova Reel API error:', error);

    // Handle AWS SDK errors
    if (error.name === 'UnrecognizedClientException') {
      return NextResponse.json(
        { 
          error: 'Invalid AWS credentials',
          details: 'The AWS credentials are invalid or malformed. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment variables.'
        },
        { status: 403 }
      );
    } else if (error.name === 'ValidationException') {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: error.message 
        },
        { status: 400 }
      );
    } else if (error.name === 'AccessDeniedException') {
      return NextResponse.json(
        { 
          error: 'AWS credentials error',
          details: 'Your AWS credentials do not have permission to access Bedrock. Please ensure the IAM user has bedrock:InvokeModel permission.'
        },
        { status: 403 }
      );
    } else if (error.name === 'ThrottlingException') {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    } else if (error.name === 'ModelTimeoutException') {
      return NextResponse.json(
        { 
          error: 'Model timeout',
          details: 'Video generation took too long. Please try again.'
        },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to generate video with Nova Reel',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}

// Health check endpoint
export async function GET() {
  const isConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  
  return NextResponse.json({
    status: 'Amazon Nova Reel API endpoint',
    model: 'amazon.nova-reel-v1:0',
    provider: 'Amazon Bedrock',
    features: [
      'Text-to-Video Generation',
      'Image-to-Video Conversion',
      'High Quality Output',
      'Customizable Duration (1s-10s)',
      'HD Resolution Support (up to 1280x720)',
      'Seed Control',
      '24 FPS'
    ],
    configured: isConfigured,
    region: process.env.AWS_REGION || 'us-east-1',
    method: 'AWS SDK Direct'
  });
}

