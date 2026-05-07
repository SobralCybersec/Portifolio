'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';

interface TechItem {
  name: string;
  icon: string;
  description: string;
  link: string;
  category: string;
  demoGif?: string;
  features?: string[];
}

const techStack: TechItem[] = [
  // Frontend
  { name: 'TypeScript', icon: '/icons/typescript.png', description: 'Strongly typed superset of JavaScript with compile-time type checking, interfaces, and advanced IDE support. Powers enterprise applications with 100% type safety.', link: 'https://www.typescriptlang.org/', category: 'Frontend', demoGif: 'https://raw.githubusercontent.com/microsoft/TypeScript-Website/v2/packages/typescriptlang-org/static/images/branding/ts-lettermark-blue.svg', features: ['Static Type Checking', 'IntelliSense Support', 'ES6+ Features', 'Interface & Generics'] },
  { name: 'Next.js', icon: '/icons/nextjs.png', description: 'React framework with App Router, Server Components, and Turbopack. Delivers 400% faster dev startup and 90% less client JS with RSC architecture.', link: 'https://nextjs.org/', category: 'Frontend', demoGif: 'https://nextjs.org/static/twitter-cards/home.jpg', features: ['Server Components', 'Turbopack', 'Image Optimization', 'API Routes'] },
  { name: 'React', icon: '/icons/react.png', description: 'Component-based UI library with hooks, concurrent rendering, and automatic batching. React 19 brings useOptimistic and Server Actions.', link: 'https://react.dev/', category: 'Frontend', demoGif: 'https://repository-images.githubusercontent.com/10270250/9cf86300-5e4e-11ea-9d4e-e0c5f4e8a7e5', features: ['Virtual DOM', 'Hooks API', 'Concurrent Mode', 'Server Actions'] },
  { name: 'Tailwind', icon: '/icons/tailwind.png', description: 'Utility-first CSS framework with JIT compiler. Tailwind v4 brings native CSS variables, container queries, and zero-config dark mode.', link: 'https://tailwindcss.com/', category: 'Frontend', demoGif: 'https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg', features: ['JIT Compiler', 'Dark Mode', 'Responsive Design', 'Custom Plugins'] },
  { name: 'JavaScript', icon: '/icons/javascript.png', description: 'Dynamic programming language with ES2024 features: decorators, pipeline operator, and pattern matching. Powers 98% of websites.', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', category: 'Frontend', features: ['Async/Await', 'Modules', 'Promises', 'Closures'] },
  
  // Backend
  { name: 'Python', icon: '/icons/python.png', description: 'High-level language with async/await, type hints, and pattern matching. Python 3.13 brings 40% performance boost with JIT compiler.', link: 'https://www.python.org/', category: 'Backend', features: ['Type Hints', 'Async/Await', 'Data Science', 'AI/ML Libraries'] },
  { name: 'Java', icon: '/icons/java.png', description: 'Enterprise-grade OOP language with virtual threads, pattern matching, and record classes. Java 21 LTS powers billions of devices.', link: 'https://www.java.com/', category: 'Backend', features: ['Virtual Threads', 'Pattern Matching', 'JVM Ecosystem', 'Spring Boot'] },
  { name: 'Spring', icon: '/icons/spring.png', description: 'Enterprise Java framework with Spring Boot 3, native compilation, and reactive programming. Powers 70% of Java enterprise apps.', link: 'https://spring.io/', category: 'Backend', features: ['Dependency Injection', 'Spring Boot', 'Reactive Streams', 'Native Images'] },
  { name: 'Flask', icon: '/icons/flask2.png', description: 'Micro web framework for Python with Werkzeug and Jinja2. Perfect for APIs, microservices, and rapid prototyping.', link: 'https://flask.palletsprojects.com/', category: 'Backend', features: ['Lightweight', 'RESTful APIs', 'Extensions', 'WSGI Compatible'] },
  { name: 'Ruby', icon: '/icons/ruby.png', description: 'Dynamic language with elegant syntax and metaprogramming. Ruby 3.3 brings YJIT JIT compiler for 3x performance.', link: 'https://www.ruby-lang.org/', category: 'Backend', features: ['Metaprogramming', 'Rails Framework', 'YJIT Compiler', 'Gems Ecosystem'] },
  { name: 'PHP', icon: '/icons/php.png', description: 'Server-side scripting with PHP 8.3 features: readonly classes, typed properties, and JIT compilation. Powers WordPress.', link: 'https://www.php.net/', category: 'Backend', features: ['JIT Compiler', 'Typed Properties', 'Composer', 'Laravel Framework'] },
  { name: 'C', icon: '/icons/c.png', description: 'Low-level systems language with direct memory access. C23 standard brings nullptr, typeof, and improved safety.', link: 'https://en.wikipedia.org/wiki/C_(programming_language)', category: 'Backend', features: ['Memory Control', 'System Programming', 'Embedded Systems', 'High Performance'] },
  { name: 'C++', icon: '/icons/cpp.png', description: 'Systems language with C++23 features: modules, ranges, and coroutines. Powers game engines, browsers, and OS kernels.', link: 'https://isocpp.org/', category: 'Backend', features: ['Templates', 'RAII', 'STL', 'Zero-Cost Abstractions'] },
  { name: 'C#', icon: '/icons/csharp.png', description: 'Modern OOP language with C# 12 features: primary constructors, collection expressions, and native AOT compilation.', link: 'https://docs.microsoft.com/en-us/dotnet/csharp/', category: 'Backend', features: ['LINQ', 'Async/Await', '.NET 8', 'Native AOT'] },
  { name: 'Rust', icon: '/icons/rust.png', description: 'Memory-safe systems language with zero-cost abstractions and fearless concurrency. No garbage collector, no data races.', link: 'https://www.rust-lang.org/', category: 'Backend', features: ['Memory Safety', 'Zero-Cost Abstractions', 'Cargo', 'Async Runtime'] },
  { name: 'Cuda', icon: '/icons/cuda.png', description: 'Parallel computing platform and API for GPU acceleration. CUDA 12 brings dynamic parallelism, unified memory, and Tensor Cores for AI workloads.', link: 'https://developer.nvidia.com/cuda-toolkit', category: 'Backend', features: ['GPU Acceleration', 'Parallel Computing', 'Tensor Cores', 'Unified Memory'] },
  
  // DevOps & Infrastructure
  { name: 'Docker', icon: '/icons/docker.png', description: 'Container platform with multi-stage builds, BuildKit caching, and multi-platform support. Enables 60-80% smaller images and seamless CI/CD integration.', link: 'https://www.docker.com/', category: 'DevOps', features: ['Multi-Stage Builds', 'BuildKit Cache', 'Docker Compose', 'Swarm Orchestration'] },
  { name: 'Kafka', icon: '/icons/kafka.png', description: 'Distributed event streaming with KRaft mode (ZooKeeper-less). Handles millions of events/sec with exactly-once semantics and stream processing.', link: 'https://kafka.apache.org/', category: 'DevOps', features: ['Event Streaming', 'KRaft Mode', 'Kafka Streams', 'Exactly-Once Delivery'] },
  { name: 'Redis', icon: '/icons/redis.png', description: 'In-memory data store with sub-millisecond latency. Redis 7+ brings JSON support, search, time-series, and probabilistic data structures.', link: 'https://redis.io/', category: 'DevOps', features: ['In-Memory Cache', 'Pub/Sub', 'Redis Streams', 'JSON Support'] },
  { name: 'Cassandra', icon: '/icons/cassandra.png', description: 'Distributed NoSQL database with linear scalability and no single point of failure. Handles petabytes across multiple datacenters with tunable consistency.', link: 'https://cassandra.apache.org/', category: 'DevOps', features: ['Linear Scalability', 'Multi-DC Replication', 'Tunable Consistency', 'CQL Query Language'] },
  { name: 'PostgreSQL', icon: '/icons/postgresql.png', description: 'Advanced RDBMS with ACID compliance, JSON support, and full-text search. PostgreSQL 16 brings parallel query improvements and logical replication.', link: 'https://www.postgresql.org/', category: 'DevOps', features: ['ACID Compliance', 'JSON/JSONB', 'Full-Text Search', 'Logical Replication'] },
  { name: 'AWS', icon: '/icons/aws.png', description: 'Cloud platform with 200+ services including EC2, Lambda, S3, and ECS. OIDC authentication eliminates long-lived credentials for secure deployments.', link: 'https://aws.amazon.com/', category: 'DevOps', features: ['EC2 & Lambda', 'S3 Storage', 'ECS/EKS', 'OIDC Auth'] },
  { name: 'GitHub', icon: '/icons/github.png', description: 'Git hosting with code review, project management, and CI/CD. 100M+ developers collaborate on open source and enterprise projects.', link: 'https://github.com/', category: 'DevOps', features: ['Git Hosting', 'Pull Requests', 'Code Review', 'Project Boards'] },
  { name: 'Actions', icon: '/icons/actions.png', description: 'CI/CD automation with matrix builds, reusable workflows, and OIDC. Build, test, and deploy with 99.9% uptime SLA and unlimited minutes for public repos.', link: 'https://github.com/features/actions', category: 'DevOps', features: ['Matrix Builds', 'Reusable Workflows', 'OIDC Integration', 'Self-Hosted Runners'] },
  { name: 'Maven', icon: '/icons/maven.png', description: 'Java build automation with dependency management and multi-module projects. Convention over configuration with extensive plugin ecosystem.', link: 'https://maven.apache.org/', category: 'DevOps', features: ['Dependency Management', 'Multi-Module Builds', 'Plugin Ecosystem', 'Repository Management'] },
  
  // Tools & IDEs
  { name: 'JetBrains', icon: '/icons/jetbrains.png', description: 'Professional IDE suite with IntelliJ IDEA, PyCharm, and WebStorm. AI-powered code completion, refactoring, and debugging for 20+ languages.', link: 'https://www.jetbrains.com/', category: 'Tools', features: ['IntelliJ IDEA', 'AI Code Completion', 'Advanced Refactoring', 'Multi-Language Support'] },
  { name: 'Vim', icon: '/icons/vim.png', description: 'Modal text editor with Vim 9 script engine. Extensible with plugins, macros, and regex. Powers productivity for millions of developers.', link: 'https://www.vim.org/', category: 'Tools', features: ['Modal Editing', 'Vim Script', 'Plugin Ecosystem', 'Regex Support'] },
  { name: 'Bash', icon: '/icons/bash.png', description: 'Unix shell with scripting, job control, and command history. Bash 5+ brings associative arrays, nameref variables, and improved debugging.', link: 'https://www.gnu.org/software/bash/', category: 'Tools', features: ['Shell Scripting', 'Job Control', 'Command History', 'Process Substitution'] },
  
  // Security & Pentesting
  { name: 'Kali Linux', icon: '/icons/kalipurple.png', description: 'Penetration testing platform with 600+ security tools. Kali 2026 brings BloodHound CE, NetHunter for Android, and ARM support for Raspberry Pi.', link: 'https://www.kali.org/', category: 'Security', features: ['600+ Security Tools', 'NetHunter Mobile', 'ARM Support', 'Live USB Boot'] },
  { name: 'Burp Suite', icon: '/icons/burp.png', description: 'Web security testing platform with proxy, scanner, and intruder. Industry standard for finding OWASP Top 10 vulnerabilities and API security flaws.', link: 'https://portswigger.net/burp', category: 'Security', features: ['Proxy Intercept', 'Active Scanner', 'Intruder', 'Repeater'] },
  { name: 'Nessus', icon: '/icons/nessus.png', description: 'Vulnerability scanner with 190K+ plugins. Detects misconfigurations, missing patches, and compliance violations across networks and cloud.', link: 'https://www.tenable.com/products/nessus', category: 'Security', features: ['190K+ Plugins', 'Compliance Scanning', 'Cloud Security', 'Patch Detection'] },
  { name: 'Shodan', icon: '/icons/shodan.png', description: 'Search engine for IoT devices, industrial systems, and exposed services. Discover 500M+ internet-connected devices with advanced filters.', link: 'https://www.shodan.io/', category: 'Security', features: ['IoT Discovery', 'Industrial Systems', 'API Access', 'Real-Time Alerts'] },
  { name: 'Gobuster', icon: '/icons/gobuster.png', description: 'High-performance directory/file brute-forcer written in Go. Supports DNS, VHOST, S3 bucket, and TFTP enumeration with wildcard detection.', link: 'https://github.com/OJ/gobuster', category: 'Security', features: ['Directory Brute-Force', 'DNS Enumeration', 'S3 Bucket Discovery', 'VHOST Scanning'] },
  { name: 'Hashcat', icon: '/icons/hashcat.png', description: 'World\'s fastest password cracker with GPU acceleration. Supports 300+ hash algorithms including bcrypt, NTLM, WPA2, and custom kernels.', link: 'https://hashcat.net/hashcat/', category: 'Security', features: ['GPU Acceleration', '300+ Hash Types', 'Rule-Based Attacks', 'Distributed Cracking'] },
  { name: 'BloodHound', icon: '/icons/bloodhound.png', description: 'Active Directory attack path analysis using graph theory. BloodHound CE maps privilege escalation routes with SharpHound and AzureHound ingestors.', link: 'https://github.com/BloodHoundAD/BloodHound', category: 'Security', features: ['Graph Theory Analysis', 'Attack Path Mapping', 'SharpHound Ingestor', 'Azure AD Support'] },
  { name: 'Ghidra', icon: '/icons/ghidra.png', description: 'NSA reverse engineering framework with decompiler for x86, ARM, MIPS, and PowerPC. Supports collaborative analysis and custom scripts.', link: 'https://ghidra-sre.org/', category: 'Security', features: ['Multi-Architecture', 'Decompiler', 'Collaborative Analysis', 'Scripting API'] },
  { name: 'xdbg', icon: '/icons/xdbg.png', description: 'Open-source x64/x32 debugger for Windows with plugin support. Features memory breakpoints, conditional tracing, and anti-anti-debug techniques.', link: 'https://x64dbg.com/', category: 'Security', features: ['Memory Breakpoints', 'Conditional Tracing', 'Plugin System', 'Anti-Debug Detection'] },
  
  // AI & APIs
  { name: 'ChatGPT', icon: '/icons/gpt.png', description: 'GPT-4o and GPT-5 models with 128K context, function calling, and vision. $0.15/1M tokens for mini. Excels at structured output and low latency.', link: 'https://openai.com/chatgpt', category: 'AI', features: ['GPT-4o & GPT-5', 'Function Calling', 'Vision API', 'Fine-Tuning'] },
  { name: 'Claude', icon: '/icons/claude.png', description: 'Claude Opus 4.7 and Sonnet 4.6 with 200K context and extended thinking. Leads SWE-bench coding benchmarks. $3/1M tokens for Sonnet.', link: 'https://www.anthropic.com/claude', category: 'AI', features: ['200K Context', 'Extended Thinking', 'Computer Use', 'MCP Protocol'] },
  { name: 'Gemini', icon: '/icons/gemini.png', description: 'Gemini 2.5 Pro with 1M+ token context and native multimodal (video/audio). $1.25/1M tokens. Best for large codebase analysis and visual tasks.', link: 'https://deepmind.google/technologies/gemini/', category: 'AI', features: ['1M+ Context', 'Video/Audio Input', 'Google Search', 'Workspace Integration'] },
  { name: 'OpenAPI', icon: '/icons/openapi.png', description: 'REST API specification standard (formerly Swagger). OpenAPI 3.1 brings JSON Schema alignment, webhooks, and improved security definitions.', link: 'https://www.openapis.org/', category: 'API', features: ['REST Specification', 'JSON Schema', 'Webhooks', 'Security Definitions'] },
  { name: 'Swagger', icon: '/icons/swagger.png', description: 'API development toolkit with Swagger UI, Editor, and Codegen. Auto-generates interactive docs and client SDKs from OpenAPI specs.', link: 'https://swagger.io/', category: 'API', features: ['Interactive Docs', 'Code Generation', 'API Editor', 'Mock Server'] },
  
  // Architecture
  { name: 'Microservices', icon: '/icons/microservice.png', description: 'Distributed architecture with independent services, API gateways, and service mesh. Enables polyglot persistence, fault isolation, and independent scaling.', link: 'https://microservices.io/', category: 'Architecture', features: ['Service Independence', 'API Gateway', 'Service Mesh', 'Event-Driven'] },
  { name: 'Assembly', icon: '/icons/assembly.png', description: 'Low-level language with direct hardware control. x86-64, ARM, and RISC-V assembly for systems programming, reverse engineering, and exploit development.', link: 'https://en.wikipedia.org/wiki/Assembly_language', category: 'Low-Level', features: ['Direct Hardware Access', 'x86-64 & ARM', 'Reverse Engineering', 'Exploit Development'] },
  { name: 'Omarchy', icon: '/icons/omarchy.png', description: 'Hybrid architecture combining monolithic core with microservice extensions. Balances simplicity with scalability for evolving systems.', link: '#', category: 'Architecture', features: ['Monolithic Core', 'Microservice Extensions', 'Gradual Migration', 'Hybrid Scalability'] },
];

export default function TechCarousel() {
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null);

  return (
    <>
      <section className="tech-carousel-section" suppressHydrationWarning>
        <div className="carousel-wrapper">
          <div className="carousel-row">
            <div className="carousel-track carousel-track-right">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="carousel-set">
                  {techStack.slice(0, Math.ceil(techStack.length / 2)).map((tech, i) => (
                    <div key={`${setIndex}-${i}`} className="carousel-item">
                      <div 
                        className="tech-card-wrapper group cursor-pointer"
                        onClick={() => setSelectedTech(tech)}
                      >
                        <div className="tech-card-neon">
                          <div className="tech-card-content">
                            <Image
                              src={tech.icon}
                              alt={tech.name}
                              width={64}
                              height={64}
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
                        onClick={() => setSelectedTech(tech)}
                      >
                        <div className="tech-card-neon">
                          <div className="tech-card-content">
                            <Image
                              src={tech.icon}
                              alt={tech.name}
                              width={64}
                              height={64}
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
      </section>

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
                  {selectedTech.category}
                </span>
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-lg mb-6 leading-relaxed">
              {selectedTech.description}
            </p>

            {selectedTech.features && selectedTech.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--theme-primary)] mb-3 uppercase tracking-wider">Key Features</h3>
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

            {selectedTech.demoGif && (
              <div className="mb-6 rounded-lg overflow-hidden border border-[var(--theme-primary)]/20">
                <img 
                  src={selectedTech.demoGif} 
                  alt={`${selectedTech.name} demo`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}

            <a
              href={selectedTech.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Learn More
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
