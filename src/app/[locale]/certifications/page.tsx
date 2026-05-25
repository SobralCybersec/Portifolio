'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useTheme } from 'next-themes';
import { useClickSound } from '@/hooks/useClickSound';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
  const [selectedFilter, setSelectedFilter] = useState('all');

  /* reveal animations */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [selectedFilter]);

  /* esc close */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const filters = [
    { id: 'all', label: t('filters.all') },
    { id: 'aws', label: t('filters.aws') },
    { id: 'google', label: t('filters.google') },
    { id: 'fiap', label: t('filters.fiap') },
    { id: 'uci', label: t('filters.uci') },
    { id: 'udemy', label: t('filters.udemy') },
  ];

  const getCertifications = (): Certification[] => [
    {
      name: t('certs.awsSolutionsArchitect.name'),
      image: '/certifications/aws1.png',
      issuer: 'Amazon Web Services',
      date: '2025',
      description: t('certs.awsSolutionsArchitect.description'),
      skills: t('certs.awsSolutionsArchitect.skills').split(','),
      credentialUrl: '#',
      category: 'aws',
    },
    {
      name: t('certs.awsMigration.name'),
      image: '/certifications/aws2.png',
      issuer: 'Amazon Web Services',
      date: '2025',
      description: t('certs.awsMigration.description'),
      skills: t('certs.awsMigration.skills').split(','),
      credentialUrl:
        'https://www.coursera.org/learn/aws-fundamentals-migrating-to-the-cloud',
      category: 'aws',
    },
    {
      name: t('certs.fiapJava.name'),
      image: '/certifications/fiapjavadevelopment.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapJava.description'),
      skills: t('certs.fiapJava.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.fiapCyber.name'),
      image: '/certifications/fiapcibersecurityskills.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapCyber.description'),
      skills: t('certs.fiapCyber.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.fiapDotnet.name'),
      image: '/certifications/fiapdesenvolvimentodotnet.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapDotnet.description'),
      skills: t('certs.fiapDotnet.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.fiapBlockchain.name'),
      image: '/certifications/fiapnanoblockchain.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapBlockchain.description'),
      skills: t('certs.fiapBlockchain.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.fiapLogic.name'),
      image: '/certifications/fiapprogramminglogical.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapLogic.description'),
      skills: t('certs.fiapLogic.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.fiapAlgorithms.name'),
      image: '/certifications/fiapalgoritms.png',
      issuer: 'FIAP',
      date: '2026',
      description: t('certs.fiapAlgorithms.description'),
      skills: t('certs.fiapAlgorithms.skills').split(','),
      category: 'fiap',
    },
    {
      name: t('certs.googleNetwork.name'),
      image: '/certifications/connectandprotect.jpg',
      issuer: 'Google',
      date: '2025',
      description: t('certs.googleNetwork.description'),
      skills: t('certs.googleNetwork.skills').split(','),
      credentialUrl:
        'https://www.coursera.org/learn/networks-and-network-security',
      category: 'google',
    },
    {
      name: t('certs.googleCyber.name'),
      image: '/certifications/googlecibersecurityfoundations.png',
      issuer: 'Google',
      date: '2025',
      description: t('certs.googleCyber.description'),
      skills: t('certs.googleCyber.skills').split(','),
      category: 'google',
    },
    {
      name: t('certs.uciPM.name'),
      image: '/certifications/uci.png',
      issuer: 'University of California, Irvine',
      date: '2025',
      description: t('certs.uciPM.description'),
      skills: t('certs.uciPM.skills').split(','),
      credentialUrl:
        'https://www.coursera.org/learn/projeto-aplicado',
      category: 'uci',
    },
    {
      name: t('certs.udemyPython.name'),
      image: '/certifications/thecompleteherobootcamppython.jpg',
      issuer: 'Udemy - Jose Portilla',
      date: '2024',
      description: t('certs.udemyPython.description'),
      skills: t('certs.udemyPython.skills').split(','),
      credentialUrl:
        'https://www.udemy.com/certificate/UC-bb76ecf3-dbfd-4b75-8be2-091b8cc1879e/',
      category: 'udemy',
    },
    {
      name: t('certs.udemyFullstack.name'),
      image: '/certifications/udemy.png',
      issuer: 'Udemy - Jorge Sant Ana, Jamilton Damasceno',
      date: '2024',
      description: t('certs.udemyFullstack.description'),
      skills: t('certs.udemyFullstack.skills').split(','),
      credentialUrl:
        'https://www.udemy.com/certificate/UC-2bd14aa1-9fb2-4bd2-a3eb-ba33d0ab42e3/',
      category: 'udemy',
    },
  ];

  const certifications = getCertifications();

  const filtered = certifications.filter(
    (c) => selectedFilter === 'all' || c.category === selectedFilter
  );

  return (
    <>
      <div className="bg-noise" />

      <Navigation />

      {/* HEADER */}
      <section className="page-header">
        <div className="speed-lines" />

        <div className="page-header-inner reveal visible">
          <p className="page-eyebrow">
            // CCG Clearance Records
          </p>

          <h1
            className="page-title"
            data-text={t('title')}
          >
            {t('title')}

            <span
              className="glitch-layer"
              aria-hidden="true"
            >
              {t('title')}
            </span>
          </h1>

          <p className="page-subtitle">
            {t('description')}
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="cert-filter-bar reveal visible">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`cert-filter-btn ${
              selectedFilter === f.id ? 'active' : ''
            }`}
          >
            {f.label}
          </button>
        ))}
      </section>

      {/* COUNT */}
      <div className="cert-count reveal visible">
        {t('showing')} {filtered.length} {t('of')}{' '}
        {certifications.length} {t('certifications')}
      </div>

      {/* GRID */}
      <section className="cert-grid">
        {filtered.length > 0 ? (
          filtered.map((cert, idx) => (
            <div
              key={cert.name}
              className="cert-panel reveal"
              style={{
                transitionDelay: `${idx * 70}ms`,
              }}
              onClick={() => setSelectedCert(cert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSelectedCert(cert);
                }
              }}
            >
              <div className="cert-img-wrap">
                <Image
                  src={cert.image}
                  alt={cert.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw,
                        (max-width: 1024px) 50vw,
                        33vw"
                  className="cert-img"
                />
              </div>

              <div className="cert-overlay">
                <span>Inspect File</span>
              </div>

              <div className="cert-info">
                <div className="cert-name">
                  {cert.name}
                </div>

                <div className="cert-issuer">
                  {cert.issuer}
                </div>

                <div className="cert-date">
                  {cert.date}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="cert-empty">
            <p>No certifications found.</p>
          </div>
        )}
      </section>

      <div className="divider" />

      {/* FOOTER */}
      <footer className="ccg-footer">
        <span>© 2026 Matheus S. Silva</span>

        <span>
          <a
            href="https://github.com/SobralCybersec"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </span>
      </footer>

      {/* LIGHTBOX */}
      {selectedCert && (
  <div
    className="lightbox"
    role="dialog"
    aria-modal="true"
    onClick={() => setSelectedCert(null)}
  >
    <div
      className="lightbox-inner"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="lightbox-close"
        onClick={() => setSelectedCert(null)}
      >
        ✕ CLOSE
      </button>

      <div className="lightbox-img-wrap">
      <Image
        src={selectedCert.image}
        alt={selectedCert.name}
        fill
        loading="lazy"
        sizes="(max-width: 900px) calc(100vw - 4rem), 900px"
        style={{ objectFit: 'contain' }}
      />
      </div>

      <div className="lightbox-body">
        <h2 className="lightbox-title">
          {selectedCert.name}
        </h2>

        <p className="lightbox-issuer">
          {selectedCert.issuer} —{' '}
          {selectedCert.date}
        </p>

        <p className="lightbox-desc">
          {selectedCert.description}
        </p>

        {selectedCert.skills.length > 0 && (
          <div className="lightbox-skills">
            {selectedCert.skills.map((s, i) => (
              <span
                key={i}
                className="skill-tag"
              >
                {s.trim()}
              </span>
            ))}
          </div>
        )}

        {selectedCert.credentialUrl &&
          selectedCert.credentialUrl !== '#' && (
            <a
              href={selectedCert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                marginTop: '1.5rem',
                display: 'inline-flex',
              }}
            >
              View Credential →
            </a>
          )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}