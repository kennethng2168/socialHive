import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      model,
      prompt,
      negative_prompt = "",
      resolution = "1024x1024", 
      aspect_ratio = "1:1",
      num_images = 1,
      seed
    } = body;

    // Validate required fields
    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: model and prompt are required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = process.env.WAVESPEED_API_KEY;
    if (!api_key) {
      return NextResponse.json(
        { error: 'WaveSpeedAI API key not configured. Please set WAVESPEED_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    console.log('Making WaveSpeedAI image request with model:', model);

    // For demo purposes, simulate API response if no API key is provided
    if (api_key === 'your_wavespeed_api_key_here' || !api_key) {
      console.log('Demo mode: Simulating image generation...');
      
      // Simulate processing time based on model speed
      const delays = {
        'Ultra Fast': 1000,
        'Fast': 2000,
        'Standard': 3000,
        'Pro': 5000
      };
      
      await new Promise(resolve => setTimeout(resolve, delays['Fast'] || 2000));
      
      return NextResponse.json({
        success: true,
        imageUrl: `https://picsum.photos/1024/1024?random=${Date.now()}`, // Demo placeholder
        taskId: `demo_${Date.now()}`,
        metadata: {
          model,
          prompt,
          resolution,
          seed
        }
      });
    }

    // Prepare data for WaveSpeedAI API
    const apiData: any = {
      prompt,
      resolution
    };

    if (negative_prompt) {
      apiData.negative_prompt = negative_prompt;
    }

    if (seed) {
      apiData.seed = parseInt(seed.toString());
    }

    // Make request to WaveSpeedAI API
    // Use the correct WaveSpeed AI v3 API endpoint based on the documentation
    let apiUrl = 'https://api.wavespeed.ai/v1/predictions'; // Default fallback
    
    // Use specific endpoints for Google models as per the API documentation
    if (model === 'google-nano-banana-text-to-image') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/nano-banana/text-to-image';
    } else if (model === 'google-imagen4') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/imagen4';
    } else if (model === 'google-imagen4-fast') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/imagen4-fast';
    } else if (model === 'google-imagen4-ultra') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/imagen4-ultra';
    } else if (model === 'google-imagen3') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/imagen3';
    } else if (model === 'google-imagen3-fast') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/imagen3-fast';
    }

    // Prepare the request payload based on the specific model requirements
    let requestPayload: any = {
      prompt,
      enable_sync_mode: false,
      enable_base64_output: false
    };

    // Google Imagen4 and variants - these support aspect_ratio, resolution, num_images, negative_prompt, seed
    if (model.startsWith('google-imagen4')) {
      requestPayload = {
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
        resolution: resolution || "1k", 
        num_images: num_images || 1,
        negative_prompt: negative_prompt || "",
        enable_base64_output: false
      };
      if (seed) requestPayload.seed = seed;
    }
    // Google Imagen3 and variants - similar to Imagen4 but may have different parameters
    else if (model.startsWith('google-imagen3')) {
      requestPayload = {
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
        resolution: resolution || "1k",
        num_images: num_images || 1,
        negative_prompt: negative_prompt || "",
        enable_base64_output: false
      };
      if (seed) requestPayload.seed = seed;
    }
    // Google Nano Banana - simpler parameters
    else if (model === 'google-nano-banana-text-to-image') {
      requestPayload = {
        prompt,
        output_format: "png",
        enable_sync_mode: false,
        enable_base64_output: false
      };
    }
    // Google Nano Banana Edit/Effects - for image editing
    else if (model.includes('nano-banana-edit') || model.includes('nano-banana-effects')) {
      requestPayload = {
        prompt,
        output_format: "png",
        enable_base64_output: false
      };
    }
    // Default fallback for other models
    else {
      requestPayload = {
        prompt,
        output_format: "png",
        enable_sync_mode: false,
        enable_base64_output: false
      };
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
    console.log('WaveSpeed API response:', result);
    
    // Handle WaveSpeed AI v3 API response format
    if (result.code === 200 && result.data) {
      const taskId = result.data.id;
      const outputs = result.data.outputs || [];
      const status = result.data.status;
      
      // If the task is completed immediately (sync mode or fast processing)
      if (status === 'completed' && outputs.length > 0) {
        return NextResponse.json({
          success: true,
          imageUrl: outputs[0],
          taskId: taskId,
          metadata: {
            model,
            prompt,
            resolution,
            seed
          }
        });
      } 
      // If the task is created/processing, return task ID for polling
      else if (status === 'created' || status === 'processing') {
        return NextResponse.json({
          success: true,
          taskId: taskId,
          imageUrl: null,
          status: status,
          message: 'Image generation in progress. Use the task ID to check status.',
          metadata: {
            model,
            prompt,
            resolution,
            seed
          }
        });
      }
      // If task failed
      else if (status === 'failed') {
        return NextResponse.json(
          { 
            error: 'Image generation failed', 
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
          imageUrl: outputs[0] || null,
          status: status,
          metadata: {
            model,
            prompt,
            resolution,
            seed
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
    console.error('WaveSpeedAI image generation error:', error);

    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Request timeout. Image generation is taking too long. Please try again.' },
        { status: 408 }
      );
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process image generation request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}
