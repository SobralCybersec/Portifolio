import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

export async function generateStaticParams() {
  const posts = getAllPosts('en');
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} — Blog`,
    description: post.description,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  return <BlogPostClient post={post} />;
}
