'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { ExternalLink, FileText, LoaderCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { safeGithubUrl } from '@/lib/security/url';

interface ProjectReadmeModalProps {
  owner: string;
  repoName: string;
  githubUrl: string;
  onClose: () => void;
}

export default function ProjectReadmeModal({
  owner,
  repoName,
  githubUrl,
  onClose,
}: ProjectReadmeModalProps) {
  const t = useTranslations('projects');
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const readmeBaseUrl = `https://github.com/${owner}/${repoName}/blob/HEAD/`;
  const rawReadmeBaseUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/`;
  const resolveReadmeUrl = (value: string | Blob | undefined, raw = false) => {
    if (typeof value !== 'string' || value.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('/')) {
      return typeof value === 'string' ? value : undefined;
    }
    try {
      return new URL(value, raw ? rawReadmeBaseUrl : readmeBaseUrl).toString();
    } catch {
      return value;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = `/api/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/readme`;

    async function loadReadme() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'README request failed');
        setReadme(data.readme);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReadme();
    return () => controller.abort();
  }, [owner, repoName]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className="readme-modal flex h-[min(88vh,850px)] w-full max-w-5xl flex-col overflow-hidden border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="readme-modal-title"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <header className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-[var(--theme-primary)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="readme-kicker">{t('readme')}</p>
              <h2 id="readme-modal-title" className="truncate text-lg font-semibold text-[var(--text-primary)]">
                {repoName}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {safeGithubUrl(githubUrl) && (
              <a
                href={safeGithubUrl(githubUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="readme-icon-link hidden sm:inline-flex"
                aria-label={t('openOnGithub')}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>{t('openOnGithub')}</span>
              </a>
            )}
            <button type="button" onClick={onClose} className="readme-close" aria-label={t('closeReadme')}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="readme-scroll-area">
          {loading && (
            <div className="flex h-full items-center justify-center gap-3 text-[var(--text-muted)]">
              <LoaderCircle className="h-5 w-5 animate-spin text-[var(--theme-primary)]" aria-hidden="true" />
              <span>{t('readmeLoading')}</span>
            </div>
          )}
          {!loading && (error || !readme) && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-[var(--text-muted)]">
              <FileText className="h-8 w-8 text-[var(--theme-primary)]" aria-hidden="true" />
              <p>{error ? t('readmeError') : t('readmeEmpty')}</p>
            </div>
          )}
          {!loading && !error && readme && (
            <article className="readme-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  a: ({ node: _node, href, children, ...props }) => (
                    <a {...props} href={resolveReadmeUrl(href)} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  img: ({ node: _node, alt, src, ...props }) => (
                    // README images come from arbitrary GitHub-hosted URLs.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img {...props} src={resolveReadmeUrl(src, true)} alt={alt ?? ''} loading="lazy" />
                  ),
                }}
              >
                {readme}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
