import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const videoFile = formData.get('video') as File;
    const targetLanguage = formData.get('target_language') as string;
    const voiceType = formData.get('voice_type') as string || 'male';

    // Validate required fields
    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = '';
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI video translation request');

    // For demo purposes, simulate API response if no API key is provided
    if (isDemo) {
      console.log('Demo mode: Simulating video translation...');
      
      // Simulate processing time based on video length
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
      
      // Return demo video
      return NextResponse.json({
        success: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        taskId: `demo_translate_${Date.now()}`,
        metadata: {
          originalVideo: videoFile.name,
          targetLanguage,
          voiceType
        }
      });
    }

    // Prepare the request payload for HeyGen Video Translate API
    const videoBuffer = await videoFile.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    
    const requestPayload = {
      video: `data:${videoFile.type};base64,${base64Video}`,
      target_language: targetLanguage,
      voice_type: voiceType
    };

    console.log('Making request to HeyGen Video Translate API');

    const response = await fetch('https://api.wavespeed.ai/api/v3/heygen/video-translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WaveSpeedAI Video Translate API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'WaveSpeedAI video translation service error',
          details: `HTTP ${response.status}: ${errorText}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('WaveSpeed API video translation response:', result);
    
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
            originalVideo: videoFile.name,
            targetLanguage,
            voiceType
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
          message: 'Video translation in progress. This may take several minutes.',
          metadata: {
            originalVideo: videoFile.name,
            targetLanguage,
            voiceType
          }
        });
      }
      // If task failed
      else if (status === 'failed') {
        return NextResponse.json(
          { 
            error: 'Video translation failed', 
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
            originalVideo: videoFile.name,
            targetLanguage,
            voiceType
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
    console.error('WaveSpeedAI video translation error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout. Video translation is taking too long. Please try again.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process video translation request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}