<div align="center">

<h1 align="center">  
  Shadow Monarch Portfolio
</h1>

Modern Next.js portfolio with Solo Leveling theme, featuring dynamic theming, multilingual support, real-time chat, GitHub integration, visitor tracking, and stunning animations.

**English**

</div>

---

<h1 align="center">
  <img src="https://i.imgur.com/dwyUWDH.gif" width="50" />
  Demo | Demonstration:
</h1>

https://github.com/user-attachments/assets/9b85d167-0bac-4a16-ab4c-323e11c79761


---

<h1 align="center">
  <img src="https://i.imgur.com/dwyUWDH.gif" width="30"/> Features
</h1>

* **Solo Leveling Boot Animation**: Epic system notification boot sequence with theme-aware styling
* **Dynamic Theme System**: Purple gradient (dark) and blue gradient (light) with smooth transitions
* **Custom Scrollbar**: Modern purple gradient scrollbar with cross-browser support (webkit + Firefox)
* **Bleach Animations**: Clip-path animations for Hero section and Skills grid with stagger effects
* **Multilingual Support**: 7 languages (EN, ES, PT, FR, DE, JA, ZH) with automatic translation via Groq API
* **Real-time Chat**: Live chat room powered by Pusher + Upstash Redis with rate limiting
* **Background Music**: Theme-aware music that switches between dark/light modes
* **Animated Components**: Hexagon grid, particle effects, scroll progress, letter glitch, and smooth page transitions
* **GitHub Integration**: Dual-account project fetching (SobralCybersec + MatheusSobralCSharp) with image slideshows and tech stack detection
* **Visitor Counter**: Persistent cumulative visitor tracking via Upstash Redis
* **Live Preview**: Interactive live code preview component
* **Tech Carousel**: Animated technology showcase carousel
* **City Map**: Visual repository map rendered from GitHub data
* **Stack Documentation**: Markdown field notes for TypeScript and React with diagrams, HTML examples, and stack icons
* **Vercel Analytics**: Integrated analytics for page views and user insights
* **CI/CD Pipeline**: GitHub Actions with multi-platform Docker builds, security scanning, and Lighthouse audits
* **Responsive Design**: Mobile-first approach with Tailwind CSS
* **SEO Optimized**: Dynamic metadata, sitemap, and Open Graph support
* **Performance**: Turbopack dev/build cache, dynamic imports, image optimization (AVIF/WebP), and code splitting
* **Rate Limiting**: Upstash Redis sliding window rate limits on auth (10/min), chat (20/min), and general API (100/min)

---

<h1 align="center">
  <img src="https://i.imgur.com/eu3StDB.gif" width="30"/> Tech Stack
</h1>

<p align="center">
  <img src="https://go-skill-icons.vercel.app/api/icons?i=nextjs,react,typescript,tailwind,nodejs,redis&size=64" />
</p>

* **Framework**: Next.js 16.3.3 (App Router, Turbopack)
* **Language**: TypeScript 5.9+
* **Styling**: Tailwind CSS 3.4+
* **Animations**: Framer Motion 11+ + CSS clip-path animations (Bleach-style)
* **i18n**: next-intl 4.14+
* **Theme**: next-themes 0.4+
* **Real-time**: Pusher 5.3 / pusher-js 8.6
* **Cache / Rate Limit**: Upstash Redis 1.38.3 + @upstash/ratelimit 2.0
* **Auth**: NextAuth.js 5.0 (beta)
* **AI Translation**: Groq API
* **Icons**: Lucide React 0.577+
* **Linting**: ESLint 9.39+ with Next.js flat config
* **Testing**: Jest 30.5 + React Testing Library 16.3
* **Runtime**: Node.js 22
* **CI/CD**: GitHub Actions with Docker, Trivy, Snyk, Lighthouse
* **Deployment**: Vercel with optimized configuration

### Engineering Documentation

| Guide | Focus |
| --- | --- |
| [TypeScript Field Notes](./docs/typescript.md) | Type contracts, runtime boundaries, component APIs, and strict checks. |
| [React Field Notes](./docs/react.md) | Render flow, component composition, state ownership, and semantic HTML. |
| [Frontend QA](./docs/testing.md) | Test stack, browser coverage, CI parity, and reviewable evidence. |

### Dependency maintenance

`package.json`, `package-lock.json`, and `pnpm-lock.yaml` are kept synchronized. CI installs with `npm ci`; local pnpm installs use the frozen lockfile:

```bash
npm ci
# or
pnpm install --frozen-lockfile
```

Dependency updates must pass type checking, linting, tests, and production build. Major-line migrations stay separate from routine patch/minor updates.

---

