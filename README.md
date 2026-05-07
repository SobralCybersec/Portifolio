<div align="center">

<h1 align="center">  

  <img src="https://i.imgur.com/zZghGx7.png">

  ---

  Shadow Monarch Portfolio
</h1>

Modern Next.js portfolio with Solo Leveling theme, featuring dynamic theming, multilingual support, blog CMS, and stunning animations.

**English** | [Português](README.pt-BR.md)

</div>

---

<h1 align="center">
  <img src="https://i.imgur.com/dwyUWDH.gif" width="30"/> Features
</h1>

* **Solo Leveling Boot Animation**: Epic system notification boot sequence with theme-aware styling
* **Dynamic Theme System**: Purple gradient (dark) and blue gradient (light) with smooth transitions
* **Custom Scrollbar**: Modern purple gradient scrollbar with cross-browser support (webkit + Firefox)
* **Bleach Animations**: Clip-path animations for Hero section and Skills grid with stagger effects
* **Multilingual Support**: 7 languages (EN, ES, PT, FR, DE, JA, ZH) with automatic translation via Groq API
* **Blog CMS**: Full-featured blog with admin panel, live preview, markdown support, auto-translation, and proper spacing
* **Background Music**: Theme-aware music that switches between dark/light modes
* **Animated Components**: Hexagon grid, particle effects, scroll progress, and smooth page transitions
* **GitHub Integration**: Automatic project fetching with image slideshows and tech stack display
* **CI/CD Pipeline**: GitHub Actions with multi-platform Docker builds, security scanning, and Lighthouse audits
* **Responsive Design**: Mobile-first approach with Tailwind CSS
* **SEO Optimized**: Dynamic metadata, sitemap, and Open Graph support
* **Performance**: Server components, image optimization, and code splitting

---

<h1 align="center">
  <img src="https://i.imgur.com/eu3StDB.gif" width="30"/> Tech Stack
</h1>

<p align="center">
  <img src="https://go-skill-icons.vercel.app/api/icons?i=nextjs,react,typescript,tailwind,nodejs&size=64" />
</p>

* **Framework**: Next.js 16.2.4 (App Router)
* **Language**: TypeScript 5.5+
* **Styling**: Tailwind CSS 3.4+
* **Animations**: CSS clip-path animations (Bleach-style)
* **i18n**: next-intl 4.11+
* **Theme**: next-themes 0.4+
* **Markdown**: react-markdown, gray-matter, remark-gfm
* **AI Translation**: Groq API (openai/gpt-oss-120b)
* **Icons**: Lucide React
* **Testing**: Jest + React Testing Library
* **CI/CD**: GitHub Actions with Docker, Trivy, Snyk, Lighthouse
* **Deployment**: Vercel with optimized configuration

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

Create `.env.local` file:

```env
# Groq API for translations
GROQ_API_KEY=your_groq_api_key

# Blog Admin Access
NEXT_PUBLIC_ENABLE_ADMIN=true
ADMIN_SECRET_TOKEN=your_secret_token
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
Main/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── blog/          # Blog pages
│   │   │   ├── projects/      # Projects page
│   │   │   └── layout.tsx     # Root layout
│   │   ├── api/               # API routes
│   │   │   ├── blog/          # Blog CRUD endpoints
│   │   │   └── health/        # Health check endpoint
│   │   └── globals.css        # Global styles + custom scrollbar
│   ├── components/            # React components
│   │   ├── Hero.tsx           # With Bleach clip animations
│   │   ├── Skills.tsx         # With stagger clip animations
│   │   ├── Navigation.tsx
│   │   ├── SoloLevelingBoot.tsx
│   │   ├── BackgroundMusic.tsx
│   │   ├── HexagonGrid.tsx
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── blog.ts           # Blog file operations
│   │   └── translate.ts      # Groq translation
│   └── i18n/                  # Internationalization
│       ├── routing.ts
│       └── messages/          # 7 language files
├── __tests__/                 # Test suite
│   ├── api/                  # API tests
│   ├── components/           # Component tests
│   ├── hooks/                # Hook tests
│   ├── integration/          # Integration tests
│   └── lib/                  # Utility tests
├── .github/
│   └── workflows/            # CI/CD pipelines
│       ├── ci.yml            # Main CI pipeline
│       ├── deploy.yml        # Vercel deployment
│       └── dependencies.yml  # Dependency updates
├── public/
│   ├── sounds/               # Background music
│   ├── images/               # Static images
│   └── uploads/              # Blog uploads
├── content/
│   └── blog/                 # Blog markdown files
├── Dockerfile                # Multi-stage production build
├── docker-compose.yml        # Docker orchestration
├── vercel.json               # Vercel configuration
└── jest.config.js            # Test configuration
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

### Blog CMS

**Features**:
- Create, edit, delete posts
- Live markdown preview with proper spacing
- Cover image upload
- Category and tags
- Auto-translation to 7 languages
- Syntax highlighting
- Reading time calculation
- Custom ReactMarkdown renderers for consistent spacing
- Fully internationalized form fields

**Admin Access**: `/[locale]/blog/admin?token=your_secret_token`

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

Powered by Groq API (openai/gpt-oss-120b):
- Automatic blog post translation
- 7 supported languages
- Retry logic with exponential backoff
- Fallback to MyMemory API
- Temperature: 0.1 (deterministic)
- Max tokens: 8192
- Reasoning effort: medium

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
Automatic image carousel for projects:
- 5-second intervals
- Smooth fade transitions
- Supports multiple images
- Error handling

### ScrollProgress
Animated progress bar:
- Purple gradient (dark mode)
- Blue gradient (light mode)
- Smooth scroll tracking
- Fixed at top of viewport

---

<h1 align="center">
  <img src="https://i.imgur.com/dwyUWDH.gif" width="30"/> Testing
</h1>

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

### Test Structure

```
__tests__/
├── api/
│   └── blog.test.ts          # Blog API endpoints
├── components/
│   ├── Hero.test.tsx         # Hero component
│   ├── Navigation.test.tsx   # Navigation
│   └── Skills.test.tsx       # Skills grid
├── hooks/
│   └── useLocalStorage.test.ts
├── integration/
│   └── blog-flow.test.ts     # End-to-end blog flow
└── lib/
    ├── blog.test.ts          # Blog utilities
    └── translate.test.ts     # Translation logic
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> CI/CD Pipeline
</h1>

### GitHub Actions Workflows

**Main CI Pipeline** (`.github/workflows/ci.yml`):
- Lint and type checking
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
* [x] Blog CMS with admin panel
* [x] Auto-translation with Groq API
* [x] Background music system
* [x] GitHub projects integration
* [x] Image slideshow for projects
* [x] Animated components
* [x] SEO optimization
* [x] CI/CD pipeline with GitHub Actions
* [x] Docker multi-platform builds
* [x] Security scanning (Trivy, Snyk)
* [x] Comprehensive test suite
* [x] Vercel deployment optimization
* [ ] Contact form with email integration
* [ ] Analytics dashboard
* [ ] RSS feed for blog
* [ ] Search functionality
* [ ] Comments system

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
  Matheus Sobral - Shadow Monarch<br>
  <em>Inspired by Solo Leveling</em>
</p>
