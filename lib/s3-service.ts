import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// S3 Client Configuration
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
});

// S3 Bucket Configuration
export const S3_BUCKETS = {
  IMAGES: 'socialhive-generated-images',
  VIDEOS: 'socialhive-generated-videos',
  VIRTUAL_TRYON: 'socialhive-virtual-tryon',
  MUSIC: 'socialhive-generated-music',
} as const;

// Content Type Configuration
export const CONTENT_TYPES = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  
  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
} as const;

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  bucket?: string;
  error?: string;
}

export interface UploadOptions {
  bucket: string;
  key?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  expires?: number; // For signed URLs (in seconds)
}

/**
 * Upload a file buffer to S3
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Generate unique key if not provided
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    const uniqueKey = options.key || `${uuidv4()}.${fileExtension}`;
    
    // Determine content type
    const contentType = options.contentType || 
      CONTENT_TYPES[fileExtension as keyof typeof CONTENT_TYPES] || 
      'application/octet-stream';

    const uploadParams = {
      Bucket: options.bucket,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        source: 'socialhive-ai-generation',
        ...options.metadata,
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate public URL
    const url = `https://${options.bucket}.s3.us-east-1.amazonaws.com/${uniqueKey}`;

    return {
      success: true,
      url,
      key: uniqueKey,
      bucket: options.bucket,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Upload image to S3 (images bucket)
 */
export async function uploadImageToS3(
  imageBuffer: Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  return uploadToS3(imageBuffer, fileName, {
    bucket: S3_BUCKETS.IMAGES,
    metadata: {
      contentType: 'image',
      ...metadata,
    },
  });
}

/**
 * Upload video to S3 (videos bucket)
 */
export async function uploadVideoToS3(
  videoBuffer: Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  return uploadToS3(videoBuffer, fileName, {
    bucket: S3_BUCKETS.VIDEOS,
    metadata: {
      contentType: 'video',
      ...metadata,
    },
  });
}

/**
 * Upload virtual try-on result to S3
 */
export async function uploadVirtualTryOnToS3(
  imageBuffer: Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  return uploadToS3(imageBuffer, fileName, {
    bucket: S3_BUCKETS.VIRTUAL_TRYON,
    metadata: {
      contentType: 'virtual-tryon',
      ...metadata,
    },
  });
}

/**
 * Upload music to S3 (music bucket)
 */
export async function uploadMusicToS3(
  audioBuffer: Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  return uploadToS3(audioBuffer, fileName, {
    bucket: S3_BUCKETS.MUSIC,
    metadata: {
      contentType: 'music',
      ...metadata,
    },
  });
}

/**
 * Generate a signed URL for private access
 */
export async function generateSignedUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(bucket: string, key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return false;
  }
}

/**
 * Download file from URL and return buffer
 */
export async function downloadFileFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading file from URL:', error);
    throw error;
  }
}

/**
 * Helper function to extract file extension from URL or filename
 */
export function getFileExtension(urlOrFilename: string): string {
  // Remove query parameters and get the last part after '.'
  const cleanUrl = urlOrFilename.split('?')[0];
  const parts = cleanUrl.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Helper function to generate a meaningful filename for generated content
 */
export function generateFileName(contentType: 'image' | 'video' | 'virtual-tryon' | 'music', model?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uuid = uuidv4().substring(0, 8);
  const modelSuffix = model ? `-${model.replace(/[^a-zA-Z0-9]/g, '-')}` : '';
  
  const extensions = {
    image: 'jpg',
    video: 'mp4',
    'virtual-tryon': 'jpg',
    music: 'mp3',
  };
  
  return `${contentType}${modelSuffix}-${timestamp}-${uuid}.${extensions[contentType]}`;
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return false;
}

/**
 * Get S3 configuration status
 */
export function getS3Status() {
  return {
    configured: isS3Configured(),
    region: 'us-east-1',
    buckets: S3_BUCKETS,
    missingEnvVars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
  };
}