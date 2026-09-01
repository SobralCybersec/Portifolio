'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Github, Linkedin, Mail } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import { AnimatedText, GradientText } from '@/components/texts/AnimatedText';
import ContactCommandForm from '@/components/contact/ContactCommandForm';
import ScrollEffect from '@/components/effects/ScrollEffect';
import { useClickSound } from '@/hooks/audio/useClickSound';
import { useDeferredMount } from '@/hooks/browser/useDeferredMount';
import { useHydrated } from '@/hooks/browser/useHydrated';

const HexagonGrid = dynamic(() => import('@/components/effects/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });
const AboutParticleField = dynamic(() => import('@/components/about/AboutParticleField'), { ssr: false });

export default function ContactPage() {
  useClickSound();
  const mounted = useHydrated();
  const effectsReady = useDeferredMount();
  const webglReady = useDeferredMount(2500);
  const { theme } = useTheme();
  const t = useTranslations('contact');
  const isLight = mounted && theme === 'light';

  const socialLinks = [
    { icon: Github, label: t('github'), href: 'https://github.com/SobralCybersec' },
    { icon: Mail, label: t('email'), href: 'mailto:matheussobrallinkedin@gmail.com' },
    { icon: Linkedin, label: t('linkedin'), href: 'https://www.linkedin.com/in/matheus-sobral-b17a5b1b9/' },
  ];

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {effectsReady && mounted && theme === 'dark' && (
        <div className="pointer-events-none fixed inset-0 z-[-2]">
          <HexagonGrid
            cellSize={60}
            glowColor="rgba(168, 85, 247, 0.6)"
            lineColor="rgba(168, 85, 247, 0.08)"
            glowInterval={150}
            maxSimultaneous={6}
          />
        </div>
      )}
      <main className="relative overflow-hidden pt-20">
        {effectsReady && <ScrollEffect />}
        {effectsReady && <ParticleBackground />}
        {webglReady && (
          <AboutParticleField
            className="z-0 opacity-45"
            particleColors={isLight ? ['#3b82f6', '#2563eb', '#8b5cf6'] : ['#a855f7', '#8b5cf6', '#3b82f6']}
            particleCount={110}
            particleSpread={1.4}
          />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <header className="mb-10 max-w-4xl md:mb-12">
            <AnimatedText className="mb-4">
              <p className="font-[var(--font-eternal)] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('eyebrow')}</p>
            </AnimatedText>
            <AnimatedText delay={0.1}>
              <h1 className="font-[var(--font-eternal)] text-5xl font-bold uppercase tracking-[0.05em] sm:text-6xl md:text-8xl">
                <GradientText>{t('title')}</GradientText>
              </h1>
            </AnimatedText>
            <div className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--theme-primary)]">
              <span className="h-px w-16 bg-[var(--theme-primary)]" />
              <span>{t('signal')}</span>
            </div>
          </header>

          <ContactCommandForm
            title={t('getInTouch')}
            description={t('description')}
            emailAddress="matheussobrallinkedin@gmail.com"
            emailLabel={t('email')}
            links={socialLinks}
            accentColor={isLight ? '#3b82f6' : '#a855f7'}
            copy={{
              transmission: t('transmission'),
              identity: t('identity'),
              namePlaceholder: t('namePlaceholder'),
              projectBrief: t('projectBrief'),
              projectBriefPlaceholder: t('projectBriefPlaceholder'),
              validationError: t('validationError'),
              draftReady: t('draftReady'),
              openMailChannel: t('openMailChannel'),
              draftReadyButton: t('draftReadyButton'),
              directChannel: t('directChannel'),
              responseWindow: t('responseWindow'),
              opportunities: t('opportunities'),
            }}
          />

          <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-6 border-t border-[var(--border)] pt-6 md:flex-row md:justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{t('footer')}</p>
            <div className="opacity-80 transition-opacity hover:opacity-100">
              <a
                data-theme={isLight ? 'light' : 'dark'}
                className="inline-flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 transition-colors hover:border-[var(--theme-primary)]"
                href="https://br.linkedin.com/in/matheusdecyber"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">LinkedIn</span>
                  <span className="font-semibold text-[var(--text-primary)]">Matheus S.</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
