import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pusher, redis } from '@/lib/chat';

const CHAT_KEY = 'chat:messages';
const MAX_MESSAGES = 100;

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage: string;
  createdAt: number;
}

export async function GET() {
  try {
    // lpush stores newest first; lrange 0..99 gives newest → oldest; reverse for chronological
    const messages = await redis.lrange<ChatMessage>(CHAT_KEY, 0, MAX_MESSAGES - 1);
    return NextResponse.json(messages.reverse());
  } catch (err) {
    console.error('[chat/messages GET]', err);
    return NextResponse.json([], { status: 200 }); // graceful degradation
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  }

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    text: text.slice(0, 500),
    userId: session.user.id,
    userName: session.user.name ?? 'Anonymous',
    userImage: session.user.image ?? '',
    createdAt: Date.now(),
  };

  await redis.lpush(CHAT_KEY, message);
  await redis.ltrim(CHAT_KEY, 0, MAX_MESSAGES - 1);
  await pusher.trigger('chat', 'message', message);

  return NextResponse.json(message, { status: 201 });
}