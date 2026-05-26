'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import { useClickSound } from '@/hooks/useClickSound';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ScrollEffect from '@/components/ScrollEffect';
import { useState } from 'react';
import { X } from 'lucide-react';
import FilterDropdown from '@/components/FilterDropdown';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

interface Certification {
  name: string;
  image: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
  credentialUrl?: string;
  category: string;
}

export default function CertificationsPage() {
  useClickSound();
  const { theme } = useTheme();
  const t = useTranslations('certifications');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: t('filters.all') },
    { id: 'aws', label: t('filters.aws') },
    { id: 'google', label: t('filters.google') },
    { id: 'fiap', label: t('filters.fiap') },
    { id: 'uci', label: t('filters.uci') },
    { id: 'udemy', label: t('filters.udemy') },
  ];

  // Get translated certifications
  const getCertifications = (): Certification[] => [
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
  ];

  const certifications = getCertifications();
  const filteredCertifications = certifications.filter(cert => 
    selectedFilter === 'all' || cert.category === selectedFilter
  );

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {theme === 'dark' && (
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
      <main className="min-h-screen pt-20 relative">
        <ScrollEffect />
        <ParticleBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <AnimatedText className="mb-4">
              <p className="text-sm uppercase tracking-wider text-[var(--text-muted)] font-semibold" style={{ fontFamily: 'var(--font-eternal)' }}>{t('eyebrow')}</p>
            </AnimatedText>
            
            <AnimatedText delay={0.1} className="mb-12">
              <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <GradientText>{t('title')}</GradientText>
              </h1>
            </AnimatedText>

            <AnimatedText delay={0.2} className="mb-8">
              <p className="text-lg text-[var(--text-muted)] max-w-3xl mb-6">
                {t('description')}
              </p>
              <FilterDropdown
                options={filters}
                selected={selectedFilter}
                onChange={setSelectedFilter}
                placeholder="Filter"
              />
            </AnimatedText>

            {/* Results Count */}
            <AnimatedText delay={0.25} className="mb-6">
              <p className="text-sm text-[var(--text-muted)]">
                {t('showing')} {filteredCertifications.length} {t('of')} {certifications.length} {t('certifications')}
              </p>
            </AnimatedText>

            {/* Certifications Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertifications.length > 0 ? (
                filteredCertifications.map((cert, idx) => (
                  <AnimatedText key={cert.name} delay={0.3 + idx * 0.1}>
                    <div 
                      onClick={() => setSelectedCert(cert)}
                      className="group cursor-pointer bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--theme-primary)] transition-all duration-300 hover:transform hover:-translate-y-2"
                    >
                      <div className="relative aspect-[4/3] bg-white">
                        <Image 
                          src={cert.image} 
                          alt={cert.name} 
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--theme-primary)] transition-colors" style={{ fontFamily: 'var(--font-solo-heading)' }}>
                          {cert.name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] mb-1">{cert.issuer}</p>
                        <p className="text-xs text-[var(--text-muted)]">{cert.date}</p>
                      </div>
                    </div>
                  </AnimatedText>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-[var(--text-muted)] text-lg">No certifications found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedCert && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--theme-primary)] rounded-lg max-w-3xl w-full p-8 relative animate-clip-intro"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[var(--theme-primary)]/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative w-full md:w-48 aspect-[4/3] bg-white rounded-lg overflow-hidden flex-shrink-0">
                <Image 
                  src={selectedCert.image} 
                  alt={selectedCert.name} 
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-eternal)' }}>
                  {selectedCert.name}
                </h2>
                <p className="text-lg text-[var(--text-muted)] mb-1">{selectedCert.issuer}</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">{selectedCert.date}</p>
                <span className="inline-block px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--theme-primary)] font-medium">
                  Certification
                </span>
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">
              {selectedCert.description}
            </p>

            {selectedCert.skills && selectedCert.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--theme-primary)] mb-3 uppercase tracking-wider">Skills Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCert.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--text-muted)]"
                    >
                      {skill}
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                View Credential
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
