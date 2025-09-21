import { NextRequest, NextResponse } from 'next/server';
import { 
  uploadImageToS3, 
  uploadVideoToS3, 
  uploadVirtualTryOnToS3, 
  uploadMusicToS3,
  downloadFileFromUrl,
  generateFileName,
  getS3Status,
  isS3Configured 
} from '@/lib/s3-service';

interface UploadRequest {
  url: string;
  contentType: 'image' | 'video' | 'virtual-tryon' | 'music';
  model?: string;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const { url, contentType, model, metadata }: UploadRequest = await request.json();

    // Validate required fields
    if (!url || !contentType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: url and contentType'
      }, { status: 400 });
    }

    // Check if S3 is configured
    if (!isS3Configured()) {
      return NextResponse.json({
        success: false,
        error: 'S3 is not configured. Please set AWS credentials in environment variables.',
        s3Status: getS3Status()
      }, { status: 500 });
    }

    // Download the file from the provided URL
    console.log(`Downloading file from: ${url}`);
    const fileBuffer = await downloadFileFromUrl(url);
    
    // Generate a meaningful filename
    const fileName = generateFileName(contentType, model);
    
    // Upload to appropriate S3 bucket based on content type
    let uploadResult;
    const uploadMetadata = {
      originalUrl: url,
      model: model || 'unknown',
      generatedAt: new Date().toISOString(),
      ...metadata
    };

    switch (contentType) {
      case 'image':
        uploadResult = await uploadImageToS3(fileBuffer, fileName, uploadMetadata);
        break;
      case 'video':
        uploadResult = await uploadVideoToS3(fileBuffer, fileName, uploadMetadata);
        break;
      case 'virtual-tryon':
        uploadResult = await uploadVirtualTryOnToS3(fileBuffer, fileName, uploadMetadata);
        break;
      case 'music':
        uploadResult = await uploadMusicToS3(fileBuffer, fileName, uploadMetadata);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported content type: ${contentType}`
        }, { status: 400 });
    }

    if (uploadResult.success) {
      console.log(`Successfully uploaded ${contentType} to S3:`, uploadResult.url);
      return NextResponse.json({
        success: true,
        s3Url: uploadResult.url,
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        originalUrl: url,
        contentType,
        model,
        fileName
      });
    } else {
      console.error(`Failed to upload ${contentType} to S3:`, uploadResult.error);
      return NextResponse.json({
        success: false,
        error: uploadResult.error || 'Upload failed'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('S3 Upload API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Health check and configuration status
export async function GET(request: NextRequest) {
  try {
    const s3Status = getS3Status();
    
    return NextResponse.json({
      status: 'S3 Upload Service',
      configured: s3Status.configured,
      region: s3Status.region,
      buckets: s3Status.buckets,
      supportedContentTypes: ['image', 'video', 'virtual-tryon', 'music'],
      missingEnvVars: s3Status.missingEnvVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}