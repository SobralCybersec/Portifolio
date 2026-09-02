"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { Github, ExternalLink, FileText, Star, GitFork } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/hooks/browser/useHydrated";
import { safeGithubUrl, safeExternalUrl } from "@/lib/security/url";
import { getLanguageImage } from "@/lib/github/languageIcon";
import { useTranslations } from "next-intl";
import { getPreviewImages, ProjectCardPreview, ProjectCardVisuals } from "./ProjectCardParts";
import type { Repo } from "./project-card-types";
import ProjectLibraryCard from './ProjectLibraryCard';

interface SoloLevelingProjectCardProps {
  repo: Repo;
  index: number;
  onReadme?: (repo: Repo) => void;
  featured?: boolean;
  variant?: 'default' | 'library';
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

// ── Dark mode: purple palette ──────────────────────────────────────────────
const DARK_COLORS = {
  bg: "#030008",
  panel: "#06000f",
  panel2: "#0e0020",

  primary: "#8b14e8",
  primaryBright: "#a855f7",
  primaryDark: "#2d0060",

  white: "#f0eeff",
  muted: "rgba(220,200,255,0.68)",

  border: "rgba(150,0,255,0.18)",
  glow: "rgba(120,0,255,0.35)",
};

// ── Light / white mode: blue palette ──────────────────────────────────────
const LIGHT_COLORS = {
  bg: "#f0f4ff",
  panel: "#e8eeff",
  panel2: "#dde6ff",

  primary: "#1a6ff5",
  primaryBright: "#3b82f6",
  primaryDark: "#1e3a8a",

  white: "#0f1740",
  muted: "rgba(15,23,100,0.72)",

  border: "rgba(30,100,240,0.22)",
  glow: "rgba(30,100,240,0.28)",
};

function langColor(lang: string | null, colors: typeof DARK_COLORS): string {
  return lang ? (LANG_COLORS[lang] ?? colors.primary) : colors.primary;
}

export default function SoloLevelingProjectCard({
  variant = 'default',
  ...props
}: SoloLevelingProjectCardProps) {
  if (variant === 'library') {
    return <ProjectLibraryCard {...props} />;
  }

  return <DefaultSoloLevelingProjectCard {...props} />;
}

function DefaultSoloLevelingProjectCard({
  repo,
  index,
  onReadme,
  featured = false,
}: SoloLevelingProjectCardProps) {
  const mounted = useHydrated();
  const t = useTranslations("projects");
  const { resolvedTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 260, damping: 28 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 260, damping: 28 });
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [5, -5]),
    { stiffness: 300, damping: 30 },
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-5, 5]),
    { stiffness: 300, damping: 30 },
  );

  // Pick palette based on resolved theme; default to dark until hydrated
  const C = mounted && resolvedTheme === "light" ? LIGHT_COLORS : DARK_COLORS;
  const isLight = mounted && resolvedTheme === "light";

  const languageFallback = getLanguageImage(repo.language);

  // When no readme/preview image was detected, fall back to the language icon
  // so every card still shows a relevant visual instead of a blank tile.
  const parsedPreviewImages = getPreviewImages(repo.previewImage);
  const previewImages =
    parsedPreviewImages.length > 0 ? parsedPreviewImages : [languageFallback];
  const isLanguageIcon = previewImages[0].startsWith("/icons/");

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      300px circle at ${mouseXSpring}px ${mouseYSpring}px,
      ${isLight ? "rgba(59,130,246,0.18)" : "rgba(168,85,247,0.2)"},
      transparent 78%
    )
  `;

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(
      -0.5,
      Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5),
    );
    const y = Math.max(
      -0.5,
      Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5),
    );
    pointerX.set(x);
    pointerY.set(y);
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    pointerX.set(0);
    pointerY.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!onReadme) return;
    const target = event.target;
    if (target instanceof Element && target.closest("a, button, video")) return;
    onReadme(repo);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!onReadme || event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onReadme(repo);
    }
  };

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : index * 0.06,
      }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
      ref={cardRef}
      aria-labelledby={`project-title-${repo.id}`}
      tabIndex={onReadme ? 0 : undefined}
      className="group relative overflow-hidden"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={(event) => {
        setIsHovered(true);
        handleMouseMove(event);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
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
          0 0 0 1px ${isLight ? "rgba(30,100,240,0.1)" : "rgba(100,0,200,0.1)"},
          0 0 60px ${isLight ? "rgba(30,100,240,0.14)" : "rgba(80,0,160,0.22)"},
          inset 0 0 120px ${isLight ? "rgba(30,100,240,0.04)" : "rgba(100,0,200,0.05)"},
          inset 0 0 12px rgba(255,255,255,0.03)
        `,
      }}
    >
      <ProjectCardVisuals
        repo={repo}
        colors={C}
        isLight={isLight}
        spotlightBackground={spotlightBackground}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
        isHovered={isHovered}
        onHoverChange={setIsHovered}
        onMouseMove={handleMouseMove}
        featured={featured}
      />

      {/* BODY */}
      <div className="relative px-5 py-5">
        <ProjectCardPreview
          repo={repo}
          previewImages={previewImages}
          languageFallback={languageFallback}
          colors={C}
          isLight={isLight}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          isLanguageIcon={isLanguageIcon}
          featured={featured}
        />

        {/* DESCRIPTION */}
        <p
          className="relative mb-5 text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-body)", color: C.muted }}
        >
          {repo.description || t("noDescription")}
        </p>

        {/* STATS */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4 text-xs"
          style={{
            color: isLight ? C.primaryDark + "cc" : "rgba(200,180,255,0.7)",
          }}
        >
          {repo.language && (
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5"
                style={{
                  background: langColor(repo.language, C),
                  boxShadow: `0 0 8px ${langColor(repo.language, C)}`,
                  clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
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
                  clipPath: "polygon(0 0,100% 0,92% 100%,0 100%)",
                  background: `${C.primaryDark}38`,
                  border: `1px solid ${C.border}`,
                  color: isLight ? C.primaryDark : "rgba(220,200,255,0.88)",
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3">
          {onReadme && (
            <button
              type="button"
              onClick={() => onReadme(repo)}
              className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                clipPath: "polygon(0 0,100% 0,92% 100%,0 100%)",
                border: `1px solid ${C.primary}59`,
                background: `${C.primary}14`,
                color: C.primaryBright,
              }}
              aria-label={`${t("inspectReadme")}: ${repo.name}`}
            >
              <FileText className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t("inspectReadme")}</span>
            </button>
          )}
          <a
            href={safeGithubUrl(repo.html_url) ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
            style={{
              clipPath: "polygon(0 0,100% 0,92% 100%,0 100%)",
              border: `1px solid ${C.primary}3d`,
              background: isLight
                ? "rgba(240,244,255,0.85)"
                : "rgba(10,0,22,0.85)",
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
            <span className="relative z-10">{t("archive")}</span>
          </a>

          {safeExternalUrl(repo.homepage) && (
            <a
              href={safeExternalUrl(repo.homepage)!}
              target="_blank"
              rel="noopener noreferrer"
              className="group/button relative flex flex-1 items-center justify-center gap-2 overflow-hidden px-4 py-3 text-xs uppercase tracking-[0.25em] transition-all duration-300"
              style={{
                clipPath: "polygon(0 0,100% 0,92% 100%,0 100%)",
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
              <span className="relative z-10">{t("deploy")}</span>
            </a>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="relative flex items-center justify-between border-t px-5 py-3"
        style={{
          borderColor: C.border,
          background: isLight ? "rgba(220,230,255,0.72)" : "rgba(14,0,30,0.72)",
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
          style={{
            color: isLight ? C.primaryDark + "80" : "rgba(180,160,255,0.4)",
          }}
        >
          FILE #{String(index + 1).padStart(3, "0")}
        </span>

        <div className="flex items-center gap-2">
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5"
              style={{
                background: C.primaryBright,
                boxShadow: `0 0 10px ${C.primary}e6`,
                clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
              }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.7, scale: 1 }
                  : { opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 1.5, repeat: Infinity, delay }
              }
            />
          ))}
        </div>
      </div>
    </motion.article>
  );
}
