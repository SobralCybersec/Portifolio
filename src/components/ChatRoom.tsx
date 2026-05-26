'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Pusher from 'pusher-js';
import type { ChatMessage } from '@/app/api/chat/messages/route';

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          background: '#a855f7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: size * 0.4, color: '#fff', flexShrink: 0,
        }}
      >
        {name[0]?.toUpperCase()}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
      onError={() => setErr(true)}
    />
  );
}

export default function ChatRoom({ session }: { session: Session | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    fetch('/api/chat/messages')
      .then(r => r.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(console.error);
  }, []);

  // Pusher realtime
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe('chat');

    channel.bind('message', (msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('chat');
      pusher.disconnect();
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    if (!text.trim() || sending || !session) return;
    setSending(true);
    const body = text.trim();
    setText('');
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body }),
      });
    } catch {
      setText(body); // restore on network error
    } finally {
      setSending(false);
    }
  }, [text, sending, session]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isOwn = (msg: ChatMessage) => msg.userId === session?.user?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(168,85,247,0.2)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontSize: 13, letterSpacing: 2, color: '#a855f7', textTransform: 'uppercase' }}>
            Live Chat
          </span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{messages.length} messages</span>
        </div>

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar src={session.user?.image} name={session.user?.name ?? '?'} size={28} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              style={{
                fontSize: 11, color: '#6b7280', background: 'none',
                border: '1px solid rgba(107,114,128,0.3)', borderRadius: 4,
                padding: '3px 8px', cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
              color: '#e5e7eb', background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.4)', borderRadius: 6,
              padding: '6px 14px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
            Sign in with GitHub
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#4b5563', fontSize: 13, marginTop: 40 }}>
            No messages yet. Be the first to say something!
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: isOwn(msg) ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <Avatar src={msg.userImage} name={msg.userName} size={36} />
            <div style={{
              maxWidth: '70%', display: 'flex', flexDirection: 'column',
              alignItems: isOwn(msg) ? 'flex-end' : 'flex-start', gap: 3,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                flexDirection: isOwn(msg) ? 'row-reverse' : 'row',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isOwn(msg) ? '#a855f7' : '#9ca3af' }}>
                  {msg.userName}
                </span>
                <span style={{ fontSize: 10, color: '#4b5563' }}>{formatTime(msg.createdAt)}</span>
              </div>
              <div style={{
                padding: '8px 12px',
                borderRadius: isOwn(msg) ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                background: isOwn(msg) ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isOwn(msg) ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: 14, color: '#e5e7eb', lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(168,85,247,0.2)', flexShrink: 0 }}>
        {session ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              maxLength={500}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8,
                padding: '10px 14px', color: '#e5e7eb', fontSize: 14,
                resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              style={{
                padding: '10px 18px',
                background: text.trim() && !sending ? 'rgba(168,85,247,0.8)' : 'rgba(168,85,247,0.2)',
                border: '1px solid rgba(168,85,247,0.5)',
                borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s', flexShrink: 0,
              }}
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, padding: '8px 0' }}>
            <button
              onClick={() => signIn('github')}
              style={{ color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}
            >
              Sign in with GitHub
            </button>
            {' '}to join the conversation
          </div>
        )}
      </div>
    </div>
  );
}