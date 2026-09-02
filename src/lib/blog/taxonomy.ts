import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { BlogTag } from './types';

const TAXONOMY_PATH = path.resolve(process.cwd(), 'data/blog-tags.yml');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function getBlogTags(filePath = TAXONOMY_PATH): BlogTag[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(`---\n${raw}\n---`).data as unknown;
  if (!isRecord(parsed)) return [];

  return Object.entries(parsed).flatMap(([slug, value]) => {
    if (!isRecord(value)) return [];
    const aliases = Array.isArray(value.aliases)
      ? value.aliases.filter((alias): alias is string => typeof alias === 'string').map((alias) => alias.trim())
      : [];
    const kind = value.kind === 'project' ? 'project' : 'topic';
    return [{
      slug,
      label: stringValue(value.label, slug),
      description: stringValue(value.description, `Posts tagged ${slug}.`),
      aliases,
      kind,
    } satisfies BlogTag];
  });
}

export function getBlogTag(slug: string, filePath?: string): BlogTag | undefined {
  return getBlogTags(filePath).find((tag) => tag.slug === slug);
}

export function suggestBlogTag(value: string, filePath?: string): string | undefined {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const tags = getBlogTags(filePath);
  return tags.find((tag) => tag.aliases.includes(value.toLowerCase()))?.slug
    ?? tags.find((tag) => tag.slug.replace(/-/g, '') === normalized)?.slug;
}
