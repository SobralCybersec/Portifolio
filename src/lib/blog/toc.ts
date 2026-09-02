import { slugify } from './slug';

export type BlogTocItem = { id: string; title: string; level: 2 | 3 };

export function getBlogToc(source: string): BlogTocItem[] {
  const counts = new Map<string, number>();
  return source.split('\n').flatMap((line) => {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) return [];
    const title = match[2].replace(/[`*_\[\]]/g, '').replace(/\([^)]*\)/g, '').trim();
    const base = slugify(title) || 'section';
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return [{ id: count ? `${base}-${count + 1}` : base, title, level: match[1].length as 2 | 3 }];
  });
}
