'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { ExternalLink, FileText, GitFork, Github, Star } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { useHydrated } from '@/hooks/browser/useHydrated';
import { getLanguageImage } from '@/lib/github/languageIcon';
import { safeExternalUrl, safeGithubUrl } from '@/lib/security/url';
import { ProjectCardPreview, getPreviewImages } from './ProjectCardParts';
import type { ProjectCardColors, Repo } from './project-card-types';

interface ProjectLibraryCardProps {
  repo: Repo;
  index: number;
  onReadme?: (repo: Repo) => void;
  featured?: boolean;
}

const DARK_COLORS: ProjectCardColors = {
  bg: '#05020b',
  panel: '#0b0614',
  panel2: '#160b27',
  primary: '#8b5cf6',
  primaryBright: '#c4b5fd',
  primaryDark: '#4c1d95',
  white: '#f5f3ff',
  muted: 'rgba(220, 210, 255, 0.72)',
  border: 'rgba(168, 85, 247, 0.28)',
  glow: 'rgba(139, 92, 246, 0.22)',
};

const LIGHT_COLORS: ProjectCardColors = {
  bg: '#f6f8ff',
  panel: '#edf2ff',
  panel2: '#dbe6ff',
  primary: '#2563eb',
  primaryBright: '#1d4ed8',
  primaryDark: '#1e3a8a',
  white: '#111b43',
  muted: 'rgba(20, 34, 88, 0.72)',
  border: 'rgba(37, 99, 235, 0.24)',
  glow: 'rgba(37, 99, 235, 0.18)',
};

function actionClass() {
  return 'magnetic-library-card__action inline-flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors';
}

export default function ProjectLibraryCard({
  repo,
  index,
  onReadme,
  featured = false,
}: ProjectLibraryCardProps) {
  const mounted = useHydrated();
  const { resolvedTheme } = useTheme();
  const t = useTranslations('projects');
  const reduceMotion = useReducedMotion();
  const isLight = mounted && resolvedTheme === 'light';
  const colors = isLight ? LIGHT_COLORS : DARK_COLORS;
  const fallback = getLanguageImage(repo.language);
  const previewImages = getPreviewImages(repo.previewImage);
  const images = previewImages.length ? previewImages : [fallback];
  const isLanguageIcon = images[0].startsWith('/icons/');
  const githubUrl = safeGithubUrl(repo.html_url) ?? '#';
  const homepageUrl = safeExternalUrl(repo.homepage);

  return (
    <article
      data-magnetic-card
      className={`magnetic-library-card ${featured ? 'magnetic-library-card--featured' : ''}`}
      style={{
        '--library-delay': `${Math.min(index * 55, 330)}ms`,
        '--library-primary': colors.primary,
        '--library-border': colors.border,
        '--library-glow': colors.glow,
      } as CSSProperties}
      aria-labelledby={`library-project-title-${repo.id}`}
    >
      <div className="magnetic-library-card__spine" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <i />
        <b>{repo.language ?? 'ARCHIVE'}</b>
      </div>

      <div className="magnetic-library-card__body">
        <div className="magnetic-library-card__topline">
          <span>ARCHIVE / {String(repo.id).slice(-3).padStart(3, '0')}</span>
          <span>{featured ? 'FEATURED FILE' : 'SELECTED WORK'}</span>
        </div>

        <div className="magnetic-library-card__title-row">
          <div>
            <p className="magnetic-library-card__kicker">VOLUME {String(index + 1).padStart(2, '0')}</p>
            <h3 id={`library-project-title-${repo.id}`}>{repo.name}</h3>
          </div>
          <span className="magnetic-library-card__mark" aria-hidden="true">↗</span>
        </div>

        <ProjectCardPreview
          repo={repo}
          previewImages={images}
          languageFallback={fallback}
          colors={colors}
          isLight={isLight}
          shouldReduceMotion={Boolean(reduceMotion)}
          isLanguageIcon={isLanguageIcon}
          featured={featured}
        />

        <p className="magnetic-library-card__description">
          {repo.description || t('noDescription')}
        </p>

        <div className="magnetic-library-card__stats" aria-label={`${repo.name} metadata`}>
          {repo.language && <span><i style={{ background: colors.primary }} />{repo.language}</span>}
          <span><Star aria-hidden="true" />{repo.stargazers_count}</span>
          <span><GitFork aria-hidden="true" />{repo.forks_count}</span>
        </div>

        {repo.topics.length > 0 && (
          <ul className="magnetic-library-card__tags" aria-label={`${repo.name} topics`}>
            {repo.topics.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        )}

        <div className="magnetic-library-card__actions">
          {onReadme && (
            <button
              type="button"
              className={actionClass()}
              onClick={() => onReadme(repo)}
              aria-label={`${t('inspectReadme')}: ${repo.name}`}
            >
              <FileText aria-hidden="true" />
              {t('inspectReadme')}
            </button>
          )}
          <a className={actionClass()} href={githubUrl} target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" />
            {t('archive')}
          </a>
          {homepageUrl && (
            <a className={actionClass()} href={homepageUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" />
              {t('deploy')}
            </a>
          )}
        </div>

        <div className="magnetic-library-card__footer">
          <span>CATALOGUE / {String(index + 1).padStart(2, '0')}</span>
          <span>READ →</span>
        </div>
      </div>
    </article>
  );
}
