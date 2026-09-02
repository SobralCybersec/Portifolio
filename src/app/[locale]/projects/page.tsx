'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/layout/Navigation';
import RouteView from '@/components/layout/RouteView';
import { GradientText } from '@/components/texts/AnimatedText';
import { useClickSound } from '@/hooks/audio/useClickSound';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FilterDropdown from '@/components/ui/FilterDropdown';
import ScrollEffect from '@/components/effects/ScrollEffect';
import ScrollProgress from '@/components/effects/ScrollProgress';
import ScrollReveal from '@/components/effects/ScrollReveal';
import MagneticLibraryGrid from '@/components/projects/MagneticLibraryGrid';

const HexagonGrid = dynamic(() => import('@/components/effects/HexagonGrid'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/effects/ParticleBackground'), { ssr: false });
const ProjectReadmeModal = dynamic(() => import('@/components/projects/ProjectReadmeModal'), { ssr: false });
const SoloLevelingProjectCard = dynamic(() => import('@/components/projects/SoloLevelingProjectCard'));

interface Repo {
  id: number;
  name: string;
  description: string | null;
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
  owner?: {
    login: string;
  };
}

function LazyProjectCard({
  project,
  index,
  onReadme,
  featured,
  variant,
}: {
  project: Repo;
  index: number;
  onReadme: (repo: Repo) => void;
  featured: boolean;
  variant?: 'default' | 'library';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(index < 2);

  useEffect(() => {
    if (visible) return;

    const element = cardRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={cardRef} className="min-h-[430px]">
      {visible ? (
        <SoloLevelingProjectCard
          repo={project}
          index={index}
          onReadme={onReadme}
          featured={featured}
          variant={variant}
        />
      ) : (
        <div aria-hidden="true" className="h-[430px] border border-[var(--border)] bg-[var(--bg-card)]/35" />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  useClickSound();
  const { theme } = useTheme();
  const t = useTranslations('projects');
  const shouldReduceMotion = useReducedMotion();
  const [effectsReady, setEffectsReady] = useState(false);
  const [projects, setProjects] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Repo | null>(null);

  const filters = [
    { id: 'all', label: t('filters.allProjects') },
    { id: 'java', label: 'Java', icon: '/icons/java.png' },
    { id: 'typescript', label: 'TypeScript', icon: '/icons/typescript.png' },
    { id: 'javascript', label: 'JavaScript', icon: '/icons/javascript.png' },
    { id: 'python', label: 'Python', icon: '/icons/python.png' },
    { id: 'c', label: 'C', icon: '/icons/c.png' },
    { id: 'c++', label: 'C++', icon: '/icons/cpp.png' },
    { id: 'c#', label: 'C#', icon: '/icons/csharp.png' },
    { id: 'php', label: 'PHP', icon: '/icons/php.png' },
    { id: 'ruby', label: 'Ruby', icon: '/icons/ruby.png' },
    { id: 'rust', label: 'Rust', icon: '/icons/rust.png' },
    { id: 'batchfile', label: 'Bash', icon: '/icons/bash.png' },
    { id: 'assembly', label: 'Assembly', icon: '/icons/assembly.png' },
  ];

  const techFilters = [
    { id: 'all', label: t('filters.allTechnologies') },
    { id: 'react', label: 'React', icon: '/icons/react.png' },
    { id: 'nextjs', label: 'Next.js', icon: '/icons/nextjs.png' },
    { id: 'spring', label: 'Spring', icon: '/icons/spring.png' },
    { id: 'docker', label: 'Docker', icon: '/icons/docker.png' },
    { id: 'aws', label: 'AWS', icon: '/icons/aws.png' },
    { id: 'postgresql', label: 'PostgreSQL', icon: '/icons/postgresql.png' },
    { id: 'redis', label: 'Redis', icon: '/icons/redis.png' },
    { id: 'kafka', label: 'Kafka', icon: '/icons/kafka.png' },
    { id: 'cassandra', label: 'Cassandra', icon: '/icons/cassandra.png' },
    { id: 'microservice', label: 'Microservices', icon: '/icons/microservice.png' },
    { id: 'flask', label: 'Flask', icon: '/icons/flask2.png' },
    { id: 'tailwind', label: 'Tailwind', icon: '/icons/tailwind.png' },
    { id: 'cuda', label: 'Cuda', icon: '/icons/cuda.png' },
  ];

  const filteredProjects = useMemo(() => projects.filter(project => {
    const matchesLanguage = selectedFilter === 'all' ||
      project.allLanguages?.includes(selectedFilter.toLowerCase()) ||
      project.language?.toLowerCase() === selectedFilter.toLowerCase();

    const matchesTech = selectedTech === 'all' ||
      project.topics?.some(topic =>
        topic.toLowerCase().split(/[-_\s]/).includes(selectedTech.toLowerCase())
      ) ||
      project.techStack?.some(tech =>
        tech.toLowerCase().split(/[-_\s]/).includes(selectedTech.toLowerCase())
      );

    const matchesSearch = searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLanguage && matchesTech && matchesSearch;
  }), [projects, searchQuery, selectedFilter, selectedTech]);

  const projectMetrics = useMemo(() => {
    const languages = new Set<string>();

    projects.forEach(project => {
      (project.allLanguages?.length ? project.allLanguages : project.language ? [project.language] : [])
        .forEach(language => languages.add(language.toLowerCase()));
    });

    return {
      languages: languages.size,
      stars: projects.reduce((total, project) => total + project.stargazers_count, 0),
      previews: projects.filter(project => project.previewImage && !project.previewImage.startsWith('/icons/')).length,
    };
  }, [projects]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/github/repos');
        const data = await res.json();
        setProjects(data);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    const revealEffects = () => {
      setEffectsReady(true);
      window.removeEventListener('scroll', revealEffects);
      window.removeEventListener('pointerdown', revealEffects);
    };

    window.addEventListener('scroll', revealEffects, { passive: true, once: true });
    window.addEventListener('pointerdown', revealEffects, { passive: true, once: true });
    return () => {
      window.removeEventListener('scroll', revealEffects);
      window.removeEventListener('pointerdown', revealEffects);
    };
  }, []);

  return (
    <>
      <Navigation />
      {shouldReduceMotion !== true && <ScrollProgress />}
      <div className="page-grid-overlay" />
      {effectsReady && theme === 'dark' && (
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
      <RouteView>
      <main className="relative min-h-[100dvh] pt-20">
        {effectsReady && <ScrollEffect />}
        {effectsReady && <ParticleBackground />}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden border-b border-[var(--border)] py-14 md:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--theme-primary)]/10 blur-3xl" />
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--theme-primary)]">
                    <span aria-hidden="true" className="h-px w-8 bg-[var(--theme-primary)]" />
                    <span className="text-[var(--text-muted)]/60">/ {String(projects.length).padStart(2, '0')}</span>
                  </div>
                </div>

                <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-[var(--text-primary)] sm:text-7xl md:text-8xl">
                  <GradientText>{t('title')}</GradientText>
                </h1>

                <p className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
                  {t('description')}
                </p>
              </div>

              <aside
                className="relative overflow-hidden border border-[var(--theme-primary)]/30 bg-[var(--bg-card)]/65 p-5 backdrop-blur-sm sm:p-6"
                aria-label={t('title')}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent" />
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                </div>
                <div className="py-7 text-center">
                  <div className="text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{t('projectUnit')}</p>
                    <p className="mt-2 text-6xl font-black tracking-[-0.08em] text-[var(--text-primary)]">{String(projects.length).padStart(2, '0')}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">LANG</dt>
                    <dd className="mt-1 text-xl font-bold text-[var(--text-primary)]">{projectMetrics.languages || '--'}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">STARS</dt>
                    <dd className="mt-1 text-xl font-bold text-[var(--text-primary)]">{projectMetrics.stars}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--text-muted)]">MEDIA</dt>
                    <dd className="mt-1 text-xl font-bold text-[var(--text-primary)]">{projectMetrics.previews}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </section>

          <section id="project-archive" className="scroll-mt-24 py-12 md:py-20">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--theme-primary)]">PROJECT ARCHIVE</p>
                <h2 className="text-3xl font-black uppercase tracking-[-0.04em] text-[var(--text-primary)] md:text-5xl">{t('title')}</h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                {t('showing')} <span className="text-[var(--text-primary)]">{filteredProjects.length}</span> {t('of')} {projects.length}
              </p>
            </div>

            <div className="sticky top-16 z-30 mb-10 border border-[var(--border)] bg-[var(--bg-dark)]/90 shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-3 md:flex-row md:items-center md:justify-between md:px-4">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-[var(--theme-primary)]" aria-hidden="true" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">FILTERS</span>
                  {(selectedFilter !== 'all' || selectedTech !== 'all' || searchQuery) && (
                    <span className="border border-[var(--theme-primary)]/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--theme-primary)]">ACTIVE</span>
                  )}
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                  <label htmlFor="project-search" className="sr-only">{t('filters.search')}</label>
                  <input
                    id="project-search"
                    type="search"
                    placeholder={t('filters.search')}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full border border-[var(--border)] bg-[var(--bg-card)]/60 py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--theme-primary)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center md:px-4">
                <FilterDropdown
                  options={filters}
                  selected={selectedFilter}
                  onChange={setSelectedFilter}
                  placeholder={t('filters.language')}
                />
                <FilterDropdown
                  options={techFilters}
                  selected={selectedTech}
                  onChange={setSelectedTech}
                  placeholder={t('filters.technology')}
                />
              </div>
            </div>

            {loading ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map(index => (
                    <div key={index} className={`h-[430px] border border-[var(--border)] bg-[var(--bg-card)]/50 ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
                  <span>{t('loading')}</span>
                  <span className="h-1 w-20 overflow-hidden bg-[var(--border)]">
                    <span className={`block h-full w-3/5 bg-[var(--theme-primary)] ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
                  </span>
                </div>
              </>
            ) : filteredProjects.length > 0 ? (
              <MagneticLibraryGrid>
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: shouldReduceMotion ? 0 : Math.min(idx * 0.04, 0.2) }}
                    className="magnetic-library-grid__item"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '480px' }}
                  >
                    <LazyProjectCard
                      project={project}
                      index={idx}
                      onReadme={setSelectedProject}
                      featured={idx === 0}
                      variant="library"
                    />
                  </motion.div>
                ))}
              </MagneticLibraryGrid>
            ) : (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-dashed border-[var(--border)] px-6 py-20 text-center"
              >
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{t('noResults')}</p>
              </motion.div>
            )}
          </section>
        </div>
      </main>
      </RouteView>
      {selectedProject && (
        <ProjectReadmeModal
          owner={selectedProject.owner?.login ?? 'SobralCybersec'}
          repoName={selectedProject.name}
          githubUrl={selectedProject.html_url}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
