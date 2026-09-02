import fs from 'node:fs';
import path from 'node:path';
import { parseBlogMetadata } from './schema';
import type { BlogMonthGroup, BlogPost, BlogPostMetadata, BlogQuery } from './types';

export const BLOG_CONTENT_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), 'content', 'blog');
const BUNDLE_RE = /^(\d{4})\/(\d{2})\/(\d{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

type BundleFile = { locale: string; sourcePath: string; metadata: BlogPostMetadata };
type BlogBundle = {
  year: string;
  month: string;
  day: string;
  slug: string;
  route: string;
  files: BundleFile[];
};

export function isPublicPost(post: BlogPost, now = new Date()): boolean {
  return !post.draft && new Date(post.date).getTime() <= now.getTime();
}

function collectBundleDirectories(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const result: string[] = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop() as string;
    for (const entry of fs.readdirSync(/* turbopackIgnore: true */ current, { withFileTypes: true })) {
      const target = path.join(/* turbopackIgnore: true */ current, entry.name);
      if (entry.isDirectory()) pending.push(target);
    }
    const files = fs.readdirSync(/* turbopackIgnore: true */ current);
    if (files.includes('index.mdx') || files.includes('index.en.mdx')) result.push(current);
  }
  return result.sort();
}

function parseBundle(bundlePath: string, contentRoot: string): BlogBundle {
  const relative = path.relative(contentRoot, bundlePath).split(path.sep).join('/');
  const match = BUNDLE_RE.exec(relative);
  if (!match) throw new Error(`Invalid blog bundle path: ${relative}`);

  const [, year, month, day, slug] = match;
  const files: BundleFile[] = [];
  for (const [locale, filename] of [['pt', 'index.mdx'], ['en', 'index.en.mdx']] as const) {
    const sourcePath = path.join(/* turbopackIgnore: true */ bundlePath, filename);
    if (!fs.existsSync(/* turbopackIgnore: true */ sourcePath)) continue;
    const { metadata } = parseBlogMetadata(fs.readFileSync(/* turbopackIgnore: true */ sourcePath, 'utf8'));
    files.push({ locale, sourcePath, metadata });
  }
  if (!files.some((file) => file.locale === 'pt')) throw new Error(`Missing index.mdx in ${relative}`);
  return { year, month, day, slug, route: `/blog/${relative}`, files };
}

function discoverBundles(contentRoot: string): BlogBundle[] {
  return collectBundleDirectories(contentRoot).map((bundlePath) => parseBundle(bundlePath, contentRoot));
}

function selectedFile(bundle: BlogBundle, locale: string): BundleFile {
  return bundle.files.find((file) => file.locale === locale) ?? bundle.files.find((file) => file.locale === 'pt') as BundleFile;
}

function toPost(bundle: BlogBundle, locale: string): BlogPost {
  const selected = selectedFile(bundle, locale);
  return {
    ...selected.metadata,
    year: bundle.year,
    month: bundle.month,
    day: bundle.day,
    slug: bundle.slug,
    route: bundle.route,
    sourcePath: selected.sourcePath,
    locale: selected.locale,
  };
}

export function getAllPosts(query: BlogQuery = {}, contentRoot = BLOG_CONTENT_ROOT): BlogPost[] {
  const now = query.now ?? new Date();
  return discoverBundles(contentRoot)
    .map((bundle) => toPost(bundle, query.locale ?? 'pt'))
    .filter((post) => query.includeDrafts || !post.draft)
    .filter((post) => query.includeFuture || new Date(post.date).getTime() <= now.getTime())
    .sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return Date.parse(b.date) - Date.parse(a.date);
    });
}

export function getPostByRoute(
  year: string,
  month: string,
  day: string,
  slug: string,
  query: BlogQuery = {},
  contentRoot = BLOG_CONTENT_ROOT,
): BlogPost | undefined {
  return getAllPosts(query, contentRoot).find(
    (post) => post.year === year && post.month === month && post.day === day && post.slug === slug,
  );
}

export function readPostBody(post: BlogPost): string {
  const source = fs.readFileSync(/* turbopackIgnore: true */ post.sourcePath, 'utf8');
  return parseBlogMetadata(source).body;
}

export function groupPostsByMonth(posts: BlogPost[], locale = 'pt-BR'): BlogMonthGroup[] {
  const groups = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const key = `${post.year}-${post.month}`;
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }
  return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([key, grouped]) => {
    const [year, month] = key.split('-');
    const label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(`${year}-${month}-01T00:00:00Z`));
    return { key, year, month, label: `${label[0].toUpperCase()}${label.slice(1)}`, posts: grouped };
  });
}

export function getAdjacentPosts(current: BlogPost, posts: BlogPost[]): { previous?: BlogPost; next?: BlogPost } {
  const index = posts.findIndex((post) => post.route === current.route);
  if (index < 0) return {};
  return { previous: posts[index + 1], next: posts[index - 1] };
}

export function getBlogRoute(post: BlogPost, locale: string): string {
  return `/${locale}${post.route}`;
}
