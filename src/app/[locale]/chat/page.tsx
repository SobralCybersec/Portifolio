import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { HexagonGrid, ClientChatRoom } from '@/components/ClientOnlyComponents';
import ChatEffects from '@/components/ChatEffects';

export default async function ChatPage() {
  const session = await auth();
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', opacity: 0.4 }}>
        <HexagonGrid
          cellSize={60}
          glowColor="rgba(168,85,247,0.5)"
          lineColor="rgba(168,85,247,0.06)"
          glowInterval={200}
          maxSimultaneous={4}
        />
      </div>

      {/* Snow + sprite layer */}
      <ChatEffects />

      <Navigation />
      <main style={{
        maxWidth: 860, margin: '0 auto', padding: '20px 16px',
        height: 'calc(100vh - 76px)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: 'rgba(10,14,24,0.85)',
          border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: 12,
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          minHeight: 0,
          boxShadow: '0 0 40px rgba(168,85,247,0.08), inset 0 0 60px rgba(168,85,247,0.03)',
          position: 'relative',
        }}>
          {/* scanline overlay on the chat panel */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
            background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(168,85,247,0.025) 3px)',
            borderRadius: 12,
          }} />
          <SessionProvider session={session}>
            <ClientChatRoom session={session} />
          </SessionProvider>
        </div>
      </main>
    </>
  );
}