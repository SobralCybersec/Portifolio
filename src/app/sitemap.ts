import type { MetadataRoute } from 'next';

const locales = ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh'];
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sobralcybersec.vercel.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/projects', '/certifications', '/contact', '/chat'];

  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
  );
}
