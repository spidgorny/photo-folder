import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    return NextResponse.json({
      success: true,
      folders: user.allowedPrefixes,
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
