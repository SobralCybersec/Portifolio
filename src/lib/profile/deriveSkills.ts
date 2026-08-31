export interface Repo {
  language: string | null;
  topics: string[];
  techStack?: string[];
  allLanguages?: string[];
}

export type SkillBucket = 'frontend' | 'backend' | 'systems' | 'devops';

const LANGUAGE_TO_DISPLAY: Record<string, string> = {
  java: 'Java', typescript: 'TypeScript', javascript: 'JavaScript', python: 'Python',
  c: 'C', 'c++': 'C++', 'c#': 'C#', php: 'PHP', ruby: 'Ruby', rust: 'Rust',
  batchfile: 'Bash', assembly: 'Assembly', go: 'Go', kotlin: 'Kotlin', swift: 'Swift',
  shell: 'Shell', html: 'HTML', css: 'CSS',
};

const TECH_TO_DISPLAY: Record<string, string> = {
  react: 'React', nextjs: 'Next.js', spring: 'Spring', docker: 'Docker', aws: 'AWS',
  postgresql: 'PostgreSQL', redis: 'Redis', kafka: 'Kafka', cassandra: 'Cassandra',
  microservice: 'Microservices', flask: 'Flask', tailwind: 'Tailwind CSS', cuda: 'CUDA',
};

const LANG_BUCKET: Record<string, Exclude<SkillBucket, 'devops'>> = {
  typescript: 'frontend', javascript: 'frontend', html: 'frontend', css: 'frontend',
  java: 'backend', python: 'backend', php: 'backend', ruby: 'backend', go: 'backend', kotlin: 'backend',
  rust: 'systems', c: 'systems', 'c++': 'systems', 'c#': 'systems', assembly: 'systems',
  batchfile: 'systems', shell: 'systems', swift: 'systems',
};

const TECH_BUCKET: Record<string, SkillBucket> = {
  react: 'frontend', nextjs: 'frontend', tailwind: 'frontend', spring: 'backend', flask: 'backend',
  postgresql: 'backend', redis: 'backend', kafka: 'backend', cassandra: 'backend', cuda: 'backend',
  docker: 'devops', aws: 'devops', microservice: 'devops',
};

const DEFAULTS: Record<SkillBucket, string[]> = {
  frontend: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
  systems: ['Rust', 'C++', 'C', 'Assembly'],
  devops: ['Docker', 'AWS', 'Kafka', 'Microservices'],
};

const normalize = (value: string) => value.toLowerCase().replace(/[-_\s]/g, '');

export function deriveSkills(repos: Repo[]): Record<SkillBucket, string[]> {
  const buckets: Record<SkillBucket, Set<string>> = {
    frontend: new Set(DEFAULTS.frontend),
    backend: new Set(DEFAULTS.backend),
    systems: new Set(DEFAULTS.systems),
    devops: new Set(DEFAULTS.devops),
  };

  const addMappedValue = (raw: string, map: Record<string, string>, bucketMap: Record<string, SkillBucket>) => {
    const key = normalize(raw);
    const mappedKey = Object.keys(bucketMap).find((candidate) => (
      candidate === key || key.includes(candidate) || candidate.includes(key)
    ));
    if (!mappedKey) return;
    const bucket = bucketMap[mappedKey];
    const display = map[mappedKey];
    if (display) buckets[bucket].add(display);
  };

  for (const repo of repos) {
    for (const language of [...(repo.allLanguages ?? []), repo.language ?? '']) {
      const key = language.toLowerCase();
      const bucket = LANG_BUCKET[key];
      const display = LANGUAGE_TO_DISPLAY[key];
      if (bucket && display) buckets[bucket].add(display);
    }

    for (const topic of repo.topics ?? []) {
      addMappedValue(topic, TECH_TO_DISPLAY, TECH_BUCKET);
      addMappedValue(topic, LANGUAGE_TO_DISPLAY, LANG_BUCKET);
    }

    for (const tech of repo.techStack ?? []) {
      addMappedValue(tech, TECH_TO_DISPLAY, TECH_BUCKET);
    }
  }

  return {
    frontend: [...buckets.frontend].slice(0, 10),
    backend: [...buckets.backend].slice(0, 10),
    systems: [...buckets.systems].slice(0, 10),
    devops: [...buckets.devops].slice(0, 10),
  };
}
