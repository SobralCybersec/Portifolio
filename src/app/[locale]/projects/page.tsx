'use client';

import Navigation from '@/components/Navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { useEffect, useState } from 'react';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import { useTranslations } from 'next-intl';
import SoloLevelingProjectCard from '@/components/SoloLevelingProjectCard';
import FilterDropdown from '@/components/FilterDropdown';
import ScrollEffect from '@/components/ScrollEffect';
import ParticleBackground from '@/components/ParticleBackground';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  previewImage?: string;
  allLanguages?: string[];
  isVideo?: boolean;
  techStack?: string[];
}

export default function ProjectsPage() {
  useClickSound();
  const t = useTranslations('projects');
  const [projects, setProjects] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All Projects' },
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
    { id: 'all', label: 'All Technologies' },
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

  const filteredProjects = projects.filter(project => {
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
  });

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

  return (
    <>

      <Navigation />

      {/* CCG page header */}
      <div className="page-header">
        <div className="speed-lines" />
        <div className="page-header-inner">
          <p className="page-eyebrow">// CCG Case Files</p>
          <h1 className="page-title">
            {t('title')}
            <span className="glitch-layer" aria-hidden="true">{t('title')}</span>
          </h1>
        </div>
      </div>

      <main style={{ position: 'relative', minHeight: '100vh' }}>
        <ScrollEffect />
        <ParticleBackground />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2.5rem', position: 'relative', zIndex: 10 }}>

          {/* Filters row — CCG styled wrapper, original components inside */}
          <div className="ccg-filter-row">
            <span className="page-eyebrow" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>// Filter:</span>
            <FilterDropdown
              options={filters}
              selected={selectedFilter}
              onChange={setSelectedFilter}
              placeholder="Language"
            />
            <FilterDropdown
              options={techFilters}
              selected={selectedTech}
              onChange={setSelectedTech}
              placeholder="Technology"
            />
            <input
              type="text"
              placeholder="Search case files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ccg-search-input"
            />
          </div>

         {/* Results Count */}
          <AnimatedText delay={0.25} className="ccg-count">
            <p className="text-sm text-[var(--text-muted)]">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </AnimatedText>

          {/* Cards grid — original SoloLevelingProjectCard kept */}
          {loading ? (
            <div className="ccg-state-msg">{t('loading')}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="ccg-state-msg">// No case files found for this filter.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => (
                <SoloLevelingProjectCard key={project.id} repo={project} index={idx} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
