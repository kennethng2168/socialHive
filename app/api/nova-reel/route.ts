import { NextRequest, NextResponse } from 'next/server';

// FastAPI MCP Server URL
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'http://localhost:8000';

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
    
    // Validate duration
    if (isNaN(durationSeconds) || durationSeconds < 6 || durationSeconds > 120 || durationSeconds % 6 !== 0) {
      return NextResponse.json(
        { error: 'Duration must be between 6 and 120 seconds in 6-second increments' },
        { status: 400 }
      );
    }

    console.log('Generating video with Amazon Nova Reel via FastAPI MCP Server...');
    console.log('FastAPI URL:', FASTAPI_SERVER_URL);

    // Determine if this is image-to-video or text-to-video
    if (imageFile) {
      // Image-to-video
      console.log('Image-to-video generation...');
      
      // Convert image to base64
      const imageBase64 = await fileToBase64(imageFile);

      const response = await fetch(`${FASTAPI_SERVER_URL}/nova/reel/text-to-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || "Generate a video from this image",
          input_image_base64: imageBase64,
          duration: durationSeconds,
          dimension: resolution,
          seed: seed ? parseInt(seed) : undefined,
          upload_to_s3: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('FastAPI error:', errorData);
        return NextResponse.json(
          {
            error: 'Video generation failed',
            details: errorData.detail || errorData.error || 'Unknown error'
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Return job info
      return NextResponse.json({
        success: true,
        async: true,
        jobId: data.job_id,
        invocationArn: data.invocation_arn,
        s3Location: data.s3_location,
        estimatedTime: data.estimated_time,
        statusEndpoint: '/api/nova-reel/status',
        metadata: {
          model: 'amazon.nova-reel-v1:1',
          duration: `${durationSeconds}s`,
          resolution,
          timestamp: new Date().toISOString(),
          source: 'fastapi-mcp-server',
          hasImage: true
        }
      });

    } else {
      // Text-to-video
      console.log('Text-to-video generation...');

      const response = await fetch(`${FASTAPI_SERVER_URL}/nova/reel/text-to-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: durationSeconds,
          dimension: resolution,
          seed: seed ? parseInt(seed) : undefined,
          upload_to_s3: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('FastAPI error:', errorData);
        return NextResponse.json(
          {
            error: 'Video generation failed',
            details: errorData.detail || errorData.error || 'Unknown error'
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Return job info
      return NextResponse.json({
        success: true,
        async: true,
        jobId: data.job_id,
        invocationArn: data.invocation_arn,
        s3Location: data.s3_location,
        estimatedTime: data.estimated_time,
        statusEndpoint: '/api/nova-reel/status',
        metadata: {
          model: 'amazon.nova-reel-v1:1',
          duration: `${durationSeconds}s`,
          resolution,
          timestamp: new Date().toISOString(),
          source: 'fastapi-mcp-server',
          hasImage: false
        }
      });
    }

  } catch (error: any) {
    console.error('Nova Reel API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate video',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_SERVER_URL}/nova/info`);
    const data = await response.json();
    
    return NextResponse.json({
      status: 'Amazon Nova Reel API endpoint',
      model: 'amazon.nova-reel-v1:1',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: response.ok,
      method: 'FastAPI Proxy'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Amazon Nova Reel API endpoint',
      model: 'amazon.nova-reel-v1:1',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: false,
      error: 'Cannot connect to FastAPI server'
    });
  }
}
