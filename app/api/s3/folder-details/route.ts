// app/api/s3/folder-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';
import { getThumbnailsFallbackToFiles } from '@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles';

/**
 * Handles GET requests for folder details including photo count and first image.
 * This is a dedicated endpoint for fetching folder metadata without loading all folders.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderName = searchParams.get('folder');

    if (!folderName) {
      return new NextResponse('Missing folder parameter', { status: 400 });
    }

    try {
      const thumbnails = await getThumbnailsFallbackToFiles(folderName);
      const firstImage = thumbnails.length > 0 ? thumbnails[0] : null;

      return NextResponse.json({
        folderName,
        photoCount: thumbnails.length,
        firstImage: firstImage ? {
          key: firstImage.key,
          src: `/api/s3/thumb/${firstImage.key}`,
        } : null,
      });
    } catch (err) {
      console.error(`Error fetching thumbnails for folder ${folderName}:`, err);
      return NextResponse.json({
        folderName,
        photoCount: 0,
        firstImage: null,
      });
    }

  } catch (error) {
    console.error('Error fetching folder details:', error);
    return new NextResponse(`Error processing request: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}
