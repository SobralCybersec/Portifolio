import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogChrome, BlogHeader, BlogMonthList } from '@/components/blog/BlogUI';
import { getAllPosts, groupPostsByMonth } from '@/lib/blog/content';
import { getBlogTag, getBlogTags } from '@/lib/blog/taxonomy';
import { routing } from '@/i18n/config/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getBlogTags().map((tag) => ({ locale, tag: tag.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tag: string }> }): Promise<Metadata> {
  const { locale, tag: slug } = await params;
  const tag = getBlogTag(slug);
  if (!tag) return { title: 'Tag not found' };
  return { title: tag.label, description: tag.description, alternates: { canonical: `/${locale}/blog/tags/${tag.slug}` } };
}

export default async function BlogTagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag: slug } = await params;
  const tag = getBlogTag(slug);
  if (!tag) notFound();
  const development = process.env.NODE_ENV !== 'production';
  const posts = getAllPosts({ locale, includeDrafts: development, includeFuture: development }).filter((post) => post.tags.includes(tag.slug));
  return <BlogChrome><BlogHeader locale={locale} eyebrow={`TAG / ${tag.slug}`} title={tag.label} description={tag.description} /><section className="blog-list-wrapper"><div className="blog-list-inner"><BlogMonthList groups={groupPostsByMonth(posts, locale)} locale={locale} /></div></section></BlogChrome>;
}
