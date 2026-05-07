'use client';

import Navigation from '@/components/Navigation';
import { AnimatedText, GradientText } from '@/components/AnimatedText';
import { useClickSound } from '@/hooks/useClickSound';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import HexagonGrid from '@/components/HexagonGrid';
import ParticleBackground from '@/components/ParticleBackground';
import SoloLevelingProjectCard from '@/components/SoloLevelingProjectCard';
import FilterDropdown from '@/components/FilterDropdown';
import ScrollEffect from '@/components/ScrollEffect';

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
  isVideo?: boolean;
  techStack?: string[];
}

export default function ProjectsPage() {
  useClickSound();
  const { theme } = useTheme();
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
    { id: 'bash', label: 'Bash', icon: '/icons/bash.png' },
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
      project.language?.toLowerCase() === selectedFilter;
    
    const matchesTech = selectedTech === 'all' ||
      project.topics?.some(topic => topic.toLowerCase().includes(selectedTech)) ||
      project.techStack?.some(tech => tech.toLowerCase().includes(selectedTech));
    
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

  if (loading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-white'}`}>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto text-center">
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('loading')}</p>
              <div className="mt-4 w-64 h-1 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full animate-pulse ${theme === 'dark' ? 'bg-purple-500' : 'bg-blue-500'}`} style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" />
      {theme === 'dark' && (
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
      <main className="min-h-screen pt-20 relative">
        <ScrollEffect />
        <ParticleBackground />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            <AnimatedText className="mb-4">
              <p className="text-sm uppercase tracking-wider text-[var(--text-muted)] font-semibold" style={{ fontFamily: 'var(--font-eternal)' }}>{t('work')}</p>
            </AnimatedText>
            
            <AnimatedText delay={0.1} className="mb-12">
              <h1 className="text-5xl font-bold" style={{ fontFamily: 'var(--font-eternal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <GradientText>{t('title')}</GradientText>
              </h1>
            </AnimatedText>

            {/* Filters and Search */}
            <AnimatedText delay={0.2} className="mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--theme-primary)] transition-colors w-full md:flex-1"
                  />
                </div>
              </div>
            </AnimatedText>

            {/* Results Count */}
            <AnimatedText delay={0.25} className="mb-6">
              <p className="text-sm text-[var(--text-muted)]">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </AnimatedText>

            {/* Project Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <SoloLevelingProjectCard key={project.id} repo={project} index={idx} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-[var(--text-muted)] text-lg">No projects found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
