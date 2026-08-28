import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sobralcybersec.vercel.app').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
