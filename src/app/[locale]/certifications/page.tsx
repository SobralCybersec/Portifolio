'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/layout/Navigation';
import RouteView from '@/components/layout/RouteView';
import { AnimatedText, GradientText } from '@/components/texts/AnimatedText';
import { useClickSound } from '@/hooks/audio/useClickSound';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollEffect from '@/components/effects/ScrollEffect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Award, CheckCircle2, Layers3, ShieldCheck, X } from 'lucide-react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import { useReducedMotion } from 'framer-motion';
import { useHydrated } from '@/hooks/browser/useHydrated';
import { useDeferredMount } from '@/hooks/browser/useDeferredMount';
import type { CSSProperties } from 'react';

const HexagonGrid = dynamic(() => import('@/components/effects/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });

interface Certification {
  name: string;
  image: string;
  issuer: string;
  date?: string;
  description: string;
  skills: string[];
  credentialUrl?: string;
  category: string;
}

interface CertificationCardProps {
  cert: Certification;
  index: number;
  categoryLabel: string;
  featured?: boolean;
  reduceMotion: boolean;
  onSelect: () => void;
}

function CertificationCard({
  cert,
  index,
  categoryLabel,
  featured = false,
  reduceMotion,
  onSelect,
}: CertificationCardProps) {
  const hasCredential = Boolean(cert.credentialUrl && cert.credentialUrl !== '#');
  const visibleSkills = cert.skills.filter(Boolean).slice(0, featured ? 3 : 2);

  return (
    <article
      className={`cert-card ${featured ? 'cert-card-featured' : ''} ${reduceMotion ? 'cert-card-reduced-motion' : ''}`}
      style={{ '--cert-delay': reduceMotion ? '0ms' : `${Math.min(index * 55, 420)}ms` } as CSSProperties}
    >
      <button
        type="button"
        className="cert-card-hit"
        onClick={onSelect}
        aria-label={`${cert.name} — ${cert.issuer}`}
      >
        <span className="cert-card-line cert-card-line-top" aria-hidden="true" />
        <span className="cert-card-line cert-card-line-side" aria-hidden="true" />
        <span className="cert-card-corner cert-card-corner-top" aria-hidden="true" />
        <span className="cert-card-corner cert-card-corner-bottom" aria-hidden="true" />

        <span className="cert-card-topline">
          <span className="cert-card-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="cert-card-category">{categoryLabel}</span>
        </span>

        <span className="cert-card-media">
          <Image
            src={cert.image}
            alt={cert.name}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            priority={index < 2}
            className="cert-card-image"
          />
          <span className="cert-card-media-wash" aria-hidden="true" />
          <span className="cert-card-media-label" aria-hidden="true">ARCHIVE / {String(index + 1).padStart(2, '0')}</span>
        </span>

        <span className="cert-card-body">
          <span className="cert-card-issuer">
            <span className="cert-card-status" aria-hidden="true" />
            <span>{cert.issuer}</span>
            {hasCredential && <CheckCircle2 className="cert-card-check" aria-label="Verified credential" />}
          </span>
          <span className="cert-card-title">{cert.name}</span>
          <span className="cert-card-description">{cert.description}</span>
          <span className="cert-card-meta">
            <span>{cert.date || tFallback('record')}</span>
            <span className="cert-card-open">
              {hasCredential ? tFallback('verified') : tFallback('inspect')}
              <ArrowUpRight aria-hidden="true" />
            </span>
          </span>
          {visibleSkills.length > 0 && (
            <span className="cert-card-skills">
              {visibleSkills.map((skill, skillIndex) => (
                <span key={`${skill}-${skillIndex}`}>{skill.trim()}</span>
              ))}
            </span>
          )}
        </span>
      </button>
    </article>
  );
}

function tFallback(key: 'record' | 'verified' | 'inspect') {
  return {
    record: 'RECORD',
    verified: 'VERIFIED',
    inspect: 'INSPECT',
  }[key];
}

export default function CertificationsPage() {
  useClickSound();
  const mounted = useHydrated();
  const effectsReady = useDeferredMount();
  const { theme } = useTheme();
  const t = useTranslations('certifications');
  const reduceMotion = useReducedMotion() ?? false;
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: t('filters.all') },
    { id: 'aws', label: t('filters.aws') },
    { id: 'google', label: t('filters.google') },
    { id: 'fiap', label: t('filters.fiap') },
    { id: 'uci', label: t('filters.uci') },
    { id: 'udemy', label: t('filters.udemy') },
    { id: 'community', label: t('filters.community') },
    { id: 'anthropic', label: t('filters.anthropic') },
    { id: 'openai', label: t('filters.openai') },
  ];

  // Get translated certifications
  const getCertifications = useCallback((): Certification[] => [
    {
      name: t('certs.awsSolutionsArchitect.name'),
      image: '/certifications/aws1.png',
      issuer: 'Amazon Web Services',
      date: '2025',
      description: t('certs.awsSolutionsArchitect.description'),
      skills: t('certs.awsSolutionsArchitect.skills').split(','),
      credentialUrl: '#',
      category: 'aws'
    },
    {
      name: t('certs.awsMigration.name'),
      image: '/certifications/aws2.png',
      issuer: 'Amazon Web Services',
      date: '2025',
      description: t('certs.awsMigration.description'),
      skills: t('certs.awsMigration.skills').split(','),
      credentialUrl: 'https://www.coursera.org/learn/aws-fundamentals-migrating-to-the-cloud',
      category: 'aws'
    },
    {
      name: t('certs.fiapJava.name'),
      image: '/certifications/fiapjavadevelopment.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapJava.description'),
      skills: t('certs.fiapJava.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.fiapCyber.name'),
      image: '/certifications/fiapcibersecurityskills.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapCyber.description'),
      skills: t('certs.fiapCyber.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.fiapDotnet.name'),
      image: '/certifications/fiapdesenvolvimentodotnet.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapDotnet.description'),
      skills: t('certs.fiapDotnet.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.fiapBlockchain.name'),
      image: '/certifications/fiapnanoblockchain.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapBlockchain.description'),
      skills: t('certs.fiapBlockchain.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.fiapLogic.name'),
      image: '/certifications/fiapprogramminglogical.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapLogic.description'),
      skills: t('certs.fiapLogic.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.fiapAlgorithms.name'),
      image: '/certifications/fiapalgoritms.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapAlgorithms.description'),
      skills: t('certs.fiapAlgorithms.skills').split(','),
      category: 'fiap'
    },
    {
      name: t('certs.googleNetwork.name'),
      image: '/certifications/connectandprotect.jpg',
      issuer: 'Google',
      date: '2025',
      description: t('certs.googleNetwork.description'),
      skills: t('certs.googleNetwork.skills').split(','),
      credentialUrl: 'https://www.coursera.org/learn/networks-and-network-security',
      category: 'google'
    },
    {
      name: t('certs.googleCyber.name'),
      image: '/certifications/googlecibersecurityfoundations.png',
      issuer: 'Google',
      date: '2025',
      description: t('certs.googleCyber.description'),
      skills: t('certs.googleCyber.skills').split(','),
      category: 'google'
    },
    {
      name: t('certs.uciPM.name'),
      image: '/certifications/uci.png',
      issuer: 'University of California, Irvine',
      date: '2025',
      description: t('certs.uciPM.description'),
      skills: t('certs.uciPM.skills').split(','),
      credentialUrl: 'https://www.coursera.org/learn/projeto-aplicado',
      category: 'uci'
    },
    {
      name: t('certs.udemyPython.name'),
      image: '/certifications/thecompleteherobootcamppython.jpg',
      issuer: 'Udemy - Jose Portilla',
      date: '2024',
      description: t('certs.udemyPython.description'),
      skills: t('certs.udemyPython.skills').split(','),
      credentialUrl: 'https://www.udemy.com/certificate/UC-bb76ecf3-dbfd-4b75-8be2-091b8cc1879e/',
      category: 'udemy'
    },
    {
      name: t('certs.udemyFullstack.name'),
      image: '/certifications/udemy.png',
      issuer: 'Udemy - Jorge Sant Ana, Jamilton Damasceno',
      date: '2024',
      description: t('certs.udemyFullstack.description'),
      skills: t('certs.udemyFullstack.skills').split(','),
      credentialUrl: 'https://www.udemy.com/certificate/UC-2bd14aa1-9fb2-4bd2-a3eb-ba33d0ab42e3/',
      category: 'udemy'
    },
    {
      name: t('certs.claudeApi.name'),
      image: '/certifications/claudecertification.png',
      issuer: 'Anthropic | Claude Academy',
      description: t('certs.claudeApi.description'),
      skills: t('certs.claudeApi.skills').split(','),
      credentialUrl: 'https://academy.claude.com/verify/591df988a03715384094dad551c0aeec',
      category: 'anthropic'
    },
    {
      name: t('certs.openaiAgents.name'),
      image: '/certifications/openaiagentsandworkflows.png',
      issuer: 'OpenAI Academy',
      date: t('certs.openaiAgents.date'),
      description: t('certs.openaiAgents.description'),
      skills: t('certs.openaiAgents.skills').split(','),
      credentialUrl: 'https://academy.openai.com/home/certificate/pcjqa2pwwe',
      category: 'openai'
    },
    {
      name: t('certs.openaiFoundations.name'),
      image: '/certifications/openaiaifoundations.png',
      issuer: 'OpenAI Academy',
      date: t('certs.openaiFoundations.date'),
      description: t('certs.openaiFoundations.description'),
      skills: t('certs.openaiFoundations.skills').split(','),
      credentialUrl: 'https://academy.openai.com/home/certificate/x06pkrly2i',
      category: 'openai'
    },
    {
      name: t('certs.openaiAppliedFoundations.name'),
      image: '/certifications/appliedaifoundations.png',
      issuer: 'OpenAI Academy',
      date: t('certs.openaiAppliedFoundations.date'),
      description: t('certs.openaiAppliedFoundations.description'),
      skills: t('certs.openaiAppliedFoundations.skills').split(','),
      credentialUrl: 'https://academy.openai.com/home/certificate/1d4pu6wrcw',
      category: 'openai'
    },
    {
      name: t('certs.curseForgeHighCrafter.name'),
      image: '/certifications/curseforge-legends-high-crafter.png',
      issuer: 'CurseForge',
      date: t('certs.curseForgeHighCrafter.milestone'),
      description: t('certs.curseForgeHighCrafter.description'),
      skills: t('certs.curseForgeHighCrafter.skills').split(','),
      credentialUrl: '/certifications/legend-certificate.pdf',
      category: 'community'
    },
    {
      name: t('certs.curseForgeRisingBuilder.name'),
      image: '/certifications/curseforge-legends-rising-builder.png',
      issuer: 'CurseForge',
      date: t('certs.curseForgeRisingBuilder.milestone'),
      description: t('certs.curseForgeRisingBuilder.description'),
      skills: t('certs.curseForgeRisingBuilder.skills').split(','),
      credentialUrl: '/certifications/legend-certificate-1.pdf',
      category: 'community'
    },
    {
      name: t('certs.curseForgeForgeborn.name'),
      image: '/certifications/curseforge-legends-forgeborn.png',
      issuer: 'CurseForge',
      date: t('certs.curseForgeForgeborn.milestone'),
      description: t('certs.curseForgeForgeborn.description'),
      skills: t('certs.curseForgeForgeborn.skills').split(','),
      credentialUrl: '/certifications/legend-certificate-2.pdf',
      category: 'community'
    },
  ], [t]);

  const certifications = useMemo(() => getCertifications(), [getCertifications]);
  const filteredCertifications = useMemo(
    () => certifications.filter(cert => selectedFilter === 'all' || cert.category === selectedFilter),
    [certifications, selectedFilter],
  );
  const archiveStats = useMemo(() => ({
    verified: certifications.filter(cert => cert.credentialUrl && cert.credentialUrl !== '#').length,
    domains: new Set(certifications.map(cert => cert.category)).size,
  }), [certifications]);

  useEffect(() => {
    if (!selectedCert) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCert(null);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCert]);

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {effectsReady && mounted && theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: -2, pointerEvents: 'none' }}>
          <HexagonGrid 
            cellSize={60} 
            glowColor="rgba(168, 85, 247, 0.6)" 
            lineColor="rgba(168, 85, 247, 0.08)"
            glowInterval={150}
            maxSimultaneous={6}
          />
        </div>
      )}
      <RouteView>
      <main className="certification-page relative min-h-screen pt-20">
        {effectsReady && <ScrollEffect />}
        {effectsReady && <ParticleBackground />}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <section className="cert-hero">
            <div className="cert-hero-copy">
              <AnimatedText className="mb-5">
                <div className="cert-eyebrow">
                  <span className="cert-eyebrow-line" aria-hidden="true" />
                  <span>{t('eyebrow')}</span>
                </div>
              </AnimatedText>

              <AnimatedText delay={0.08}>
                <h1 className="cert-title">
                  <GradientText>{t('title')}</GradientText>
                </h1>
              </AnimatedText>

              <p className="cert-description">{t('description')}</p>

              <div className="cert-stats" aria-label={t('title')}>
                <div className="cert-stat">
                  <Award aria-hidden="true" />
                  <strong>{String(certifications.length).padStart(2, '0')}</strong>
                  <span>{t('certifications')}</span>
                </div>
                <div className="cert-stat">
                  <ShieldCheck aria-hidden="true" />
                  <strong>{String(archiveStats.verified).padStart(2, '0')}</strong>
                  <span>VERIFIED</span>
                </div>
                <div className="cert-stat">
                  <Layers3 aria-hidden="true" />
                  <strong>{String(archiveStats.domains).padStart(2, '0')}</strong>
                  <span>DOMAINS</span>
                </div>
              </div>
            </div>

            <div className="cert-duality" aria-hidden="true">
              <svg viewBox="0 0 300 300" className="cert-duality-svg">
                <circle className="cert-duality-ring cert-duality-ring-outer" cx="150" cy="150" r="126" />
                <circle className="cert-duality-ring cert-duality-ring-inner" cx="150" cy="150" r="96" />
                <path className="cert-duality-path cert-duality-path-light" d="M150 24 A126 126 0 1 1 149.9 24" />
                <path className="cert-duality-path cert-duality-path-dark" d="M150 54 A96 96 0 1 0 149.9 54" />
              </svg>
              <div className="cert-duality-axis" />
              <div className="cert-duality-core">
              </div>
            </div>
          </section>

          <section id="certification-archive" className="cert-archive scroll-mt-24">
            <div className="cert-archive-heading">
              <div>
                <h2>{t('title')}</h2>
              </div>
              <div className="cert-archive-count">
                <span>{t('showing')} <strong>{filteredCertifications.length}</strong> {t('of')} {certifications.length}</span>
              </div>
            </div>

            <div className="cert-controls">
              <div className="cert-controls-label">
                <span className="cert-controls-mark" aria-hidden="true" />
                <span>FILTER </span>
              </div>
              <FilterDropdown
                options={filters}
                selected={selectedFilter}
                onChange={setSelectedFilter}
                placeholder={t('filter')}
              />
            </div>

            <div className="cert-archive-line" aria-hidden="true" />

            {filteredCertifications.length > 0 ? (
              <div className="certification-grid">
                {filteredCertifications.map((cert, idx) => (
                  <CertificationCard
                    key={cert.name}
                    cert={cert}
                    index={idx}
                    categoryLabel={filters.find(filter => filter.id === cert.category)?.label ?? cert.category}
                    featured={idx === 0}
                    reduceMotion={reduceMotion}
                    onSelect={() => setSelectedCert(cert)}
                  />
                ))}
              </div>
            ) : (
              <div className="cert-empty-state">
                <p>{t('noResults')}</p>
              </div>
            )}
          </section>
        </div>
      </main>
      </RouteView>

      {/* Modal */}
      {selectedCert && (
        <div
          className="cert-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedCert(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
            className="cert-modal-panel relative max-h-[min(860px,calc(100vh-2rem))] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--theme-primary)] bg-[var(--bg-card)] p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cert-modal-topline" aria-hidden="true" />
            <button
              onClick={() => setSelectedCert(null)}
              className="cert-modal-close absolute right-4 top-4 rounded-xl p-2 transition-colors"
              aria-label={t('closeDetails')}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="cert-modal-header">
              <span className="cert-modal-kicker">RECORD / {String(certifications.findIndex(cert => cert.name === selectedCert.name) + 1).padStart(2, '0')}</span>
              <span className="cert-modal-kicker">{selectedCert.issuer}</span>
            </div>

            <div className="mb-7 flex flex-col gap-6 md:flex-row">
              <div className="cert-modal-image relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden rounded-xl bg-white md:w-64">
                <Image
                  src={selectedCert.image}
                  alt={selectedCert.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-contain p-4"
                />
              </div>
              <div className="flex-1 pt-1">
                <h2 id="cert-modal-title" className="mb-3 text-3xl font-bold leading-tight" style={{ fontFamily: 'var(--font-eternal)' }}>
                  {selectedCert.name}
                </h2>
                <p className="mb-1 text-lg text-[var(--text-muted)]">{selectedCert.issuer}</p>
                {selectedCert.date && <p className="mb-5 text-sm text-[var(--text-muted)]">{selectedCert.date}</p>}
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--theme-primary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)]" aria-hidden="true" />
                  {t('type')}
                </span>
              </div>
            </div>

            <p className="mb-7 text-lg leading-relaxed text-[var(--text-muted)]">
              {selectedCert.description}
            </p>

            {selectedCert.skills && selectedCert.skills.length > 0 && (
              <div className="mb-7">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--theme-primary)]">{t('skillsCovered')}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCert.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/10 px-3 py-1 text-sm text-[var(--text-muted)]"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCert.credentialUrl && (
              <a
                href={selectedCert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-credential-link inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-6 py-3 font-semibold text-white transition-transform"
              >
                {t('viewCredential')}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .certification-page { --cert-line: color-mix(in srgb, var(--theme-primary) 30%, var(--border)); }
        .cert-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(260px, .9fr); gap: 3rem; min-height: 420px; align-items: center; padding: 2rem 0 4.5rem; border-bottom: 1px solid var(--border); overflow: hidden; }
        .cert-hero::after { content: ''; position: absolute; left: 0; right: 34%; bottom: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--theme-primary), transparent); opacity: .8; }
        .cert-hero-copy { position: relative; z-index: 2; max-width: 760px; }
        .cert-eyebrow, .cert-section-kicker, .cert-controls-label, .cert-modal-kicker { font: 700 10px/1 var(--font-geist-mono), monospace; letter-spacing: .24em; text-transform: uppercase; }
        .cert-eyebrow { display: flex; align-items: center; gap: .8rem; color: var(--theme-primary); }
        .cert-eyebrow-line { width: 2.5rem; height: 1px; background: var(--theme-primary); }
        .cert-title { max-width: 850px; margin: 1.5rem 0 0; font: 900 clamp(3.5rem, 9vw, 8rem)/.85 var(--font-eternal), sans-serif; letter-spacing: -.07em; text-transform: uppercase; }
        .cert-description { max-width: 620px; margin: 2rem 0 0; color: var(--text-muted); font-size: 1.05rem; line-height: 1.75; }
        .cert-stats { display: grid; grid-template-columns: repeat(3, minmax(100px, 1fr)); gap: .75rem; max-width: 620px; margin-top: 2.5rem; }
        .cert-stat { display: grid; grid-template-columns: auto 1fr; column-gap: .7rem; align-items: center; padding: .9rem 1rem; border: 1px solid var(--border); background: color-mix(in srgb, var(--bg-card) 78%, transparent); }
        .cert-stat svg { grid-row: span 2; width: 1rem; height: 1rem; color: var(--theme-primary); }
        .cert-stat strong { color: var(--text-primary); font-size: 1.35rem; line-height: 1; }
        .cert-stat span { color: var(--text-muted); font: 700 8px/1.2 var(--font-geist-mono), monospace; letter-spacing: .12em; text-transform: uppercase; }
        .cert-duality { position: relative; min-height: 360px; isolation: isolate; }
        .cert-duality::before, .cert-duality::after { content: ''; position: absolute; left: 50%; top: 50%; border: 1px solid var(--cert-line); border-radius: 50%; transform: translate(-50%, -50%); }
        .cert-duality::before { width: 76%; aspect-ratio: 1; opacity: .25; }
        .cert-duality::after { width: 93%; aspect-ratio: 1; opacity: .12; }
        .cert-duality-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .cert-duality-ring { fill: none; stroke: var(--cert-line); stroke-width: 1; opacity: .25; stroke-dasharray: 2 9; }
        .cert-duality-path { fill: none; stroke: var(--theme-primary); stroke-linecap: round; stroke-width: 1.5; stroke-dasharray: 3 14; transform-origin: 150px 150px; animation: cert-orbit 18s linear infinite; }
        .cert-duality-path-dark { opacity: .4; animation-direction: reverse; animation-duration: 13s; }
        .cert-duality-axis { position: absolute; left: 50%; top: 16%; width: 1px; height: 68%; background: linear-gradient(transparent, var(--theme-primary), transparent); transform: translateX(-50%) scaleY(.45); animation: cert-axis 3.8s cubic-bezier(.16,1,.3,1) .35s both; }
        .cert-duality-core { position: absolute; left: 50%; top: 50%; display: grid; place-items: center; width: 106px; aspect-ratio: 1; border: 1px solid var(--theme-primary); border-radius: 50%; background: conic-gradient(from 42deg, color-mix(in srgb, var(--theme-primary) 75%, var(--bg-card)) 0 50%, var(--bg-card) 50% 100%); color: var(--text-primary); transform: translate(-50%, -50%); box-shadow: 0 0 0 9px color-mix(in srgb, var(--theme-primary) 8%, transparent), 0 0 50px color-mix(in srgb, var(--theme-primary) 16%, transparent); animation: cert-core-in .8s cubic-bezier(.16,1,.3,1) .2s both; }
        .cert-duality-core span { font: 900 1.65rem/1 var(--font-geist-mono), monospace; }
        .cert-duality-core small { margin-top: -.7rem; font: 700 7px/1 var(--font-geist-mono), monospace; letter-spacing: .18em; }
        .cert-duality-label { position: absolute; color: var(--text-muted); font: 700 8px/1 var(--font-geist-mono), monospace; letter-spacing: .22em; writing-mode: vertical-rl; }
        .cert-duality-label-a { left: 7%; top: 50%; transform: translateY(-50%); }
        .cert-duality-label-b { right: 7%; top: 50%; transform: translateY(-50%) rotate(180deg); }
        .cert-archive { padding: 4.5rem 0 2rem; }
        .cert-archive-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: 1.75rem; }
        .cert-section-kicker { margin-bottom: .85rem; color: var(--theme-primary); }
        .cert-archive-heading h2 { color: var(--text-primary); font: 900 clamp(2rem, 5vw, 4rem)/.9 var(--font-solo-heading), sans-serif; letter-spacing: -.05em; text-transform: uppercase; }
        .cert-archive-count { display: flex; flex-direction: column; align-items: end; gap: .75rem; color: var(--text-muted); font: 700 10px/1.2 var(--font-geist-mono), monospace; letter-spacing: .12em; text-transform: uppercase; }
        .cert-archive-count strong { color: var(--text-primary); }
        .cert-archive-status { display: inline-flex; align-items: center; gap: .45rem; color: var(--theme-primary); }
        .cert-archive-status i { width: .4rem; height: .4rem; border-radius: 50%; background: var(--theme-primary); box-shadow: 0 0 12px var(--theme-primary); }
        .cert-controls { position: sticky; top: 4.75rem; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2.5rem; padding: .75rem; border: 1px solid var(--border); background: color-mix(in srgb, var(--bg-dark) 88%, transparent); backdrop-filter: blur(18px); }
        .cert-controls-label { display: flex; align-items: center; gap: .7rem; color: var(--text-muted); }
        .cert-controls-mark { width: .5rem; height: .5rem; border: 1px solid var(--theme-primary); transform: rotate(45deg); }
        .cert-archive-line { height: 1px; margin: 0 0 1.5rem; background: linear-gradient(90deg, var(--theme-primary), transparent 72%); opacity: .5; transform-origin: left; animation: cert-line-grow .9s cubic-bezier(.16,1,.3,1) .25s both; }
        .certification-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1.25rem; }
        .cert-card { min-width: 0; opacity: 0; animation: cert-card-reveal .75s cubic-bezier(.16,1,.3,1) var(--cert-delay) both; }
        .cert-card-hit { all: unset; position: relative; display: flex; box-sizing: border-box; width: 100%; height: 100%; flex-direction: column; overflow: hidden; cursor: pointer; border: 1px solid var(--border); border-radius: 1.25rem; background: linear-gradient(145deg, color-mix(in srgb, var(--bg-card) 94%, var(--theme-primary)), var(--bg-card)); color: var(--text-primary); text-align: left; transition: transform .32s cubic-bezier(.16,1,.3,1), border-color .32s ease, box-shadow .32s ease; }
        .cert-card-hit::before { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(260px circle at 50% 0%, color-mix(in srgb, var(--theme-primary) 17%, transparent), transparent 72%); transition: opacity .35s ease; }
        .cert-card-hit::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .035; background: repeating-linear-gradient(0deg, transparent 0 3px, var(--theme-primary) 4px); }
        .cert-card-hit:hover { transform: translateY(-6px); border-color: var(--theme-primary); box-shadow: 0 18px 45px color-mix(in srgb, var(--theme-primary) 14%, transparent), 0 0 0 3px color-mix(in srgb, var(--theme-primary) 7%, transparent); }
        .cert-card-hit:hover::before { opacity: 1; }
        .cert-card-hit:focus-visible { outline: 2px solid var(--theme-primary); outline-offset: 4px; }
        .cert-card-line { position: absolute; z-index: 3; pointer-events: none; background: var(--theme-primary); }
        .cert-card-line-top { left: 0; top: 0; width: 100%; height: 1px; transform: scaleX(0); transform-origin: left; animation: cert-line-draw .8s cubic-bezier(.16,1,.3,1) calc(var(--cert-delay) + 150ms) both; }
        .cert-card-line-side { right: 0; top: 0; width: 1px; height: 100%; opacity: .4; transform: scaleY(0); transform-origin: top; animation: cert-line-draw-side .65s cubic-bezier(.16,1,.3,1) calc(var(--cert-delay) + 280ms) both; }
        .cert-card-corner { position: absolute; z-index: 3; width: 22px; height: 22px; pointer-events: none; border-color: var(--theme-primary); border-style: solid; opacity: .8; }
        .cert-card-corner-top { top: 0; left: 0; border-width: 1px 0 0 1px; }
        .cert-card-corner-bottom { right: 0; bottom: 0; border-width: 0 1px 1px 0; }
        .cert-card-topline { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: 1rem 1rem .75rem; font: 700 8px/1 var(--font-geist-mono), monospace; letter-spacing: .14em; text-transform: uppercase; }
        .cert-card-number { color: var(--theme-primary); }
        .cert-card-category { max-width: 68%; overflow: hidden; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; }
        .cert-card-media { position: relative; display: block; aspect-ratio: 4 / 3; margin: 0 .75rem; overflow: hidden; border: 1px solid var(--border); border-radius: .9rem; background: #fff; }
        .cert-card-featured .cert-card-media { aspect-ratio: 16 / 8; }
        .cert-card-image { object-fit: contain; padding: 1rem; transition: transform .7s cubic-bezier(.16,1,.3,1); }
        .cert-card-hit:hover .cert-card-image { transform: scale(1.045); }
        .cert-card-media-wash { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, transparent 62%, color-mix(in srgb, var(--theme-primary) 12%, transparent)); opacity: .7; }
        .cert-card-media-label { position: absolute; right: .65rem; bottom: .6rem; padding: .35rem .45rem; color: var(--text-primary); background: color-mix(in srgb, var(--bg-card) 76%, transparent); font: 700 7px/1 var(--font-geist-mono), monospace; letter-spacing: .12em; }
        .cert-card-body { position: relative; z-index: 2; display: flex; flex: 1; flex-direction: column; padding: 1.15rem 1rem 1rem; }
        .cert-card-issuer { display: flex; align-items: center; gap: .45rem; min-height: 1rem; color: var(--text-muted); font: 700 9px/1.3 var(--font-geist-mono), monospace; letter-spacing: .1em; text-transform: uppercase; }
        .cert-card-status { width: .4rem; height: .4rem; flex: 0 0 auto; border-radius: 50%; background: var(--theme-primary); box-shadow: 0 0 10px color-mix(in srgb, var(--theme-primary) 70%, transparent); }
        .cert-card-check { width: .85rem; height: .85rem; margin-left: auto; color: var(--theme-primary); }
        .cert-card-title { display: block; margin-top: .75rem; color: var(--text-primary); font: 800 1.15rem/1.1 var(--font-solo-heading), sans-serif; letter-spacing: .02em; transition: color .25s ease; }
        .cert-card-hit:hover .cert-card-title { color: var(--theme-primary); }
        .cert-card-description { display: -webkit-box; min-height: 3.8em; margin-top: .75rem; overflow: hidden; color: var(--text-muted); font-size: .82rem; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
        .cert-card-meta { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin-top: auto; padding-top: 1.1rem; color: var(--text-muted); font: 700 9px/1 var(--font-geist-mono), monospace; letter-spacing: .12em; text-transform: uppercase; }
        .cert-card-open { display: inline-flex; align-items: center; gap: .3rem; color: var(--theme-primary); }
        .cert-card-open svg { width: .9rem; height: .9rem; transition: transform .25s ease; }
        .cert-card-hit:hover .cert-card-open svg { transform: translate(2px, -2px); }
        .cert-card-skills { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .8rem; }
        .cert-card-skills span { max-width: 100%; overflow: hidden; padding: .34rem .48rem; border: 1px solid var(--border); color: var(--text-muted); font: 700 8px/1 var(--font-geist-mono), monospace; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
        .cert-empty-state { padding: 5rem 1rem; border: 1px dashed var(--border); color: var(--text-muted); text-align: center; font: 700 11px/1.5 var(--font-geist-mono), monospace; letter-spacing: .15em; text-transform: uppercase; }
        .cert-modal-backdrop { animation: cert-backdrop-in .25s ease-out both; }
        .cert-modal-panel { animation: cert-modal-in .42s cubic-bezier(.16,1,.3,1) both; }
        .cert-modal-topline { position: absolute; left: 2rem; right: 2rem; top: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--theme-primary), transparent); }
        .cert-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.6rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .cert-modal-kicker { color: var(--theme-primary); }
        .cert-modal-kicker:last-child { overflow: hidden; color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; }
        .cert-modal-close { color: var(--text-muted); }
        .cert-modal-close:hover { background: color-mix(in srgb, var(--theme-primary) 12%, transparent); color: var(--theme-primary); }
        .cert-credential-link:hover { transform: translateY(-2px); }
        @keyframes cert-card-reveal { from { opacity: 0; clip-path: inset(10% 0 0); transform: translateY(22px); } to { opacity: 1; clip-path: inset(0); transform: translateY(0); } }
        @keyframes cert-line-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes cert-line-draw-side { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes cert-line-grow { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: .5; } }
        @keyframes cert-orbit { to { transform: rotate(360deg); } }
        @keyframes cert-axis { from { transform: translateX(-50%) scaleY(.1); opacity: 0; } to { transform: translateX(-50%) scaleY(1); opacity: 1; } }
        @keyframes cert-core-in { from { opacity: 0; transform: translate(-50%, -50%) scale(.76) rotate(-18deg); } to { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0); } }
        @keyframes cert-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cert-modal-in { from { opacity: 0; transform: translateY(16px) scale(.97); clip-path: inset(8% 0 0); } to { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0); } }
        @media (min-width: 640px) { .certification-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1280px) { .certification-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); } .cert-card-featured { grid-column: span 8; } .cert-card:not(.cert-card-featured) { grid-column: span 4; } }
        @media (max-width: 900px) { .cert-hero { grid-template-columns: 1fr; min-height: 0; } .cert-duality { min-height: 270px; max-width: 430px; margin: -1rem auto 0; width: 100%; } }
        @media (max-width: 640px) { .cert-hero { padding-top: 1rem; padding-bottom: 3rem; } .cert-title { font-size: clamp(3.2rem, 17vw, 5.4rem); } .cert-description { font-size: .95rem; } .cert-stats { gap: .45rem; } .cert-stat { display: block; padding: .7rem .55rem; } .cert-stat svg { display: block; margin-bottom: .6rem; } .cert-stat strong, .cert-stat span { display: block; } .cert-stat span { margin-top: .35rem; font-size: 7px; } .cert-archive-heading { align-items: start; flex-direction: column; } .cert-archive-count { align-items: start; } .cert-controls { align-items: stretch; flex-direction: column; } .cert-controls .relative { width: 100%; } .cert-modal-header { padding-right: 2.5rem; } }
        @media (prefers-reduced-motion: reduce) { .cert-card, .cert-card-line-top, .cert-card-line-side, .cert-archive-line, .cert-duality-path, .cert-duality-axis, .cert-duality-core, .cert-modal-backdrop, .cert-modal-panel { animation: none !important; } .cert-card { opacity: 1; } .cert-card-hit, .cert-card-image, .cert-card-open svg, .cert-credential-link { transition: none; } .cert-card-hit:hover, .cert-credential-link:hover { transform: none; } }
        @media (max-width: 640px) { .cert-card-featured .cert-card-media { aspect-ratio: 4 / 3; } }
      `}</style>
    </>
  );
}
