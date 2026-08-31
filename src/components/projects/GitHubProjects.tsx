'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Star, GitFork, RefreshCw } from 'lucide-react';
import { AnimatedText } from '@/components/texts/AnimatedText';
import CityMap from './CityMap';
import Image from 'next/image';
import { safeGithubUrl, safeExternalUrl } from '@/lib/security/url';

function ImageSlideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((img, idx) => (
        <Image
          key={img}
          src={img}
          alt={`Preview ${idx + 1}`}
          fill
          className={`object-contain transition-opacity duration-500 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          unoptimized
        />
      ))}
    </div>
  );
}

const GITHUB_USERNAME = 'SobralCybersec';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
};

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  owner: {
    login: string;
  };
  previewImage?: string;
  isVideo?: boolean;
  techStack?: string[];
}

export default function GitHubProjects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github/repos');

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    let cancelled = false;

    async function loadRepos() {
      try {
        const response = await fetch('/api/github/repos');

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch repositories');
        }

        const data = await response.json();

        if (!cancelled) {
          setRepos(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRepos();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="projects-section">
        <div className="projects-inner">
          <div className="section-header-block">
            <h2 className="section-title">My Projects</h2>
          </div>
          <div className="mb-8">
            <CityMap repos={[]} />
          </div>
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="projects-section">
        <div className="projects-inner">
          <div className="section-header-block">
            <h2 className="section-title">My Projects</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-400">Error: {error}</p>
            <button 
              onClick={fetchRepos}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-section">
      <div className="projects-inner">
        <div className="section-header-block">
          <AnimatedText delay={0.1}>
            <div className="flex items-center justify-between">
              <div className="animate-clip-in">
                <h2 className="section-title">My Projects</h2>
              </div>
              <button
                onClick={fetchRepos}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="Refresh projects"
                suppressHydrationWarning
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </AnimatedText>
        </div>

        <div className="mb-8">
          <CityMap repos={repos} />
        </div>

        <div className="projects-grid stagger-clip-in">
          {repos.slice(0, 6).map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="project-card"
              suppressHydrationWarning
            >
              {repo.previewImage && (
                <div className="relative w-full mb-4 rounded-lg overflow-hidden bg-zinc-900" style={{ aspectRatio: '16/9' }}>
                  {repo.isVideo ? (
                    <video
                      src={repo.previewImage}
                      className="w-full h-full object-contain"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      preload="metadata"
                    />
                  ) : (() => {
                    try {
                      const images = JSON.parse(repo.previewImage);
                      if (Array.isArray(images) && images.length > 1) {
                        return <ImageSlideshow images={images} />;
                      }
                    } catch {}
                    return (
                      <Image
                        src={repo.previewImage}
                        alt={`${repo.name} preview`}
                        fill
                        className="object-contain"
                        loading="lazy"
                        unoptimized
                        onError={(e) => {
                          const safeUrl = safeGithubUrl(repo.html_url);
                          if (safeUrl) {
                            const path = safeUrl.replace('https://github.com/', '');
                            // Fix: encode each segment separately so the separating '/' is preserved
                            const encodedPath = path.split('/').map(encodeURIComponent).join('/');
                            (e.target as HTMLImageElement).src =
                              `https://opengraph.githubassets.com/1/${encodedPath}`;
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              )}

              <h3 className="project-title">{repo.name}</h3>
              <p className="project-desc">
                {repo.description || 'No description available'}
              </p>

              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#6366f1' }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  {repo.forks_count}
                </span>
              </div>

              {repo.techStack && repo.techStack.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {repo.techStack.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {repo.topics.length > 0 && (
                <div className="project-tags mb-4">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="project-tag">{topic}</span>
                  ))}
                </div>
              )}

              <div className="project-links mt-auto">
                <a 
                  href={safeGithubUrl(repo.html_url) ?? '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <Github className="w-4 h-4" />
                  Code
                </a>
                {safeExternalUrl(repo.homepage) && (
                  <a 
                    href={safeExternalUrl(repo.homepage)!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Demo
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            View All on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
