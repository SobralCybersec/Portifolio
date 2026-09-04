import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { publishBlog, validateBlog } from '../blog/lib.mjs';
import { promoteDraft, promoteDrafts } from '../blog/validate.mjs';

const rootDir = resolve(import.meta.dirname, '../..');
const taxonomy = readFileSync(join(rootDir, 'data/blog-tags.yml'), 'utf8');

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'blog-git-'));
  mkdirSync(join(root, 'content/blog/2026/01/02/test-article'), { recursive: true });
  mkdirSync(join(root, 'public/blog/2026/01/02/test-article'), { recursive: true });
  mkdirSync(join(root, 'data'), { recursive: true });
  mkdirSync(join(root, 'app'), { recursive: true });
  writeFileSync(join(root, 'data/blog-tags.yml'), taxonomy);
writeFileSync(join(root, 'content/blog/2026/01/02/test-article/index.mdx'), `---\ntitle: Test article\ndescription: A concrete article description for validation and isolation tests.\ndate: "2026-01-02T10:00:00-03:00"\ntags:\n  - nextjs\ndraft: false\n---\n\n## Test\n\nBody.`);
  writeFileSync(join(root, 'app/page.tsx'), 'export default function Page() { return null; }\n');
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Blog Test'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'initial'], { cwd: root });
  return root;
}

test('blog validator reports unknown tags and date/path mismatch', async () => {
  const root = makeRepo();
  try {
    const file = join(root, 'content/blog/2026/01/02/test-article/index.mdx');
    writeFileSync(file, readFileSync(file, 'utf8').replace('2026-01-02', '2026-02-02').replace('nextjs', 'next-js'));
    const result = await validateBlog({ root, now: new Date('2026-03-01T00:00:00Z') });
    assert.ok(result.issues.some((issue) => issue.rule.includes('canonical')));
    assert.ok(result.issues.some((issue) => issue.rule.includes('YYYY/MM/DD')));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('blog validator promotes draft files and is idempotent', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-draft-'));
  try {
    const file = join(root, 'index.mdx');
    const source = '---\ntitle: Draft\ndraft: true\n---\n\nBody.\n';
    writeFileSync(file, source, 'utf8');
    const result = { bundles: [{ files: [{ sourcePath: file, data: { draft: true } }] }] };
    assert.equal(promoteDrafts(result), 1);
    const promoted = readFileSync(file, 'utf8');
    assert.match(promoted, /^draft: false$/mu);
    assert.equal(promoteDraft(promoted), promoted);
    assert.equal(promoteDrafts({ bundles: [{ files: [{ sourcePath: file, data: { draft: false } }] }] }), 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('publisher commits only editorial paths and preserves external staging', async () => {
  const root = makeRepo();
  try {
    writeFileSync(join(root, 'app/page.tsx'), 'export default function Page() { return <main />; }\n');
    execFileSync('git', ['add', 'app/page.tsx'], { cwd: root });
    writeFileSync(join(root, 'content/blog/2026/01/02/test-article/index.mdx'), `${readFileSync(join(root, 'content/blog/2026/01/02/test-article/index.mdx'), 'utf8')}\nUpdated.`);
    writeFileSync(join(root, 'public/blog/2026/01/02/test-article/image.webp'), 'fixture');
    const result = await publishBlog({ root, push: false });
    assert.equal(result.published, true);
    const committed = execFileSync('git', ['show', '--format=', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' });
    assert.match(committed, /content\/blog\/2026\/01\/02\/test-article\/index.mdx/);
    assert.match(committed, /public\/blog\/2026\/01\/02\/test-article\/image.webp/);
    assert.doesNotMatch(committed, /app\/page\.tsx/);
    const staged = execFileSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8' });
    assert.equal(staged.trim(), 'app/page.tsx');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('blog:new creates portable Typora paths and refuses collisions', () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-new-'));
  try {
    const script = join(rootDir, 'scripts/blog/new.mjs');
    const first = spawnSync(process.execPath, [script, 'Como consegui 100 no Lighthouse'], { cwd: root, encoding: 'utf8' });
    assert.equal(first.status, 0, first.stderr);
    const files = execFileSync('find', ['content/blog', '-name', 'index.mdx'], { cwd: root, encoding: 'utf8' }).trim();
    assert.match(files, /como-consegui-100-no-lighthouse\/index\.mdx/);
    const content = readFileSync(join(root, files), 'utf8');
    assert.match(content, /typora-copy-images-to:/);
    assert.doesNotMatch(content, /\/home\//);
    const second = spawnSync(process.execPath, [script, 'Como consegui 100 no Lighthouse'], { cwd: root, encoding: 'utf8' });
    assert.notEqual(second.status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
