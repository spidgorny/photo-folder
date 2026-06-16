import { NextRequest, NextResponse } from 'next/server';
import { getS3Storage } from '@/lib/S3Storage';
import { getAuthenticatedUser, isValidUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    let folders: string[] = [];

    // Always return all top-level folders for now.
    // Authentication is still enforced on individual folder views.
    const s3 = getS3Storage();
    const allFolders = await s3.listFolders();
    folders = allFolders
      .map(f => f.key?.replace(/\/$/, '') || '')
      .filter(Boolean);

    return NextResponse.json({ 
      success: true, 
      folders 
    });
  } catch (error: any) {
    console.error('List folders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
