// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth'; // Keep the original utility
import { getS3Storage } from '@/lib/S3Storage';

/**
 * Handles GET requests for current user information and folder list.
 * Replaces logic previously in pages/api/auth/me.ts
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get authenticated user from the request object (server-side middleware logic)
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Assuming 'getS3Storage' and methods are available/imported here.
    // We keep the original call structure from app/page.tsx for consistency,
    // but ideally, this would be a contained function to prevent circular dependencies.
    const s3 = getS3Storage(); 
    const folders = await s3.listFolders();

    return NextResponse.json({
      user: user,
      folders: folders,
      message: "Successfully retrieved user context and folder list.",
    });

  } catch (error) {
    console.error('Error fetching /api/auth/me:', error);
    // General error response for debugging
    return new NextResponse(`Error processing request: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}