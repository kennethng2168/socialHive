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

    // Get API key from environment variables
    const api_key = '';
    if (!api_key) {
      return NextResponse.json(
        { error: 'API key not configured. Please set IDMVTON_API_KEY environment variable.' },
        { status: 500 }
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

    const data = {
      crop,
      seed: parseInt(seed.toString()),
      steps: parseInt(steps.toString()),
      category,
      force_dc,
      human_img: processedHumanImg,
      garm_img: processedGarmImg,
      mask_only,
      garment_des: garment_des.trim()
    };

    // Validate category
    const validCategories = ['upper_body', 'lower_body', 'dresses'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate steps and seed
    if (steps < 1 || steps > 100) {
      return NextResponse.json(
        { error: 'Steps must be between 1 and 100' },
        { status: 400 }
      );
    }

    console.log('Making virtual try-on request with category:', category);

    // Make request to IDM-VTON API
    const url = "https://api.segmind.com/v1/idm-vton-c2m8";
    const response = await axios.post(url, data, {
      headers: {
        'x-api-key': api_key,
        'Content-Type': 'application/json'
      },
      timeout: 60000, // 60 seconds timeout
      responseType: 'arraybuffer'
    });

    // Convert response to base64
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    
    let s3Url = null;
    let s3UploadError = null;

    // Try to upload to S3 if configured
    if (isS3Configured()) {
      try {
        console.log('Uploading virtual try-on result to S3...');
        const imageBuffer = Buffer.from(response.data, 'binary');
        const fileName = generateFileName('virtual-tryon', 'idm-vton');
        
        const uploadResult = await uploadVirtualTryOnToS3(imageBuffer, fileName, {
          category,
          garment_description: garment_des,
          steps: steps.toString(),
          seed: seed.toString(),
          human_img_type: human_img.startsWith('http') ? 'url' : 'base64',
          garm_img_type: garm_img.startsWith('http') ? 'url' : 'base64'
        });

        if (uploadResult.success) {
          s3Url = uploadResult.url;
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
          enabled: isS3Configured(),
          success: !!s3Url,
          error: s3UploadError
        }
      }
    });

  } catch (error: any) {
    console.error('Virtual try-on API error:', error);

    if (error.response) {
      // API returned an error response
      return NextResponse.json(
        { 
          error: 'Virtual try-on service error',
          details: error.response.data?.message || error.response.statusText,
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
