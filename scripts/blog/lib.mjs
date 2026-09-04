import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, watch } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';

export const ROOT = process.cwd();
export const CONTENT_ROOT = resolve(ROOT, 'content/blog');
export const PUBLIC_ROOT = resolve(ROOT, 'public');
export const TAXONOMY_PATH = resolve(ROOT, 'data/blog-tags.yml');
export const EDITORIAL_PATHS = ['content/blog', 'public/blog', 'data/blog-tags.yml'];
export const DEBOUNCE_MS = 30_000;
export const BLOG_LOCALES = ['pt', 'en', 'de', 'es', 'fr', 'ja', 'zh'];
const LANGUAGE_MARKERS = {
  en: ['the', 'and', 'with', 'from', 'this', 'that', 'is', 'are', 'how', 'what', 'was', 'were', 'you', 'your', 'not'],
  de: ['der', 'die', 'das', 'und', 'ist', 'mit', 'für', 'ein', 'eine', 'einer', 'den', 'dem', 'nicht', 'ich', 'sie'],
  es: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'es', 'son', 'cómo', 'más', 'sin', 'sobre', 'esta', 'está'],
  fr: ['le', 'la', 'les', 'des', 'un', 'une', 'et', 'est', 'avec', 'pour', 'sans', 'mais', 'qui', 'cette', 'dans', 'sur'],
};
const PORTUGUESE_MARKERS = new Set([
  'não', 'uma', 'tão', 'estava', 'porém', 'decidi', 'cheguei', 'havia', 'ficar', 'ficou',
  'ficando', 'meu', 'minha', 'meus', 'minhas', 'portfólio', 'portifólio', 'imagens',
  'diversas', 'graças', 'louco', 'sofrimento', 'desconsiderando', 'tive', 'tenho',
  'veio', 'enquanto', 'qualquer', 'assim', 'atualmente', 'novamente', 'situação',
  'afins',
]);
const BLOG_FILENAMES = BLOG_LOCALES.map((locale) => locale === 'pt' ? 'index.mdx' : `index.${locale}.mdx`);
const BLOG_FILE_RE = /^index(?:\.[a-z]{2})?\.mdx$/;

export function isLikelyTranslation(text, locale) {
  if (locale === 'pt' || !BLOG_LOCALES.includes(locale)) return true;
  const normalized = text.normalize('NFKC').toLocaleLowerCase();
  if (locale === 'ja') return /[\u3040-\u30ff]/u.test(normalized);
  if (locale === 'zh') return /[\u4e00-\u9fff]/u.test(normalized) && !/[\u3040-\u30ff]/u.test(normalized);
  const words = normalized.match(/\p{L}+/gu) ?? [];
  if (words.length < 3) return true;
  const markers = new Set(LANGUAGE_MARKERS[locale] ?? []);
  const matches = words.filter((word) => markers.has(word)).length;
  const portugueseMatches = words.filter((word) => PORTUGUESE_MARKERS.has(word)).length;
  return portugueseMatches < 2 && matches >= 2;
}

const BUNDLE_RE = /^(\d{4})\/(\d{2})\/(\d{2})\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T/;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function slugify(value) {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
}

function parseYaml(raw) {
  try {
    const data = matter(`---\n${raw}\n---`).data;
    return isRecord(data) ? data : {};
  } catch {
    return {};
  }
}

function walk(root) {
  if (!existsSync(root)) return [];
  const result = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && BLOG_FILE_RE.test(entry.name))) result.push(current);
    for (const entry of entries) if (entry.isDirectory()) pending.push(join(current, entry.name));
  }
  return result.sort();
}

function parseFile(sourcePath) {
  try {
    const parsed = matter(readFileSync(sourcePath, 'utf8'));
    return { parsed, data: isRecord(parsed.data) ? parsed.data : null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid YAML front matter' };
  }
}

function contentHash(sourcePath) {
  return createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
}

function validateFile(sourcePath, data, issues) {
  const display = relative(ROOT, sourcePath).split(sep).join('/');
  for (const key of ['title', 'description']) if (typeof data[key] !== 'string' || !data[key].trim()) issues.push({ file: display, rule: `${key} is required`, value: data[key] });
  if (typeof data.description === 'string' && (data.description.length < 20 || data.description === 'Artigo sobre tecnologia.')) issues.push({ file: display, rule: 'description must be a concrete summary of at least 20 characters', value: data.description });
  if (typeof data.date !== 'string' || !ISO_RE.test(data.date) || Number.isNaN(Date.parse(data.date))) issues.push({ file: display, rule: 'date must be a valid ISO 8601 datetime', value: data.date });
  if (data.updated !== undefined && (typeof data.updated !== 'string' || !ISO_RE.test(data.updated) || Number.isNaN(Date.parse(data.updated)))) issues.push({ file: display, rule: 'updated must be a valid ISO 8601 datetime', value: data.updated });
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) issues.push({ file: display, rule: 'tags must be an array of strings', value: data.tags });
  if (typeof data.draft !== 'boolean') issues.push({ file: display, rule: 'draft must be boolean', value: data.draft });
  if (data.pinned !== undefined && typeof data.pinned !== 'boolean') issues.push({ file: display, rule: 'pinned must be boolean', value: data.pinned });
  if (data.cover !== undefined && typeof data.cover !== 'string') issues.push({ file: display, rule: 'cover must be a string', value: data.cover });
  if (data.translationKey !== undefined && (typeof data.translationKey !== 'string' || !data.translationKey.trim())) issues.push({ file: display, rule: 'translationKey must be a non-empty string', value: data.translationKey });
}

