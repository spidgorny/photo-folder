import { NextRequest, NextResponse } from "next/server";
import { getS3Storage } from "../../../../lib/S3Storage.ts";
import { getAuthenticatedUser } from '@/lib/auth';

function isAllowedFolder(folder: string, allowedPrefixes?: string[]) {
  if (!allowedPrefixes?.length) return true;
  return allowedPrefixes.some((prefix) => {
    const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
    return folder === normalizedPrefix || folder.startsWith(`${normalizedPrefix}/`);
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const formData = await req.json();
    const prefix = String(formData.name ?? '').replace(/^\/+|\/+$/g, '');

    if (!prefix || prefix.includes('..')) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    if (!isAllowedFolder(prefix, user.allowedPrefixes)) {
      return NextResponse.json({ error: 'Not allowed to create this folder' }, { status: 403 });
    }

    const s3 = getS3Storage();
    const res = await s3.put(`${prefix}/.empty`, "");
    return NextResponse.json({ status: "ok", res });
  } catch (error: any) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
