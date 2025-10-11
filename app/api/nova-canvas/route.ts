import { NextRequest, NextResponse } from 'next/server';

// FastAPI MCP Server URL
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'http://localhost:8000';

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

    console.log('Generating image with Amazon Nova Canvas via FastAPI MCP Server...');
    console.log('FastAPI URL:', FASTAPI_SERVER_URL);

    // Call FastAPI server (no timeout - wait until completion)
    const response = await fetch(`${FASTAPI_SERVER_URL}/nova/canvas/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        negative_prompt: negative_prompt || undefined,
        width,
        height,
        seed: seed ? parseInt(seed.toString()) : undefined,
        number_of_images: parseInt(num_images.toString()) || 1,
        upload_to_s3: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('FastAPI error:', errorData);
      return NextResponse.json(
        {
          error: 'Image generation failed',
          details: errorData.detail || errorData.error || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Image generation failed' },
        { status: 500 }
      );
    }

    // Format response
    const images = data.images.map((img: any) => ({
      url: img.url || img.s3_key,
      base64: img.base64,
      s3_key: img.s3_key
    }));

    // Get the primary image URL (try S3 first, then direct URL, then base64)
    const primaryImageUrl = (data.s3_urls && data.s3_urls.length > 0) 
      ? data.s3_urls[0] 
      : images[0].url || images[0].base64;

    return NextResponse.json({
      success: true,
      imageUrl: primaryImageUrl,
      s3Url: (data.s3_urls && data.s3_urls.length > 0) ? data.s3_urls[0] : null, // Add s3Url field
      images: images,
      s3_urls: data.s3_urls,
      seed: data.seed,
      metadata: {
        model: 'amazon.nova-canvas-v1:0',
        prompt: prompt,
        resolution: `${width}x${height}`,
        seed: data.seed,
        numberOfImages: images.length,
        timestamp: new Date().toISOString(),
        source: 'fastapi-mcp-server',
        s3Upload: data.s3_urls && data.s3_urls.length > 0 ? {
          success: true,
          enabled: true
        } : {
          success: false,
          enabled: false
        }
      }
    });

  } catch (error: any) {
    console.error('Nova Canvas API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
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
      status: 'Amazon Nova Canvas API endpoint',
      model: 'amazon.nova-canvas-v1:0',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: response.ok,
      method: 'FastAPI Proxy'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Amazon Nova Canvas API endpoint',
      model: 'amazon.nova-canvas-v1:0',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: false,
      error: 'Cannot connect to FastAPI server'
    });
  }
}
