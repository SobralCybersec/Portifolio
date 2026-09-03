import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getAdjacentPosts, getAllPosts, groupPostsByMonth } from '../content';
import { BlogMetadataError, parseBlogMetadata } from '../schema';

const valid = `---\ntitle: Test article\ndescription: A concrete description long enough for editorial validation.\ndate: "2026-01-02T10:00:00-03:00"\ntags:\n  - nextjs\ndraft: false\n---\n\n## Heading\n\nBody.`;

function writePost(root: string, date: string, slug: string, extra = '') {
  const directory = join(root, 'blog', date.slice(0, 4), date.slice(5, 7), date.slice(8, 10), slug);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.mdx'), valid.replace('2026-01-02T10:00:00-03:00', date).replace('Test article', slug) + extra);
}

test('parses valid front matter and body', () => {
  const result = parseBlogMetadata(valid);
  expect(result.metadata.title).toBe('Test article');
  expect(result.metadata.tags).toEqual(['nextjs']);
  expect(result.body).toContain('## Heading');
});

test('rejects invalid front matter', () => {
  expect(() => parseBlogMetadata(valid.replace('draft: false', 'draft: yes'))).toThrow(BlogMetadataError);
  expect(() => parseBlogMetadata(valid.replace('date: "2026-01-02T10:00:00-03:00"', 'date: yesterday'))).toThrow('ISO 8601');
});

test('filters drafts and future posts, sorts, groups months, and finds chronology', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-content-'));
  try {
    writePost(root, '2026-01-02T10:00:00-03:00', 'newer');
    writePost(root, '2025-12-31T10:00:00-03:00', 'older');
    writePost(root, '2026-02-01T10:00:00-03:00', 'future', '\n\n<!-- future -->');
    const futurePath = join(root, 'blog/2026/02/01/future/index.mdx');
    writeFileSync(futurePath, readFileSync(futurePath, 'utf8').replace('draft: false', 'draft: true'));
    const posts = getAllPosts({ now: new Date('2026-01-10T00:00:00Z') }, join(root, 'blog'));
    expect(posts.map((post) => post.slug)).toEqual(['newer', 'older']);
    expect(groupPostsByMonth(posts, 'en-US').map((group) => group.key)).toEqual(['2026-01', '2025-12']);
    expect(getAdjacentPosts(posts[0], posts).previous?.slug).toBe('older');
    expect(getAdjacentPosts(posts[1], posts).next?.slug).toBe('newer');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('selects localized siblings and falls back to Portuguese', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-locale-'));
  try {
    writePost(root, '2026-01-02T10:00:00-03:00', 'localized');
    const directory = join(root, 'blog/2026/01/02/localized');
    writeFileSync(join(directory, 'index.en.mdx'), readFileSync(join(directory, 'index.mdx'), 'utf8').replace('title: localized', 'title: Localized English'));
    writeFileSync(join(directory, 'index.de.mdx'), readFileSync(join(directory, 'index.mdx'), 'utf8').replace('title: localized', 'title: Lokalisierter Beitrag'));
    expect(getAllPosts({ locale: 'de' }, join(root, 'blog'))[0].title).toBe('Lokalisierter Beitrag');
    expect(getAllPosts({ locale: 'fr' }, join(root, 'blog'))[0].title).toBe('localized');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
