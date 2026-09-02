import matter from 'gray-matter';
import type { BlogPostMetadata } from './types';

export class BlogMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlogMetadataError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new BlogMetadataError(`"${key}" must be a non-empty string`);
  }
  return value.trim();
}

function optionalString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim()) {
    throw new BlogMetadataError(`"${key}" must be a non-empty string when provided`);
  }
  return value.trim();
}

function isoDate(data: Record<string, unknown>, key: string, required: boolean): string | undefined {
  const value = data[key];
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    throw new BlogMetadataError(`"${key}" must be a valid ISO 8601 datetime`);
  }
  return value;
}

export function parseBlogMetadata(source: string): { metadata: BlogPostMetadata; body: string } {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(source);
  } catch (error) {
    throw new BlogMetadataError(error instanceof Error ? error.message : 'Invalid YAML front matter');
  }

  const data = parsed.data as unknown;
  if (!isRecord(data)) throw new BlogMetadataError('front matter must be an object');

  const tags = data.tags;
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    throw new BlogMetadataError('"tags" must be an array of non-empty strings');
  }

  if (typeof data.draft !== 'boolean') throw new BlogMetadataError('"draft" must be boolean');
  if (data.pinned !== undefined && typeof data.pinned !== 'boolean') {
    throw new BlogMetadataError('"pinned" must be boolean when provided');
  }

  const date = isoDate(data, 'date', true) as string;
  const updated = isoDate(data, 'updated', false);
  const cover = optionalString(data, 'cover');
  const translationKey = optionalString(data, 'translationKey');

  return {
    metadata: {
      title: requiredString(data, 'title'),
      description: requiredString(data, 'description'),
      date,
      ...(updated ? { updated } : {}),
      tags: tags.map((tag) => tag.trim()),
      draft: data.draft,
      ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
      ...(cover ? { cover } : {}),
      ...(translationKey ? { translationKey } : {}),
    },
    body: parsed.content,
  };
}
