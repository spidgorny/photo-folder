import { getMySession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ status: 'ok' });
  const session = await getMySession(req, res);
  session.user = undefined;
  await session.save();
  return res;
}
