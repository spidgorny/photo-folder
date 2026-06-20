// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';

/**
 * Handles GET requests for current user information and folder list.
 * Returns basic folder list without thumbnail data for performance.
 * Use /api/s3/folder-details for folder-specific metadata.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const s3 = getS3Storage();
    const folders = await s3.listFolders();

    // Return basic folder information without thumbnail data
    const foldersBasic = folders.map((folder: any) => ({
      ...folder,
      name: folder.name || folder.key?.replace(/\/$/, '') || '',
    }));

    return NextResponse.json({
      user: user,
      folders: foldersBasic,
    });

  } catch (error) {
    console.error('Error fetching /api/auth/me:', error);
    return new NextResponse(`Error processing request: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}