import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Rss } from 'lucide-react';
import { Link as LocalizedLink } from '@/i18n/config/routing';
import type { BlogMonthGroup, BlogPost } from '@/lib/blog/types';
import Navigation from '@/components/layout/Navigation';

export function BlogChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="page-grid-overlay" aria-hidden="true" />
      <main className="blog-page-wrapper">{children}</main>
    </>
  );
}

export function BlogHeader({ locale, title, description, eyebrow = 'FIELD NOTES' }: {
  locale: string;
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <header className="blog-hero-section">
      <div className="blog-hero-inner">
        <p className="blog-hero-eyebrow">{eyebrow} / {locale.toUpperCase()}</p>
        <h1 className="blog-hero-title">{title}</h1>
        <p className="blog-hero-subtitle">{description}</p>
        <nav className="blog-subnav" aria-label="Blog navigation">
          <LocalizedLink href="/blog">Posts</LocalizedLink>
          <LocalizedLink href="/blog/archive">Archive</LocalizedLink>
          <LocalizedLink href="/blog/tags">Tags</LocalizedLink>
          <LocalizedLink href="/blog/rss.xml" prefetch={false}>RSS <Rss size={13} aria-hidden="true" /></LocalizedLink>
        </nav>
      </div>
    </header>
  );
}

export function BlogCard({ post, locale, index = 0 }: { post: BlogPost; locale: string; index?: number }) {
  return (
    <LocalizedLink
      href={post.route}
      className={`blog-article-row${index === 0 ? ' blog-article-row-first' : ''}`}
    >
      <article className="blog-article-content">
        <div className="blog-article-meta">
          <time className="blog-article-date" dateTime={post.date}>
            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(post.date))}
          </time>
          {post.pinned && <span className="blog-article-tag">PINNED</span>}
          <ArrowRight className="blog-article-arrow" aria-hidden="true" />
        </div>
        <h2 className="blog-article-title">{post.title}</h2>
        <p className="blog-article-desc">{post.description}</p>
        <div className="blog-article-footer">
          {post.tags.slice(0, 3).map((tag) => <span className="blog-article-tag" key={tag}>{tag}</span>)}
          <span className="blog-article-read"><Clock3 size={14} aria-hidden="true" /> {post.tags.length} topics</span>
        </div>
      </article>
    </LocalizedLink>
  );
}

export function BlogMonthList({ groups, locale }: { groups: BlogMonthGroup[]; locale: string }) {
  return (
    <div className="blog-month-list">
      {groups.map((group) => (
        <section key={group.key} className="blog-month-group" aria-labelledby={`month-${group.key}`}>
          <div className="blog-month-heading">
            <h2 id={`month-${group.key}`}><span>{group.label}</span> <time dateTime={`${group.key}-01`}>{group.year}</time></h2>
            <span>{String(group.posts.length).padStart(2, '0')} POSTS</span>
          </div>
          {group.posts.map((post, index) => <BlogCard key={post.route} post={post} locale={locale} index={index} />)}
        </section>
      ))}
    </div>
  );
}

export function BlogChronology({ current, previous, next, locale }: {
  current: BlogPost;
  previous?: BlogPost;
  next?: BlogPost;
  locale: string;
}) {
  return (
    <nav className="blog-chronology" aria-label="Article chronology">
      {previous ? <LocalizedLink href={previous.route}><ArrowLeft size={16} aria-hidden="true" /><span><small>OLDER ARTICLE</small>{previous.title}</span></LocalizedLink> : <span />}
      {next ? <LocalizedLink href={next.route}><span className="blog-chronology__next"><small>NEWER ARTICLE</small>{next.title}</span><ArrowRight size={16} aria-hidden="true" /></LocalizedLink> : <span />}
      <span className="sr-only">Current article: {current.title}</span>
    </nav>
  );
}

export function BlogBackLink({ locale }: { locale: string }) {
  return <LocalizedLink className="blog-post-back" href="/blog"><ArrowLeft size={16} aria-hidden="true" /> Back to field notes</LocalizedLink>;
}

export function BlogExternalReference({ href, label }: { href: string; label: string }) {
  return <Link className="blog-external-reference" href={href} target="_blank" rel="noopener noreferrer">{label}</Link>;
}

export function BlogDate({ post }: { post: BlogPost }) {
  return <span className="blog-post-date"><CalendarDays size={14} aria-hidden="true" /> <time dateTime={post.date}>{new Intl.DateTimeFormat(post.locale, { dateStyle: 'long' }).format(new Date(post.date))}</time></span>;
}
