// app/api/sync/presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Assuming local imports for utility functions like getS3Storage and JWT logic are available
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';

/**
 * Handles POST requests to generate presigned URLs for file uploads.
 * Replaces logic previously in pages/api/sync/presign.ts
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Authorization Check (Same as /api/auth/me)
    // In a real setup, getAuthenticatedUser() must be called here to authorize the user requesting the URL.
    const user = await getAuthenticatedUser(request); // Placeholder function
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Get file details from request body (e.g., File name, folder prefix, intended data type)
    const { key, content_type } = await request.json();
    
    if (!key || !content_type) {
      return new NextResponse('Missing required parameters: key or content_type.', { status: 400 });
    }

    // 3. Generate the presigned URL using the S3 utility wrapper
    const s3 = getS3Storage(); // Get S3 storage instance
    const signedUrl = await s3.getPresignUrl(key, content_type);

    return NextResponse.json({
      success: true,
      presignedUrl: signedUrl,
      message: 'Successfully generated presigned URL.',
    });

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    // Log the actual error for debugging
    return new NextResponse(`Failed to generate signed URL due to server error.`, { status: 500 });
  }
}