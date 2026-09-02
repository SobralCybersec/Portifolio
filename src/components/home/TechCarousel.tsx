'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Link } from '@/i18n/config/routing';
import { InfiniteMarquee } from '@/components/ui/InfiniteMarquee';
import { useTranslations } from 'next-intl';

interface TechItem {
  name: string;
  icon: string;
  description: string;
  link: string;
  category: string;
  features?: string[];
}

const techStack: TechItem[] = [
  // Frontend
  { name: 'TypeScript', icon: '/icons/typescript.png', description: 'Typed superset of JavaScript with compile-time checks, interfaces, and IDE support. It catches type errors before runtime.', link: 'https://www.typescriptlang.org/', category: 'Frontend', features: ['Static Type Checking', 'IntelliSense Support', 'ES6+ Features', 'Interfaces & Generics'] },
  { name: 'Next.js', icon: '/icons/nextjs.png', description: 'React framework with App Router, Server Components, and Turbopack for server-rendered applications and API routes.', link: 'https://nextjs.org/', category: 'Frontend', features: ['Server Components', 'Turbopack', 'Image Optimization', 'API Routes'] },
  { name: 'React', icon: '/icons/react.png', description: 'UI library built around components and hooks. React 19 adds useOptimistic and Server Actions.', link: 'https://react.dev/', category: 'Frontend', features: ['Virtual DOM', 'Hooks API', 'Concurrent Mode', 'Server Actions'] },
  { name: 'Tailwind', icon: '/icons/tailwind.png', description: 'Utility-first CSS framework with a JIT compiler, CSS variables, container queries, and dark-mode utilities.', link: 'https://tailwindcss.com/', category: 'Frontend', features: ['JIT Compiler', 'Dark Mode', 'Responsive Design', 'Custom Plugins'] },
  { name: 'JavaScript', icon: '/icons/javascript.png', description: 'Programming language with ES2024 features such as decorators, the pipeline operator, and pattern matching.', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', category: 'Frontend', features: ['Async/Await', 'Modules', 'Promises', 'Closures'] },
  
  // Backend
  { name: 'Python', icon: '/icons/python.png', description: 'High-level language with async/await, type hints, pattern matching, and libraries for web, data, and AI work.', link: 'https://www.python.org/', category: 'Backend', features: ['Type Hints', 'Async/Await', 'Data Science', 'AI/ML Libraries'] },
  { name: 'Java', icon: '/icons/java.png', description: 'Object-oriented language with virtual threads, pattern matching, and record classes. Java 21 is an LTS release.', link: 'https://www.java.com/', category: 'Backend', features: ['Virtual Threads', 'Pattern Matching', 'JVM', 'Spring Boot'] },
  { name: 'Spring', icon: '/icons/spring.png', description: 'Java framework with Spring Boot 3, native compilation, and reactive programming for web applications and services.', link: 'https://spring.io/', category: 'Backend', features: ['Dependency Injection', 'Spring Boot', 'Reactive Streams', 'Native Images'] },
  { name: 'Flask', icon: '/icons/flask2.png', description: 'Small Python web framework built on Werkzeug and Jinja2. Commonly used for APIs and prototypes.', link: 'https://flask.palletsprojects.com/', category: 'Backend', features: ['Lightweight', 'RESTful APIs', 'Extensions', 'WSGI Compatible'] },
  { name: 'Ruby', icon: '/icons/ruby.png', description: 'Dynamic language with concise syntax and metaprogramming. Ruby includes the YJIT compiler.', link: 'https://www.ruby-lang.org/', category: 'Backend', features: ['Metaprogramming', 'Rails Framework', 'YJIT Compiler', 'RubyGems'] },
  { name: 'PHP', icon: '/icons/php.png', description: 'Server-side language with typed properties, readonly classes, and JIT compilation. It runs many WordPress sites.', link: 'https://www.php.net/', category: 'Backend', features: ['JIT Compiler', 'Typed Properties', 'Composer', 'Laravel Framework'] },
  { name: 'C', icon: '/icons/c.png', description: 'Low-level systems language with direct memory access. C23 adds nullptr, typeof, and other language changes.', link: 'https://en.wikipedia.org/wiki/C_(programming_language)', category: 'Backend', features: ['Memory Control', 'System Programming', 'Embedded Systems', 'Performance'] },
  { name: 'C++', icon: '/icons/cpp.png', description: 'Systems language with C++23 features such as modules, ranges, and coroutines. Used in game engines, browsers, and OS kernels.', link: 'https://isocpp.org/', category: 'Backend', features: ['Templates', 'RAII', 'STL', 'Zero-Cost Abstractions'] },
  { name: 'C#', icon: '/icons/csharp.png', description: 'Object-oriented language with C# 12 features such as primary constructors, collection expressions, and native AOT compilation.', link: 'https://docs.microsoft.com/en-us/dotnet/csharp/', category: 'Backend', features: ['LINQ', 'Async/Await', '.NET 8', 'Native AOT'] },
  { name: 'Rust', icon: '/icons/rust.png', description: 'Memory-safe systems language with zero-cost abstractions and fearless concurrency. No garbage collector, no data races.', link: 'https://www.rust-lang.org/', category: 'Backend', features: ['Memory Safety', 'Zero-Cost Abstractions', 'Cargo', 'Async Runtime'] },
  { name: 'Cuda', icon: '/icons/cuda.png', description: 'Parallel computing platform and API for GPU acceleration. CUDA includes dynamic parallelism, unified memory, and Tensor Cores for AI workloads.', link: 'https://developer.nvidia.com/cuda-toolkit', category: 'Backend', features: ['GPU Acceleration', 'Parallel Computing', 'Tensor Cores', 'Unified Memory'] },
  
  // DevOps & Infrastructure
  { name: 'Docker', icon: '/icons/docker.png', description: 'Container platform with multi-stage builds, BuildKit caching, and multi-platform support for repeatable CI/CD builds.', link: 'https://www.docker.com/', category: 'DevOps', features: ['Multi-Stage Builds', 'BuildKit Cache', 'Docker Compose', 'Swarm Orchestration'] },
  { name: 'Kafka', icon: '/icons/kafka.png', description: 'Distributed event-streaming platform with KRaft mode, exactly-once semantics, and stream processing.', link: 'https://kafka.apache.org/', category: 'DevOps', features: ['Event Streaming', 'KRaft Mode', 'Kafka Streams', 'Exactly-Once Delivery'] },
  { name: 'Redis', icon: '/icons/redis.png', description: 'In-memory data store with caching, streams, JSON, search, time series, and probabilistic data structures.', link: 'https://redis.io/', category: 'DevOps', features: ['In-Memory Cache', 'Pub/Sub', 'Redis Streams', 'JSON Support'] },
  { name: 'Cassandra', icon: '/icons/cassandra.png', description: 'Distributed NoSQL database with replication across datacenters and tunable consistency.', link: 'https://cassandra.apache.org/', category: 'DevOps', features: ['Datacenter Replication', 'Multi-DC Replication', 'Tunable Consistency', 'CQL Query Language'] },
  { name: 'PostgreSQL', icon: '/icons/postgresql.png', description: 'Relational database with ACID transactions, JSON support, full-text search, and logical replication. PostgreSQL 16 adds parallel query improvements.', link: 'https://www.postgresql.org/', category: 'DevOps', features: ['ACID Transactions', 'JSON/JSONB', 'Full-Text Search', 'Logical Replication'] },
  { name: 'AWS', icon: '/icons/aws.png', description: 'Cloud platform with 200+ services including EC2, Lambda, S3, and ECS. OIDC authentication eliminates long-lived credentials for secure deployments.', link: 'https://aws.amazon.com/', category: 'DevOps', features: ['EC2 & Lambda', 'S3 Storage', 'ECS/EKS', 'OIDC Auth'] },
  { name: 'GitHub', icon: '/icons/github.png', description: 'Git hosting platform with code review, project management, and CI/CD for public and private repositories.', link: 'https://github.com/', category: 'DevOps', features: ['Git Hosting', 'Pull Requests', 'Code Review', 'Project Boards'] },
  { name: 'Actions', icon: '/icons/actions.png', description: 'CI/CD service with matrix builds, reusable workflows, and OIDC. It can build, test, and deploy repository code.', link: 'https://github.com/features/actions', category: 'DevOps', features: ['Matrix Builds', 'Reusable Workflows', 'OIDC Integration', 'Self-Hosted Runners'] },
  { name: 'Maven', icon: '/icons/maven.png', description: 'Java build tool with dependency management, multi-module projects, and a plugin-based configuration model.', link: 'https://maven.apache.org/', category: 'DevOps', features: ['Dependency Management', 'Multi-Module Builds', 'Plugin Support', 'Repository Management'] },
  
  // Tools & IDEs
  { name: 'JetBrains', icon: '/icons/jetbrains.png', description: 'IDE suite including IntelliJ IDEA, PyCharm, and WebStorm, with refactoring, debugging, and code completion for many languages.', link: 'https://www.jetbrains.com/', category: 'Tools', features: ['IntelliJ IDEA', 'AI Code Completion', 'Advanced Refactoring', 'Multi-Language Support'] },
  { name: 'Vim', icon: '/icons/vim.png', description: 'Modal text editor with a script engine, plugins, macros, and regular-expression support.', link: 'https://www.vim.org/', category: 'Tools', features: ['Modal Editing', 'Vim Script', 'Plugin Support', 'Regex Support'] },
  { name: 'Bash', icon: '/icons/bash.png', description: 'Unix shell with scripting, job control, command history, associative arrays, and nameref variables.', link: 'https://www.gnu.org/software/bash/', category: 'Tools', features: ['Shell Scripting', 'Job Control', 'Command History', 'Process Substitution'] },
  
  // Security & Pentesting
  { name: 'Kali Linux', icon: '/icons/kalipurple.png', description: 'Penetration-testing distribution with tools for network analysis, web testing, forensics, and wireless security.', link: 'https://www.kali.org/', category: 'Security', features: ['Security Tools', 'NetHunter Mobile', 'ARM Support', 'Live USB Boot'] },
  { name: 'Burp Suite', icon: '/icons/burp.png', description: 'Web security testing platform with a proxy, scanner, and tools for testing OWASP Top 10 and API flaws.', link: 'https://portswigger.net/burp', category: 'Security', features: ['Proxy Intercept', 'Active Scanner', 'Intruder', 'Repeater'] },
  { name: 'Nessus', icon: '/icons/nessus.png', description: 'Vulnerability scanner for missing patches, misconfigurations, and compliance issues across networks and cloud systems.', link: 'https://www.tenable.com/products/nessus', category: 'Security', features: ['Plugin Scanning', 'Compliance Scanning', 'Cloud Security', 'Patch Detection'] },
  { name: 'Shodan', icon: '/icons/shodan.png', description: 'Search engine for internet-connected devices and exposed services, with filters and an API.', link: 'https://www.shodan.io/', category: 'Security', features: ['IoT Discovery', 'Industrial Systems', 'API Access', 'Real-Time Alerts'] },
  { name: 'Gobuster', icon: '/icons/gobuster.png', description: 'Go tool for enumerating directories, files, DNS records, virtual hosts, S3 buckets, and TFTP services.', link: 'https://github.com/OJ/gobuster', category: 'Security', features: ['Directory Brute-Force', 'DNS Enumeration', 'S3 Bucket Discovery', 'VHOST Scanning'] },
  { name: 'Hashcat', icon: '/icons/hashcat.png', description: 'Password recovery tool with GPU acceleration and support for bcrypt, NTLM, WPA2, and custom kernels.', link: 'https://hashcat.net/hashcat/', category: 'Security', features: ['GPU Acceleration', 'Hash Types', 'Rule-Based Attacks', 'Distributed Cracking'] },
  { name: 'BloodHound', icon: '/icons/bloodhound.png', description: 'Graph-based tool for mapping Active Directory privilege paths with SharpHound and AzureHound data.', link: 'https://github.com/BloodHoundAD/BloodHound', category: 'Security', features: ['Graph Theory Analysis', 'Attack Path Mapping', 'SharpHound Ingestor', 'Azure AD Support'] },
  { name: 'Ghidra', icon: '/icons/ghidra.png', description: 'Reverse-engineering framework with a decompiler for x86, ARM, MIPS, and PowerPC, plus collaborative analysis and scripting.', link: 'https://ghidra-sre.org/', category: 'Security', features: ['Multi-Architecture', 'Decompiler', 'Collaborative Analysis', 'Scripting API'] },
  { name: 'xdbg', icon: '/icons/xdbg.png', description: 'Open-source x64/x32 debugger for Windows with plugins, memory breakpoints, conditional tracing, and anti-debugging tools.', link: 'https://x64dbg.com/', category: 'Security', features: ['Memory Breakpoints', 'Conditional Tracing', 'Plugin System', 'Anti-Debug Detection'] },
  
  // AI & APIs
  { name: 'ChatGPT', icon: '/icons/gpt.png', description: 'AI assistant with text and image input, function calling, and structured output.', link: 'https://openai.com/chatgpt', category: 'AI', features: ['Text and Image Input', 'Function Calling', 'Structured Output', 'Fine-Tuning'] },
  { name: 'Claude', icon: '/icons/claude.png', description: 'AI assistant with long-context input, extended thinking, computer use, and MCP support.', link: 'https://www.anthropic.com/claude', category: 'AI', features: ['Long Context', 'Extended Thinking', 'Computer Use', 'MCP Protocol'] },
  { name: 'Gemini', icon: '/icons/gemini.png', description: 'Multimodal model with long-context input for codebase review and visual tasks.', link: 'https://deepmind.google/technologies/gemini/', category: 'AI', features: ['Long Context', 'Video and Audio Input', 'Google Search', 'Workspace Integration'] },
  { name: 'OpenAPI', icon: '/icons/openapi.png', description: 'Specification for describing HTTP APIs. OpenAPI 3.1 aligns with JSON Schema and supports webhooks.', link: 'https://www.openapis.org/', category: 'API', features: ['REST Specification', 'JSON Schema', 'Webhooks', 'Security Definitions'] },
  { name: 'Swagger', icon: '/icons/swagger.png', description: 'Tools for designing, documenting, and testing APIs from OpenAPI specifications.', link: 'https://swagger.io/', category: 'API', features: ['Interactive Docs', 'Code Generation', 'API Editor', 'Mock Server'] },
  
  // Architecture
  { name: 'Microservices', icon: '/icons/microservice.png', description: 'Architecture of independent services connected by APIs or messaging. Each service can deploy and fail separately.', link: 'https://microservices.io/', category: 'Architecture', features: ['Service Independence', 'API Gateway', 'Service Mesh', 'Event-Driven'] },
  { name: 'Assembly', icon: '/icons/assembly.png', description: 'Low-level language with direct hardware control. Used for systems programming and reverse engineering.', link: 'https://en.wikipedia.org/wiki/Assembly_language', category: 'Low-Level', features: ['Direct Hardware Access', 'x86-64 & ARM', 'Reverse Engineering', 'Exploit Development'] },
  { name: 'Omarchy', icon: '/icons/omarchy.png', description: 'Hybrid architecture with a monolithic core and microservice extensions. Supports gradual migration between the two.', link: '#', category: 'Architecture', features: ['Monolithic Core', 'Microservice Extensions', 'Gradual Migration', 'Hybrid Deployment'] },
];

interface TechCarouselProps {
  /** Render only the reusable track when embedded in another section. */
  embedded?: boolean;
  /** Render the compact signal rail without the full card carousel. */
  compact?: boolean;
}

function SignalMarquee({ onSelect, inspectLabel }: { onSelect: (tech: TechItem) => void; inspectLabel: string }) {
  return (
    <InfiniteMarquee
      speed={34}
      className="border-y border-[var(--border)] bg-[var(--bg-card)]/[0.24] py-1"
      itemClassName="mr-2 py-2"
      items={techStack.slice(0, 16).map((tech) => (
        <button
          key={`signal-${tech.name}`}
          type="button"
          onClick={() => onSelect(tech)}
          className="group/signal inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:border-[var(--theme-primary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
          aria-label={`${inspectLabel} ${tech.name}`}
        >
          <Image
            src={tech.icon}
            alt=""
            width={18}
            height={18}
            loading="lazy"
            className="h-[18px] w-[18px] object-contain transition-transform duration-300 group-hover/signal:scale-110"
          />
          {tech.name}
        </button>
      ))}
    />
  );
}

function CarouselTracks({ onSelect, inspectLabel }: { onSelect: (tech: TechItem) => void; inspectLabel: string }) {
  return (
    <div className="carousel-wrapper">
      <div className="carousel-row">
        <div className="carousel-track carousel-track-right">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="carousel-set">
              {techStack.slice(0, Math.ceil(techStack.length / 2)).map((tech, i) => (
                <div key={`${setIndex}-${i}`} className="carousel-item">
                  <div
                    className="tech-card-wrapper group cursor-pointer"
                    onClick={() => onSelect(tech)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') onSelect(tech);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${inspectLabel} ${tech.name}`}
                  >
                    <div className="tech-card-neon">
                      <div className="tech-card-content">
                        <Image
                          src={tech.icon}
                          alt={tech.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          className="tech-icon-img transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="tech-name">{tech.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-row">
        <div className="carousel-track carousel-track-left">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="carousel-set">
              {techStack.slice(Math.ceil(techStack.length / 2)).map((tech, i) => (
                <div key={`${setIndex}-${i}`} className="carousel-item">
                  <div
                    className="tech-card-wrapper group cursor-pointer"
                    onClick={() => onSelect(tech)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') onSelect(tech);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${inspectLabel} ${tech.name}`}
                  >
                    <div className="tech-card-neon">
                      <div className="tech-card-content">
                        <Image
                          src={tech.icon}
                          alt={tech.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          className="tech-icon-img transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="tech-name">{tech.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TechCarousel({ embedded = false, compact = false }: TechCarouselProps) {
  const t = useTranslations('tech');
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);

  return (
    <>
      {embedded ? (
        <CarouselTracks onSelect={setSelectedTech} inspectLabel={t('inspect')} />
      ) : compact ? (
        <section className="overflow-hidden" suppressHydrationWarning>
          <SignalMarquee onSelect={setSelectedTech} inspectLabel={t('inspect')} />
        </section>
      ) : (
        <section className="tech-carousel-section" suppressHydrationWarning>
          <div className="mx-auto mb-7 flex max-w-7xl items-end justify-between gap-4 px-5 md:px-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--theme-primary)]">{t('signalEyebrow')}</p>
              <h2 className="mt-2 font-[var(--font-eternal)] text-2xl uppercase tracking-[0.08em] text-[var(--text-primary)] md:text-3xl">{t('signalTitle')}</h2>
            </div>
            <Link href="/about" className="group inline-flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--theme-primary)]">
              {t('capabilityMap')}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mb-8">
            <SignalMarquee onSelect={setSelectedTech} inspectLabel={t('inspect')} />
          </div>
          <CarouselTracks onSelect={setSelectedTech} inspectLabel={t('inspect')} />
        </section>
      )}

      {/* Modal */}
      {selectedTech && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTech(null)}
        >
          <div 
            className="bg-[var(--bg-card)] border border-[var(--theme-primary)] rounded-lg max-w-2xl w-full p-8 relative animate-clip-intro"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTech(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[var(--theme-primary)]/10 rounded-lg transition-colors"
              aria-label={t('closeDetails')}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-start gap-6 mb-6">
              <div className="relative flex-shrink-0">
                <Image
                  src={selectedTech.icon}
                  alt={selectedTech.name}
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-eternal)' }}>
                  {selectedTech.name}
                </h2>
                <span className="inline-block px-3 py-1 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 rounded-full text-sm text-[var(--theme-primary)] font-medium">
                  {t('category')}: {selectedTech.category}
                </span>
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">
              {selectedTech.description}
            </p>

            {selectedTech.features && selectedTech.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--theme-primary)] mb-3 uppercase tracking-wider">{t('keyFeatures')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTech.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <svg className="w-4 h-4 text-[var(--theme-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selectedTech.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              {t('learnMore')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
