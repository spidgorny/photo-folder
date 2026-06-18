import { NextRequest, NextResponse } from 'next/server';
import { reindexFile } from '@/app/[prefix]/actions.ts';
import { getAuthenticatedUser } from '@/lib/auth.ts';

export async function POST(req: NextRequest) {
  // Authenticate via Bearer header or access_token cookie
  let user;
  try {
    user = await getAuthenticatedUser(req);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prefix, key } = await req.json();
    if (!prefix || !key) {
      return NextResponse.json({ error: 'Missing prefix or key' }, { status: 400 });
    }
    await reindexFile(key);
    return NextResponse.json({ status: 'ok', key }, { status: 200 });
  } catch (e) {
    console.error('Reindex API error', e);
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
