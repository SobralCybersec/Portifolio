'use client';

import { motion } from 'framer-motion';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useHydrated } from '@/hooks/useHydrated';
import SafeImage from './SafeImage';
import ImageSlideshow from './ImageSlideshow';
import { safeGithubUrl, safeExternalUrl } from '@/lib/url';
import { getLanguageImage } from '@/lib/languageIcon';

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

// ── Dark mode: purple palette ──────────────────────────────────────────────
const DARK_COLORS = {
  bg: '#030008',
  panel: '#06000f',
  panel2: '#0e0020',

  primary: '#8b14e8',
  primaryBright: '#a855f7',
  primaryDark: '#2d0060',

  white: '#f0eeff',
  muted: 'rgba(220,200,255,0.68)',

  border: 'rgba(150,0,255,0.18)',
  glow: 'rgba(120,0,255,0.35)',
};

// ── Light / white mode: blue palette ──────────────────────────────────────
const LIGHT_COLORS = {
  bg: '#f0f4ff',
  panel: '#e8eeff',
  panel2: '#dde6ff',

  primary: '#1a6ff5',
  primaryBright: '#3b82f6',
  primaryDark: '#1e3a8a',

  white: '#0f1740',
  muted: 'rgba(15,23,100,0.72)',

  border: 'rgba(30,100,240,0.22)',
  glow: 'rgba(30,100,240,0.28)',
};

function langColor(lang: string | null, colors: typeof DARK_COLORS): string {
  return lang ? (LANG_COLORS[lang] ?? colors.primary) : colors.primary;
}

