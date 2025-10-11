import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { uploadVirtualTryOnToS3, generateFileName, isS3Configured } from '@/lib/s3-service';

// Helper function to convert image URL to base64
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }
}

// Helper function to validate base64 image
function isValidBase64Image(base64String: string): boolean {
  try {
    const buffer = Buffer.from(base64String, 'base64');
    const signature = buffer.toString('hex', 0, 4);
    
    // Check for common image file signatures
    const imageSignatures = [
      'ffd8ffe0', // JPEG
      'ffd8ffe1', // JPEG
      'ffd8ffe2', // JPEG
      '89504e47', // PNG
      '47494638', // GIF
      '424d',     // BMP
      '52494646', // WEBP
    ];
    
    return imageSignatures.some(sig => signature.toLowerCase().startsWith(sig));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      human_img,
      garm_img,
      garment_des = "Stylish garment",
      category = "upper_body",
      crop = false,
      seed = 42,
      steps = 30,
      force_dc = false,
      mask_only = false
    } = body;

    // Validate required fields
    if (!human_img || !garm_img) {
      return NextResponse.json(
        { error: 'Missing required fields: human_img and garm_img are required' },
        { status: 400 }
      );
    }

    // Prepare data for the API
    let processedHumanImg = human_img;
    let processedGarmImg = garm_img;

    // If URLs are provided, convert them to base64
    if (human_img.startsWith('http')) {
      try {
        processedHumanImg = await imageUrlToBase64(human_img);
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to process human image URL: ${error}` },
          { status: 400 }
        );
      }
    } else if (!isValidBase64Image(human_img)) {
      return NextResponse.json(
        { error: 'Invalid human image: must be a valid base64 image or URL' },
        { status: 400 }
      );
    }

    if (garm_img.startsWith('http')) {
      try {
        processedGarmImg = await imageUrlToBase64(garm_img);
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to process garment image URL: ${error}` },
          { status: 400 }
        );
      }
    } else if (!isValidBase64Image(garm_img)) {
      return NextResponse.json(
        { error: 'Invalid garment image: must be a valid base64 image or URL' },
        { status: 400 }
      );
    }

    // Validate steps
    if (steps < 1 || steps > 100) {
      return NextResponse.json(
        { error: 'Steps must be between 1 and 100' },
        { status: 400 }
      );
    }

    console.log('Making virtual try-on request with category:', category);

    // Ensure base64 strings don't have data URL prefixes
    const cleanHumanBase64 = processedHumanImg.includes('base64,') 
      ? processedHumanImg.split('base64,')[1] 
      : processedHumanImg;
    const cleanGarmentBase64 = processedGarmImg.includes('base64,') 
      ? processedGarmImg.split('base64,')[1] 
      : processedGarmImg;

    // Validate base64 strings
    if (!cleanHumanBase64 || cleanHumanBase64.length < 100) {
      return NextResponse.json(
        { error: 'Human image data is invalid or too small' },
        { status: 400 }
      );
    }
    
    if (!cleanGarmentBase64 || cleanGarmentBase64.length < 100) {
      return NextResponse.json(
        { error: 'Garment image data is invalid or too small' },
        { status: 400 }
      );
    }

    // Check if base64 is valid
    try {
      Buffer.from(cleanHumanBase64, 'base64');
      Buffer.from(cleanGarmentBase64, 'base64');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid base64 image data format' },
        { status: 400 }
      );
    }

    // Prepare request for the new MCP API
    const apiUrl = "https://awshackathon1.pagekite.me/mcp/call";
    const requestData = {
      tool_name: "virtual_tryon",
      arguments: {
        human_image_base64: cleanHumanBase64,
        garment_image_base64: cleanGarmentBase64,
        garment_description: garment_des.trim(),
        denoise_steps: parseInt(steps.toString()),
        seed: parseInt(seed.toString())
      },
      server_name: "vton"
    };

    console.log('Sending request to MCP API...');
    console.log('Request parameters:', {
      tool_name: requestData.tool_name,
      garment_description: requestData.arguments.garment_description,
      denoise_steps: requestData.arguments.denoise_steps,
      seed: requestData.arguments.seed,
      human_image_length: cleanHumanBase64.length,
      garment_image_length: cleanGarmentBase64.length
    });
    
    // Make request to MCP Virtual Try-On API
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 120000, // 120 seconds timeout for processing
      responseType: 'json'
    });

    console.log('Received response from MCP API');
    console.log('Response data keys:', Object.keys(response.data));
    console.log('Full response structure:', JSON.stringify(response.data, null, 2).substring(0, 500));

    // Check if the API returned an error
    if (response.data.error || response.data.success === false) {
      console.error('MCP API returned an error:', response.data.error);
      const errorMessage = response.data.error || 'Unknown error from MCP API';
      
      // Provide more helpful error messages
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('TaskGroup')) {
        userFriendlyError = 'The virtual try-on service encountered an internal error. This might be due to image format/size issues or the service being temporarily unavailable. Please try with different images or try again later.';
      }
      
      throw new Error(userFriendlyError);
    }

    // Parse the response
    let imageDataUrl: string;
    let base64Image: string = '';
    let s3UrlFromMcp: string | null = null;

    // The API might return the image in different formats
    // Try multiple paths to find the image data
    if (response.data.content) {
      console.log('Response has content property');
      // MCP format with content array
      if (Array.isArray(response.data.content)) {
        console.log('Content is array with', response.data.content.length, 'items');
        
        // Check for text content that might contain S3 URL or base64
        const textContent = response.data.content.find((item: any) => item.type === 'text');
        if (textContent && textContent.text) {
          console.log('Found text content:', textContent.text.substring(0, 200));
          
          // Try to extract S3 URL from text
          const s3UrlMatch = textContent.text.match(/(?:Image URL:|URL:)\s*(https?:\/\/[^\s\n]+)/i);
          if (s3UrlMatch && s3UrlMatch[1]) {
            s3UrlFromMcp = s3UrlMatch[1];
            console.log('Found S3 URL in text:', s3UrlFromMcp);
            
            // Download the image from S3 URL
            try {
              const imageResponse = await axios.get(s3UrlFromMcp as string, { responseType: 'arraybuffer' });
              base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
              console.log('Downloaded image from S3, size:', base64Image.length);
            } catch (error) {
              console.error('Failed to download image from S3:', error);
              throw new Error('Virtual try-on succeeded but failed to download result image from S3');
            }
          }
          // Try to extract base64 from text
          else if (textContent.text.includes('base64') || textContent.text.match(/^[A-Za-z0-9+/=]{100,}/)) {
            const base64Match = textContent.text.match(/(?:Base64 Image:|base64:)\s*([A-Za-z0-9+/=]+)/i);
            if (base64Match) {
              base64Image = base64Match[1];
              console.log('Extracted base64 from text, size:', base64Image.length);
            } else {
              // Try treating entire text as base64
              const cleanedText = textContent.text.replace(/\s/g, '');
              if (cleanedText.match(/^[A-Za-z0-9+/=]+$/)) {
                base64Image = cleanedText;
                console.log('Using entire text as base64, size:', base64Image.length);
              }
            }
          }
        }
        
        // Check for image content
        const imageContent = response.data.content.find((item: any) => 
          item.type === 'image' || item.type === 'resource'
        );
        if (imageContent && imageContent.data) {
          base64Image = imageContent.data;
          console.log('Found image data in content array, size:', base64Image.length);
        } else if (imageContent && imageContent.url) {
          // Download from URL
          try {
            const imageResponse = await axios.get(imageContent.url, { responseType: 'arraybuffer' });
            base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            console.log('Downloaded image from URL, size:', base64Image.length);
          } catch (error) {
            console.error('Failed to download image from URL:', error);
            throw new Error('Failed to download image from provided URL');
          }
        }
        
        if (!base64Image) {
          console.error('No image found in content array:', JSON.stringify(response.data.content));
          throw new Error('No image data in content array');
        }
      } else if (typeof response.data.content === 'string') {
        base64Image = response.data.content;
        console.log('Content is string, size:', base64Image.length);
      } else if (response.data.content.data) {
        base64Image = response.data.content.data;
        console.log('Found data in content object, size:', base64Image.length);
      } else if (response.data.content.image) {
        base64Image = response.data.content.image;
        console.log('Found image in content object, size:', base64Image.length);
      } else {
        console.error('Unknown content format:', JSON.stringify(response.data.content));
        throw new Error('Unknown content format');
      }
    } else if (response.data.result) {
      console.log('Response has result property');
      // If result contains base64 image
      if (typeof response.data.result === 'string') {
        base64Image = response.data.result;
        console.log('Result is string, size:', base64Image.length);
      } else if (response.data.result.image) {
        base64Image = response.data.result.image;
        console.log('Found image in result, size:', base64Image.length);
      } else if (response.data.result.data) {
        base64Image = response.data.result.data;
        console.log('Found data in result, size:', base64Image.length);
      } else {
        console.error('Unknown result format:', JSON.stringify(response.data.result));
        throw new Error('Invalid response format from API');
      }
    } else if (response.data.image) {
      base64Image = response.data.image;
      console.log('Found image property, size:', base64Image.length);
    } else if (response.data.data) {
      base64Image = response.data.data;
      console.log('Found data property, size:', base64Image.length);
    } else {
      console.error('Full response data:', JSON.stringify(response.data, null, 2));
      throw new Error('No image data in API response. Check server logs for details.');
    }

    if (!base64Image || base64Image.length < 100) {
      console.error('Base64 image is empty or too small:', base64Image?.length);
      throw new Error('Received empty or invalid image data from API');
    }

    console.log('Final base64 image size:', base64Image.length);

    // Ensure we have a valid data URL
    imageDataUrl = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/png;base64,${base64Image}`;
    
    // Use S3 URL from MCP if available, otherwise try local upload
    let s3Url = s3UrlFromMcp;
    let s3UploadError = null;

    // Only try local S3 upload if MCP didn't provide one and local S3 is configured
    if (!s3UrlFromMcp && isS3Configured()) {
      try {
        console.log('Uploading virtual try-on result to S3...');
        // Extract pure base64 if it has data URL prefix
        const pureBase64 = base64Image.includes('base64,') 
          ? base64Image.split('base64,')[1] 
          : base64Image;
        const imageBuffer = Buffer.from(pureBase64, 'base64');
        const fileName = generateFileName('virtual-tryon', 'mcp-vton');
        
        const uploadResult = await uploadVirtualTryOnToS3(imageBuffer, fileName, {
          category,
          garment_description: garment_des,
          steps: steps.toString(),
          seed: seed.toString(),
          human_img_type: human_img.startsWith('http') ? 'url' : 'base64',
          garm_img_type: garm_img.startsWith('http') ? 'url' : 'base64'
        });

        if (uploadResult.success) {
          s3Url = uploadResult.url || null;
          console.log('Successfully uploaded virtual try-on result to S3:', s3Url);
        } else {
          s3UploadError = uploadResult.error;
          console.error('Failed to upload virtual try-on result to S3:', uploadResult.error);
        }
      } catch (error) {
        s3UploadError = error instanceof Error ? error.message : 'S3 upload failed';
        console.error('S3 upload error:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      image: imageDataUrl,
      s3Url: s3Url,
      metadata: {
        category,
        garment_description: garment_des,
        steps,
        seed,
        s3Upload: {
          enabled: isS3Configured() || !!s3UrlFromMcp,
          success: !!s3Url,
          error: s3UploadError,
          source: s3UrlFromMcp ? 'mcp-server' : (s3Url ? 'local' : 'none')
        }
      }
    });

  } catch (error: any) {
    console.error('Virtual try-on API error:', error);

    if (error.response) {
      // API returned an error response
      const errorMessage = error.response.data?.error || error.response.data?.message || error.response.statusText;
      return NextResponse.json(
        { 
          error: 'Virtual try-on service error',
          details: errorMessage,
          status: error.response.status
        },
        { status: error.response.status }
      );
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return NextResponse.json(
        { error: 'Request timeout. Virtual try-on is taking too long. Please try again.' },
        { status: 408 }
      );
    } else if (error.code === 'ECONNREFUSED') {
      // Connection refused
      return NextResponse.json(
        { 
          error: 'Unable to connect to virtual try-on service',
          details: 'The API server might be down or unreachable'
        },
        { status: 503 }
      );
    } else {
      // Network or other error
      return NextResponse.json(
        { 
          error: 'Failed to process virtual try-on request',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}
