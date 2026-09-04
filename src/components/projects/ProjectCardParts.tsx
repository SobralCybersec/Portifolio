'use client';

import {
  AnimatePresence,
  motion,
  type MotionValue,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Github } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { shouldRenderVideoPreview } from '@/lib/media/project-preview';
import ImageSlideshow from './ImageSlideshow';
import type { ProjectCardColors, Repo } from './project-card-types';
import { useEffect, useRef, useState } from 'react';

export function getPreviewImages(previewImage: string | undefined): string[] {
  if (!previewImage) return [];

  try {
    const parsed = JSON.parse(previewImage);
    if (Array.isArray(parsed)) return [...new Set<string>(parsed)];
  } catch {
    return [previewImage];
  }

  return [previewImage];
}

function LazyPreviewVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [shouldLoad]);

  if (failed) return null;

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      className="h-full w-full object-cover"
      autoPlay={shouldLoad}
      loop
      muted
      playsInline
      controls
      preload={shouldLoad ? 'metadata' : 'none'}
      onError={() => setFailed(true)}
    />
  );
}

interface ProjectCardPreviewProps {
  repo: Repo;
  previewImages: string[];
  languageFallback: string;
  colors: ProjectCardColors;
  isLight: boolean;
  shouldReduceMotion: boolean;
  isLanguageIcon: boolean;
  featured: boolean;
}

interface PreviewMediaProps {
  repo: Repo;
  previewImages: string[];
  languageFallback: string;
  colors: ProjectCardColors;
  isLanguageIcon: boolean;
}

function PreviewMedia(props: PreviewMediaProps) {
  const { repo, previewImages, languageFallback, colors: C, isLanguageIcon } = props;
  const t = useTranslations('projects');

  if (shouldRenderVideoPreview(repo.isVideo, previewImages[0])) return <LazyPreviewVideo src={previewImages[0]} />;
  if (isLanguageIcon) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <SafeImage
          src={previewImages[0]}
          alt={repo.language ?? t('languageIcon')}
          width={140}
          height={140}
          className="object-contain"
          fallbackSrc={languageFallback}
          style={{ filter: 'brightness(0.95) contrast(1.1) drop-shadow(0 0 18px ' + C.primary + '80)' }}
        />
      </div>
    );
  }
  return <ImageSlideshow images={previewImages} alt={repo.name} interval={5000} fallbackSrc={languageFallback} />;
}

export function ProjectCardPreview(props: ProjectCardPreviewProps) {
  const { repo, previewImages, languageFallback, colors: C, isLight, shouldReduceMotion, isLanguageIcon, featured } = props;

  return (
    <div
      className="relative mb-5 overflow-hidden"
      style={{
        aspectRatio: isLanguageIcon ? '1 / 1' : featured ? '21 / 9' : '16 / 9',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)',
        border: '1px solid ' + C.border,
        background: isLight ? '#dde6ff' : 'rgba(6,0,16,0.95)',
        isolation: 'isolate',
      }}
    >
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, ' + C.primary + '1a)' }} />
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        animate={shouldReduceMotion ? { opacity: 0.05 } : { opacity: [0.05, 0.1, 0.05] }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity }}
        style={{ background: 'repeating-linear-gradient(90deg, transparent 0px, ' + C.primary + '0d 2px, transparent 4px)' }}
      />
      <PreviewMedia repo={repo} previewImages={previewImages} languageFallback={languageFallback} colors={C} isLanguageIcon={isLanguageIcon} />
    </div>
  );
}

interface ProjectCardVisualsProps {
  repo: Repo;
  colors: ProjectCardColors;
  isLight: boolean;
  spotlightBackground: MotionValue<string>;
  shouldReduceMotion: boolean;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onMouseMove: (event: React.MouseEvent<HTMLElement>) => void;
  featured: boolean;
}

export function ProjectCardVisuals(props: ProjectCardVisualsProps) {
  const {
    repo,
    colors: C,
    isLight,
    spotlightBackground,
    shouldReduceMotion,
    isHovered,
    onHoverChange,
    onMouseMove,
    featured,
  } = props;

  return (
    <>
      <AnimatePresence>
        {!shouldReduceMotion && isHovered && (
          <motion.span
            layoutId="project-card-hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
            className="pointer-events-none absolute inset-0 z-20"
            style={{ background: `${C.primaryBright}0d` }}
          />
        )}
      </AnimatePresence>

      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        />
      )}

      {/* BACKGROUND NOISE */}
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 0.6px, transparent 0.6px)`,
          backgroundSize: "6px 6px",
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
            ${isLight ? "rgba(30,100,240,0.12)" : "rgba(120,0,255,0.14)"} 3px
          )`,
        }}
      />

      {/* KAGUNE GLOW — purple/blue tint only outside image area */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={
          shouldReduceMotion
            ? { opacity: 0.15, scale: 1 }
            : { opacity: [0.15, 0.28, 0.15], scale: [1, 1.03, 1] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 5, repeat: Infinity }
        }
        style={{
          background: `radial-gradient(circle at 50% 120%, ${C.glow}, transparent 55%)`,
          // NO mixBlendMode here — keeps glow on the card bg, never touches image pixels
        }}
      />

      {/* GLITCH SWEEP */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-y-0 -left-[40%] w-[30%] pointer-events-none"
          animate={{ x: ["0%", "420%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{
            background: `linear-gradient(90deg, transparent, ${isLight ? "rgba(30,100,240,0.1)" : "rgba(120,0,255,0.12)"}, transparent)`,
            transform: "skewX(-20deg)",
            filter: "blur(8px)",
          }}
        />
      )}

      {/* CORNERS */}
      <div
        className="absolute top-0 left-0 h-10 w-10 border-l border-t"
        style={{ borderColor: C.primaryBright + "b3" }}
      />
      <div
        className="absolute bottom-0 right-0 h-10 w-10 border-r border-b"
        style={{ borderColor: C.primaryBright + "b3" }}
      />

      {/* SIDE LABEL */}
      <div
        className="absolute right-[-58px] top-24 rotate-90 text-[10px] tracking-[0.7em]"
        style={{ color: C.primary + "60" }}
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
              id={`project-title-${repo.id}`}
              className={`truncate font-black uppercase tracking-[0.24em] ${featured ? "text-[20px] md:text-[22px]" : "text-[18px]"}`}
              style={{
                fontFamily: "var(--font-eternal)",
                color: C.white,
                textShadow: `0 0 14px ${C.primary}80`,
              }}
            >
              {repo.name}
            </h2>
          </div>

          <motion.div
            animate={
              shouldReduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: [0.4, 1, 0.4], scale: [1, 1.08, 1] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 2.4, repeat: Infinity }
            }
            className="relative flex h-11 w-11 items-center justify-center"
            style={{
              border: `1px solid ${C.primary}33`,
              background: `${C.primaryDark}33`,
              clipPath: "polygon(0 0,100% 0,100% 72%,72% 100%,0 100%)",
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

    </>
  );
}
