import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const s3 = getS3Storage();
    const allFolders = (await s3.listFolders())
      .map((f) => f.key?.replace(/\/$/, '') || '')
      .filter(Boolean);

    const allowedPrefixes = user.allowedPrefixes?.length
      ? allFolders.filter((folder) => user.allowedPrefixes!.some((prefix) => folder === prefix || folder.startsWith(`${prefix}/`)))
      : allFolders;

    return NextResponse.json({
      success: true,
      folders: allowedPrefixes,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Get folders error:', error.message);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