function loadTaxonomy(taxonomyPath) {
  if (!existsSync(taxonomyPath)) return { tags: new Set(), aliases: new Map() };
  const data = parseYaml(readFileSync(taxonomyPath, 'utf8'));
  const tags = new Set(Object.keys(data));
  const aliases = new Map();
  for (const [slug, value] of Object.entries(data)) {
    if (!isRecord(value) || !Array.isArray(value.aliases)) continue;
    for (const alias of value.aliases) if (typeof alias === 'string') aliases.set(alias.toLowerCase(), slug);
  }
  return { tags, aliases };
}

export async function validateBlog({ root = ROOT, now = new Date() } = {}) {
  const contentRoot = resolve(root, 'content/blog');
  const publicRoot = resolve(root, 'public');
  const taxonomyPath = resolve(root, 'data/blog-tags.yml');
  const localTaxonomy = loadTaxonomy(taxonomyPath);
  const issues = [];
  const bundles = [];
  if (!existsSync(taxonomyPath)) issues.push({ file: 'data/blog-tags.yml', rule: 'taxonomy file exists', value: taxonomyPath });
  for (const bundlePath of walk(contentRoot)) {
    const relativeBundle = relative(contentRoot, bundlePath).split(sep).join('/');
    const match = BUNDLE_RE.exec(relativeBundle);
    if (!match) { issues.push({ file: relativeBundle, rule: 'bundle path must be YYYY/MM/DD/slug', value: relativeBundle }); continue; }
    const [, year, month, day, slug] = match;
    const names = readdirSync(bundlePath).filter((name) => BLOG_FILE_RE.test(name));
    if (names.some((name) => !BLOG_FILENAMES.includes(name))) issues.push({ file: relativeBundle, rule: `bundle may contain only ${BLOG_FILENAMES.join(', ')}`, value: names });
    const files = [];
    for (const locale of BLOG_LOCALES) {
      const filename = locale === 'pt' ? 'index.mdx' : `index.${locale}.mdx`;
      const sourcePath = join(bundlePath, filename);
      if (!existsSync(sourcePath)) continue;
      const parsed = parseFile(sourcePath);
      const display = relative(ROOT, sourcePath).split(sep).join('/');
      if (parsed.error || !parsed.data || !parsed.parsed) { issues.push({ file: display, rule: 'front matter and YAML are valid', value: parsed.error ?? 'front matter must be an object' }); continue; }
      validateFile(sourcePath, parsed.data, issues);
      if (typeof parsed.data.date === 'string' && parsed.data.date.slice(0, 10) !== `${year}-${month}-${day}`) issues.push({ file: display, rule: 'date must match YYYY/MM/DD bundle path', value: parsed.data.date });
      if (Array.isArray(parsed.data.tags)) for (const tag of parsed.data.tags) if (typeof tag === 'string' && !localTaxonomy.tags.has(tag)) issues.push({ file: display, rule: `tag must be canonical${localTaxonomy.aliases.has(tag.toLowerCase()) ? `; use "${localTaxonomy.aliases.get(tag.toLowerCase())}"` : ''}`, value: tag });
      if (typeof parsed.data.cover === 'string' && parsed.data.cover.startsWith('/')) { const coverPath = resolve(publicRoot, parsed.data.cover.slice(1)); if (!existsSync(coverPath)) issues.push({ file: display, rule: 'declared local cover exists', value: parsed.data.cover }); }
      if (/!\[\s*\]\(/.test(parsed.parsed.content) || /<img\b(?![^>]*\balt\s*=)/i.test(parsed.parsed.content)) issues.push({ file: display, rule: 'content images need alt text', value: 'missing alt' });
      try { await compile(parsed.parsed.content, { remarkPlugins: [remarkGfm] }); } catch (error) { issues.push({ file: display, rule: 'MDX compiles', value: error instanceof Error ? error.message : 'compile error' }); }
      if (locale !== 'pt' && !isLikelyTranslation(`${parsed.data.title}\n${parsed.data.description}\n${parsed.parsed.content}`, locale)) issues.push({ file: display, rule: `${locale} translation language mismatch; run pnpm blog:translate --stale`, value: locale });
      files.push({ locale, sourcePath, data: parsed.data });
    }
    if (!files.some((file) => file.locale === 'pt')) issues.push({ file: relativeBundle, rule: 'index.mdx exists', value: 'missing' });
    const portuguese = files.find((file) => file.locale === 'pt');
    if (portuguese) {
      const expectedHash = contentHash(portuguese.sourcePath);
      for (const localized of files.filter((file) => file.locale !== 'pt')) {
        if (localized.data.translationKey !== portuguese.data.translationKey) issues.push({ file: relativeBundle, rule: `${localized.locale} translationKey matches source`, value: [portuguese.data.translationKey, localized.data.translationKey] });
        const translation = localized.data.translation;
        if (!isRecord(translation) || translation.sourceLocale !== 'pt-BR' || translation.sourceHash !== expectedHash) {
          issues.push({ file: relativeBundle, rule: `${localized.locale} translation is stale; run pnpm blog:translate --stale`, value: translation?.sourceHash ?? 'missing sourceHash' });
        }
      }
    }
    bundles.push({ route: `/blog/${relativeBundle}`, slug, year, month, day, files });
  }
  const seen = new Map();
  for (const bundle of bundles) { if (seen.has(bundle.route)) issues.push({ file: bundle.route, rule: 'route is unique', value: seen.get(bundle.route) }); else seen.set(bundle.route, bundle.slug); }
  const current = now.getTime();
  const visible = bundles.flatMap((bundle) => bundle.files.filter((file) => file.locale === 'pt').map((file) => ({ bundle, data: file.data }))).filter(({ data }) => data.draft === false && typeof data.date === 'string' && Date.parse(data.date) <= current);
  return { issues, bundles, visible };
}

function git(args, root = ROOT) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return { ...result, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

export function editorialStatus(root = ROOT) {
  return git(['status', '--porcelain', '--untracked-files=all', '--', ...EDITORIAL_PATHS], root).stdout.trim();
}

export async function publishBlog({ root = ROOT, push = true } = {}) {
  const result = await validateBlog({ root });
  if (result.issues.length) throw new Error(result.issues.map((issue) => `${issue.file}: ${issue.rule} (${JSON.stringify(issue.value)})`).join('\n'));
  const status = editorialStatus(root);
  if (!status) return { published: false, reason: 'no editorial changes' };
  const add = git(['add', '--all', '--', ...EDITORIAL_PATHS], root);
  if (add.status !== 0) throw new Error(add.stderr || 'git add failed');
  const staged = git(['diff', '--cached', '--name-only', '--', ...EDITORIAL_PATHS], root).stdout.trim().split('\n').filter(Boolean);
  if (!staged.length) return { published: false, reason: 'no staged editorial changes' };
  const slugs = [...new Set(staged.map((file) => /content\/blog\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/.exec(file)?.[1]).filter(Boolean))];
  const message = slugs.length === 1 ? `blog: update ${slugs[0]}` : 'blog: update content';
  const commit = git(['commit', '-m', message, '--', ...EDITORIAL_PATHS], root);
  if (commit.status !== 0) throw new Error(commit.stderr || 'git commit failed');
  if (push) {
    const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'], root);
    if (upstream.status !== 0 || !upstream.stdout.trim()) throw new Error('No Git upstream configured; commit preserved, push skipped.');
    const pushed = git(['push'], root);
    if (pushed.status !== 0) throw new Error(pushed.stderr || 'git push failed; commit preserved.');
  }
  return { published: true, message, staged, pushed: push };
}

export function watchEditorial(onChange, root = ROOT) {
  const watchers = [];
  const watched = new Set();
  const watchTree = (directory) => {
    if (!existsSync(directory) || watched.has(directory)) return;
    watched.add(directory);
    watchers.push(watch(directory, (event, name) => {
      const entryName = name ? String(name) : '';
      onChange(entryName || directory);
      if (event === 'rename' && entryName) watchTree(join(directory, entryName));
    }));
    for (const entry of readdirSync(directory, { withFileTypes: true })) if (entry.isDirectory()) watchTree(join(directory, entry.name));
  };
  watchTree(resolve(root, 'content/blog'));
  watchTree(resolve(root, 'public/blog'));
  const dataDirectory = resolve(root, 'data');
  if (existsSync(dataDirectory)) watchers.push(watch(dataDirectory, (_event, name) => onChange(name ? String(name) : 'data')));
  return () => watchers.forEach((current) => current.close());
}
