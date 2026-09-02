import type { Metadata } from 'next';
import { BlogChrome, BlogHeader } from '@/components/blog/BlogUI';
import { getBlogTags } from '@/lib/blog/taxonomy';
import { Link } from '@/i18n/config/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: 'Tags', description: 'Controlled topics used to organize field notes.', alternates: { canonical: `/${locale}/blog/tags` } };
}

export default async function BlogTagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tags = getBlogTags();
  return <BlogChrome><BlogHeader locale={locale} eyebrow="TAXONOMY" title="Tags" description="A small vocabulary keeps the archive useful as it grows." /><section className="blog-list-wrapper"><div className="blog-tag-grid">{tags.map((tag) => <Link className="blog-tag-card" href={`/blog/tags/${tag.slug}`} key={tag.slug}><span>{tag.slug}</span><h2>{tag.label}</h2><p>{tag.description}</p></Link>)}</div></section></BlogChrome>;
}
