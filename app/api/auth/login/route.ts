import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken, signRefreshToken, isValidUser } from '@/lib/auth';
import { getMySession } from '@/lib/session'; // keep iron-session for web UI for now

export async function POST(request: NextRequest) {
  try {
    const { email, provider = 'email' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // For now support both old VALID_USERS and new Google login
    if (!isValidUser(email)) {
      return NextResponse.json({ error: 'User not authorized' }, { status: 403 });
    }

    // No longer using hardcoded per-user folder list — all folders are shown after login
    const allowedPrefixes: string[] = [];

    const accessToken = await signAccessToken({
      userId: email,
      email,
      allowedPrefixes,
      role: 'user',
      provider,
    });

    const refreshToken = await signRefreshToken(email);

    // Set httpOnly cookie for web UI compatibility
    const response = NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: { email, allowedPrefixes: [] }, // will be populated from /api/s3/folders
    });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 hours
    });

    // Also keep old iron-session for full backward compatibility with existing UI
    const session = await getMySession(request, response);
    session.user = email;
    await session.save();

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
