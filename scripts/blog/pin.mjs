import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBlog, ROOT } from './lib.mjs';

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/;

export function setPinnedFlag(source, pinned) {
  const match = FRONTMATTER_RE.exec(source);
  if (!match) throw new Error('Blog post must start with YAML front matter.');
  const value = `pinned: ${pinned}`;
  const header = /^pinned:[ \t]*(?:true|false)[ \t]*$/mu.test(match[0])
    ? match[0].replace(/^pinned:[ \t]*(?:true|false)[ \t]*$/mu, value)
    : match[0].replace(/^draft:/mu, `${value}\ndraft:`);
  return `${source.slice(0, match.index)}${header}${source.slice(match.index + match[0].length)}`;
}

function sourceHash(source) {
  return createHash('sha256').update(source).digest('hex');
}

function setTranslationHash(source, hash) {
  const match = FRONTMATTER_RE.exec(source);
  if (!match || !/^  sourceHash:[ \t]*(?:"[^"]*"|'[^']*'|[^\r\n]*)[ \t]*$/mu.test(match[0])) return source;
  const header = match[0].replace(/^  sourceHash:[ \t]*(?:"[^"]*"|'[^']*'|[^\r\n]*)[ \t]*$/mu, `  sourceHash: "${hash}"`);
  return `${source.slice(0, match.index)}${header}${source.slice(match.index + match[0].length)}`;
}

function writeAtomic(file, content) {
  const temporary = `${file}.tmp-${process.pid}`;
  writeFileSync(temporary, content, 'utf8');
  renameSync(temporary, file);
}

export async function pinBlogPost({ root = ROOT, selector } = {}) {
  const name = selector?.trim();
  if (!name) throw new Error('Usage: pnpm blog:pin <slug>');
  const result = await validateBlog({ root });
  if (result.issues.length) throw new Error(result.issues.map((issue) => `${issue.file}: ${issue.rule}`).join('\n'));
  const matches = result.bundles.filter((bundle) => bundle.slug === name || bundle.route === name || bundle.route === `/blog/${name}`);
  if (matches.length !== 1) throw new Error(matches.length ? `Selector matched multiple blog posts: ${name}` : `Blog post not found: ${name}`);
  const target = matches[0];
  let changed = 0;
  const files = new Map();
  for (const bundle of result.bundles) {
    for (const file of bundle.files) {
      if (!existsSync(file.sourcePath)) continue;
      const source = readFileSync(file.sourcePath, 'utf8');
      files.set(file.sourcePath, { source, updated: setPinnedFlag(source, bundle === target) });
    }
  }
  for (const bundle of result.bundles) {
    const portuguese = bundle.files.find((file) => file.locale === 'pt');
    const english = bundle.files.find((file) => file.locale === 'en');
    const portugueseFile = portuguese && files.get(portuguese.sourcePath);
    const englishFile = english && files.get(english.sourcePath);
    if (portugueseFile && englishFile) {
      englishFile.updated = setTranslationHash(englishFile.updated, sourceHash(portugueseFile.updated));
    }
  }
  for (const [file, entry] of files) {
    if (entry.updated === entry.source) continue;
    writeAtomic(file, entry.updated);
    changed += 1;
  }
  return { slug: target.slug, changed };
}

async function main() {
  const selector = process.argv.slice(2).join(' ').trim();
  const result = await pinBlogPost({ root: resolve(process.cwd()), selector });
  console.log(`Pinned ${result.slug}; updated ${result.changed} file${result.changed === 1 ? '' : 's'}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`blog:pin failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
