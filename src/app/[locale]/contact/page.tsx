'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import { motion } from 'framer-motion';
import { Github, Mail, Linkedin } from 'lucide-react';
import { useClickSound } from '@/hooks/useClickSound';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import ScrollEffect from '@/components/ScrollEffect';

const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function ContactPage() {
  useClickSound();
  const { theme } = useTheme();
  const t = useTranslations('contact');

  const socialLinks = [
    { 
      icon: Github, 
      label: 'GitHub', 
      href: 'https://github.com/SobralCybersec',
      color: 'from-[var(--theme-primary)] to-[var(--theme-secondary)]'
    },
    { 
      icon: Mail, 
      label: 'Email', 
      href: 'mailto:matheussobrallinkedin@gmail.com',
      color: 'from-[var(--theme-secondary)] to-[var(--theme-accent)]'
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: 'https://www.linkedin.com/in/matheus-sobral-b17a5b1b9/',
      color: 'from-[var(--theme-accent)] to-[var(--theme-primary)]'
    },
  ];

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
          <div className="max-w-4xl mx-auto">
            <AnimatedText className="mb-4">
              <p className="text-sm uppercase tracking-wider text-[var(--text-muted)] font-semibold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em' }}>{t('eyebrow')}</p>
            </AnimatedText>
            
            <AnimatedText delay={0.1} className="mb-12">
              <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <GradientText>{t('getInTouch')}</GradientText>
              </h1>
            </AnimatedText>

            <AnimatedText delay={0.2} className="mb-12">
              <p className="text-lg text-[var(--text-muted)] text-center max-w-2xl mx-auto">
                {t('description')}
              </p>
            </AnimatedText>
            
            <div className="grid md:grid-cols-3 gap-6">
              {socialLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                    className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-lg hover:border-[var(--theme-primary)] transition-all duration-300 flex flex-col items-center gap-4 group"
                  >
                    <div className={`p-4 rounded-full bg-gradient-to-br ${link.color} bg-opacity-10`}>
                      <Icon className="w-8 h-8 text-[var(--theme-primary)] group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[var(--text-muted)] font-semibold" style={{ fontFamily: 'var(--font-solo-heading)' }}>{link.label}</span>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
