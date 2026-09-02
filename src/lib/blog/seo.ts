import type { Metadata } from 'next';
import { getBlogRoute } from './content';
import type { BlogPost } from './types';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo/seo';

export function getBlogPostMetadata(post: BlogPost, locale: string): Metadata {
  const route = getBlogRoute(post, locale);
  const image = post.cover ?? OG_IMAGE;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: route },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      url: route,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [image] },
  };
}

export function getBlogJsonLd(post: BlogPost, locale: string) {
  const route = getBlogRoute(post, locale);
  const image = post.cover ? [`${SITE_URL}${post.cover}`] : [`${SITE_URL}${OG_IMAGE}`];
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Person', name: 'Matheus Sobral', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${route}` },
    image,
    keywords: post.tags,
  };
}
