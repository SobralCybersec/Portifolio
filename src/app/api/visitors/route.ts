import { NextResponse } from 'next/server';
import { redis } from '@/lib/chat';

export const runtime = 'nodejs';

const VISITORS_KEY = 'visitors:total';

export async function GET() {
  try {
    const count = (await redis.get<number>(VISITORS_KEY)) ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const count = await redis.incr(VISITORS_KEY);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: 'Failed to increment visitor count' }, { status: 500 });
  }
}
