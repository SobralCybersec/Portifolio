import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  reactStrictMode: true,

  output: 'standalone',

  poweredByHeader: false,

  compress: true,

  productionBrowserSourceMaps: false,

  crossOrigin: 'anonymous',

  transpilePackages: ['next-intl', 'use-intl'],

  images: {
    formats: ['image/avif', 'image/webp'],

    // Reduced image variants = faster builds
    deviceSizes: [640, 828, 1200, 1920],

    imageSizes: [16, 32, 64, 128, 256],

    qualities: [75],

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

  experimental: {
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(
  withNextIntl(withMDX(nextConfig))
);