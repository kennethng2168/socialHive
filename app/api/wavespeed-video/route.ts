import { NextRequest, NextResponse } from 'next/server';
import { uploadVideoToS3, uploadImageToS3, downloadFileFromUrl, generateFileName, isS3Configured } from '@/lib/s3-service';

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
    const api_key = '';
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI video request with model:', model);

    // Check if this is a self-hosted model that should use MCP
    if (model === 'self-hosted-video') {
      console.log('Using MCP server for self-hosted video generation...');
      
      try {
        const mcpUrl = 'http://localhost:8000/mcp/call';
        
        // Determine which MCP tool to use based on whether we have an image
        let mcpToolName: string;
        let mcpArgs: any;
        
        if (imageFile) {
          // Image-to-video using generate_video_wavespeed
          console.log('Using MCP image-to-video (generate_video_wavespeed)');
          
          // Convert image file to base64
          const imageBuffer = await imageFile.arrayBuffer();
          const imageBase64 = Buffer.from(imageBuffer).toString('base64');
          const imageMimeType = imageFile.type || 'image/jpeg';
          
          // First, upload image to S3 to get a public URL
          let imageUrl: string;
          
          if (isS3Configured()) {
            try {
              console.log('Uploading image to S3 for MCP video generation...');
              const imageFileName = generateFileName('image', 'temp-i2v');
              const s3Result = await uploadImageToS3(Buffer.from(imageBuffer), imageFileName, {
                purpose: 'temp-image-to-video',
                timestamp: Date.now().toString()
              });
              
              if (s3Result.success && s3Result.url) {
                imageUrl = s3Result.url;
                console.log('Image uploaded to S3:', imageUrl);
              } else {
                throw new Error('Failed to upload image to S3');
              }
            } catch (s3Error) {
              console.error('S3 upload failed, falling back to base64:', s3Error);
              // Fallback: Use text-to-video with descriptive prompt
              mcpToolName = 'generate_video_text_to_video';
              mcpArgs = {
                prompt: prompt || 'Animate this scene with natural movement',
                duration: parseInt(duration.replace('s', '')) || 5,
                size: resolution.replace('x', '*'),
                seed: seed ? parseInt(seed) : -1
              };
              imageUrl = ''; // Will skip image-to-video
            }
          } else {
            console.log('S3 not configured, using text-to-video fallback');
            mcpToolName = 'generate_video_text_to_video';
            mcpArgs = {
              prompt: prompt || 'Animate this scene with natural movement',
              duration: parseInt(duration.replace('s', '')) || 5,
              size: resolution.replace('x', '*'),
              seed: seed ? parseInt(seed) : -1
            };
            imageUrl = '';
          }
          
          // Use image-to-video if we have a URL
          if (imageUrl) {
            mcpToolName = 'generate_video_wavespeed';
            mcpArgs = {
              image_url: imageUrl,
              prompt: prompt || 'Animate this image with natural movement',
              duration: parseInt(duration.replace('s', '')) || 5,
              seed: seed ? parseInt(seed) : -1,
              last_image: ''
            };
          }
        } else {
          // Text-to-video using generate_video_text_to_video
          console.log('Using MCP text-to-video (generate_video_text_to_video)');
          
          mcpToolName = 'generate_video_text_to_video';
          mcpArgs = {
            prompt: prompt,
            duration: parseInt(duration.replace('s', '')) || 5,
            size: resolution.replace('x', '*'),
            seed: seed ? parseInt(seed) : -1
          };
        }
        
        // Call MCP server
        const mcpResponse = await fetch(mcpUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tool_name: mcpToolName,
            arguments: mcpArgs
          })
        });
        
        if (!mcpResponse.ok) {
          throw new Error(`MCP request failed: ${mcpResponse.status} ${mcpResponse.statusText}`);
        }
        
        const mcpResult = await mcpResponse.json();
        console.log('MCP Response:', JSON.stringify(mcpResult).substring(0, 200));
        
        // Parse the MCP response
        if (mcpResult.success && mcpResult.data) {
          const resultText = mcpResult.data;
          
          // Extract video URL from the response text
          const urlMatch = resultText.match(/Video URL: (https?:\/\/[^\s]+)/);
          if (urlMatch && urlMatch[1]) {
            const videoUrl = urlMatch[1];
            
            // Optionally save to S3
            let s3Url = null;
            if (isS3Configured()) {
              try {
                const videoBuffer = await downloadFileFromUrl(videoUrl);
                const fileName = generateFileName('video', 'self-hosted-mcp');
                const s3Result = await uploadVideoToS3(videoBuffer, fileName, {
                  prompt,
                  model: 'self-hosted-mcp',
                  resolution,
                  duration
                });
                if (s3Result.success && s3Result.url) {
                  s3Url = s3Result.url;
                  console.log('Video saved to S3:', s3Url);
                } else {
                  console.error('S3 upload failed:', s3Result.error);
                }
              } catch (s3Error) {
                console.error('Failed to save to S3:', s3Error);
              }
            }
            
            return NextResponse.json({
              success: true,
              videoUrl: s3Url || videoUrl,
              taskId: `mcp_video_${Date.now()}`,
              metadata: {
                model: 'self-hosted-mcp',
                prompt,
                resolution,
                duration,
                seed: seed ? parseInt(seed) : undefined,
                storedInS3: !!s3Url
              }
            });
          } else {
            // Check if it's still processing
            const requestIdMatch = resultText.match(/Request ID: ([^\s]+)/);
            if (requestIdMatch) {
              return NextResponse.json({
                success: true,
                taskId: requestIdMatch[1],
                message: 'Video generation in progress via MCP',
                metadata: {
                  model: 'self-hosted-mcp',
                  prompt,
                  resolution,
                  duration
                }
              });
            }
            
            throw new Error(`Could not extract video URL from MCP response: ${resultText}`);
          }
        } else if (mcpResult.error) {
          throw new Error(`MCP error: ${mcpResult.error}`);
        } else {
          throw new Error(`Unexpected MCP response: ${JSON.stringify(mcpResult)}`);
        }
        
      } catch (mcpError: any) {
        console.error('MCP video generation error:', mcpError);
        return NextResponse.json(
          { 
            error: 'MCP video generation failed',
            details: mcpError.message
          },
          { status: 500 }
        );
      }
    }
    
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
        const originalVideoUrl = outputs[0];
        let s3Url = null;
        let s3UploadError = null;

        // Try to upload to S3 if configured
        if (isS3Configured() && originalVideoUrl) {
          try {
            console.log('Uploading generated video to S3...');
            const videoBuffer = await downloadFileFromUrl(originalVideoUrl);
            const fileName = generateFileName('video', model);
            
            const uploadResult = await uploadVideoToS3(videoBuffer, fileName, {
              model,
              prompt: prompt.substring(0, 100), // Truncate for metadata
              resolution,
              duration,
              seed: seed || undefined,
              taskId,
              originalUrl: originalVideoUrl
            });

            if (uploadResult.success) {
              s3Url = uploadResult.url;
              console.log('Successfully uploaded video to S3:', s3Url);
            } else {
              s3UploadError = uploadResult.error;
              console.error('Failed to upload video to S3:', uploadResult.error);
            }
          } catch (error) {
            s3UploadError = error instanceof Error ? error.message : 'S3 upload failed';
            console.error('S3 upload error:', error);
          }
        }

        return NextResponse.json({
          success: true,
          videoUrl: originalVideoUrl,
          s3Url: s3Url,
          taskId: taskId,
          metadata: {
            model,
            prompt,
            resolution,
            duration,
            seed: seed ? parseInt(seed) : undefined,
            s3Upload: {
              enabled: isS3Configured(),
              success: !!s3Url,
              error: s3UploadError
            }
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
