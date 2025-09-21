import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const model = formData.get('model') as string;
    const prompt = formData.get('prompt') as string;
    const negative_prompt = formData.get('negative_prompt') as string || "";
    const resolution = formData.get('resolution') as string || "1280x720";
    const duration = formData.get('duration') as string || "10s";
    const seed = formData.get('seed') as string;
    const imageFile = formData.get('image') as File;

    // Validate required fields based on model category
    const isImageToVideo = model.includes('i2v') || model.includes('image-to-video');
    
    if (!model) {
      return NextResponse.json(
        { error: 'Missing required field: model' },
        { status: 400 }
      );
    }

    if (!isImageToVideo && !prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt is required for text-to-video models' },
        { status: 400 }
      );
    }

    if (isImageToVideo && !imageFile) {
      return NextResponse.json(
        { error: 'Missing required field: image is required for image-to-video models' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = process.env.WAVESPEED_API_KEY;
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI video request with model:', model);

    // For demo purposes, simulate API response if no API key is provided
    if (isDemo) {
      console.log('Demo mode: Simulating video generation...');
      
      // Simulate processing time based on model name for realistic experience
      let delay = 15000; // Default 15 seconds
      if (model.includes('ultra-fast') || model.includes('turbo')) {
        delay = 5000; // 5 seconds for ultra fast
      } else if (model.includes('fast')) {
        delay = 8000; // 8 seconds for fast
      } else if (model.includes('pro') || model.includes('master') || model.includes('aleph')) {
        delay = 25000; // 25 seconds for pro/master models
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Use different demo videos based on model type for variety
      const demoVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
      ];
      
      const randomVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
      
      return NextResponse.json({
        success: true,
        videoUrl: randomVideo,
        taskId: `demo_video_${Date.now()}`,
        metadata: {
          model,
          prompt,
          resolution,
          duration,
          seed: seed ? parseInt(seed) : undefined
        }
      });
    }

    // Prepare data for WaveSpeedAI API in JSON format

    // Make request to WaveSpeedAI API using v3 endpoints
    // Use specific endpoints for different model providers
    let apiUrl = 'https://api.wavespeed.ai/v1/predictions'; // Default fallback
    
    // Use specific v3 endpoints based on model type - Updated for working models
    if (model === 'google-veo3-fast-image-to-video') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/veo3-fast/image-to-video';
    } else if (model === 'google-veo3-image-to-video') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/veo3/image-to-video';
    } else if (model === 'kwaivgi-kling-v2.1-i2v-pro') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/kwaivgi/kling-v2.1-i2v-pro';
    } else if (model === 'kwaivgi-kling-v2.1-i2v-standard') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/kwaivgi/kling-v2.1-i2v-standard';
    } else if (model === 'kwaivgi-kling-v2.1-t2v-master') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/kwaivgi/kling-v2.1-t2v-master';
    } else if (model === 'pixverse-pixverse-v5-t2v') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/pixverse/pixverse-v5-t2v';
    }

    // Prepare the request payload based on model-specific requirements
    let requestPayload: any = {};
    
    // Google Veo models - specific parameters from documentation
    if (model.startsWith('google-veo3')) {
      requestPayload = {
        prompt: prompt || "",
        aspect_ratio: "16:9", // Default aspect ratio for Veo3
        duration: "8", // Google Veo3 only supports 8 seconds (as string)
        resolution: resolution === "1080p" ? "1080p" : "720p", // Ensure valid resolution
        generate_audio: false
      };
      if (seed) requestPayload.seed = parseInt(seed);
      
      // For image-to-video models, add the image as URL or base64
      if (imageFile && model.includes('image-to-video')) {
        const imageBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        requestPayload.image = `data:${imageFile.type};base64,${base64Image}`;
      }
    }
    // Kwaivgi Kling models - specific parameters
    else if (model.startsWith('kwaivgi-kling')) {
      // Kling models only accept duration values "5" or "10" as strings
      const durationValue = duration?.replace('s', '') || '10';
      const validDuration = ['5', '10'].includes(durationValue) ? durationValue : '10';
      
      requestPayload = {
        prompt: prompt || "",
        duration: validDuration, // Must be "5" or "10" as string
        resolution: resolution,
        negative_prompt: negative_prompt || ""
      };
      if (seed) requestPayload.seed = parseInt(seed);
      
      // For image-to-video models
      if (imageFile && model.includes('i2v')) {
        const imageBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        requestPayload.image = `data:${imageFile.type};base64,${base64Image}`;
      }
    }
    // Pixverse models
    else if (model.startsWith('pixverse')) {
      requestPayload = {
        prompt: prompt || "",
        duration: parseInt(duration?.replace('s', '') || '10'),
        resolution: resolution,
        negative_prompt: negative_prompt || ""
      };
      if (seed) requestPayload.seed = parseInt(seed);
    }
    // Fallback for other models
    else {
      requestPayload = {
        prompt: prompt || "",
        enable_sync_mode: false,
        enable_base64_output: false,
        resolution: resolution,
        duration: duration,
        negative_prompt: negative_prompt || ""
      };
      if (seed) requestPayload.seed = parseInt(seed);
      
      if (imageFile) {
        const imageBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        requestPayload.image = base64Image;
      }
    }

    console.log('Making request to:', apiUrl);
    console.log('Request payload:', requestPayload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WaveSpeedAI API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'WaveSpeedAI service error',
          details: `HTTP ${response.status}: ${errorText}`,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('WaveSpeed API video response:', result);
    
    // Handle WaveSpeed AI v3 API response format
    if (result.code === 200 && result.data) {
      const taskId = result.data.id;
      const outputs = result.data.outputs || [];
      const status = result.data.status;
      
      // If the task is completed immediately (sync mode or fast processing)
      if (status === 'completed' && outputs.length > 0) {
        return NextResponse.json({
          success: true,
          videoUrl: outputs[0],
          taskId: taskId,
          metadata: {
            model,
            prompt,
            resolution,
            duration,
            seed: seed ? parseInt(seed) : undefined
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
          message: 'Video generation in progress. Use the task ID to check status.',
          metadata: {
            model,
            prompt,
            resolution,
            duration,
            seed: seed ? parseInt(seed) : undefined
          }
        });
      }
      // If task failed
      else if (status === 'failed') {
        return NextResponse.json(
          { 
            error: 'Video generation failed', 
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
            model,
            prompt,
            resolution,
            duration,
            seed: seed ? parseInt(seed) : undefined
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
    console.error('WaveSpeedAI video generation error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout. Video generation is taking too long. Please try again.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process video generation request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}