export default function SoloLevelingProjectCard({
  repo,
  index,
}: SoloLevelingProjectCardProps) {
  const mounted = useHydrated();
  const { resolvedTheme } = useTheme();

  // Pick palette based on resolved theme; default to dark until hydrated
  const C = mounted && resolvedTheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
  const isLight = mounted && resolvedTheme === 'light';

  const languageFallback = getLanguageImage(repo.language);

  const getPreviewImages = (): string[] => {
    if (!repo.previewImage) return [];
    try {
      const parsed = JSON.parse(repo.previewImage);
      if (Array.isArray(parsed)) {
        // Deduplicate by URL — duplicate entries cause React "same key" warnings
        // when ImageSlideshow or any parent maps over this array using URL as key
        return [...new Set<string>(parsed)];
      }
    } catch {}
    return [repo.previewImage];
  };

  // When no readme/preview image was detected, fall back to the language icon
  // so every card still shows a relevant visual instead of a blank tile.
  const parsedPreviewImages = getPreviewImages();
  const previewImages =
    parsedPreviewImages.length > 0 ? parsedPreviewImages : [languageFallback];
  const hasPreview = previewImages.length > 0;
  const isLanguageIcon =
    hasPreview && previewImages[0].startsWith('/icons/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.06 }}
      className="group relative overflow-hidden"
      style={{
        clipPath: `
          polygon(
            0 0,
            calc(100% - 34px) 0,
            100% 34px,
            100% 100%,
            34px 100%,
            0 calc(100% - 34px)
          )
        `,
        background: isLight
          ? `linear-gradient(145deg, #edf2ff 0%, #f5f8ff 45%, #e8eeff 100%)`
          : `linear-gradient(145deg, rgba(8,0,18,0.98) 0%, rgba(3,0,8,1) 45%, rgba(14,0,30,0.98) 100%)`,
        border: `1px solid ${C.border}`,
        boxShadow: `
          0 0 0 1px ${isLight ? 'rgba(30,100,240,0.1)' : 'rgba(100,0,200,0.1)'},
          0 0 60px ${isLight ? 'rgba(30,100,240,0.14)' : 'rgba(80,0,160,0.22)'},
          inset 0 0 120px ${isLight ? 'rgba(30,100,240,0.04)' : 'rgba(100,0,200,0.05)'},
          inset 0 0 12px rgba(255,255,255,0.03)
        `,
      }}
    >
      {/* BACKGROUND NOISE */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 0.6px, transparent 0.6px)`,
          backgroundSize: '6px 6px',
        }}
      />

      {/* SCANLINES */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 2px,
            ${isLight ? 'rgba(30,100,240,0.12)' : 'rgba(120,0,255,0.14)'} 3px
          )`,
        }}
      />

      {/* KAGUNE GLOW — purple/blue tint only outside image area */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.03, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{
          background: `radial-gradient(circle at 50% 120%, ${C.glow}, transparent 55%)`,
          // NO mixBlendMode here — keeps glow on the card bg, never touches image pixels
        }}
      />

      {/* GLITCH SWEEP */}
      <motion.div
        className="absolute inset-y-0 -left-[40%] w-[30%] pointer-events-none"
        animate={{ x: ['0%', '420%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        style={{
          background: `linear-gradient(90deg, transparent, ${isLight ? 'rgba(30,100,240,0.1)' : 'rgba(120,0,255,0.12)'}, transparent)`,
          transform: 'skewX(-20deg)',
          filter: 'blur(8px)',
        }}
      />

      {/* CORNERS */}
      <div
        className="absolute top-0 left-0 h-10 w-10 border-l border-t"
        style={{ borderColor: C.primaryBright + 'b3' }}
      />
      <div
        className="absolute bottom-0 right-0 h-10 w-10 border-r border-b"
        style={{ borderColor: C.primaryBright + 'b3' }}
      />

      {/* SIDE LABEL */}
      <div
        className="absolute right-[-58px] top-24 rotate-90 text-[10px] tracking-[0.7em]"
        style={{ color: C.primary + '60' }}
      >
        CLASSIFIED
      </div>

      {/* HEADER */}
      <div
        className="relative border-b px-5 py-4 overflow-hidden"
        style={{ borderColor: C.border }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${C.primary}14, transparent 42%)`,
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="min-w-0">
         

            <h2
              className="truncate text-[18px] font-black uppercase tracking-[0.24em]"
              style={{
                fontFamily: 'var(--font-eternal)',
                color: C.white,
                textShadow: `0 0 14px ${C.primary}80`,
              }}
            >
              {repo.name}
            </h2>
          </div>

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="relative flex h-11 w-11 items-center justify-center"
            style={{
              border: `1px solid ${C.primary}33`,
              background: `${C.primaryDark}33`,
              clipPath: 'polygon(0 0,100% 0,100% 72%,72% 100%,0 100%)',
            }}
          >
            <Github
              className="h-5 w-5"
              style={{
                color: C.primaryBright,
                filter: `drop-shadow(0 0 8px ${C.primary}e6)`,
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative px-5 py-5">
        {hasPreview && (
          /*
           * FIX: `isolation: isolate` creates a new stacking context so that
           * any overlay divs inside CANNOT composite (blend) with the image
           * element below them. The overlays use pointer-events:none + opacity
           * only — no mixBlendMode — so they tint the container background
           * without touching image pixels. This eliminates the red ghosting.
           */
          <div
            className="relative mb-5 overflow-hidden"
            style={{
              aspectRatio: isLanguageIcon ? '1 / 1' : '16 / 9',
              clipPath: `
                polygon(
                  0 0,
                  100% 0,
                  100% calc(100% - 18px),
                  calc(100% - 18px) 100%,
                  0 100%
                )
              `,
              border: `1px solid ${C.border}`,
              background: isLight ? '#dde6ff' : 'rgba(6,0,16,0.95)',
              // KEY FIX: isolate this container so internal overlays
              // never blend with image pixels via mix-blend-mode
              isolation: 'isolate',
            }}
          >
            {/* TINT FILM — opacity-only, NO mixBlendMode */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent, ${C.primary}1a)`,
                // Removed: mixBlendMode: 'screen' ← was causing image ghosting
              }}
            />

            {/* DISTORTION LINES — opacity-only, NO mixBlendMode */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              animate={{ opacity: [0.05, 0.10, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                background: `repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  ${C.primary}0d 2px,
                  transparent 4px
                )`,
                // Removed: mixBlendMode — was compounding with the film overlay
              }}
            />

            {repo.isVideo ? (
              <video
                src={previewImages[0]}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : isLanguageIcon ? (
              <div className="flex h-full w-full items-center justify-center p-10">
                <SafeImage
                  src={previewImages[0]}
                  alt={repo.language ?? 'Language icon'}
                  width={140}
                  height={140}
                  className="object-contain"
                  fallbackSrc={languageFallback}
                  style={{
                    filter: `brightness(0.95) contrast(1.1) drop-shadow(0 0 18px ${C.primary}80)`,
                  }}
                />
              </div>
            ) : (
              <ImageSlideshow
                images={previewImages}
                alt={repo.name}
                interval={5000}
                fallbackSrc={languageFallback}
              />
            )}
          </div>
        )}

        {/* DESCRIPTION */}
        <p
          className="relative mb-5 text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-body)', color: C.muted }}
        >
          {repo.description || 'No description available'}
        </p>

        {/* STATS */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4 text-xs"
          style={{ color: isLight ? C.primaryDark + 'cc' : 'rgba(200,180,255,0.7)' }}
        >
          {repo.language && (
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5"
                style={{
                  background: langColor(repo.language, C),
                  boxShadow: `0 0 8px ${langColor(repo.language, C)}`,
                  clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
                }}
              />
              {repo.language}
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {repo.stargazers_count}
          </span>

          <span className="flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5" />
            {repo.forks_count}
          </span>
        </div>

        {/* TAGS */}
        {repo.topics.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {repo.topics.slice(0, 5).map((topic, i) => (
              <span
                key={`${topic}-${i}`}
                className="px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                style={{
                  clipPath: 'polygon(0 0,100% 0,92% 100%,0 100%)',
                  background: `${C.primaryDark}38`,
                  border: `1px solid ${C.border}`,
                  color: isLight ? C.primaryDark : 'rgba(220,200,255,0.88)',
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3">
          <a
            href={safeGithubUrl(repo.html_url) ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
            style={{
              clipPath: 'polygon(0 0,100% 0,92% 100%,0 100%)',
              border: `1px solid ${C.primary}3d`,
              background: isLight ? 'rgba(240,244,255,0.85)' : 'rgba(10,0,22,0.85)',
              color: C.white,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${C.primary}2e, transparent)`,
              }}
            />
            <Github className="relative z-10 h-4 w-4" />
            <span className="relative z-10">Archive</span>
          </a>

          {safeExternalUrl(repo.homepage) && (
            <a
              href={safeExternalUrl(repo.homepage)!}
              target="_blank"
              rel="noopener noreferrer"
              className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                clipPath: 'polygon(0 0,100% 0,92% 100%,0 100%)',
                border: `1px solid ${C.primary}59`,
                background: `${C.primary}14`,
                color: C.primaryBright,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${C.primary}38, transparent)`,
                }}
              />
              <ExternalLink className="relative z-10 h-4 w-4" />
              <span className="relative z-10">Deploy</span>
            </a>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="relative flex items-center justify-between border-t px-5 py-3"
        style={{
          borderColor: C.border,
          background: isLight ? 'rgba(220,230,255,0.72)' : 'rgba(14,0,30,0.72)',
        }}
      >
        <div
          className="absolute left-0 top-0 h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.primaryBright}b3, transparent)`,
          }}
        />

        <span
          className="text-[10px] tracking-[0.35em]"
          style={{ color: isLight ? C.primaryDark + '80' : 'rgba(180,160,255,0.4)' }}
        >
          FILE #{String(index + 1).padStart(3, '0')}
        </span>

        <div className="flex items-center gap-2">
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5"
              style={{
                background: C.primaryBright,
                boxShadow: `0 0 10px ${C.primary}e6`,
                clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .group:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </motion.div>
  );
}