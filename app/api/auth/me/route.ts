import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getMySession } from '@/lib/session';
import { getS3Storage } from '@/lib/S3Storage';

export async function GET(request: NextRequest) {
  try {
    let email: string | null = null;
    let isAuthenticated = false;

    // Try new JWT auth first
    try {
      const user = await getAuthenticatedUser(request);
      email = user.email;
      isAuthenticated = true;
    } catch {
      // Fallback to old iron-session
      const session = await getMySession(request, NextResponse.next());
      if (session.user) {
        email = session.user;
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated || !email) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Always fetch the full current list of folders from S3
    const s3 = getS3Storage();
    const allFolders = await s3.listFolders();
    const folders = allFolders
      .map(f => f.key?.replace(/\/$/, '') || '')
      .filter(Boolean);

    return NextResponse.json({
      user: { email, role: 'user' },
      folders,
    });
  } catch (error: any) {
    console.error('Auth me error:', error.message);
    return NextResponse.json({ user: null, error: error.message }, { status: 401 });
  }
}
