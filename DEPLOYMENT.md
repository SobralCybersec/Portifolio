# Vercel Deployment Guide

## Quick Start

### Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - **IMPORTANT**: Set Root Directory to `Main` in project settings
   - Vercel will auto-detect Next.js and use `vercel.json` configuration

3. **Add Environment Variables** (Vercel Dashboard → Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SITE_NAME=LO Portfolio
   NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
   NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
   NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourusername
   NEXT_PUBLIC_TWITTER_URL=https://twitter.com/yourusername
   GITHUB_TOKEN=your_github_token_here
   YOUTUBE_BACKGROUND_MUSIC=https://www.youtube.com/watch?v=qB2rMhn2epE
   ```

4. **Deploy**: Vercel will automatically deploy

### Deploy via CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   - Windows: `deploy.bat`
   - Linux/Mac: `./deploy.sh`
   - Or manually: `vercel --prod`

## Configuration

### vercel.json
- Framework: Next.js auto-detected
- Build command: `npm run build`
- Install command: `npm ci`
- Output directory: `.next`
- Security headers configured
- Image optimization with GitHub domains
- API functions: 1024MB memory, 10s timeout
- Region: US East (iad1)

### next.config.mjs
- ✅ Standalone output for Vercel
- ✅ AVIF/WebP image optimization
- ✅ Turbopack for faster builds
- ✅ Package import optimization
- ✅ Static asset caching (1 year)
- ✅ Console.log removal in production

## Pre-Deployment Checklist

Run these commands before deploying:

```bash
# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Test build locally
npm run build

# Run tests
npm test
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard → Deployments
- Run `npm run build` locally to reproduce
- Verify all environment variables are set

### Type Errors
```bash
npx tsc --noEmit
```

### ESLint Errors
```bash
npm run lint
```

### Missing Environment Variables
Add them in Vercel Dashboard → Project Settings → Environment Variables

### Function Timeout (default 10s)
Increase in `vercel.json`:
```json
"functions": {
  "src/app/api/**/*.ts": {
    "maxDuration": 30
  }
}
```

## Performance Features

- ✅ Standalone output (minimal bundle)
- ✅ AVIF/WebP images
- ✅ Static asset caching (31536000s)
- ✅ Turbopack build optimization
- ✅ Package import optimization
- ✅ Compression enabled
- ✅ Security headers

## Monitoring

After deployment:
- Check Vercel Dashboard → Deployments
- View build logs
- Monitor function execution
- Check Lighthouse CI in GitHub Actions

## Next Steps

1. ✅ Push to GitHub
2. ✅ Import to Vercel (set Root Directory to `Main`)
3. ✅ Add environment variables
4. ✅ Deploy
5. Set up custom domain (optional)
6. Enable Vercel Analytics (optional)
7. Configure deployment protection (optional)
