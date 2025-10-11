import { NextRequest, NextResponse } from 'next/server';

// FastAPI MCP Server URL
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const prompt = formData.get('prompt') as string;
    const target_language = formData.get('target_language') as string || 'en';
    const s3_bucket = formData.get('s3_bucket') as string;
    const imageFile = formData.get('file') as File | null;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Smart Creative Agent: Processing request...');
    console.log('   Prompt:', prompt.substring(0, 60) + '...');
    console.log('   FastAPI URL:', FASTAPI_SERVER_URL);

    // Prepare FormData for FastAPI
    const fastapiFormData = new FormData();
    fastapiFormData.append('prompt', prompt);
    fastapiFormData.append('target_language', target_language);
    
    if (s3_bucket) {
      fastapiFormData.append('s3_bucket', s3_bucket);
    }
    
    if (imageFile) {
      fastapiFormData.append('file', imageFile);
    }

    // Call FastAPI server (no timeout - wait until completion)
    const response = await fetch(`${FASTAPI_SERVER_URL}/agent/smart-creative`, {
      method: 'POST',
      body: fastapiFormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('FastAPI error:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: 'Smart creative generation failed',
          details: errorData.detail || errorData.error || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Smart creative generation failed',
          details: data.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Return the result
    return NextResponse.json({
      success: true,
      intent: data.intent,
      assets: data.assets,
      s3_assets: data.s3_assets,
      user_prompt: prompt,
      timestamp: new Date().toISOString(),
      source: 'fastapi-smart-creative'
    });

  } catch (error: any) {
    console.error('Smart Creative API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate content',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_SERVER_URL}/healthz`);
    
    return NextResponse.json({
      status: 'Smart Creative API endpoint',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: response.ok,
      capabilities: [
        'Image Generation (Nova Canvas)',
        'Copywriting (Nova Pro)',
        'Video Generation (Nova Reel)',
        'Hybrid Multi-Asset Generation',
        'Natural Language Understanding'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Smart Creative API endpoint',
      provider: 'FastAPI MCP Server',
      server_url: FASTAPI_SERVER_URL,
      configured: false,
      error: 'Cannot connect to FastAPI server'
    });
  }
}
