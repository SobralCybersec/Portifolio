import type { Metadata } from 'next';
import { BlogChrome, BlogHeader, BlogMonthList } from '@/components/blog/BlogUI';
import { getAllPosts, groupPostsByMonth } from '@/lib/blog/content';
import { SITE_NAME } from '@/lib/seo/seo';
import { routing } from '@/i18n/config/routing';

const COPY: Record<string, { title: string; description: string }> = {
  pt: { title: 'Field Notes', description: 'Notas sobre engenharia de software, interfaces, performance e segurança.' },
  en: { title: 'Field Notes', description: 'Notes on software engineering, interfaces, performance and security.' },
};

function copy(locale: string) { return COPY[locale] ?? COPY.en; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const text = copy(locale);
  return { title: text.title, description: text.description, alternates: { canonical: `/${locale}/blog` }, openGraph: { type: 'website', siteName: SITE_NAME, title: text.title, description: text.description, url: `/${locale}/blog` } };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const development = process.env.NODE_ENV !== 'production';
  const posts = getAllPosts({ locale, includeDrafts: development, includeFuture: development });
  const text = copy(locale);
  return <BlogChrome><BlogHeader locale={locale} title={text.title} description={text.description} /><section className="blog-list-wrapper" aria-label="Blog posts"><div className="blog-list-inner"><BlogMonthList groups={groupPostsByMonth(posts, locale)} locale={locale} /></div></section></BlogChrome>;
}
