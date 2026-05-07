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
* **Multilingual Support**: 7 languages (EN, ES, PT, FR, DE, JA, ZH) with automatic translation via Groq API
* **Blog CMS**: Full-featured blog with admin panel, live preview, markdown support, and auto-translation
* **Background Music**: Theme-aware music that switches between dark/light modes
* **Animated Components**: Hexagon grid, particle effects, scroll progress, and smooth page transitions
* **GitHub Integration**: Automatic project fetching with image slideshows and tech stack display
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
* **Animations**: Framer Motion 11.2+
* **i18n**: next-intl 4.11+
* **Theme**: next-themes 0.4+
* **Markdown**: react-markdown, gray-matter
* **AI Translation**: Groq API (openai/gpt-oss-120b)
* **Icons**: Lucide React
* **Testing**: Jest + React Testing Library

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
│   │   └── api/               # API routes
│   │       └── blog/          # Blog CRUD endpoints
│   ├── components/            # React components
│   │   ├── Hero.tsx
│   │   ├── Navigation.tsx
│   │   ├── SoloLevelingBoot.tsx
│   │   ├── BackgroundMusic.tsx
│   │   ├── HexagonGrid.tsx
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── blog.ts           # Blog file operations
│   │   └── translate.ts      # Groq translation
│   └── i18n/                  # Internationalization
│       └── routing.ts
├── public/
│   ├── sounds/               # Background music
│   ├── images/               # Static images
│   └── uploads/              # Blog uploads
└── content/
    └── blog/                 # Blog markdown files
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
- Live markdown preview
- Cover image upload
- Category and tags
- Auto-translation to 7 languages
- Syntax highlighting
- Reading time calculation

**Admin Access**: `/[locale]/blog/admin?token=your_secret_token`

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

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> Deployment
</h1>

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Docker

```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

---

<h1 align="center">
  <img src="https://i.imgur.com/O7HwCZt.gif" width="30"/> Roadmap
</h1>

* [x] Solo Leveling boot animation
* [x] Dynamic theme system
* [x] Multilingual support (7 languages)
* [x] Blog CMS with admin panel
* [x] Auto-translation with Groq API
* [x] Background music system
* [x] GitHub projects integration
* [x] Image slideshow for projects
* [x] Animated components
* [x] SEO optimization
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
