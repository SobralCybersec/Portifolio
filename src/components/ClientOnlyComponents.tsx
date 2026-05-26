'use client';

import dynamic from 'next/dynamic';
import type { Session } from 'next-auth';

// Shared visual components
export const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
export const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

// Chat
import type { ChatMessage } from '@/app/api/chat/messages/route';
const ChatRoomDynamic = dynamic(() => import('@/components/ChatRoom'), { ssr: false });
export function ClientChatRoom({ session }: { session: Session | null }) {
  return <ChatRoomDynamic session={session} />;
}