<h1 align="center">
  <img src="https://i.imgur.com/VN6wG7g.gif" width="50" />
  Installation & Setup
</h1>

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
npm install
```

### Environment Variables

Create `.env.local` file (see `.env.local.example` for full reference):

```env
# GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=SobralCybersec

# Groq API for translations
GROQ_API_KEY=your_groq_api_key

# Upstash Redis (rate limiting, chat, visitor counter)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Pusher (real-time chat)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run every Jest, Vitest, browser, Playwright, and Node test
pnpm full:tests

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

<h1 align="center">
  <img src="https://i.imgur.com/nbxr7bD.gif" width="30"/> Project Structure
</h1>

```
Portifolio/
├── 📁 src/
│   ├── 📁 app/                       # 🌐 Routes, layouts, metadata, API handlers
│   │   ├── 📁 [locale]/              # 🌍 Internationalized pages (7 languages)
│   │   │   ├── 📁 about/             # ℹ️ About page
│   │   │   ├── 📁 certifications/    # 🏅 Certifications page
│   │   │   ├── 📁 chat/              # 💬 Chat page
│   │   │   ├── 📁 contact/           # 📧 Contact page
│   │   │   ├── 📁 projects/          # 💼 Projects page
│   │   │   └── 📁 tests/             # Page tests
│   │   ├── 📁 api/                   # 🔌 API routes and route tests
│   │   ├── 📁 tests/                 # App shell tests
│   │   └── 📄 globals.css            # 🎨 Global styles
│   ├── 📁 components/                # ⚛️ Components grouped by responsibility
│   │   ├── 📁 about/                 # About-page sections
│   │   ├── 📁 chat/                  # Chat UI and effects
│   │   ├── 📁 contact/               # Contact UI and effects
│   │   ├── 📁 effects/               # Backgrounds, scroll, particles, glitch
│   │   ├── 📁 home/                  # Hero, skills, metrics, tech carousel
│   │   ├── 📁 layout/                # Navigation, theme, transitions
│   │   ├── 📁 loading-screen/        # Boot screen, loader, loading messages
│   │   ├── 📁 media/                 # Background music and media UI
│   │   ├── 📁 projects/              # Project cards, previews, GitHub data
│   │   ├── 📁 runtime/               # Client-only runtime components
│   │   ├── 📁 texts/                 # Animated text and typewriter UI
│   │   ├── 📁 ui/                    # Reusable UI primitives
│   │   └── 📁 tests/                 # Component tests
│   ├── 📁 hooks/                     # 🪝 Hooks grouped by audio/browser concern
│   │   ├── 📁 audio/                 # Click sound hook
│   │   └── 📁 browser/               # Hydration hook and tests
│   ├── 📁 i18n/                      # 🌐 Internationalization
│   │   ├── 📁 config/                # Routing config and tests
│   │   ├── 📁 messages/              # 7 language JSON files
│   │   └── 📄 request.ts              # next-intl request config
│   ├── 📁 lib/                       # 🛠️ Utilities grouped by domain
│   │   ├── 📁 auth/ chat/ github/ localization/
│   │   ├── 📁 media/ profile/ security/ seo/
│   │   └── 📁 tests/                 # Utility and integration tests
│   ├── 📁 tests/                     # 🧪 Infrastructure tests
│   └── 📁 types/auth/                # NextAuth type augmentation
├── 📁 tests/                         # 🧪 API and Docker tests
│   ├── 📁 api/                       # Health endpoint tests
│   └── 📁 docker/                    # Docker config tests
├── 📁 .github/
│   └── 📁 workflows/                 # 🔄 CI/CD pipelines
│       ├── 📄 ci.yml                 # Main CI (lint, test, build)
│       ├── 📄 deploy.yml             # Vercel deployment
│       ├── 📄 docker.yml             # Docker multi-platform build
│       └── 📄 dependencies.yml       # Weekly dependency updates
├── 📁 public/
│   ├── 📁 certifications/            # 🏅 Certification images
│   ├── 📁 cv/                        # 📄 CV/Resume PDFs (EN + PT)
│   ├── 📁 fonts/                     # 🔤 Custom fonts (Eternal.ttf)
│   ├── 📁 icons/                     # 🎨 Tech stack icons (40+ icons)
│   ├── 📁 images/                    # 🖼️ Static images + badges + sprites
│   ├── 📁 sounds/                    # 🎵 Background music files
│   └── 📁 sprites/                   # 🎮 Animated character sprites
├── 📄 Dockerfile                     # 🐳 Multi-stage production build
├── 📄 docker-compose.yml             # 🐳 Docker orchestration
├── 📄 vercel.json                    # ▲ Vercel configuration
├── 📄 next.config.mjs                # ⚙️ Next.js + Turbopack configuration
├── 📄 tailwind.config.ts             # 🎨 Tailwind CSS config
├── 📄 eslint.config.mjs              # 📏 ESLint 9 flat config
├── 📄 jest.config.js                 # 🧪 Test configuration
├── 📄 lighthouserc.js                # 🔦 Lighthouse CI config
└── 📄 package.json                   # 📦 Dependencies
```

