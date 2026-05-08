'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';
import SafeImage from './SafeImage';
import ImageSlideshow from './ImageSlideshow';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  previewImage?: string;
  isVideo?: boolean;
  techStack?: string[];
}

interface SoloLevelingProjectCardProps {
  repo: Repo;
  index: number;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89e051', HTML: '#e34c26',
  CSS: '#563d7c',
};

function langColor(lang: string | null): string {
  return lang ? (LANG_COLORS[lang] ?? '#a855f7') : '#a855f7';
}

export default function SoloLevelingProjectCard({ repo, index }: SoloLevelingProjectCardProps) {
  const { theme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted ? theme === 'dark' : true;
  const primary = isDark ? '#a855f7' : '#3b82f6';
  const accent = isDark ? '#8b5cf6' : '#3b82f6';

  const getPreviewImages = (): string[] => {
    if (!repo.previewImage) return [];
    try {
      const p = JSON.parse(repo.previewImage);
      if (Array.isArray(p)) return p;
    } catch {}
    return [repo.previewImage];
  };

  const previewImages = getPreviewImages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="relative overflow-hidden rounded-[2px]"
      style={{
        border: `1px solid ${primary}59`,
        background: isDark ? 'rgba(10,5,20,0.96)' : 'rgba(59,130,246,0.35)',
        boxShadow: `0 0 0 1px ${primary}33, 0 0 40px ${primary}1f, inset 0 0 80px ${isDark ? 'rgba(100,30,150,0.35)' : 'rgba(59,130,246,0.35)'}`,
      }}
    >
      {/* Scanline effect */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg,transparent,${primary}b3,transparent)` }}
        animate={{ top: ['-2px', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Edge glows */}
      {(['top','bottom'] as const).map((side) => (
        <div key={side} className={`absolute ${side === 'top' ? '-top-px' : '-bottom-px'} left-[10%] right-[10%] h-px`}
          style={{ background: `linear-gradient(90deg,transparent,${accent},${primary},${accent},transparent)`, animation: 'edgepulse 2.5s ease-in-out infinite' }} />
      ))}
      {(['left','right'] as const).map((side) => (
        <div key={side} className={`absolute ${side === 'left' ? '-left-px' : '-right-px'} top-[10%] bottom-[10%] w-px`}
          style={{ background: `linear-gradient(180deg,transparent,${accent},${primary},${accent},transparent)`, animation: 'edgepulse 2.5s ease-in-out infinite' }} />
      ))}

      {/* Corners */}
      {[
        { pos: '-top-[3px] -left-[3px]',   bw: '2px 0 0 2px',   dot: '-top-px -left-px'   },
        { pos: '-top-[3px] -right-[3px]',  bw: '2px 2px 0 0',   dot: '-top-px -right-px'  },
        { pos: '-bottom-[3px] -left-[3px]', bw: '0 0 2px 2px',  dot: '-bottom-px -left-px' },
        { pos: '-bottom-[3px] -right-[3px]',bw: '0 2px 2px 0',  dot: '-bottom-px -right-px'},
      ].map((c, i) => (
        <div key={i} className={`absolute ${c.pos} h-5 w-5`} style={{ borderStyle: 'solid', borderWidth: c.bw, borderColor: accent }}>
          <div className={`absolute ${c.dot} h-1.5 w-1.5`} style={{ background: accent, boxShadow: `0 0 10px 3px ${accent}e6` }} />
        </div>
      ))}

      {/* Header */}
      <div className="relative flex items-center border-b" style={{ borderColor: `${primary}4d` }}>
        <div className="absolute -bottom-px left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${accent}e6,transparent)` }} />
        <div className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center border-r" style={{ borderColor: `${primary}4d`, background: isDark ? 'rgba(100,40,150,0.3)' : 'rgba(59,130,246,0.3)' }}>
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-full border-2"
            style={{ borderColor: accent, boxShadow: `0 0 12px ${accent}b3, inset 0 0 10px ${accent}26` }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Github className="w-5 h-5" style={{ color: accent }} />
          </motion.div>
        </div>
        <div className="relative mx-[14px] my-2.5 flex flex-1 items-center border px-4 py-2" style={{ borderColor: `${primary}40`, background: isDark ? 'rgba(80,30,120,0.2)' : 'rgba(59,130,246,0.2)' }}>
          <div className="absolute -bottom-px -left-px -top-px w-[3px]" style={{ background: accent, boxShadow: `0 0 8px ${accent}cc` }} />
          <div className="absolute -bottom-px -right-px -top-px w-[3px]" style={{ background: accent, boxShadow: `0 0 8px ${accent}cc` }} />
          <span className="font-black uppercase leading-none tracking-[4px] truncate" style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: '#e0f4ff', textShadow: `0 0 8px ${accent}e6, 0 0 20px ${primary}99` }}>
            {repo.name}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-5 pt-5">
        {previewImages.length > 0 && (
          <div className="relative w-full rounded-lg overflow-hidden mb-4 border" style={{ aspectRatio: '16/9', borderColor: `${primary}66`, background: isDark ? 'rgba(50,10,80,0.8)' : 'rgba(59,130,246,0.3)' }}>
            {repo.isVideo ? (
              <video src={previewImages[0]} className="w-full h-full object-contain" autoPlay loop muted playsInline />
            ) : (
              <ImageSlideshow images={previewImages} alt={repo.name} interval={5000} />
            )}
          </div>
        )}

        <p className="text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Rajdhani,sans-serif', color: isDark ? 'rgba(220,180,255,0.8)' : 'rgba(59,130,246,0.95)' }}>
          {repo.description || 'No description available'}
        </p>

        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: isDark ? 'rgba(210,160,255,0.8)' : 'rgba(59,130,246,0.9)' }}>
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{repo.stargazers_count}</span>
          <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />{repo.forks_count}</span>
        </div>

        {repo.techStack && repo.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repo.techStack.map(t => (
              <span key={t} className="px-2.5 py-1 text-xs rounded border" style={{ background: isDark ? 'rgba(50,10,80,0.8)' : 'rgba(59,130,246,0.35)', borderColor: `${primary}66`, color: isDark ? 'rgba(210,160,255,0.8)' : 'rgba(59,130,246,0.95)' }}>{t}</span>
            ))}
          </div>
        )}

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {repo.topics.slice(0, 5).map(t => (
              <span key={t} className="px-2.5 py-1 text-xs rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)' }}>{t}</span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded border transition-all hover:brightness-110"
            style={{ 
              background: isDark ? 'rgba(50,10,80,0.8)' : 'rgba(59,130,246,0.35)', 
              borderColor: `${primary}66`,
              color: isDark ? '#f0e0ff' : '#3b82f6',
              fontFamily: 'Rajdhani,sans-serif',
              fontWeight: 600
            }}>
            <Github className="w-4 h-4" /> Code
          </a>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded border transition-all hover:brightness-110"
              style={{ 
                background: 'rgba(168,85,247,0.15)', 
                borderColor: 'rgba(168,85,247,0.4)',
                color: '#a855f7',
                fontFamily: 'Rajdhani,sans-serif',
                fontWeight: 600
              }}>
              <ExternalLink className="w-4 h-4" /> Demo
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-[18px] py-2" style={{ borderColor: `${primary}33`, background: isDark ? 'rgba(50,10,80,0.4)' : 'rgba(59,130,246,0.3)' }}>
        <span className="leading-none tracking-[2px] text-xs" style={{ fontFamily: 'Orbitron,monospace', color: `${primary}66` }}>
          PROJECT #{String(index + 1).padStart(3, '0')}
        </span>
        <div className="flex items-center gap-1.5">
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div 
              key={i} 
              className="h-1.5 w-1.5 rounded-full" 
              style={{ background: accent, boxShadow: `0 0 6px ${accent}cc` }} 
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }} 
              transition={{ duration: 1.5, repeat: Infinity, delay }} 
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes edgepulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
      `}</style>
    </motion.div>
  );
}
