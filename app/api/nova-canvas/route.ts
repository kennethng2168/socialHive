import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Amazon Nova Canvas API Integration
// Direct AWS SDK calls to Amazon Bedrock

export async function POST(request: NextRequest) {
  try {
    const { prompt, negative_prompt = "", resolution = "1024x1024", seed, num_images = 1 } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Parse resolution - handle both "1k"/"2k" format and "1024x1024" format
    let width: number;
    let height: number;

    if (resolution === "1k") {
      width = height = 1024;
    } else if (resolution === "2k") {
      width = height = 2048;
    } else if (resolution.includes('x')) {
      [width, height] = resolution.split('x').map(Number);
      if (!width || !height) {
        return NextResponse.json(
          { error: 'Invalid resolution format. Use format like "1024x1024" or "1k"/"2k"' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid resolution format. Use format like "1024x1024" or "1k"/"2k"' },
        { status: 400 }
      );
    }

    console.log('Generating image with Amazon Nova Canvas via AWS Bedrock...');

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

    // Prepare request body for Amazon Nova Canvas
    const requestBody = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt.trim(),
        ...(negative_prompt && { negativeText: negative_prompt }),
      },
      imageGenerationConfig: {
        numberOfImages: parseInt(num_images.toString()) || 1,
        quality: "premium",
        height: height,
        width: width,
        cfgScale: 7.5,
        seed: seed ? parseInt(seed.toString()) : Math.floor(Math.random() * 1000000),
      }
    };

    console.log('Request parameters:', {
      model: 'amazon.nova-canvas-v1:0',
      prompt: prompt.substring(0, 50) + '...',
      width,
      height,
      seed: requestBody.imageGenerationConfig.seed,
      numberOfImages: requestBody.imageGenerationConfig.numberOfImages
    });

    // Invoke the model
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-canvas-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await client.send(command);
    
    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Received response from AWS Bedrock');

    // Extract image from response
    if (!responseBody.images || responseBody.images.length === 0) {
      throw new Error('No images returned from Nova Canvas');
    }

    // Get the first image (base64 encoded)
    const base64Image = responseBody.images[0];
    const timestamp = Date.now();
    
    // Save to S3 for history/gallery
      const s3Bucket = process.env.S3_BUCKET || process.env.AWS_S3_VIDEO_BUCKET;
    let s3Url = null;
    let presignedUrl = null;
    
    if (s3Bucket) {
      try {
        console.log('Saving image to S3 for history...');
        const s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
          }
        });
        const imageKey = `nova-canvas-images/${timestamp}.png`;
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Image, 'base64');
        
        // Upload to S3 with metadata
        await s3Client.send(new PutObjectCommand({
          Bucket: s3Bucket,
          Key: imageKey,
          Body: imageBuffer,
          ContentType: 'image/png',
          Metadata: {
            prompt: prompt.substring(0, 200),
            resolution: `${width}x${height}`,
            seed: requestBody.imageGenerationConfig.seed.toString(),
            timestamp: timestamp.toString(),
            model: 'amazon-nova-canvas',
            type: 'image'
          }
        }));

        s3Url = `s3://${s3Bucket}/${imageKey}`;
        
        // Generate presigned URL (valid for 7 days)
        presignedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: s3Bucket,
            Key: imageKey
          }),
          { expiresIn: 604800 } // 7 days
        );
        
        console.log('✅ Image saved to S3:', s3Url);
      } catch (s3Error: any) {
        console.error('⚠️  Failed to save to S3 (non-critical):', s3Error.message);
        // Continue even if S3 upload fails
      }
    }

    // Return both base64 (for immediate display) and S3 URL (for history)
    const imageUrl = presignedUrl || `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      base64Image: `data:image/png;base64,${base64Image}`,
      s3Url: s3Url,
      presignedUrl: presignedUrl,
      taskId: `nova_canvas_${timestamp}`,
      metadata: {
        model: 'amazon-nova-canvas',
        provider: 'Amazon Bedrock',
        prompt,
        resolution: `${width}x${height}`,
        seed: requestBody.imageGenerationConfig.seed,
        num_images,
        storedInS3: !!s3Url,
        timestamp: Date.now()
      }
    });

  } catch (error: any) {
    console.error('Nova Canvas API error:', error);

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
          details: 'Image generation took too long. Please try again.'
        },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to generate image with Nova Canvas',
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
    status: 'Amazon Nova Canvas API endpoint',
    model: 'amazon.nova-canvas-v1:0',
    provider: 'Amazon Bedrock',
    features: [
      'Text-to-Image Generation',
      'High Quality Output',
      'Multiple Image Sizes (1K, 2K)',
      'Negative Prompts',
      'Seed Control',
      'Premium Quality'
    ],
    configured: isConfigured,
    region: process.env.AWS_REGION || 'us-east-1',
    method: 'AWS SDK Direct'
  });
}

