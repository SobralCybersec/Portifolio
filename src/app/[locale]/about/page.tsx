'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import AboutScrollStory, { type AboutStoryItem } from '@/components/about/AboutScrollStory';
import InteractiveExpertiseGrid, { type ExpertiseGroup } from '@/components/about/InteractiveExpertiseGrid';
import ScrollEffect from '@/components/ScrollEffect';
import ScrollReveal from '@/components/ScrollReveal';
import { useClickSound } from '@/hooks/useClickSound';
import { useHydrated } from '@/hooks/useHydrated';
import { deriveSkills, type Repo } from '@/lib/deriveSkills';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });
const AboutParticleField = dynamic(() => import('@/components/about/AboutParticleField'), { ssr: false });

export default function AboutPage() {
  useClickSound();
  const mounted = useHydrated();
  const { theme } = useTheme();
  const t = useTranslations('about');
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    let active = true;

    fetch('/api/github/repos')
      .then((response) => (response.ok ? response.json() : []))
      .then((data: unknown) => {
        if (active && Array.isArray(data)) setRepos(data as Repo[]);
      })
      .catch(() => undefined);

    return () => {
      active = false;
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
      image: '/images/JinWoo-BackFacing3.png',
    },
    {
      label: t('story.expertiseLabel'),
      title: t('expertise'),
      body: t('story.expertiseBody'),
      signal: t('story.expertiseSignal'),
      detail: t('story.expertiseDetail'),
      image: '/images/JinWoo-BackFacing34 (2).png',
    },
    {
      label: t('story.experienceLabel'),
      title: t('philosophy'),
      body: `${t('philosophyText1')} ${t('philosophyText2')}`,
      signal: t('story.experienceSignal'),
      detail: t('story.experienceDetail'),
      image: '/images/JinWoo-render.png',
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
      {mounted && theme === 'dark' && (
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
        <ScrollEffect />
        <ParticleBackground />
        <AboutParticleField
          className="z-0 opacity-55"
          particleColors={theme === 'light' ? ['#3b82f6', '#2563eb', '#8b5cf6'] : ['#a855f7', '#8b5cf6', '#3b82f6']}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <header className="relative mb-16 max-w-4xl">
            <AnimatedText className="mb-4">
              <p className="font-[var(--font-eternal)] text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('eyebrow')}</p>
            </AnimatedText>
            <AnimatedText delay={0.1}>
              <h1 className="font-[var(--font-eternal)] text-5xl font-bold uppercase tracking-[0.05em] sm:text-6xl md:text-8xl">
                <GradientText>{t('title')}</GradientText>
              </h1>
            </AnimatedText>
            <ScrollReveal containerClassName="mt-8 max-w-3xl" textClassName="text-base text-[var(--text-muted)] md:text-lg">
              {t('backgroundText1')}
            </ScrollReveal>
            <div className="mt-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--theme-primary)]">
              <span className="h-px w-16 bg-[var(--theme-primary)]" />
              <span>{t('profileSignal')}</span>
            </div>
          </header>

          <AboutScrollStory items={storyItems} sectionLabel={t('story.sectionLabel')} prompt={t('story.prompt')} traceLabel={t('story.traceLabel')} />

          <section className="relative py-20" aria-labelledby="expertise-title">
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
