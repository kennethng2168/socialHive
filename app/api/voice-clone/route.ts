import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;
    const voiceName = formData.get('voice_name') as string || 'cloned_voice';
    const language = formData.get('language') as string || 'en';

    // Validate required fields
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required for voice cloning' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for voice synthesis' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = '';
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI voice cloning request');

    // For demo purposes, simulate API response if no API key is provided
    if (isDemo) {
      console.log('Demo mode: Simulating voice cloning...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      
      // Return demo audio URL
      return NextResponse.json({
        success: true,
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio
        taskId: `demo_voice_clone_${Date.now()}`,
        metadata: {
          originalAudio: audioFile.name,
          text,
          voiceName,
          language
        }
      });
    }

    // Prepare the request payload for Minimax Voice Clone API
    const audioBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    const requestPayload = {
      audio: `data:${audioFile.type};base64,${base64Audio}`,
      text: text,
      voice_name: voiceName,
      language: language
    };

    console.log('Making request to Minimax Voice Clone API');

    const response = await fetch('https://api.wavespeed.ai/api/v3/minimax/voice-clone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WaveSpeedAI Voice Clone API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'WaveSpeedAI voice cloning service error',
          details: `HTTP ${response.status}: ${errorText}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('WaveSpeed API voice clone response:', result);
    
    // Handle WaveSpeed AI v3 API response format
    if (result.code === 200 && result.data) {
      const taskId = result.data.id;
      const outputs = result.data.outputs || [];
      const status = result.data.status;
      
      // If the task is completed immediately
      if (status === 'completed' && outputs.length > 0) {
        return NextResponse.json({
          success: true,
          audioUrl: outputs[0],
          taskId: taskId,
          metadata: {
            originalAudio: audioFile.name,
            text,
            voiceName,
            language
          }
        });
      } 
      // If the task is created/processing, return task ID for polling
      else if (status === 'created' || status === 'processing') {
        return NextResponse.json({
          success: true,
          taskId: taskId,
          audioUrl: null,
          status: status,
          message: 'Voice cloning in progress. This may take a few minutes.',
          metadata: {
            originalAudio: audioFile.name,
            text,
            voiceName,
            language
          }
        });
      }
      // If task failed
      else if (status === 'failed') {
        return NextResponse.json(
          { 
            error: 'Voice cloning failed', 
            details: result.data.error || 'Unknown error',
            taskId: taskId 
          },
          { status: 500 }
        );
      }
      else {
        // Fallback for other statuses
        return NextResponse.json({
          success: true,
          taskId: taskId,
          audioUrl: outputs[0] || null,
          status: status,
          metadata: {
            originalAudio: audioFile.name,
            text,
            voiceName,
            language
          }
        });
      }
    } else {
      return NextResponse.json(
        { 
          error: 'Unexpected response format from WaveSpeedAI',
          details: result.message || 'No data field in response'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('WaveSpeedAI voice cloning error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout. Voice cloning is taking too long. Please try again.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process voice cloning request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}