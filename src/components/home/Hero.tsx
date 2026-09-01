'use client';

import Image from 'next/image';
import { ArrowRight, Briefcase, Code2, Github, Globe, MapPin, GitCommit, Download } from 'lucide-react';
import { AnimatedText, AnimatedWord, GradientText } from '@/components/texts/AnimatedText';
import { Typewriter } from '@/components/texts/Typewriter';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import LetterGlitch from '@/components/effects/LetterGlitch';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/config/routing';
import MetricsTicker from './MetricsTicker';
import MagneticButton from '@/components/ui/MagneticButton';
import ScrollVelocityRibbon from '@/components/effects/ScrollVelocityRibbon';

interface HeroProps {
  animateSection?: string;
}

export default function Hero({ animateSection }: HeroProps) {
  const t = useTranslations('hero');
  const { theme } = useTheme();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [statValues, setStatValues] = useState(['50+', '5Y', '1K+']);

  const stats = [
    { label: t('stats.projects'), value: statValues[0], icon: Code2 },
    { label: t('stats.experience'), value: statValues[1], icon: Briefcase },
    { label: t('stats.commits'), value: statValues[2], icon: GitCommit },
  ];

  const highlights = [
    t('highlights.fullstack'),
    t('highlights.architecture'),
    t('highlights.tdd'),
    t('highlights.opensource'),
  ];

  const badges = [
    { src: '/images/badges/badge.png', alt: 'Badge 1' },
    { src: '/images/badges/badge1.png', alt: 'Badge 2' },
    { src: '/images/badges/badge2.png', alt: 'Badge 3' },
    { src: '/images/badges/badge3.png', alt: 'Badge 4' },
  ];

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/github/stats');
        const data = await res.json();
        setStatValues([
          `${data.publicRepos}+`,
          `${data.yearsActive}Y`,
          `${Math.floor(data.totalCommits / 1000)}K+`,
        ]);
      } catch {}
    }
    fetchStats();
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-grid">

          {/* Left — content */}
          <div className="hero-left-col">
            <AnimatedText delay={0}>
              <div className="hero-badges" suppressHydrationWarning>
                <span className="hero-badge">
                  <MapPin className="w-3 h-3" />
                  {t('location')}
                </span>
                <span className="hero-badge hero-badge-outline">
                  <Briefcase className="w-3 h-3" />
                  {t('availability')}
                </span>
              </div>
            </AnimatedText>

            <div className="hero-text-block">
              <AnimatedText delay={0.1}>
                <p className="hero-eyebrow">
                  <Typewriter 
                    text={t('title')} 
                    duration={1.5}
                    delay={0.5}
                    cursor={false}
                  />
                </p>
              </AnimatedText>
              
              <AnimatedText delay={0.2}>
                <div className="animate-clip-intro">
                  <h1 className="hero-name">
                    {t('greeting')} <GradientText>Matheus Sobral</GradientText>
                  </h1>
                </div>
              </AnimatedText>
              
              <AnimatedText delay={0.3}>
                <p className="hero-description">
                  <Typewriter 
                    text={t('description')}
                    duration={3}
                    delay={2}
                    cursor={false}
                  />
                </p>
              </AnimatedText>
            </div>

            <AnimatedText delay={0.4}>
              <div className="hero-highlights" suppressHydrationWarning>
                {highlights.map((h) => (
                  <div key={h} className="hero-highlight-item">
                    <span className="hero-highlight-dot" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </AnimatedText>

            <AnimatedText delay={0.5}>
              <div className="hero-cta-row" suppressHydrationWarning>
                <MagneticButton href="/projects" className="hero-btn-primary">
                  {t('cta.viewProjects')}
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
                <MagneticButton href="/chat" variant="outline" className="hero-btn-secondary">
                  {t('cta.readBlog')}
                </MagneticButton>
                <a 
                  href={locale === 'pt' ? '/cv/cv.pdf' : '/cv/cven.pdf'}
                  download
                  className="hero-btn-secondary"
                >
                  <Download className="w-4 h-4" />
                  {t('cta.downloadCV')}
                </a>
              </div>
            </AnimatedText>

            <AnimatedText delay={0.7}>
              <div className="flex gap-3 mt-6" suppressHydrationWarning>
                {badges.map((badge, i) => (
                  <div key={i} className="neon-badge">
                    <div className="relative w-full h-full">
                      <Image
                        src={badge.src}
                        alt={badge.alt}
                        fill
                        className="object-contain"
                        quality={75}
                        sizes="74px"
                        style={theme === 'light' && i === 0 ? { filter: 'invert(1)' } : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedText>
          </div>

          {/* Right — image + stats */}
          <div className="hero-right-col">
            <AnimatedText critical>
              <div className="hero-image-wrapper" suppressHydrationWarning>
                <div className="hero-image-frame">
                  {/* LetterGlitch Background */}
                  <div className="hero-glitch-bg">
                    <LetterGlitch
                      glitchColors={theme === 'light' ? ['#ffffff', '#f5f5f5', '#e5e5e5'] : ['#7c3aed', '#8b5cf6', '#a855f7']}
                      glitchSpeed={60}
                      centerVignette={false}
                      outerVignette={true}
                      smooth={true}
                      vignetteColor={theme === 'light' ? '255,255,255' : '0,0,0'}
                    />
                  </div>
                  <Image
                    src={theme === 'light' ? '/images/JinWoo-BackFacing3-768.avif' : '/images/JinWoo-render-768.avif'}
                    alt="Matheus Sobral — Developer"
                    fill
                    className="hero-img"
                    fetchPriority="high"
                    loading="eager"
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                </div>
                <div className="hero-available-badge">
                  <span className="hero-available-dot" />
                  <span>{t('openToOpportunities')}</span>
                </div>
              </div>
            </AnimatedText>

            <AnimatedText delay={0.4}>
              <div className="hero-stats-grid" suppressHydrationWarning>
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="hero-stat-card">
                      <div className="hero-stat-icon">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="hero-stat-value">{stat.value}</div>
                        <div className="hero-stat-label">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedText>
          </div>

        </div>

        <div className="mt-10 border-y border-[var(--border)] bg-[var(--bg-card)]/[0.35] py-2 text-[var(--theme-primary)]" aria-label={t('scrollCapabilities')}>
          <ScrollVelocityRibbon className="font-mono text-xs uppercase tracking-[0.22em]" baseVelocity={0.7}>
            {highlights.join('  •  ')}
          </ScrollVelocityRibbon>
        </div>

        {/* Metrics Ticker - Below Stats */}
        <AnimatedText delay={0.6}>
          <MetricsTicker />
        </AnimatedText>
      </div>
    </section>
  );
}
