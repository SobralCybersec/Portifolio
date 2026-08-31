'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Pusher from 'pusher-js';
import { useTranslations } from 'next-intl';
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
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: size * 0.4,
          color: '#fff', flexShrink: 0,
          boxShadow: '0 0 10px rgba(168,85,247,0.5)',
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
      style={{
        borderRadius: '50%', flexShrink: 0, objectFit: 'cover',
        boxShadow: '0 0 8px rgba(168,85,247,0.4)',
        border: '1px solid rgba(168,85,247,0.3)',
      }}
      onError={() => setErr(true)}
    />
  );
}

export default function ChatRoom({ session }: { session: Session | null }) {
  const t = useTranslations('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/chat/messages', { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(err => { if ((err as Error).name !== 'AbortError') console.error(err); });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;
    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe('chat');
    channel.bind('message', (msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg].slice(-100);
      });
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe('chat');
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    if (!text.trim() || sending || !session) return;
    setSending(true);
    const body = text.trim();
    setText('');
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setText(body);
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
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes msg-in-own {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes msg-in-other {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chat-msg-own {
          animation: msg-in-own 0.22s ease both;
        }
        .chat-msg-other {
          animation: msg-in-other 0.22s ease both;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(168,85,247,0.25);
          border-radius: 4px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168,85,247,0.5);
        }
        .send-btn:not(:disabled):hover {
          background: rgba(168,85,247,0.95) !important;
          box-shadow: 0 0 24px rgba(168,85,247,0.55) !important;
          transform: translateY(-1px);
        }
        .send-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .send-btn {
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s !important;
        }
        .signout-btn:hover {
          border-color: rgba(168,85,247,0.4) !important;
          color: #a855f7 !important;
        }
        .bubble-own {
          transition: box-shadow 0.2s;
        }
        .bubble-own:hover {
          box-shadow: 0 0 20px rgba(168,85,247,0.3) !important;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', flexShrink: 0,
          borderBottom: '1px solid rgba(168,85,247,0.18)',
          background: 'linear-gradient(90deg, rgba(168,85,247,0.06) 0%, transparent 60%)',
          position: 'relative',
        }}>
          {/* top shimmer line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.4)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 12, letterSpacing: 3, color: '#a855f7',
              textTransform: 'uppercase', fontWeight: 600,
            }}>
              {t('title')}
            </span>
            <span style={{
              fontSize: 11, color: 'rgba(168,85,247,0.4)',
              background: 'rgba(168,85,247,0.08)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: 4, padding: '1px 7px',
            }}>
              {messages.length}
            </span>
          </div>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar src={session.user?.image} name={session.user?.name ?? '?'} size={28} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{session.user?.name}</span>
              <button
                className="signout-btn"
                onClick={() => signOut()}
                style={{
                  fontSize: 11, color: '#6b7280', background: 'none',
                  border: '1px solid rgba(107,114,128,0.25)', borderRadius: 4,
                  padding: '3px 8px', cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                {t('signOut')}
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
              {t('signInGithub')}
            </button>
          )}
        </div>

        {/* ── Messages ── */}
        <div
          className="chat-scroll"
          style={{
            flex: 1, overflowY: 'auto', padding: '20px 20px 12px',
            display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0,
          }}
        >
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center', marginTop: 60,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '1px solid rgba(168,85,247,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>

              </div>
              <p style={{ color: '#4b5563', fontSize: 13, margin: 0 }}>
                {t('emptyState')}
              </p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={isOwn(msg) ? 'chat-msg-own' : 'chat-msg-other'}
              style={{
                display: 'flex',
                flexDirection: isOwn(msg) ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <Avatar src={msg.userImage} name={msg.userName} size={34} />

              <div style={{
                maxWidth: '70%', display: 'flex', flexDirection: 'column',
                alignItems: isOwn(msg) ? 'flex-end' : 'flex-start', gap: 4,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexDirection: isOwn(msg) ? 'row-reverse' : 'row',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: isOwn(msg) ? '#a855f7' : '#9ca3af',
                    letterSpacing: 0.5,
                  }}>
                    {msg.userName}
                  </span>
                  <span style={{ fontSize: 10, color: '#374151' }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                <div
                  className={isOwn(msg) ? 'bubble-own' : ''}
                  style={{
                    padding: '9px 13px',
                    borderRadius: isOwn(msg) ? '14px 3px 14px 14px' : '3px 14px 14px 14px',
                    background: isOwn(msg)
                      ? 'rgba(168,85,247,0.18)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isOwn(msg) ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: isOwn(msg)
                      ? '0 0 14px rgba(168,85,247,0.15), inset 0 0 20px rgba(168,85,247,0.04)'
                      : 'none',
                    fontSize: 14, color: '#e5e7eb', lineHeight: 1.55,
                    wordBreak: 'break-word',
                    position: 'relative',
                  }}
                >
                  {/* own bubble left accent bar */}
                  {isOwn(msg) && (
                    <div style={{
                      position: 'absolute', top: 8, right: -1, bottom: 8,
                      width: 2, borderRadius: 2,
                      background: 'linear-gradient(to bottom, #a855f7, rgba(168,85,247,0.2))',
                    }} />
                  )}
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div style={{
          padding: '12px 20px', flexShrink: 0,
          borderTop: '1px solid rgba(168,85,247,0.18)',
          background: 'linear-gradient(180deg, transparent, rgba(168,85,247,0.03))',
          position: 'relative',
        }}>
          {/* bottom shimmer line */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)',
          }} />

          {session ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKey}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={t('inputPlaceholder')}
                rows={1}
                maxLength={500}
                style={{
                  flex: 1,
                  background: inputFocused ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${inputFocused ? 'rgba(168,85,247,0.6)' : 'rgba(168,85,247,0.25)'}`,
                  boxShadow: inputFocused ? '0 0 20px rgba(168,85,247,0.15), inset 0 0 12px rgba(168,85,247,0.04)' : 'none',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#e5e7eb', fontSize: 14, resize: 'none',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                }}
              />
              <button
                className="send-btn"
                onClick={send}
                disabled={!text.trim() || sending}
                style={{
                  padding: '10px 20px',
                  background: text.trim() && !sending
                    ? 'rgba(168,85,247,0.8)'
                    : 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.5)',
                  borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                  boxShadow: text.trim() && !sending
                    ? '0 0 18px rgba(168,85,247,0.35)'
                    : 'none',
                  flexShrink: 0, letterSpacing: 0.5,
                }}
              >
                {sending ? '…' : t('send')}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, padding: '8px 0' }}>
              <button
                onClick={() => signIn('github')}
                style={{
                  color: '#a855f7', background: 'none', border: 'none',
                  cursor: 'pointer', textDecoration: 'underline', fontSize: 13,
                }}
              >
                {t('signInGithub')}
              </button>
              {' '}{t('joinConversation')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
