import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getS3Storage } from '@/lib/S3Storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { prefix, filename, contentType, size } = await request.json();

    if (!prefix || !filename) {
      return NextResponse.json({ error: 'prefix and filename are required' }, { status: 400 });
    }

    // For now we allow upload to any folder the user can see.
    // TODO: Add per-user folder restrictions later if needed.

    const s3 = getS3Storage();
    const key = `${prefix}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: key,
      ContentType: contentType || 'image/jpeg',
      ...(size && { ContentLength: size }),
    });

    const signedUrl = await getSignedUrl(s3.s3, command, { expiresIn: 900 }); // 15 minutes

    return NextResponse.json({
      success: true,
      url: signedUrl,
      key,
    });
  } catch (error: any) {
    console.error('Presign error:', error.message);
    const status = error.message.includes('token') || error.message.includes('No authentication') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
