import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pinBlogPost, setPinnedFlag } from '../blog/pin.mjs';

const source = (date, title) => `---\ntitle: "${title}"\ndescription: "A concrete article description."\ndate: "${date}"\ntags: []\ndraft: false\n---\n\n## Content\n`;

test('pin script sets one bundle and clears other pinned flags', async () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-pin-'));
  try {
    mkdirSync(join(root, 'data'), { recursive: true });
    writeFileSync(join(root, 'data/blog-tags.yml'), '{}\n', 'utf8');
    const first = join(root, 'content/blog/2026/01/01/first');
    const second = join(root, 'content/blog/2026/01/02/second');
    mkdirSync(first, { recursive: true });
    mkdirSync(second, { recursive: true });
    writeFileSync(join(first, 'index.mdx'), `${setPinnedFlag(source('2026-01-01T10:00:00Z', 'First'), true)}`, 'utf8');
    writeFileSync(join(second, 'index.mdx'), source('2026-01-02T10:00:00Z', 'Second'), 'utf8');

    const result = await pinBlogPost({ root, selector: 'second' });
    assert.equal(result.changed, 2);
    assert.match(readFileSync(join(first, 'index.mdx'), 'utf8'), /^pinned: false$/m);
    assert.match(readFileSync(join(second, 'index.mdx'), 'utf8'), /^pinned: true$/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
