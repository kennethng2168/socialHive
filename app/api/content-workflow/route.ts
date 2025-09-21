import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      workflow_type = "complete",
      custom_parameters = {},
      user_id = "anonymous"
    } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Demo mode - simulate the multi-agent workflow
    const isDemo = true; // Set to false when Python backend is ready

    if (isDemo) {
      console.log('Demo mode: Simulating multi-agent content creation workflow...');
      
      // Simulate different processing times for each step
      const steps = [];
      const startTime = Date.now();
      
      // Step 1: Image Generation (2-3 seconds)
      steps.push({
        step: "image_generation",
        status: "processing",
        estimated_time: "2-3 seconds"
      });
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const imageAsset = {
        asset_id: `img_${Date.now()}`,
        asset_type: "image",
        url: `https://demo.socialhive.ai/generated-image-${Date.now()}.jpg`,
        metadata: {
          model: "google-imagen4",
          prompt: prompt,
          resolution: "1024x1024",
          generation_time: "2.3s"
        },
        created_at: new Date().toISOString(),
        created_by: "Image_Generation_Agent"
      };
      
      steps[0].status = "completed";
      steps[0].result = imageAsset;
      
      // Step 2: Video Generation (15-20 seconds) 
      if (workflow_type === "complete" || workflow_type === "image_to_video" || workflow_type === "music_video") {
        steps.push({
          step: "video_generation", 
          status: "processing",
          estimated_time: "15-20 seconds"
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
        
        const videoAsset = {
          asset_id: `vid_${Date.now()}`,
          asset_type: "video",
          url: `https://demo.socialhive.ai/generated-video-${Date.now()}.mp4`,
          metadata: {
            model: "google-veo3-image-to-video",
            prompt: prompt,
            duration: "8s",
            resolution: "1080p",
            source_image: imageAsset.url,
            generation_time: "15.2s"
          },
          created_at: new Date().toISOString(),
          created_by: "Video_Generation_Agent"
        };
        
        steps[1].status = "completed";
        steps[1].result = videoAsset;
      }
      
      // Step 3: Lipsync (10-12 seconds)
      if (workflow_type === "complete" || workflow_type === "music_video") {
        steps.push({
          step: "lipsync_generation",
          status: "processing", 
          estimated_time: "10-12 seconds"
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const lipsyncAsset = {
          asset_id: `lipsync_${Date.now()}`,
          asset_type: "video",
          url: `https://demo.socialhive.ai/lipsync-video-${Date.now()}.mp4`,
          metadata: {
            original_video: steps[1]?.result?.url || "previous_video.mp4",
            audio_source: "text_to_speech",
            text_content: "Hello! Welcome to our AI-generated content!",
            processing_time: "10.1s"
          },
          created_at: new Date().toISOString(),
          created_by: "Lipsync_Agent"
        };
        
        steps[2].status = "completed";
        steps[2].result = lipsyncAsset;
      }
      
      // Step 4: Music Generation (25-35 seconds)
      if (workflow_type === "complete" || workflow_type === "music_video") {
        steps.push({
          step: "music_generation",
          status: "processing",
          estimated_time: "25-35 seconds"
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const musicAsset = {
          asset_id: `music_${Date.now()}`,
          asset_type: "audio", 
          url: `https://demo.socialhive.ai/generated-music-${Date.now()}.mp3`,
          metadata: {
            lyrics_prompt: "upbeat, energetic, modern",
            style_prompt: "Upbeat background music for social media content",
            duration: "3:30",
            generation_time: "30.5s"
          },
          created_at: new Date().toISOString(),
          created_by: "Music_Generation_Agent"
        };
        
        const musicStepIndex = steps.length - 1;
        steps[musicStepIndex].status = "completed";
        steps[musicStepIndex].result = musicAsset;
      }
      
      // Calculate final results
      const totalProcessingTime = (Date.now() - startTime) / 1000;
      const successfulSteps = steps.filter(step => step.status === "completed").length;
      const successRate = successfulSteps / steps.length;
      
      const finalResult = {
        success: true,
        workflow_id: `workflow_${Date.now()}`,
        workflow_type: workflow_type,
        user_prompt: prompt,
        success_rate: successRate,
        completed_steps: steps.map(step => step.step),
        generated_assets: steps.reduce((assets, step) => {
          if (step.result) {
            const assetKey = step.result.asset_type === "video" && step.step === "lipsync_generation" 
              ? "lipsync_video" 
              : step.result.asset_type;
            assets[assetKey] = step.result.url;
          }
          return assets;
        }, {} as Record<string, string>),
        total_processing_time: totalProcessingTime,
        workflow_status: successRate > 0.5 ? "completed" : "partially_failed",
        step_details: steps,
        metadata: {
          user_id: user_id,
          timestamp: new Date().toISOString(),
          estimated_vs_actual: {
            estimated: getEstimatedTime(workflow_type),
            actual: totalProcessingTime
          }
        }
      };
      
      return NextResponse.json(finalResult);
    }
    
    // Real implementation - call the Python multi-agent system
    const pythonEndpoint = process.env.CONTENT_CREATION_ENDPOINT || 'http://127.0.0.1:8000';
    
    try {
      console.log('Calling Python backend at:', `${pythonEndpoint}/workflow/create`);
      
      const response = await fetch(`${pythonEndpoint}/workflow/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          workflow_type,
          custom_parameters,
          user_id
        })
      });

      if (!response.ok) {
        console.error('Python backend error:', response.status, response.statusText);
        
        // If Python backend is not available, fall back to demo mode
        if (response.status === 500 || !response.ok) {
          console.log('Python backend not available, falling back to demo mode...');
          // Fall through to demo mode below
        } else {
          const errorData = await response.text();
          return NextResponse.json({
            error: 'Python backend error',
            details: errorData,
            status: response.status
          }, { status: response.status });
        }
      } else {
        const result = await response.json();
        console.log('Python backend response received:', result.success);
        
        return NextResponse.json({
          ...result,
          backend: 'python_multi_agent',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to connect to Python backend:', error);
      console.log('Falling back to demo mode...');
      // Fall through to demo mode
    }

  } catch (error) {
    console.error('Content workflow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function getEstimatedTime(workflowType: string): number {
  const baseTimes = {
    image_generation: 3,
    video_generation: 15, 
    lipsync_generation: 10,
    music_generation: 30
  };
  
  switch (workflowType) {
    case "complete":
      return baseTimes.image_generation + baseTimes.video_generation + 
             baseTimes.lipsync_generation + baseTimes.music_generation;
    case "image_to_video":
      return baseTimes.image_generation + baseTimes.video_generation;
    case "music_video":
      return baseTimes.image_generation + baseTimes.video_generation + 
             baseTimes.music_generation + baseTimes.lipsync_generation;
    default:
      return 60; // Default estimate
  }
}

export async function GET(request: NextRequest) {
  // Get workflow status/templates
  return NextResponse.json({
    available_workflows: [
      {
        type: "complete",
        name: "Complete Content Creation",
        description: "Image → Video → Lipsync → Music",
        estimated_time: "50-60 seconds",
        steps: ["image_generation", "video_generation", "lipsync_generation", "music_generation"]
      },
      {
        type: "image_to_video", 
        name: "Image to Video",
        description: "Generate image then convert to video",
        estimated_time: "15-20 seconds",
        steps: ["image_generation", "video_generation"]
      },
      {
        type: "music_video",
        name: "Music Video Creation", 
        description: "Create a complete music video with soundtrack",
        estimated_time: "45-55 seconds",
        steps: ["image_generation", "video_generation", "music_generation", "lipsync_generation"]
      }
    ],
    supported_models: {
      image_generation: [
        "google-imagen4",
        "google-imagen4-ultra", 
        "google-nano-banana-text-to-image",
        "google-nano-banana-edit",
        "google-nano-banana-effects"
      ],
      video_generation: [
        "google-veo3-fast-image-to-video",
        "google-veo3-image-to-video", 
        "kwaivgi-kling-v2.1-i2v-pro",
        "kwaivgi-kling-v2.1-t2v-master",
        "pixverse-pixverse-v5-t2v"
      ],
      lipsync: ["pixverse-lipsync"],
      music_generation: ["minimax-music-v1.5"]
    }
  });
}