---

<h1 align="center">
  <img src="https://i.imgur.com/PFZmPWb.gif" width="30" />
  Key Features
</h1>

### Solo Leveling Boot Animation

Epic system notification that plays on first visit:
- Theme-aware colors (purple for dark, blue for light)
- Animated card with scanlines and glowing effects
- Job change animation: Necromancer → Shadow Monarch
- Stores completion in localStorage
- Triggers background music after completion

### Dynamic Theme System

**Dark Theme**:
- Purple gradient (#a855f7, #8b5cf6)
- Hexagon grid background
- White favicon
- sound.mp3 background music

**Light Theme**:
- Blue gradient (#6366f1, #3b82f6)
- Clean white background
- Black favicon
- sound2.mp3 background music

### Real-time Chat

Powered by Pusher + Upstash Redis:
- Live messaging with WebSocket connections
- Rate limited: 20 messages/minute per user
- Message history stored in Redis
- Auth-gated via NextAuth.js
- Available at `/[locale]/chat`

### Custom Scrollbar

Modern purple gradient scrollbar:
- **Chrome/Safari/Edge**: webkit-scrollbar pseudo-elements
- **Firefox**: scrollbar-color and scrollbar-width properties
- Transparent thumb with border revealing gradient track
- Hover effects and light theme support
- Cross-browser compatible

### Bleach Animations

Clip-path animations inspired by Bleach anime:
- **Hero Section**: animate-clip-intro (vertical reveal)
- **Skills Grid**: stagger-clip-in (sequential card reveals)
- Pure CSS animations (no JavaScript)
- Theme-aware timing and easing

### Translation System

Powered by Groq API:
- Automatic UI translation across 7 languages
- Retry logic with exponential backoff
- Fallback to MyMemory API
- Temperature: 0.1 (deterministic)

---

<h1 align="center">
  <img src="https://i.imgur.com/6nSJzZ2.gif" width="35"/> Component Highlights
</h1>

### HexagonGrid
Animated hexagonal grid background with:
- Dynamic sizing based on viewport
- Theme-aware colors
- Smooth animations
- Client-side only rendering

### BackgroundMusic
Theme-aware music player:
- Auto-plays after boot animation
- Switches music on theme change
- Volume: 0.35 (half volume)
- Persists across page navigation
- Smooth transitions

### ImageSlideshow
Automatic image carousel for projects (inline in GitHubProjects):
- 3-second intervals
- Smooth fade transitions
- Supports multiple images parsed from README
- Error handling with GitHub OG image fallback

### ScrollProgress
Animated progress bar:
- Purple gradient (dark mode)
- Blue gradient (light mode)
- Smooth scroll tracking
- Fixed at top of viewport

---

<h1 align="center">
  <img src="https://i.imgur.com/dwyUWDH.gif" width="30"/> Testing & Code Quality
</h1>

### ESLint 9 Configuration

**Modern flat config** (`eslint.config.mjs`):
- Next.js 16 core-web-vitals preset
- React 19 strict rules compliance
- Custom ignore patterns for build artifacts
- Zero errors, zero warnings in production

**Key Rules Enforced**:
- `react-hooks/exhaustive-deps` - Validates hook dependencies
- `react-hooks/set-state-in-effect` - Prevents cascading renders
- `react-hooks/purity` - Ensures component purity
- `@next/next/no-img-element` - Enforces Next.js Image optimization

```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Test Suite

Comprehensive test coverage:
- **Unit Tests**: Components, hooks, utilities
- **Integration Tests**: API routes, blog system
- **Component Tests**: React Testing Library
- **API Tests**: Blog CRUD operations
- **Docker Tests**: Health checks, container validation

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

See [test.md](./test.md) for the full test matrix, Mermaid diagrams, screenshots, and video demonstration.

### Complexity Review

Lizard reviews TypeScript and TSX complexity during quality checks. `NavigationContent` and `ProjectCardPreview` now use smaller render helpers instead of large branching bodies; both pass the configured review and hard thresholds.

### Test Structure

```
tests/
├── api/
│   └── health.test.ts        # Health check endpoint
└── docker/
    └── config.test.ts        # Docker configuration
src/components/tests/
├── Contact.test.tsx
├── GitHubProjects.test.tsx
├── LivePreview.test.tsx
├── Navigation.test.tsx
└── TechCarousel.test.tsx

Additional tests live beside their responsibility:
`src/app/**/tests`, `src/hooks/browser/tests`, `src/i18n/config/tests`,
`src/lib/profile/tests`, and `src/lib/tests/integration`.
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> CI/CD Pipeline
</h1>

### GitHub Actions Workflows

**Main CI Pipeline** (`.github/workflows/ci.yml`):
- **Linting**: ESLint 9.39+ with React 19 strict rules
- **Type Checking**: TypeScript 5.9+ strict mode
- Unit and integration tests
- Security scanning (npm audit, Snyk, Trivy)
- Multi-platform Docker builds (amd64, arm64)
- SLSA provenance attestation
- SBOM generation
- Lighthouse performance audits
- Bundle size analysis

**Deployment** (`.github/workflows/deploy.yml`):
- Automatic Vercel deployment
- Release creation
- Environment-specific configurations

**Dependency Updates** (`.github/workflows/dependencies.yml`):
- Weekly automated dependency updates
- Security vulnerability checks

### Trigger CI/CD

```bash
# Push to trigger CI
git add .
git commit -m "feat: new feature"
git push origin main

# Create release to trigger deployment
git tag v1.0.0
git push origin v1.0.0
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> Deployment
</h1>

### Vercel (Recommended)

**Configuration**: `vercel.json` with 2026 best practices
- Security headers (CSP, HSTS, X-Frame-Options)
- Optimized caching strategies
- Image optimization settings
- Function configuration (memory, maxDuration)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Docker

**Multi-stage build** with production optimizations:
- Non-root user (nextjs:nodejs)
- Health check endpoint
- Standalone output mode
- Multi-platform support (amd64, arm64)

```bash
# Build and run
docker build -t portfolio .
docker run -p 3000:3000 portfolio

# Using docker-compose
docker-compose up -d

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t portfolio .
```

### Health Check

Endpoint: `/api/health`

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T...",
  "uptime": 123.45,
  "environment": "production",
  "version": "1.0.0",
  "memory": { "used": 50, "total": 100 }
}
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> Roadmap
</h1>

* [x] Solo Leveling boot animation
* [x] Dynamic theme system
* [x] Custom scrollbar with gradient
* [x] Bleach clip-path animations
* [x] Multilingual support (7 languages)
* [x] Auto-translation with Groq API
* [x] Background music system
* [x] GitHub projects integration (dual-account)
* [x] Image slideshow for projects (3s intervals)
* [x] Animated components (HexagonGrid, ParticleBackground, LetterGlitch, MetricsTicker)
* [x] SEO optimization
* [x] CI/CD pipeline with GitHub Actions (ci, deploy, docker, dependencies)
* [x] Docker multi-platform builds (amd64, arm64)
* [x] Security scanning (Trivy, Snyk)
* [x] Comprehensive test suite
* [x] Vercel deployment optimization
* [x] ESLint 9 migration with flat config
* [x] Next.js Image optimization (AVIF/WebP)
* [x] Visitor counter with Upstash Redis persistence
* [x] Vercel Analytics integration
* [x] Real-time chat (Pusher + Redis)
* [x] NextAuth.js authentication
* [x] Rate limiting (Upstash sliding window)
* [x] Live code preview component
* [x] Tech carousel
* [x] City map visualization
* [x] Certifications page
* [x] CV/Resume download (EN + PT)
* [x] Turbopack filesystem cache (dev + build)
* [ ] Contact form with email integration
* [ ] Analytics dashboard
* [ ] Search functionality

---

<h1 align="center"><img src="https://i.imgur.com/6nSJzZ2.gif" width="35"/> References</h1>

<h2 align="center">
  
**Next.js**: [Next.js Documentation](https://nextjs.org/docs)  <img src="https://go-skill-icons.vercel.app/api/icons?i=nextjs&size=32" width="40" />

</h2>

<h2 align="center">
  
**Groq API**: [Groq Documentation](https://console.groq.com/docs)  <img src="https://go-skill-icons.vercel.app/api/icons?i=nodejs&size=32" width="40" />

</h2>

<h2 align="center">
  
**Framer Motion**: [Framer Motion Docs](https://www.framer.com/motion/)  <img src="https://go-skill-icons.vercel.app/api/icons?i=react&size=32" width="40" />

</h2>

<h1 align="center">Credits</h1>

<p align="center">
  <strong>Developed by:</strong><br>
  Matheus Sobral & Pyetrah (Designer)
  <em>Lol</em>
</p>
