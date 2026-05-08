import { NextResponse } from 'next/server';

// In-memory storage (resets on deployment)
// For production, use a database like Vercel KV, Redis, or PostgreSQL
let visitorCount = 0;
const visitedIPs = new Set<string>();

export async function GET(request: Request) {
  try {
    return NextResponse.json({ count: visitorCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get visitor IP from headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Only increment if this IP hasn't visited before (in this session)
    if (!visitedIPs.has(ip)) {
      visitedIPs.add(ip);
      visitorCount++;
    }
    
    return NextResponse.json({ count: visitorCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment visitor count' }, { status: 500 });
  }
}
