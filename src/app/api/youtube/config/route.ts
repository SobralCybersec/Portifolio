import { NextResponse } from 'next/server';

export async function GET() {
  const youtubeUrl = process.env.YOUTUBE_BACKGROUND_MUSIC;
  
  if (!youtubeUrl) {
    return NextResponse.json({ url: null });
  }

  return NextResponse.json({ url: youtubeUrl });
}
