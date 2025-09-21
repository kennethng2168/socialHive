import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lyrics_prompt, prompt, enable_sync_mode = false } = await request.json();

    if (!lyrics_prompt || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: lyrics_prompt and prompt are required' },
        { status: 400 }
      );
    }

    const api_key = process.env.WAVESPEED_API_KEY;
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    if (isDemo) {
      console.log('Demo mode: Simulating music generation...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds delay
      return NextResponse.json({
        success: true,
        musicUrl: '/music/demo-generated-track.mp3', // Placeholder for demo
        taskId: `demo_music_${Date.now()}`,
        metadata: { 
          lyrics_prompt, 
          prompt,
          title: "Generated Track",
          artist: "AI Composer",
          duration: "3:30"
        }
      });
    }

    const apiUrl = 'https://api.wavespeed.ai/api/v3/minimax/music-v1.5';

    const requestPayload = {
      enable_sync_mode,
      lyrics_prompt,
      prompt
    };

    console.log('Making music generation request to WaveSpeed AI...');
    console.log('Request payload:', requestPayload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WaveSpeed AI Music Generation API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Music generation failed', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('WaveSpeed API music generation response:', result);

    if (result.code === 200 && result.data) {
      const taskId = result.data.id;
      const outputs = result.data.outputs || [];
      const status = result.data.status;

      if (status === 'completed' && outputs.length > 0) {
        return NextResponse.json({
          success: true,
          musicUrl: outputs[0],
          taskId: taskId,
          metadata: { 
            lyrics_prompt, 
            prompt,
            title: "Generated Track",
            artist: "AI Composer",
            duration: "3:30"
          }
        });
      } else if (status === 'created' || status === 'processing') {
        return NextResponse.json({
          success: true,
          taskId: taskId,
          musicUrl: null,
          status: status,
          message: 'Music generation in progress. Use the task ID to check status.',
          metadata: { lyrics_prompt, prompt }
        });
      } else if (status === 'failed') {
        return NextResponse.json(
          { error: 'Music generation failed', details: result.data.error || 'Unknown error', taskId: taskId },
          { status: 500 }
        );
      } else {
        return NextResponse.json({
          success: true,
          taskId: taskId,
          musicUrl: outputs[0] || null,
          status: status,
          metadata: { lyrics_prompt, prompt }
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format from WaveSpeed AI Music API', details: result.message || 'No data field in response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Music Generation API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}