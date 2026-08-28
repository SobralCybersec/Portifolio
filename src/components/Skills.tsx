'use client';

import { motion } from 'framer-motion';
import { Code2, Database, Cpu, Zap } from 'lucide-react';
import { AnimatedText } from './AnimatedText';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import CapabilityRail from './CapabilityRail';
import BongoCat from './BongoCat';
import { deriveSkills, type Repo } from '@/lib/deriveSkills';

interface SkillsProps {
  animateSection?: string;
  repos?: Repo[];
  techSignal?: ReactNode;
}


export default function Skills({ animateSection, repos = [], techSignal }: SkillsProps) {
  const t = useTranslations('skills');

  const derived = useMemo(() => deriveSkills(repos), [repos]);

  const skills = [
    { category: t('frontend.title'),     icon: Code2,    key: 'frontend', background: '/images/gifs/jinwoogf.gif',  portrait: '/images/jinwoo.png' },
    { category: t('backend.title'),      icon: Database, key: 'backend',  background: '/images/gifs/jinwoogf2.gif', portrait: '/images/jinwoo2.png' },
    { category: t('architecture.title'), icon: Cpu,      key: 'systems',  background: '/images/gifs/jinwoogf3.gif', portrait: '/images/jinwoo3.png' },
    { category: t('devops.title'),       icon: Zap,      key: 'devops',   background: '/images/gifs/jinwoogf4.gif', portrait: '/images/jinwoo2.png' },
  ] as const;

  return (
    <section className="skills-section">
      <div className="skills-inner">
        <div className="skills-header">
          <AnimatedText delay={0.1}>
            <div className="animate-clip-in">
              <h2 className="section-title">{t('title')}</h2>
            </div>
          </AnimatedText>
        </div>

        <div className="skills-grid">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            const items = derived[skill.key];
            return (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="skill-card group relative overflow-hidden"
                suppressHydrationWarning
              >
                <Image
                  src={skill.background}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="theme-ambient-media pointer-events-none absolute inset-0 z-0 object-cover opacity-20 mix-blend-screen transition duration-700 group-hover:scale-105 group-hover:opacity-30"
                />
                <Image
                  src={skill.portrait}
                  alt=""
                  fill
                  sizes="180px"
                  className="theme-portrait-media pointer-events-none absolute inset-y-0 right-0 left-auto z-0 w-2/3 object-contain object-right-bottom opacity-20 mix-blend-screen transition duration-700 group-hover:scale-105 group-hover:opacity-30"
                />
                <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[var(--bg-card)]/[0.95] via-[var(--bg-card)]/[0.82] to-transparent" />
                <div className="relative z-10">
                  <div className="skill-card-header">
                    <div className="skill-icon">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="skill-category">{skill.category}</h3>
                  </div>
                  <ul className="skill-list">
                    {items.map((item) => (
                      <li key={item} className="skill-item">
                        <span className="skill-dot" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
          <div className="relative min-w-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]/[0.35]">
            <Image
              src="/images/gifs/jinwoogf5.gif"
              alt=""
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="theme-ambient-media pointer-events-none absolute inset-0 z-0 object-cover opacity-[0.08] mix-blend-screen"
            />
            <div className="relative z-10 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('capabilityMap')}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--theme-primary)]">{t('hoverModule')}</span>
            </div>
            <CapabilityRail
              items={skills.map((skill) => ({
                id: skill.key,
                label: skill.category,
                eyebrow: `${skill.key} / active stack`,
                items: derived[skill.key],
                image: skill.key === 'frontend'
                  ? '/icons/typescript.png'
                  : skill.key === 'backend'
                  ? '/icons/java.png'
                  : skill.key === 'systems'
                  ? '/icons/rust.png'
                  : '/icons/docker.png',
              }))}
            />
          </div>

          <div className="min-w-0 space-y-6">
            {techSignal && (
              <div className="relative min-w-0 overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]/[0.35]">
                <Image
                  src="/images/gifs/jinwoogf6.gif"
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="theme-ambient-media pointer-events-none absolute inset-0 z-0 object-cover opacity-[0.08] mix-blend-screen"
                />
                <div className="relative z-10 flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{t('liveStackSignal')}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--theme-primary)]">{t('clickInspect')}</span>
                </div>
                <div className="relative z-10">{techSignal}</div>
              </div>
            )}
            <BongoCat />
          </div>
        </div>
      </div>
    </section>
  );
}
