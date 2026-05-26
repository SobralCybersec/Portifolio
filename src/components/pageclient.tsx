'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), {
  ssr: false,
});

const ChatRoom = dynamic(() => import('@/components/ChatRoom'), {
  ssr: false,
});

export default function ChatPageClient({ session }: { session: any }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        <HexagonGrid
          cellSize={60}
          glowColor="rgba(168,85,247,0.5)"
          lineColor="rgba(168,85,247,0.06)"
          glowInterval={200}
          maxSimultaneous={4}
        />
      </div>

      <main
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '20px 16px',
          height: 'calc(100vh - 76px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10,14,24,0.85)',
            border: '1px solid rgba(168,85,247,0.25)',
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <SessionProvider session={session}>
            <ChatRoom session={session} />
          </SessionProvider>
        </div>
      </main>
    </>
  );
}