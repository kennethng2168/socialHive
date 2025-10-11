import { NextRequest, NextResponse } from 'next/server';

// FastAPI MCP Server URL
const FASTAPI_SERVER_URL = process.env.FASTAPI_SERVER_URL || 'https://awshackathon1.pagekite.me';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invocationArn = searchParams.get('invocationArn');

    if (!invocationArn) {
      return NextResponse.json(
        { error: 'invocationArn is required' },
        { status: 400 }
      );
    }

    console.log('Checking Nova Reel status via FastAPI MCP Server...');

    // Call FastAPI server to check status
    const response = await fetch(`${FASTAPI_SERVER_URL}/nova/reel/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invocation_arn: invocationArn
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('FastAPI error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to check video status',
          details: errorData.detail || errorData.error || 'Unknown error'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status,
      jobId: data.job_id,
      invocationArn: invocationArn,
      videoUrl: data.video_url,
      s3Location: data.s3_location,
      errorMessage: data.error_message,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check video status',
        details: error.message
      },
      { status: 500 }
    );
  }
}
