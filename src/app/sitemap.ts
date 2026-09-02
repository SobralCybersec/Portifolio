import type { MetadataRoute } from 'next';
import { getAllPosts, getBlogRoute } from '@/lib/blog/content';

const locales = ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh'];
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sobralcybersec.vercel.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/projects', '/certifications', '/contact', '/chat'];
  const baseRoutes = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
  );
  const blogRoutes = getAllPosts().flatMap((post) => locales.map((locale) => ({
    url: `${baseUrl}${getBlogRoute(post, locale)}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: post.pinned ? 0.9 : 0.7,
  })));
  return [...baseRoutes, ...blogRoutes];
}
