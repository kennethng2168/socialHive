import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3, downloadFileFromUrl, generateFileName, isS3Configured } from '@/lib/s3-service';

export async function POST(request: NextRequest) {
  try {
    let model: string;
    let prompt: string;
    let negative_prompt = "";
    let resolution = "1024x1024";
    let aspect_ratio = "1:1";
    let num_images = 1;
    let seed: number | undefined;
    let imageFiles: File[] = [];

    // Check if the request is FormData (for image uploads) or JSON
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData for image editing models
      const formData = await request.formData();
      model = formData.get('model') as string;
      prompt = formData.get('prompt') as string;
      negative_prompt = formData.get('negative_prompt') as string || "";
      resolution = formData.get('resolution') as string || "1024x1024";
      aspect_ratio = formData.get('aspect_ratio') as string || "1:1";
      num_images = parseInt(formData.get('num_images') as string) || 1;
      const seedValue = formData.get('seed') as string;
      seed = seedValue ? parseInt(seedValue) : undefined;
      
      // Collect all image files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('image_') && value instanceof File) {
          imageFiles.push(value);
        }
      }
    } else {
      // Handle JSON for text-to-image models
      const body = await request.json();
      ({ model, prompt, negative_prompt = "", resolution = "1024x1024", aspect_ratio = "1:1", num_images = 1, seed } = body);
    }

    // Validate required fields
    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: model and prompt are required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const api_key = process.env.WAVESPEED_API_KEY;
    
    // Check if we should run in demo mode
    const isDemo = !api_key || api_key === 'your_wavespeed_api_key_here' || api_key === 'demo_key';

    console.log('Making WaveSpeedAI image request with model:', model);

    // For demo purposes, simulate API response if no API key is provided
    if (isDemo) {
      console.log('Demo mode: Simulating image generation...');
      
      // Simulate processing time based on model name for realistic experience
      let delay = 2000; // Default 2 seconds
      if (model.includes('ultra-fast') || model.includes('schnell')) {
        delay = 1000; // 1 second for ultra fast
      } else if (model.includes('fast')) {
        delay = 1500; // 1.5 seconds for fast
      } else if (model.includes('pro') || model.includes('ultra')) {
        delay = 4000; // 4 seconds for pro/ultra models
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Generate different placeholder images based on model type
      let imageSize = "1024/1024";
      if (resolution === "2k" || resolution === "2048x2048") {
        imageSize = "2048/2048";
      } else if (resolution === "512x512") {
        imageSize = "512/512";
      }
      
      return NextResponse.json({
        success: true,
        imageUrl: `https://picsum.photos/${imageSize}?random=${Date.now()}&grayscale`, // Demo placeholder
        taskId: `demo_${Date.now()}`,
        metadata: {
          model,
          prompt,
          resolution: resolution || "1024x1024",
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
    } else if (model === 'google-nano-banana-edit') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/nano-banana/edit';
    } else if (model === 'google-nano-banana-effects') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/google/nano-banana/effects';
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
    } else if (model === 'qwen-image-edit') {
      apiUrl = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/qwen-image-edit';
    }

    // Prepare the request payload based on the specific model requirements
    let requestPayload: any = {
      prompt,
      enable_sync_mode: false,
      enable_base64_output: false
    };

    // Google Imagen4 and variants - these support aspect_ratio, resolution, num_images, negative_prompt, seed
    if (model.startsWith('google-imagen4')) {
      // Convert resolution to the format expected by WaveSpeed API
      let apiResolution = "1k";
      if (resolution === "2048x2048" || resolution === "2k") {
        apiResolution = "2k";
      }
      
      requestPayload = {
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
        resolution: apiResolution, // Use 1k/2k format for WaveSpeed API
        num_images: num_images || 1,
        negative_prompt: negative_prompt || "",
        enable_base64_output: false
      };
      if (seed) requestPayload.seed = seed;
    }
    // Google Imagen3 and variants - similar to Imagen4 but may have different parameters
    else if (model.startsWith('google-imagen3')) {
      // Convert resolution to the format expected by WaveSpeed API
      let apiResolution = "1k";
      if (resolution === "2048x2048" || resolution === "2k") {
        apiResolution = "2k";
      }
      
      requestPayload = {
        prompt,
        aspect_ratio: aspect_ratio || "1:1",
        resolution: apiResolution, // Use 1k/2k format for WaveSpeed API
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
        images: [], // Will be populated with image URLs
        output_format: "png",
        enable_sync_mode: false,
        enable_base64_output: false
      };

      // Convert uploaded images to base64 for the API
      if (imageFiles.length > 0) {
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            return `data:${file.type};base64,${base64Image}`;
          })
        );
        requestPayload.images = imageUrls;
      }
    }
    // Qwen Image Edit - similar to nano banana
    else if (model === 'qwen-image-edit') {
      requestPayload = {
        prompt,
        output_format: "png",
        enable_sync_mode: false,
        enable_base64_output: false
      };

      // If images are provided, include the first one (Qwen typically uses single image)
      if (imageFiles.length > 0) {
        const file = imageFiles[0];
        const arrayBuffer = await file.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        requestPayload.image = `data:${file.type};base64,${base64Image}`;
      }
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
        const originalImageUrl = outputs[0];
        let s3Url = null;
        let s3UploadError = null;

        // Try to upload to S3 if configured
        if (isS3Configured() && originalImageUrl) {
          try {
            console.log('Uploading generated image to S3...');
            const imageBuffer = await downloadFileFromUrl(originalImageUrl);
            const fileName = generateFileName('image', model);
            
            const uploadResult = await uploadImageToS3(imageBuffer, fileName, {
              model,
              prompt: prompt.substring(0, 100), // Truncate for metadata
              resolution,
              seed: seed?.toString(),
              taskId,
              originalUrl: originalImageUrl
            });

            if (uploadResult.success) {
              s3Url = uploadResult.url;
              console.log('Successfully uploaded image to S3:', s3Url);
            } else {
              s3UploadError = uploadResult.error;
              console.error('Failed to upload image to S3:', uploadResult.error);
            }
          } catch (error) {
            s3UploadError = error instanceof Error ? error.message : 'S3 upload failed';
            console.error('S3 upload error:', error);
          }
        }

        return NextResponse.json({
          success: true,
          imageUrl: originalImageUrl,
          s3Url: s3Url,
          taskId: taskId,
          metadata: {
            model,
            prompt,
            resolution,
            seed,
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
