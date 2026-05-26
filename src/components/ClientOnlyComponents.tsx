'use client';

import dynamic from 'next/dynamic';
import type { Session } from 'next-auth';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ChatRoom = dynamic(() => import('@/components/ChatRoom'), { ssr: false });

export function ClientHexagonGrid(props: { cellSize: number; glowColor: string; lineColor: string; glowInterval: number; maxSimultaneous: number }) {
  return <HexagonGrid {...props} />;
}

export function ClientChatRoom({ session }: { session: Session | null }) {
  return <ChatRoom session={session} />;
}