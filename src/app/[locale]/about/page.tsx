'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { GradientText } from '@/components/texts/AnimatedText';
import type { AboutStoryItem } from '@/components/about/AboutScrollStory';
import type { ExpertiseGroup } from '@/components/about/InteractiveExpertiseGrid';
import ScrollEffect from '@/components/effects/ScrollEffect';
import { useClickSound } from '@/hooks/audio/useClickSound';
import { useHydrated } from '@/hooks/browser/useHydrated';
import { deriveSkills, type Repo } from '@/lib/profile/deriveSkills';

const HexagonGrid = dynamic(() => import('@/components/effects/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });
const AboutParticleField = dynamic(() => import('@/components/about/AboutParticleField'), { ssr: false });
const AboutScrollStory = dynamic(() => import('@/components/about/AboutScrollStory'));
const InteractiveExpertiseGrid = dynamic(() => import('@/components/about/InteractiveExpertiseGrid'));

export default function AboutPage() {
  useClickSound();
  const mounted = useHydrated();
  const { theme } = useTheme();
  const t = useTranslations('about');
  const [repos, setRepos] = useState<Repo[]>([]);
  const expertiseSectionRef = useRef<HTMLElement>(null);
  const [effectsReady, setEffectsReady] = useState(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const revealEffects = () => {
      setEffectsReady(true);
      setWebglReady(true);
    };

    window.addEventListener('scroll', revealEffects, { once: true, passive: true });
    window.addEventListener('pointerdown', revealEffects, { once: true, passive: true });
    return () => {
      window.removeEventListener('scroll', revealEffects);
      window.removeEventListener('pointerdown', revealEffects);
    };
  }, []);

  useEffect(() => {
    const section = expertiseSectionRef.current;
    if (!section) return;

    let active = true;
    let loaded = false;

    const loadRepos = async () => {
      if (loaded) return;
      loaded = true;

      try {
        const response = await fetch('/api/github/repos');
        const data: unknown = response.ok ? await response.json() : [];
        if (active && Array.isArray(data)) setRepos(data as Repo[]);
      } catch {
        // Static expertise content remains available when live data is unavailable.
      }
    };

    if (!('IntersectionObserver' in window)) {
      void loadRepos();
      return () => {
        active = false;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadRepos();
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(section);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  const liveSkills = useMemo(() => deriveSkills(repos), [repos]);

  const storyItems: AboutStoryItem[] = [
    {
      label: t('story.backgroundLabel'),
      title: t('background'),
      body: t('backgroundText2'),
      signal: t('story.backgroundSignal'),
      detail: t('story.backgroundDetail'),
      image: '/images/JinWoo-BackFacing3-288.avif',
      imageDesktop: '/images/JinWoo-BackFacing3-768.avif',
    },
    {
      label: t('story.expertiseLabel'),
      title: t('expertise'),
      body: t('story.expertiseBody'),
      signal: t('story.expertiseSignal'),
      detail: t('story.expertiseDetail'),
      image: '/images/JinWoo-BackFacing34-288.avif',
      imageDesktop: '/images/JinWoo-BackFacing34-768.avif',
    },
    {
      label: t('story.experienceLabel'),
      title: t('philosophy'),
      body: `${t('philosophyText1')} ${t('philosophyText2')}`,
      signal: t('story.experienceSignal'),
      detail: t('story.experienceDetail'),
      image: '/images/JinWoo-render-288.avif',
      imageDesktop: '/images/JinWoo-render-768.avif',
    },
  ];

  const expertiseVisuals = [
    { background: '/images/gifs/jinwoogf.gif', portrait: '/images/jinwoo.png' },
    { background: '/images/gifs/jinwoogf2.gif', portrait: '/images/jinwoo2.png' },
    { background: '/images/gifs/jinwoogf3.gif', portrait: '/images/jinwoo3.png' },
    { background: '/images/gifs/jinwoogf4.gif', portrait: '/images/jinwoo.png' },
    { background: '/images/gifs/jinwoogf5.gif', portrait: '/images/jinwoo2.png' },
    { background: '/images/gifs/jinwoogf6.gif', portrait: '/images/jinwoo3.png' },
    { background: '/images/gifs/jinwoogf2.gif', portrait: '/images/jinwoo.png' },
    { background: '/images/gifs/jinwoo1.gif', portrait: '/images/jinwoo3.png' },
  ];

  const expertiseGroups: ExpertiseGroup[] = [
    { title: t('security'), items: [...new Set([...liveSkills.systems, ...liveSkills.backend, 'Spring Boot'])].slice(0, 10), ...expertiseVisuals[0] },
    { title: t('development'), items: liveSkills.frontend, ...expertiseVisuals[1] },
    { title: t('backend'), items: liveSkills.backend, ...expertiseVisuals[2] },
    { title: t('cybersecurity'), items: ['Penetration Testing', 'OWASP Top 10', 'Network Security', 'Cryptography', 'Kali Linux'], ...expertiseVisuals[3] },
    { title: t('securityTools'), items: ['Burp Suite', 'Nessus', 'Hashcat', 'Gobuster', 'BloodHound', 'Ghidra'], ...expertiseVisuals[4] },
    { title: t('devtools'), items: [...new Set([...liveSkills.devops, 'Git', 'GitHub Actions', 'Maven'])].slice(0, 10), ...expertiseVisuals[5] },
    { title: t('aiTools'), items: ['ChatGPT', 'Claude', 'Gemini', 'OpenAPI', 'Swagger'], ...expertiseVisuals[6] },
    { title: t('execution'), items: ['Architecture', 'Automation', 'Testing', 'Delivery'], ...expertiseVisuals[7] },
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
      <main className="relative min-h-screen overflow-x-clip pt-20">
        {effectsReady && <ScrollEffect />}
        {effectsReady && <ParticleBackground />}
        {webglReady && (
          <AboutParticleField
            className="z-0 opacity-55"
            particleColors={theme === 'light' ? ['#3b82f6', '#2563eb', '#8b5cf6'] : ['#a855f7', '#8b5cf6', '#3b82f6']}
          />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <header className="relative mb-16 max-w-4xl">
            <div className="mb-4">
              <p className="font-[var(--font-eternal)] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('eyebrow')}</p>
            </div>
            <h1 className="font-[var(--font-eternal)] text-5xl font-bold uppercase tracking-[0.05em] sm:text-6xl md:text-8xl">
              <GradientText>{t('title')}</GradientText>
            </h1>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">{t('backgroundText1')}</p>
            <div className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--theme-primary)]">
              <span className="h-px w-16 bg-[var(--theme-primary)]" />
              <span>{t('profileSignal')}</span>
            </div>
          </header>

          <AboutScrollStory items={storyItems} sectionLabel={t('story.sectionLabel')} prompt={t('story.prompt')} traceLabel={t('story.traceLabel')} />

          <section ref={expertiseSectionRef} className="relative py-20" aria-labelledby="expertise-title">
            <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
              <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--theme-primary)]">{t('stackStatus', { count: repos.length })}</p>
                <h2 id="expertise-title" className="mt-3 font-[var(--font-solo-heading)] text-3xl font-bold uppercase tracking-[0.08em] text-[var(--text-primary)] md:text-5xl">{t('expertise')}</h2>
              </div>
            </div>
            <InteractiveExpertiseGrid groups={expertiseGroups} moduleLabel={t('story.moduleLabel')} />
          </section>
        </div>
      </main>
    </>
  );
}
