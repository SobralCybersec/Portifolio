import type { Metadata } from 'next';
import { BlogChrome, BlogHeader } from '@/components/blog/BlogUI';
import BlogSearch from '@/components/blog/BlogSearch';
import { getAllPosts, groupPostsByMonth, readPostBody } from '@/lib/blog/content';
import { SITE_NAME } from '@/lib/seo/seo';
import { routing } from '@/i18n/config/routing';

const COPY: Record<string, { title: string; description: string }> = {
  pt: { title: 'Field Notes', description: 'Notas sobre engenharia de software, interfaces, performance e segurança.' },
  en: { title: 'Field Notes', description: 'Notes on software engineering, interfaces, performance and security.' },
};

const SEARCH_COPY: Record<string, { placeholder: string; empty: string; stack: string; allStack: string }> = {
  pt: { placeholder: 'Título, resumo, tag ou conteúdo', empty: 'Nenhum post encontrado para esta busca.', stack: 'Stack', allStack: 'Todas as tecnologias' },
  en: { placeholder: 'Title, summary, tag or post content', empty: 'No posts found for this search.', stack: 'Stack', allStack: 'All Technologies' },
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
  const search = SEARCH_COPY[locale] ?? SEARCH_COPY.en;
  const searchablePosts = posts.map((post) => ({ ...post, searchText: readPostBody(post) }));
  return <BlogChrome><BlogHeader locale={locale} title={text.title} description={text.description} /><section className="blog-list-wrapper" aria-label="Blog posts"><div className="blog-list-inner"><BlogSearch groups={groupPostsByMonth(searchablePosts, locale)} locale={locale} placeholder={search.placeholder} emptyMessage={search.empty} stackLabel={search.stack} allStackLabel={search.allStack} /></div></section></BlogChrome>;
}
