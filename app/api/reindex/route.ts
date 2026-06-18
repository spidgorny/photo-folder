import { NextRequest, NextResponse } from 'next/server';
import { reindexFile } from '@/app/[prefix]/actions.ts';
import { getAuthenticatedUser } from '@/lib/auth.ts';

export async function POST(req: NextRequest) {
  try {
    // Optionally enforce authentication
    const session = await getAuthenticatedUser(req);
    // Ensure user is authorized (this example assumes any logged-in user is allowed)
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
