import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json()
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const apiKey = ''
    if (!apiKey) {
      return NextResponse.json(
        { error: 'WAVESPEED_API_KEY not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.wavespeed.ai/api/v3/predictions/${taskId}/result`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { 
          error: `API Error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      data: result,
      imageUrl: result?.data?.outputs?.[0] || null,
      isProcessing: !result?.data?.outputs?.length
    })

  } catch (error) {
    console.error('Nanobanana fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Nanobanana API endpoint - use POST with taskId' },
    { status: 200 }
  )
}
