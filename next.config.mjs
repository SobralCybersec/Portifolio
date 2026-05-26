import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  output: 'standalone',
  crossOrigin: 'anonymous',

  transpilePackages: ['next-intl', 'use-intl'],

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75],
    minimumCacheTTL: 14400,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'go-skill-icons.vercel.app', pathname: '/**' },
      { protocol: 'https', hostname: 'skillicons.dev', pathname: '/**' },
      { protocol: 'https', hostname: 'img.shields.io', pathname: '/**' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'opengraph.githubassets.com', pathname: '/**' },
      { protocol: 'https', hostname: 'repository-images.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'user-images.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'github.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.forgecdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'www.fiap.com.br', pathname: '/**' },
    ],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'react-syntax-highlighter',
      '@heroicons/react',
    ],
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },

  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));