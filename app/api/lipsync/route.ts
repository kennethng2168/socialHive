import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const videoFile = formData.get('video') as File;
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;
    const mode = formData.get('mode') as string || 'audio'; // 'audio' or 'text'

    // Validate required fields
    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    if (mode === 'audio' && !audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required for audio mode' },
        { status: 400 }
      );
    }

    if (mode === 'text' && !text) {
      return NextResponse.json(
        { error: 'Text is required for text mode' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = process.env.WAVESPEED_API_KEY;
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI lipsync request');

    // For demo purposes, simulate API response if no API key is provided
    if (isDemo) {
      console.log('Demo mode: Simulating lipsync generation...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 8000)); // 8 seconds
      
      // Return demo video
      return NextResponse.json({
        success: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        taskId: `demo_lipsync_${Date.now()}`,
        metadata: {
          mode,
          originalVideo: videoFile.name,
          audio: audioFile?.name,
          text: text
        }
      });
    }

    // Prepare the request payload for Pixverse Lipsync API
    const requestPayload: any = {};
    
    // Convert files to base64
    const videoBuffer = await videoFile.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    requestPayload.video = `data:${videoFile.type};base64,${base64Video}`;

    if (mode === 'audio' && audioFile) {
      const audioBuffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      requestPayload.audio = `data:${audioFile.type};base64,${base64Audio}`;
    } else if (mode === 'text' && text) {
      requestPayload.text = text;
    }

    console.log('Making request to Pixverse Lipsync API');

    const response = await fetch('https://api.wavespeed.ai/api/v3/pixverse/lipsync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WaveSpeedAI Lipsync API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'WaveSpeedAI lipsync service error',
          details: `HTTP ${response.status}: ${errorText}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('WaveSpeed API lipsync response:', result);
    
    // Handle WaveSpeed AI v3 API response format
    if (result.code === 200 && result.data) {
      const taskId = result.data.id;
      const outputs = result.data.outputs || [];
      const status = result.data.status;
      
      // If the task is completed immediately
      if (status === 'completed' && outputs.length > 0) {
        return NextResponse.json({
          success: true,
          videoUrl: outputs[0],
          taskId: taskId,
          metadata: {
            mode,
            originalVideo: videoFile.name,
            audio: audioFile?.name,
            text: text
          }
        });
      } 
      // If the task is created/processing, return task ID for polling
      else if (status === 'created' || status === 'processing') {
        return NextResponse.json({
          success: true,
          taskId: taskId,
          videoUrl: null,
          status: status,
          message: 'Lipsync generation in progress. Use the task ID to check status.',
          metadata: {
            mode,
            originalVideo: videoFile.name,
            audio: audioFile?.name,
            text: text
          }
        });
      }
      // If task failed
      else if (status === 'failed') {
        return NextResponse.json(
          { 
            error: 'Lipsync generation failed', 
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
          videoUrl: outputs[0] || null,
          status: status,
          metadata: {
            mode,
            originalVideo: videoFile.name,
            audio: audioFile?.name,
            text: text
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
    console.error('WaveSpeedAI lipsync generation error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout. Lipsync generation is taking too long. Please try again.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process lipsync generation request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}