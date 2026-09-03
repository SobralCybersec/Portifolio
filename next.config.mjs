import { fileURLToPath } from 'node:url';
import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [],
  },
});

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://platform.linkedin.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://go-skill-icons.vercel.app https://skillicons.dev https://img.shields.io https://github.com https://githubassets.com https://*.githubassets.com https://raw.githubusercontent.com https://*.githubusercontent.com https://opengraph.githubassets.com https://repository-images.githubusercontent.com https://user-images.githubusercontent.com https://avatars.githubusercontent.com https://i.imgur.com https://media.forgecdn.net https://www.fiap.com.br https://res.cloudinary.com https://platform.linkedin.com https://api.star-history.com https://cdn.jsdelivr.net",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://api.github.com https://github.com https://raw.githubusercontent.com https://*.githubusercontent.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.vercel-insights.com https://api.groq.com https://api.mymemory.translated.net https://platform.linkedin.com https://www.linkedin.com https://*.upstash.io https://ws-sa1.pusher.com https://sockjs-sa1.pusher.com wss://ws-sa1.pusher.com wss://sockjs-sa1.pusher.com",
  "frame-src 'self' https://youtube.com https://www.youtube.com https://youtube-nocookie.com https://www.youtube-nocookie.com https://www.linkedin.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  reactStrictMode: true,

  // Vercel supplies its own Next.js runtime and post-build trace step.
  // Standalone output remains for the Docker image, but it makes Vercel's
  // onBuildComplete hook look for a trace file that its build layout omits.
  output: process.env.VERCEL ? undefined : 'standalone',

  // Blog content is read by server routes through a runtime directory walk.
  // Keep only editorial files in the traced server output.
  outputFileTracingIncludes: {
    '/*': ['./content/blog/**/*', './data/blog-tags.yml'],
  },

  poweredByHeader: false,

  compress: true,

  productionBrowserSourceMaps: false,

  crossOrigin: 'anonymous',

  transpilePackages: ['next-intl', 'use-intl'],

  images: {
    formats: ['image/avif', 'image/webp'],

    // Reduced image variants = faster builds
    deviceSizes: [640, 828, 1200, 1920],

    imageSizes: [16, 32, 64, 74, 128, 148, 256, 384],

    qualities: [60, 75, 100],

    minimumCacheTTL: 2592000,

    // Safer unless absolutely required
    dangerouslyAllowSVG: false,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'go-skill-icons.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'skillicons.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'opengraph.githubassets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'repository-images.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.forgecdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fiap.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  turbopack: {
    // Pin workspace root so Next.js doesn't pick up a stray parent-dir lockfile
    root: fileURLToPath(new URL('.', import.meta.url)),
  },

  experimental: {
    // Jest's next/jest loader currently mis-parses the TypeScript CLI output
    // in this project; use the equivalent compiler API for config loading.
    useTypeScriptCli: false,
    optimizePackageImports: [
      // Keep only packages NOT already optimized automatically
      'framer-motion',
      'react-syntax-highlighter',
    ],

    turbopackFileSystemCacheForBuild: true,
  },

  webpack: (config) => {
    config.cache = true;

    return config;
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(
  withNextIntl(withMDX(nextConfig))
);
