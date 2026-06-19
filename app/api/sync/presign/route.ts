import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';

function normalizeKey(key: string) {
  return key.replace(/^\/+/, '').replace(/\/+/g, '/');
}

function isAllowedKey(key: string, allowedPrefixes?: string[]) {
  if (!allowedPrefixes?.length) return true;
  return allowedPrefixes.some((prefix) => {
    const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
    return key === normalizedPrefix || key.startsWith(`${normalizedPrefix}/`);
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const rawKey = body.key ?? (body.prefix && body.filename ? `${body.prefix}/${body.filename}` : undefined);
    const contentType = body.content_type ?? body.contentType;

    if (!rawKey || !contentType) {
      return NextResponse.json({ error: 'Missing required parameters: key/content_type.' }, { status: 400 });
    }

    const key = normalizeKey(String(rawKey));
    if (!key || key.includes('..') || path.basename(key).startsWith('.')) {
      return NextResponse.json({ error: 'Invalid upload key.' }, { status: 400 });
    }

    if (!String(contentType).startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed.' }, { status: 400 });
    }

    if (!isAllowedKey(key, user.allowedPrefixes)) {
      return NextResponse.json({ error: 'Not allowed to upload to this folder.' }, { status: 403 });
    }

    const s3 = getS3Storage();
    const presignedUrl = await s3.getPresignUrl(key, String(contentType));

    return NextResponse.json({
      success: true,
      key,
      presignedUrl,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error('Error generating pre-signed URL:', error);
    const status = error?.message?.includes('token') || error?.message?.includes('authentication') ? 401 : 500;
    return NextResponse.json({ error: status === 401 ? error.message : 'Failed to generate signed URL.' }, { status });
  }
}
