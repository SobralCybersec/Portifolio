'use client';

import './certifications.css';
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

    </>
  );
}
