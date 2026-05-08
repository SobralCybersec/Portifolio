'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import GitHubProjects from '@/components/GitHubProjects';
import Contact from '@/components/Contact';
import TechCarousel from '@/components/TechCarousel';
import KeyboardNav from '@/components/KeyboardNav';
import ScrollProgress from '@/components/ScrollProgress';
import Navigation from '@/components/Navigation';
import SoloLevelingBoot from '@/components/SoloLevelingBoot';
import LivePreview from '@/components/LivePreview';
import { useClickSound } from '@/hooks/useClickSound';
import HexagonGrid from '@/components/HexagonGrid';
import ParticleBackground from '@/components/ParticleBackground';
import VisitorCounter from '@/components/VisitorCounter';

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const { theme } = useTheme();
  useClickSound();

  const handleBootComplete = () => {
    setBootComplete(true);
    localStorage.setItem('bootComplete', 'true');
    window.dispatchEvent(new Event('bootComplete'));
  };

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
          <VisitorCounter />
          
          <main className="portfolio-main">
            <div className="page-section" id="hero">
              <Hero />
            </div>
            
            <div className="page-section" id="skills">
              <Skills />
            </div>

            <div className="page-section" id="tech">
              <TechCarousel />
            </div>
            
            <div className="page-section" id="live">
              <LivePreview />
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
