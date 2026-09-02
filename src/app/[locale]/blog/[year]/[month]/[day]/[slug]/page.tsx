import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogChrome, BlogChronology, BlogDate, BlogBackLink } from '@/components/blog/BlogUI';
import { BlogMdx } from '@/components/blog/BlogComponents';
import BlogToc from '@/components/blog/BlogToc';
import { getAdjacentPosts, getAllPosts, getPostByRoute, isPublicPost, readPostBody } from '@/lib/blog/content';
import { getBlogJsonLd, getBlogPostMetadata } from '@/lib/blog/seo';
import { getBlogToc } from '@/lib/blog/toc';
import { routing } from '@/i18n/config/routing';

type Params = { locale: string; year: string; month: string; day: string; slug: string };

function visibleQuery(locale: string) {
  const development = process.env.NODE_ENV !== 'production';
  return { locale, includeDrafts: development, includeFuture: development };
}

export function generateStaticParams() {
  const posts = getAllPosts({ includeDrafts: process.env.NODE_ENV !== 'production', includeFuture: process.env.NODE_ENV !== 'production' });
  return routing.locales.flatMap((locale) => posts.map((post) => ({ locale, year: post.year, month: post.month, day: post.day, slug: post.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, year, month, day, slug } = await params;
  const post = getPostByRoute(year, month, day, slug, visibleQuery(locale));
  return post ? getBlogPostMetadata(post, locale) : { title: 'Article not found' };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { locale, year, month, day, slug } = await params;
  const post = getPostByRoute(year, month, day, slug, visibleQuery(locale));
  if (!post) notFound();
  const body = readPostBody(post);
  const toc = getBlogToc(body);
  const posts = getAllPosts(visibleQuery(locale));
  const { previous, next } = getAdjacentPosts(post, posts.filter((candidate) => isPublicPost(candidate) || process.env.NODE_ENV !== 'production'));
  const jsonLd = JSON.stringify(getBlogJsonLd(post, locale)).replace(/</g, '\\u003c');
  return <BlogChrome><article className="blog-post-wrapper"><div className="blog-post-inner"><div className="blog-post-back-row"><BlogBackLink locale={locale} /></div><header className="blog-post-header"><div className="blog-post-meta-row"><BlogDate post={post} />{post.draft && <span className="blog-post-category">DRAFT</span>}</div><h1 className="blog-post-title">{post.title}</h1><p className="blog-post-description">{post.description}</p><div className="blog-post-tags" aria-label="Article tags">{post.tags.map((tag) => <span className="blog-post-category" key={tag}>{tag}</span>)}</div>{post.cover && <div className="blog-post-cover"><Image src={post.cover} alt={post.title} fill sizes="(max-width: 800px) 100vw, 800px" priority /></div>}</header><div className="blog-post-layout"><BlogToc items={toc} /><div className="blog-post-body"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /><div className="blog-post-content"><BlogMdx source={body} /></div></div></div><BlogChronology current={post} previous={previous} next={next} locale={locale} /></div></article></BlogChrome>;
}
