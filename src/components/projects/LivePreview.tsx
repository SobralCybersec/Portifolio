'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AnimatedText } from '@/components/texts/AnimatedText';
import { Activity, ArrowUpRight, Github, Play, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function LivePreview() {
  const t = useTranslations('liveCoding');
  const readmeError = t('readmeError');
  const gifMissingError = t('gifMissingError');
  const unknownError = t('unknownError');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchGifUrl = useCallback(async (guard?: { cancelled: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/SobralCybersec/SobralCybersec/main/README.md'
      );

      if (!response.ok) {
        throw new Error(readmeError);
      }

      const text = await response.text();

      const gifRegex = /<img\s+src="(https:\/\/github\.com\/SobralCybersec\/SobralCybersec\/releases\/download\/[^"]+\.gif)"/i;
      const match = text.match(gifRegex);

      if (guard?.cancelled) return;
      if (match && match[1]) {
        setGifUrl(match[1]);

        const dateMatch = match[1].match(/(\d{4}-\d{2}-\d{2}\.\d{2}-\d{2}-\d{2})/);
        if (dateMatch) {
          const dateStr = dateMatch[1].replace(/\./g, ' ').replace(/-/g, ':');
          setLastUpdated(dateStr);
        }
      } else {
        throw new Error(gifMissingError);
      }
    } catch (err) {
      if (guard?.cancelled) return;
      setError(err instanceof Error ? err.message : unknownError);
    } finally {
      if (!guard?.cancelled) setLoading(false);
    }
  }, [gifMissingError, readmeError, unknownError]);

  useEffect(() => {
    const guard = { cancelled: false };
    async function load() { await fetchGifUrl(guard); }
    load();
    return () => { guard.cancelled = true; };
  }, [fetchGifUrl]);

  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
          <AnimatedText delay={0.1}>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--theme-primary)]">{t('feedEyebrow')}</p>
              <h2 className="section-title mb-0">{t('title')}</h2>
          </AnimatedText>
          
          <AnimatedText delay={0.2}>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-muted)] md:text-lg">
              {t('description')}
            </p>
          </AnimatedText>
          </div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative grid w-full gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-8"
        >
          <div
            className="group relative overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]/[0.84] shadow-[0_30px_100px_rgba(0,0,0,0.2)] [background-image:radial-gradient(440px_circle_at_var(--live-x,50%)_var(--live-y,50%),rgba(168,85,247,0.13),transparent_72%)]"
            onPointerMove={(event) => {
              if (event.pointerType === 'touch') return;
              const rect = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty('--live-x', `${event.clientX - rect.left}px`);
              event.currentTarget.style.setProperty('--live-y', `${event.clientY - rect.top}px`);
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/[0.08] via-transparent to-[var(--theme-accent)]/[0.06]" />
            <div className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-[var(--theme-primary)] shadow-[0_0_18px_var(--theme-primary)]" />
            <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-[var(--text-muted)] font-mono">
                  live-coding-session.gif
                </span>
              </div>
              
              <button
                onClick={() => fetchGifUrl()}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--theme-primary)] transition-colors disabled:opacity-50"
                aria-label={t('refresh')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {t('refresh')}
              </button>
            </div>

            <div className="relative z-10 p-3 sm:p-5 md:p-6">
              {loading && (
                <div className="flex min-h-[220px] flex-col items-center justify-center sm:min-h-[360px] md:min-h-[560px]">
                  <div className="w-16 h-16 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[var(--text-muted)] font-mono text-sm">{t('loading')}</p>
                </div>
              )}

              {error && (
                <div className="flex min-h-[220px] flex-col items-center justify-center sm:min-h-[360px] md:min-h-[560px]">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[var(--text-muted)] font-mono text-sm mb-4">{error}</p>
                  <button
                    onClick={() => fetchGifUrl()}
                    className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:bg-[var(--theme-secondary)] transition-colors"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              )}

              {!loading && !error && gifUrl && (
                <div className="space-y-5">
                  <div className="relative aspect-video min-h-0 w-full overflow-hidden rounded-lg bg-black sm:aspect-[16/10] sm:min-h-[360px] md:min-h-[560px]">
                    <Image
                      src={gifUrl}
                      alt={t('imageAlt')}
                      fill
                      className="object-contain"
                      loading="lazy"
                      unoptimized
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="w-20 h-20 rounded-full bg-[var(--theme-primary)]/80 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center">
                    <p className="text-[var(--text-muted)] font-mono" suppressHydrationWarning>
                      {lastUpdated && (
                        <>
                          <span className="text-[var(--theme-primary)]">{t('lastUpdated')}:</span> {lastUpdated}
                        </>
                      )}
                    </p>
                    
                    <a
                      href="https://github.com/SobralCybersec/SobralCybersec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-muted)] hover:text-[var(--theme-primary)] transition-colors flex items-center gap-2"
                    >
                      <span>{t('viewOnGithub')}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </div>

                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="border border-[var(--border)] bg-[var(--bg-card)]/[0.55] p-6">
              <Github className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
              <a
                href="https://github.com/SobralCybersec/SobralCybersec"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--theme-primary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <span className="break-all">github.com/SobralCybersec</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>

            <div className="border border-[var(--border)] bg-[var(--bg-card)]/[0.55] p-6">
              <div className="group mt-5 overflow-hidden border border-[var(--border)] bg-black/30 p-2 transition-colors hover:border-[var(--theme-primary)]/50">
                <Image
                  src="/images/CurseForgeProfile.png"
                  alt="CurseForge profile"
                  width={512}
                  height={701}
                  loading="lazy"
                  sizes="(min-width: 1024px) 20vw, 90vw"
                  className="h-auto max-h-[120rem] w-full object-contain object-top transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                />
              </div>
            </div>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}
