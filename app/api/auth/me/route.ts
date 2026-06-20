// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';
import { getThumbnailsFallbackToFiles } from '@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles';

/**
 * Handles GET requests for current user information and folder list.
 * Returns folders with photo count and first image for display on home page.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const s3 = getS3Storage();
    const folders = await s3.listFolders();

    // Fetch thumbnail data for each folder to get photo count and first image
    const foldersWithThumbnails = await Promise.all(
      folders.map(async (folder: any) => {
        const folderName = folder.name || folder.key?.replace(/\/$/, '') || '';

        try {
          const thumbnails = await getThumbnailsFallbackToFiles(folderName);
          const firstImage = thumbnails.length > 0 ? thumbnails[0] : null;

          return {
            ...folder,
            name: folderName,
            photoCount: thumbnails.length,
            firstImage: firstImage ? {
              key: firstImage.key,
              src: `/api/s3/thumb/${firstImage.key}`,
            } : null,
          };
        } catch (err) {
          console.error(`Error fetching thumbnails for folder ${folderName}:`, err);
          return {
            ...folder,
            name: folderName,
            photoCount: 0,
            firstImage: null,
          };
        }
      })
    );

    return NextResponse.json({
      user: user,
      folders: foldersWithThumbnails,
    });

  } catch (error) {
    console.error('Error fetching /api/auth/me:', error);
    return new NextResponse(`Error processing request: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}