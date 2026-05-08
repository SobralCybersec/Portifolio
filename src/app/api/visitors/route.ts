import { NextResponse } from 'next/server';

// In-memory storage (resets on deployment)
// For production, use a database like Vercel KV, Redis, or PostgreSQL
let totalVisits = 0;

export async function GET(request: Request) {
  try {
    return NextResponse.json({ count: totalVisits });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get visitor count' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Increment on every visit (cumulative counter)
    totalVisits++;
    
    return NextResponse.json({ count: totalVisits });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increment visitor count' }, { status: 500 });
  }
}
