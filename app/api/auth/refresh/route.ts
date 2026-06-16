import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const payload = await verifyToken(refreshToken);
    const email = payload.userId || payload.email;

    if (!email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // No longer using per-user hardcoded folder list
    const allowedPrefixes: string[] = [];

    const newAccessToken = await signAccessToken({
      userId: email,
      email,
      allowedPrefixes,
      role: 'user',
      provider: (payload as any).provider || 'google',
    });

    const newRefreshToken = await signRefreshToken(email);

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Update cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Refresh token error:', error.message);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
