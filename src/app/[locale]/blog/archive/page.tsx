import type { Metadata } from 'next';
import { BlogChrome, BlogHeader, BlogMonthList } from '@/components/blog/BlogUI';
import { getAllPosts, groupPostsByMonth } from '@/lib/blog/content';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: 'Archive', description: 'Chronological archive of published field notes.', alternates: { canonical: `/${locale}/blog/archive` } };
}

export default async function BlogArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const development = process.env.NODE_ENV !== 'production';
  const posts = getAllPosts({ locale, includeDrafts: development, includeFuture: development });
  return <BlogChrome><BlogHeader locale={locale} eyebrow="ARCHIVE" title="Archive" description="Every note, grouped by the month it entered the record." /><section className="blog-list-wrapper" aria-label="Blog archive"><div className="blog-list-inner"><BlogMonthList groups={groupPostsByMonth(posts, locale)} locale={locale} /></div></section></BlogChrome>;
}
