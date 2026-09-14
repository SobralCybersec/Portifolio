export function getLanguageImage(language: string | null): string {
  if (!language) return '/icons/github.png';
  const normalized = language.trim();
  return TECH_ICONS[normalized.toLowerCase()] ?? '/icons/github.png';
}

export const TECH_ICONS: Record<string, string> = {
  typescript: '/icons/typescript.png', javascript: '/icons/javascript.png', python: '/icons/python.png',
  java: '/icons/java.png', c: '/icons/c.png', 'c++': '/icons/cpp.png', cpp: '/icons/cpp.png',
  'c#': '/icons/csharp.png', csharp: '/icons/csharp.png', go: '/icons/github.png', rust: '/icons/rust.png',
  ruby: '/icons/ruby.png', php: '/icons/php.png', assembly: '/icons/assembly.png', bash: '/icons/bash.png',
  shell: '/icons/bash.png', batchfile: '/icons/bash.png', react: '/icons/react.png', next: '/icons/nextjs.png', nextjs: '/icons/nextjs.png', 'next-js': '/icons/nextjs.png', 'next.js': '/icons/nextjs.png',
  tailwind: '/icons/tailwind.png', tailwindcss: '/icons/tailwind.png', flask: '/icons/flask2.png',
  spring: '/icons/spring.png', springboot: '/icons/spring.png', 'spring-boot': '/icons/spring.png', postgresql: '/icons/postgresql.png',
  postgres: '/icons/postgresql.png', redis: '/icons/redis.png', cassandra: '/icons/cassandra.png', kafka: '/icons/kafka.png',
  docker: '/icons/docker.png', aws: '/icons/aws.png', github: '/icons/github.png', 'github-actions': '/icons/actions.png',
  actions: '/icons/actions.png', maven: '/icons/maven.png', jetbrains: '/icons/jetbrains.png', vim: '/icons/vim.png',
  burp: '/icons/burp.png', 'burp-suite': '/icons/burp.png', bloodhound: '/icons/bloodhound.png', ghidra: '/icons/ghidra.png',
  gobuster: '/icons/gobuster.png', hashcat: '/icons/hashcat.png', nessus: '/icons/nessus.png', shodan: '/icons/shodan.png',
  kali: '/icons/kalipurple.png', 'kali-linux': '/icons/kalipurple.png', cybersecurity: '/icons/kalipurple.png',
  security: '/icons/kalipurple.png', xdbg: '/icons/xdbg.png', gpt: '/icons/gpt.png', openai: '/icons/gpt.png',
  claude: '/icons/claude.png', gemini: '/icons/gemini.png', chatgpt: '/icons/gpt.png', cuda: '/icons/cuda.png',
  microservice: '/icons/microservice.png', microservices: '/icons/microservice.png', openapi: '/icons/openapi.png',
  swagger: '/icons/swagger.png', omarchy: '/icons/omarchy.png',
};

export function getTechnologyIcon(value: string): string | undefined {
  return TECH_ICONS[value.trim().toLowerCase()];
}

export type StackFilterOption = {
  id: string;
  label: string;
  icon?: string;
  aliases?: string[];
};

export const LANGUAGE_FILTERS: StackFilterOption[] = [
  { id: 'java', label: 'Java' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'c', label: 'C' },
  { id: 'c++', label: 'C++' },
  { id: 'c#', label: 'C#' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'rust', label: 'Rust' },
  { id: 'batchfile', label: 'Bash', aliases: ['bash', 'shell'] },
  { id: 'assembly', label: 'Assembly' },
].map((option) => ({ ...option, icon: getTechnologyIcon(option.id) }));

export const TECH_STACK_FILTERS: StackFilterOption[] = [
  { id: 'react', label: 'React' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'spring', label: 'Spring' },
  { id: 'docker', label: 'Docker' },
  { id: 'aws', label: 'AWS' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'redis', label: 'Redis' },
  { id: 'kafka', label: 'Kafka' },
  { id: 'cassandra', label: 'Cassandra' },
  { id: 'microservice', label: 'Microservices', aliases: ['microservices'] },
  { id: 'flask', label: 'Flask' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'cuda', label: 'Cuda' },
].map((option) => ({ ...option, icon: getTechnologyIcon(option.id) }));

export const STACK_FILTERS: StackFilterOption[] = [
  ...LANGUAGE_FILTERS,
  ...TECH_STACK_FILTERS,
];
