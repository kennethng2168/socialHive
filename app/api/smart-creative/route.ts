import { NextRequest, NextResponse } from 'next/server';

/**
 * Smart Creative Agent API
 * 
 * This endpoint proxies requests to the external AI agent server that provides:
 * - Image Generation
 * - Video Generation  
 * - Copywriting
 * - Hybrid content creation
 * 
 * The agent intelligently understands user intent and generates appropriate content.
 */

const SMART_CREATIVE_API_URL = 'http://43.216.73.223';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const prompt = formData.get('prompt') as string;
    const target_language = formData.get('target_language') as string || 'en';
    const s3_bucket = formData.get('s3_bucket') as string | null;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Smart Creative Agent Request:', {
      prompt: prompt.substring(0, 100),
      has_file: !!file,
      target_language,
      s3_bucket
    });

    // Prepare FormData for external API
    const externalFormData = new FormData();
    externalFormData.append('prompt', prompt.trim());
    externalFormData.append('target_language', target_language);
    
    if (s3_bucket) {
      externalFormData.append('s3_bucket', s3_bucket);
    }
    
    if (file) {
      externalFormData.append('file', file);
    }

    // Call external smart creative agent API
    const response = await fetch(`${SMART_CREATIVE_API_URL}/agent/smart-creative`, {
      method: 'POST',
      body: externalFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Smart Creative API error:', response.status, errorText);
      
      // Handle specific error codes
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Content blocked by guardrails',
            details: errorText,
            status: 403
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Smart Creative API error',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Smart Creative API response:', {
      success: result.success,
      intent: result.intent,
      has_image: !!result.assets?.image,
      has_video: !!result.assets?.video,
      has_copywriting: !!result.assets?.copywriting
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Smart Creative Agent error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Smart Creative API unavailable',
          details: 'Cannot connect to AI agent server',
          message: 'The AI agent service is currently unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if external API is available
    const response = await fetch(`${SMART_CREATIVE_API_URL}/healthz`, {
      method: 'GET',
    });
    
    const isHealthy = response.ok;
    
    return NextResponse.json({
      status: 'Smart Creative Agent API',
      endpoint: '/agent/smart-creative',
      external_api: SMART_CREATIVE_API_URL,
      external_api_healthy: isHealthy,
      features: [
        'Image Generation (Amazon Nova Canvas)',
        'Video Generation (Amazon Nova Reel)',
        'Copywriting (AWS Bedrock)',
        'Hybrid Content Creation',
        'Multi-language Support',
        'AWS Guardrails Protection'
      ],
      supported_intents: [
        'generate_image',
        'generate_copy',
        'generate_video',
        'hybrid'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Smart Creative Agent API',
      external_api: SMART_CREATIVE_API_URL,
      external_api_healthy: false,
      error: 'External API unavailable'
    });
  }
}

