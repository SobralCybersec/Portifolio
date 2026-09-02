'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useHydrated } from '@/hooks/browser/useHydrated';
import Hero from '@/components/home/Hero';
import Navigation from '@/components/layout/Navigation';
import RouteView from '@/components/layout/RouteView';
import ScrollProgress from '@/components/effects/ScrollProgress';
import ChapterIndex from '@/components/home/ChapterIndex';
import { useClickSound } from '@/hooks/audio/useClickSound';

const SoloLevelingBoot = dynamic(() => import('@/components/loading-screen/SoloLevelingBoot'), { ssr: false });
const HexagonGrid = dynamic(() => import('@/components/effects/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });
const KeyboardNav = dynamic(() => import('@/components/ui/KeyboardNav'), { ssr: false });
const Skills = dynamic(() => import('@/components/home/Skills'), { ssr: false });
const GitHubProjects = dynamic(() => import('@/components/projects/GitHubProjects'), { ssr: false });
const Contact = dynamic(() => import('@/components/contact/Contact'), { ssr: false });
const LivePreview = dynamic(() => import('@/components/projects/LivePreview'), { ssr: false });
const TechCarousel = dynamic(() => import('@/components/home/TechCarousel'), { ssr: false });

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  previewImage?: string;
  allLanguages?: string[];
  isVideo?: boolean;
  techStack?: string[];
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [decorationsReady, setDecorationsReady] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [skillsReady, setSkillsReady] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const mounted = useHydrated();
  useClickSound();

  const handleBootComplete = () => {
    setBootComplete(true);
    localStorage.setItem('bootComplete', 'true');
    window.dispatchEvent(new Event('bootComplete'));
  };

  useEffect(() => {
    fetch('/api/github/repos')
      .then(r => r.json())
      .then(setRepos)
      .catch(() => setRepos([]));
  }, []);

  useEffect(() => {
    if (!bootComplete) return;

    const timer = window.setTimeout(() => setDecorationsReady(true), 1600);
    return () => window.clearTimeout(timer);
  }, [bootComplete]);

  useEffect(() => {
    const section = skillsRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      setSkillsReady(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setSkillsReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px 300px' });
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!bootComplete && <SoloLevelingBoot onComplete={handleBootComplete} />}
      {/* Animated Grid Overlay */}
      <div className="page-grid-overlay" />
          
      {/* Dark Theme Background Effects */}
      {decorationsReady && mounted && theme === 'dark' && (
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
          
      {/* Particle Background for entire page */}
      {decorationsReady && (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
          <ParticleBackground />
        </div>
      )}
          
      <Navigation />
      <ScrollProgress />
      <KeyboardNav onMenuToggle={() => setMenuOpen(!menuOpen)} />

      <RouteView>
        <main className="portfolio-main">
          <ChapterIndex />
        <div className="page-section" id="hero">
          <Hero />
        </div>

        <div className="page-section" id="live">
          <LivePreview />
        </div>


        <div ref={skillsRef} data-lazy-load="skills" className="page-section min-h-[900px]" id="skills">
          {skillsReady && <Skills repos={repos} techSignal={<TechCarousel compact />} />}
        </div>

        <div className="page-section" id="contact">
          <Contact />
        </div>
        </main>
      </RouteView>
    </>
  );
}
