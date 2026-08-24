'use client';

import { motion } from 'framer-motion';
import { Code2, Database, Layers, Cpu, Zap } from 'lucide-react';
import { AnimatedText } from './AnimatedText';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface Repo {
  language: string | null;
  topics: string[];
  techStack?: string[];
  allLanguages?: string[];
}

interface SkillsProps {
  animateSection?: string;
  repos?: Repo[];
}

// ─── Mirrors the EXACT ids from ProjectsPage filters ──────────────────────────

const LANGUAGE_TO_DISPLAY: Record<string, string> = {
  java: 'Java',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  python: 'Python',
  c: 'C',
  'c++': 'C++',
  'c#': 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  batchfile: 'Bash',
  assembly: 'Assembly',
  go: 'Go',
  kotlin: 'Kotlin',
  swift: 'Swift',
  shell: 'Shell',
  html: 'HTML',
  css: 'CSS',
};

const TECH_TO_DISPLAY: Record<string, string> = {
  react: 'React',
  nextjs: 'Next.js',
  spring: 'Spring',
  docker: 'Docker',
  aws: 'AWS',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
  kafka: 'Kafka',
  cassandra: 'Cassandra',
  microservice: 'Microservices',
  flask: 'Flask',
  tailwind: 'Tailwind CSS',
  cuda: 'CUDA',
};

// ─── Which bucket each item belongs to ───────────────────────────────────────

const LANG_BUCKET: Record<string, 'frontend' | 'backend' | 'systems'> = {
  typescript: 'frontend', javascript: 'frontend', html: 'frontend', css: 'frontend',
  java: 'backend', python: 'backend', php: 'backend', ruby: 'backend', go: 'backend', kotlin: 'backend',
  rust: 'systems', c: 'systems', 'c++': 'systems', 'c#': 'systems', assembly: 'systems',
  batchfile: 'systems', shell: 'systems', swift: 'systems',
};

const TECH_BUCKET: Record<string, 'frontend' | 'backend' | 'devops'> = {
  react: 'frontend', nextjs: 'frontend', tailwind: 'frontend',
  spring: 'backend', flask: 'backend', postgresql: 'backend',
  redis: 'backend', kafka: 'backend', cassandra: 'backend', cuda: 'backend',
  docker: 'devops', aws: 'devops', microservice: 'devops',
};

// ─── Defaults (shown even with no repos) ─────────────────────────────────────

const DEFAULTS: Record<string, string[]> = {
  frontend: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS'],
  backend:  ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
  systems:  ['Rust', 'C++', 'C', 'Assembly'],
  devops:   ['Docker', 'AWS', 'Kafka', 'Microservices'],
};

function deriveSkills(repos: Repo[]) {
  const buckets: Record<string, Set<string>> = {
    frontend: new Set(DEFAULTS.frontend),
    backend:  new Set(DEFAULTS.backend),
    systems:  new Set(DEFAULTS.systems),
    devops:   new Set(DEFAULTS.devops),
  };

  for (const repo of repos) {
    // allLanguages + primary language
    const langs = [
      ...(repo.allLanguages ?? []),
      repo.language?.toLowerCase() ?? '',
    ].filter(Boolean);

    for (const raw of langs) {
      const key = raw.toLowerCase();
      const bucket = LANG_BUCKET[key];
      const display = LANGUAGE_TO_DISPLAY[key];
      if (bucket && display) buckets[bucket].add(display);
    }

    // topics (GitHub slugs, e.g. "next-js", "spring-boot")
    for (const topic of repo.topics ?? []) {
      // normalise: strip dashes/underscores and match
      const key = topic.toLowerCase().replace(/[-_]/g, '');
      // try direct match first, then substring match
      const techKey = Object.keys(TECH_BUCKET).find(
        k => k === key || key.includes(k) || k.includes(key)
      );
      if (techKey) {
        const bucket = TECH_BUCKET[techKey];
        const display = TECH_TO_DISPLAY[techKey];
        if (display) buckets[bucket].add(display);
      }

      const langKey = Object.keys(LANG_BUCKET).find(
        k => k === key || key.includes(k)
      );
      if (langKey) {
        const bucket = LANG_BUCKET[langKey];
        const display = LANGUAGE_TO_DISPLAY[langKey];
        if (display) buckets[bucket].add(display);
      }
    }

    // explicit techStack array (already normalised by your API)
    for (const tech of repo.techStack ?? []) {
      const key = tech.toLowerCase().replace(/[-_\s]/g, '');
      const techKey = Object.keys(TECH_BUCKET).find(
        k => k === key || key.includes(k) || k.includes(key)
      );
      if (techKey) {
        const bucket = TECH_BUCKET[techKey];
        const display = TECH_TO_DISPLAY[techKey];
        if (display) buckets[bucket].add(display);
      }
    }
  }

  // Cap each bucket to keep cards compact
  return Object.fromEntries(
    Object.entries(buckets).map(([k, v]) => [k, [...v].slice(0, 10)])
  );
}

export default function Skills({ animateSection, repos = [] }: SkillsProps) {
  const t = useTranslations('skills');

  const derived = useMemo(() => deriveSkills(repos), [repos]);

  const skills = [
    { category: t('frontend.title'),     icon: Code2,    key: 'frontend' },
    { category: t('backend.title'),      icon: Database, key: 'backend'  },
    { category: t('architecture.title'), icon: Cpu,   key: 'systems'  },
    { category: t('devops.title'),       icon: Zap,      key: 'devops'   },
  ];

  return (
    <section className="skills-section">
      <div className="skills-inner">
        <div className="skills-header">
          <AnimatedText delay={0.1}>
            <div className="animate-clip-in">
              <h2 className="section-title">{t('title')}</h2>
            </div>
          </AnimatedText>
        </div>

        <div className="skills-grid">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            const items = derived[skill.key];
            return (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="skill-card"
                suppressHydrationWarning
              >
                <div className="skill-card-header">
                  <div className="skill-icon">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="skill-category">{skill.category}</h3>
                </div>
                <ul className="skill-list">
                  {items.map((item) => (
                    <li key={item} className="skill-item">
                      <span className="skill-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
