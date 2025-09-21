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
    if (!api_key) {
      return NextResponse.json(
        { error: 'WaveSpeedAI API key not configured. Please set WAVESPEED_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    console.log('Making WaveSpeedAI video request with model:', model);

    // For demo purposes, simulate API response if no API key is provided
    if (api_key === 'your_wavespeed_api_key_here' || !api_key) {
      console.log('Demo mode: Simulating video generation...');
      
      // Simulate processing time based on model speed
      const delays = {
        'Ultra Fast': 5000,
        'Fast': 10000,
        'Standard': 15000,
        'Pro': 30000
      };
      
      await new Promise(resolve => setTimeout(resolve, delays['Standard'] || 15000));
      
      return NextResponse.json({
        success: true,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`, // Demo video
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

    // Make request to WaveSpeedAI API
    // Based on WaveSpeedAI docs, the correct endpoint format is /v1/predictions
    // For video models, we need to convert FormData to JSON format
    const inputData: any = {};
    
    if (prompt) inputData.prompt = prompt;
    if (negative_prompt) inputData.negative_prompt = negative_prompt;
    inputData.resolution = resolution;
    inputData.duration = duration;
    if (seed) inputData.seed = parseInt(seed);
    
    // For image-to-video, we need to handle the image file
    if (imageFile) {
      // Convert image to base64 for API
      const imageBuffer = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      inputData.image = `data:${imageFile.type};base64,${base64Image}`;
    }

    const response = await fetch('https://api.wavespeed.ai/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: model, // Model ID goes in version field
        input: inputData // Parameters go in input field
      })
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
    
    // Check if the response contains video data
    if (result.output && result.output.length > 0) {
      return NextResponse.json({
        success: true,
        videoUrl: result.output[0], // WaveSpeedAI typically returns array of URLs
        taskId: result.id,
        metadata: {
          model,
          prompt,
          resolution,
          duration,
          seed: seed ? parseInt(seed) : undefined
        }
      });
    } else if (result.id) {
      // If it's a task ID, we might need to poll for results
      return NextResponse.json({
        success: true,
        taskId: result.id,
        videoUrl: result.output?.[0] || null,
        metadata: {
          model,
          prompt,
          resolution,
          duration,
          seed: seed ? parseInt(seed) : undefined
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format from WaveSpeedAI' },
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
