'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import ScrollProgress from '@/components/ScrollProgress';
import { useClickSound } from '@/hooks/useClickSound';

const SoloLevelingBoot = dynamic(() => import('@/components/SoloLevelingBoot'), { ssr: false });
const HexagonGrid = dynamic(() => import('@/components/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });
const KeyboardNav = dynamic(() => import('@/components/KeyboardNav'), { ssr: false });
const Skills = dynamic(() => import('@/components/Skills'), { ssr: false });
const GitHubProjects = dynamic(() => import('@/components/GitHubProjects'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: false });
const TechCarousel = dynamic(() => import('@/components/TechCarousel'), { ssr: false });
const LivePreview = dynamic(() => import('@/components/LivePreview'), { ssr: false });

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
  const [repos, setRepos] = useState<Repo[]>([]);
  const { theme } = useTheme();
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

  return (
    <>
      {!bootComplete && <SoloLevelingBoot onComplete={handleBootComplete} />}
      {bootComplete && (
        <>
          {/* Animated Grid Overlay */}
          <div className="page-grid-overlay" />
          
          {/* Dark Theme Background Effects */}
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
          
          {/* Particle Background for entire page */}
          <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
            <ParticleBackground />
          </div>
          
          <Navigation />
          <ScrollProgress />
          <KeyboardNav onMenuToggle={() => setMenuOpen(!menuOpen)} />
          
          <main className="portfolio-main">
            <div className="page-section" id="hero">
              <Hero />
            </div>
            
            <div className="page-section" id="live">
              <LivePreview />
            </div>


            <div className="page-section" id="skills">
             <Skills repos={repos} />
            </div>

            <div className="page-section" id="tech">
              <TechCarousel />
            </div>

            <div className="page-section" id="contact">
              <Contact />
            </div>
          </main>
        </>
      )}
    </>
  );
}
