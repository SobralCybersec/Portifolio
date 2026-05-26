'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import { motion } from 'framer-motion';
import { useClickSound } from '@/hooks/useClickSound';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import ScrollEffect from '@/components/ScrollEffect';
import { useHydrated } from '@/hooks/useHydrated';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function AboutPage() {
  useClickSound();
  const mounted = useHydrated();
  const { theme } = useTheme();
  const t = useTranslations('about');

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {mounted && theme === 'dark' && (
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
          <div className="max-w-4xl mx-auto">
            <AnimatedText className="mb-4">
              <p className="text-sm uppercase tracking-wider text-[var(--text-muted)] font-semibold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em' }}>{t('eyebrow')}</p>
            </AnimatedText>
            
            <AnimatedText delay={0.1} className="mb-12">
              <div className="animate-clip-intro">
                <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <GradientText>{t('title')}</GradientText>
                </h1>
              </div>
            </AnimatedText>
            
            <div className="space-y-6 stagger-clip-in">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-lg hover:border-[var(--theme-primary)] transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-[var(--theme-primary)] mb-4" style={{ fontFamily: 'var(--font-solo-heading)' }}>{t('background')}</h2>
                <p className="leading-relaxed text-[var(--text-muted)] mb-4">
                  {t('backgroundText1')}
                </p>
                <p className="leading-relaxed text-[var(--text-muted)]">
                  {t('backgroundText2')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-lg hover:border-[var(--theme-secondary)] transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-[var(--theme-secondary)] mb-6" style={{ fontFamily: 'var(--font-solo-heading)' }}>{t('expertise')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-clip-in">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('security')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Java', 'Spring Boot', 'Python', 'Node.js', 'C', 'C++', 'C#', 'Rust'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--theme-primary)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('development')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'JavaScript'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-secondary)]/10 border border-[var(--theme-secondary)]/30 rounded-full text-sm text-[var(--theme-secondary)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('backend')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'MongoDB'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 rounded-full text-sm text-[var(--theme-accent)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('cybersecurity')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Penetration Testing', 'OWASP Top 10', 'Network Security', 'Cryptography', 'Kali Linux'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--theme-primary)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('securityTools')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Burp Suite', 'Nessus', 'Hashcat', 'Gobuster', 'BloodHound', 'Ghidra'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-secondary)]/10 border border-[var(--theme-secondary)]/30 rounded-full text-sm text-[var(--theme-secondary)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('devtools')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Docker', 'Git', 'GitHub Actions', 'Maven', 'AWS', 'Vim', 'Bash', 'JetBrains'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 rounded-full text-sm text-[var(--theme-accent)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('aiTools')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['ChatGPT', 'Claude', 'Gemini', 'OpenAPI', 'Swagger'].map((skill) => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--theme-primary)] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-lg hover:border-[var(--theme-accent)] transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-[var(--theme-accent)] mb-4" style={{ fontFamily: 'var(--font-solo-heading)' }}>{t('philosophy')}</h2>
                <p className="leading-relaxed text-[var(--text-muted)] mb-4">
                  {t('philosophyText1')}
                </p>
                <p className="leading-relaxed text-[var(--text-muted)]">
                  {t('philosophyText2')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
