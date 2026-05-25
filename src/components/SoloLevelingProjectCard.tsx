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


const TOKYO_COLORS = {
  bg: '#030000',
  panel: '#090000',
  panel2: '#120000',

  crimson: '#d90429',
  crimsonBright: '#ff2442',
  crimsonDark: '#540000',

  white: '#f5eeee',
  muted: 'rgba(255,220,220,0.68)',

  border: 'rgba(255,0,40,0.16)',
  glow: 'rgba(255,0,30,0.32)',
};

function langColor(lang: string | null): string {
  return lang
    ? LANG_COLORS[lang] ??
        TOKYO_COLORS.crimson
    : TOKYO_COLORS.crimson;
}

export default function SoloLevelingProjectCard({
  repo,
  index,
}: SoloLevelingProjectCardProps) {
  const mounted = useHydrated();

  const primary =
    TOKYO_COLORS.crimson;

  const accent =
    TOKYO_COLORS.crimsonBright;

  const getPreviewImages =
    (): string[] => {
      if (!repo.previewImage)
        return [];

      try {
        const parsed = JSON.parse(
          repo.previewImage
        );

        if (Array.isArray(parsed))
          return parsed;
      } catch {}

      return [repo.previewImage];
    };

  const previewImages =
    getPreviewImages();

  const hasPreview =
    previewImages.length > 0;

  const isLanguageIcon =
    hasPreview &&
    previewImages[0].startsWith(
      '/icons/'
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.7,
        delay: index * 0.06,
      }}
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
        background: `
          linear-gradient(
            145deg,
            rgba(10,0,0,0.98) 0%,
            rgba(2,0,0,1) 45%,
            rgba(18,0,0,0.98) 100%
          )
        `,
        border: `1px solid ${TOKYO_COLORS.border}`,
        boxShadow: `
          0 0 0 1px rgba(255,0,0,0.08),
          0 0 60px rgba(120,0,0,0.22),
          inset 0 0 120px rgba(255,0,0,0.04),
          inset 0 0 12px rgba(255,255,255,0.03)
        `,
      }}
    >
      {/* BACKGROUND NOISE */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(
              rgba(255,255,255,0.4) 0.6px,
              transparent 0.6px
            )
          `,
          backgroundSize: '6px 6px',
        }}
      />

      {/* SCANLINES */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          background: `
            repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 2px,
              rgba(255,0,0,0.14) 3px
            )
          `,
        }}
      />

      {/* KAGUNE GLOW */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0.15, 0.28, 0.15],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        style={{
          background: `
            radial-gradient(
              circle at 50% 120%,
              rgba(255,0,0,0.22),
              transparent 55%
            )
          `,
          mixBlendMode: 'screen',
        }}
      />

      {/* GLITCH SWEEP */}
      <motion.div
        className="absolute inset-y-0 -left-[40%] w-[30%] pointer-events-none"
        animate={{
          x: ['0%', '420%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              rgba(255,0,0,0.12),
              transparent
            )
          `,
          transform: 'skewX(-20deg)',
          filter: 'blur(8px)',
        }}
      />

      {/* CORNERS */}
      <div className="absolute top-0 left-0 h-10 w-10 border-l border-t border-red-500/70" />
      <div className="absolute bottom-0 right-0 h-10 w-10 border-r border-b border-red-500/70" />

      {/* SIDE LABEL */}
      <div
        className="absolute right-[-58px] top-24 rotate-90 text-[10px] tracking-[0.7em]"
        style={{
          color: 'rgba(255,0,0,0.28)',
        }}
      >
        TOKYO GHOUL
      </div>

      {/* HEADER */}
      <div
        className="relative border-b px-5 py-4 overflow-hidden"
        style={{
          borderColor:
            'rgba(255,0,0,0.12)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                90deg,
                rgba(255,0,0,0.08),
                transparent 42%
              )
            `,
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p
              className="mb-1 text-[10px] uppercase tracking-[0.45em]"
              style={{
                color:
                  'rgba(255,120,120,0.45)',
              }}
            >
              Classified Archive
            </p>

            <h2
              className="truncate text-[18px] font-black uppercase tracking-[0.24em]"
              style={{
                fontFamily:
                  'var(--font-display)',
                color:
                  TOKYO_COLORS.white,
                textShadow:
                  '0 0 14px rgba(255,0,0,0.42)',
              }}
            >
              {repo.name}
            </h2>
          </div>

          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
            }}
            className="relative flex h-11 w-11 items-center justify-center"
            style={{
              border:
                '1px solid rgba(255,0,0,0.2)',
              background:
                'rgba(80,0,0,0.2)',
              clipPath:
                'polygon(0 0,100% 0,100% 72%,72% 100%,0 100%)',
            }}
          >
            <Github
              className="h-5 w-5"
              style={{
                color: accent,
                filter:
                  'drop-shadow(0 0 8px rgba(255,0,0,0.9))',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative px-5 py-5">
        {hasPreview && (
          <div
            className="relative mb-5 overflow-hidden"
            style={{
              aspectRatio:
                isLanguageIcon
                  ? '1 / 1'
                  : '16 / 9',
              clipPath: `
                polygon(
                  0 0,
                  100% 0,
                  100% calc(100% - 18px),
                  calc(100% - 18px) 100%,
                  0 100%
                )
              `,
              border:
                '1px solid rgba(255,0,0,0.18)',
              background:
                'rgba(8,0,0,0.95)',
            }}
          >
            {/* RED FILM */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    180deg,
                    rgba(255,0,0,0.02),
                    rgba(255,0,0,0.12)
                  )
                `,
                mixBlendMode: 'screen',
              }}
            />

            {/* DISTORTION */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              animate={{
                opacity: [0.08, 0.16, 0.08],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(255,0,0,0.08) 2px,
                    transparent 4px
                  )
                `,
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
                  alt={
                    repo.language ??
                    'Language icon'
                  }
                  width={140}
                  height={140}
                  className="object-contain"
                  style={{
                    filter: `
                      brightness(0.9)
                      contrast(1.2)
                      drop-shadow(0 0 18px rgba(255,0,0,0.5))
                    `,
                  }}
                />
              </div>
            ) : (
              <ImageSlideshow
                images={previewImages}
                alt={repo.name}
                interval={5000}
              />
            )}
          </div>
        )}

        {/* DESCRIPTION */}
        <p
          className="relative mb-5 text-sm leading-relaxed"
          style={{
            fontFamily:
              'var(--font-body)',
            color:
              'rgba(255,220,220,0.82)',
          }}
        >
          {repo.description ||
            'No description available'}
        </p>

        {/* STATS */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4 text-xs"
          style={{
            color:
              'rgba(255,190,190,0.7)',
          }}
        >
          {repo.language && (
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5"
                style={{
                  background:
                    langColor(
                      repo.language
                    ),
                  boxShadow: `
                    0 0 8px ${langColor(
                      repo.language
                    )}
                  `,
                  clipPath:
                    'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
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
            {repo.topics
              .slice(0, 5)
              .map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    clipPath:
                      'polygon(0 0,100% 0,92% 100%,0 100%)',
                    background:
                      'rgba(90,0,0,0.22)',
                    border:
                      '1px solid rgba(255,0,0,0.18)',
                    color:
                      'rgba(255,220,220,0.88)',
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
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
            style={{
              clipPath:
                'polygon(0 0,100% 0,92% 100%,0 100%)',
              border:
                '1px solid rgba(255,0,0,0.24)',
              background:
                'rgba(20,0,0,0.85)',
              color:
                TOKYO_COLORS.white,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
              style={{
                background: `
                  linear-gradient(
                    90deg,
                    transparent,
                    rgba(255,0,0,0.18),
                    transparent
                  )
                `,
              }}
            />

            <Github className="relative z-10 h-4 w-4" />

            <span className="relative z-10">
              Archive
            </span>
          </a>

          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                clipPath:
                  'polygon(0 0,100% 0,92% 100%,0 100%)',
                border:
                  '1px solid rgba(255,0,0,0.35)',
                background:
                  'rgba(255,0,0,0.08)',
                color: accent,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100"
                style={{
                  background: `
                    linear-gradient(
                      90deg,
                      transparent,
                      rgba(255,0,0,0.22),
                      transparent
                    )
                  `,
                }}
              />

              <ExternalLink className="relative z-10 h-4 w-4" />

              <span className="relative z-10">
                Deploy
              </span>
            </a>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="relative flex items-center justify-between border-t px-5 py-3"
        style={{
          borderColor:
            'rgba(255,0,0,0.1)',
          background:
            'rgba(25,0,0,0.72)',
        }}
      >
        <div
          className="absolute left-0 top-0 h-px w-full"
          style={{
            background: `
              linear-gradient(
                90deg,
                transparent,
                rgba(255,0,0,0.7),
                transparent
              )
            `,
          }}
        />

        <span
          className="text-[10px] tracking-[0.35em]"
          style={{
            color:
              'rgba(255,180,180,0.4)',
          }}
        >
          FILE #
          {String(index + 1).padStart(
            3,
            '0'
          )}
        </span>

        <div className="flex items-center gap-2">
          {[0, 0.3, 0.6].map(
            (delay, i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5"
                style={{
                  background: accent,
                  boxShadow:
                    '0 0 10px rgba(255,0,0,0.9)',
                  clipPath:
                    'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay,
                }}
              />
            )
          )}
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