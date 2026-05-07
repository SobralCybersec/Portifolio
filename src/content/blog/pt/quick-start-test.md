---
title: Quick Start test
description: Teste de quick start
category: Web Development
date: '2026-05-07T16:02:31.105Z'
readTime: 2
---
# 🚀 Quick Start - Bleach Animations

## 5-Minute Integration

### Step 1: Verify Installation ✅
The animations are already integrated! Check `src/app/globals.css` - you'll see:
```css
@import '../components/css/bleach-animations.css';
```

### Step 2: Add to Hero Section (2 minutes)

Open `src/components/Hero.tsx` and wrap your main title:

**Before:**
```tsx
<h1 className="hero-name">
  {t('greeting')} <GradientText>Matheus Sobral</GradientText>
</h1>
```

**After:**
```tsx
<div className="animate-clip-intro">
  <h1 className="hero-name">
    {t('greeting')} <GradientText>Matheus Sobral</GradientText>
  </h1>
</div>
```

### Step 3: Add to Skills Section (1 minute)

Open `src/components/Skills.tsx` and add to the grid:

**Before:**
```tsx
<div className="skills-grid">
  {/* skill cards */}
</div>
```

**After:**
```tsx
<div className="skills-grid">
  {/* skill cards */}
</div>
```

### Step 4: Test It! (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000 and watch the magic! 🎉

## That's It!

You now have:
- ✅ Dramatic hero entrance
- ✅ Sequential skill card reveals
- ✅ Professional anime-style transitions

## Want More?

### Add to Section Titles
```tsx
<div className="animate-clip-in">
  <h2 className="section-title">Projects</h2>
</div>
```

### Add to Buttons
```tsx
<button className="animate-clip-in-delay hero-btn-primary">
  Get Started
</button>
```

### Add to Cards
```tsx
<div className="stagger-clip-in">
  <ProjectCard />
  <ProjectCard />
  <ProjectCard />
</div>
```

## Full Documentation

- **Complete Guide:** `BLEACH_ANIMATIONS_GUIDE.md`
- **Live Examples:** `src/components/BleachAnimationExample.tsx`
- **Cleanup Info:** `CLEANUP_REPORT.md`

## Troubleshooting

**Animations not showing?**
1. Clear browser cache (Ctrl+Shift+R)
2. Check console for errors
3. Verify globals.css has the @import

**Too fast/slow?**
```tsx
<div 
  className="animate-clip-in"
  style={{ animationDuration: '1.2s' }}
>
  Content
</div>
```

**Need delay?**
```tsx
<div 
  className="animate-clip-in"
  style={{ animationDelay: '0.5s' }}
>
  Content
</div>
```

---

**Time to implement:** 5 minutes
**Impact:** High visual appeal
**Performance:** Zero impact
**Browser support:** All modern browsers
