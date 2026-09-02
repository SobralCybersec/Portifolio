import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const DOCS = join(ROOT, 'docs');
const MIN_LINES = 1000;
const MIN_MERMAID = 2;
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\u00AD]/u;
const SLOP_WORDS = [
  'delve', 'foster', 'leverage', 'utilize', 'facilitate', 'empower',
  'streamline', 'robust', 'cutting-edge', 'paradigm shift', 'game changer',
  'tapestry', 'realm', 'beacon', 'multifaceted', 'meticulous', 'intricate',
  'paramount', 'transformative', 'elevate', 'embark', 'supercharge',
  'harness', 'ever-evolving', 'seamless', 'innovative', 'revolutionary',
  'unparalleled', 'pivotal', 'holistic', 'cornerstone', 'bedrock',
  'mosaic', 'ecosystem', 'symphony', 'labyrinth', 'odyssey', 'kaleidoscope',
  'underscore', 'showcase', 'testament', 'compelling', 'synergy', 'scalable',
  'demystify', 'ignite', 'uncover', 'unleash', 'optimize', 'hone', 'unveil',
];

function markdownFiles() {
  return readdirSync(DOCS)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => join(DOCS, file));
}

function headingSlug(heading) {
  return heading
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/gu, '')
    .trim()
    .replace(/\s+/gu, '-');
}

function localTarget(file, target) {
  const [path] = target.split(/[?#]/u);
  return path ? resolve(file, '..', path) : file;
}

function checkFile(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const errors = [];
  const name = file.replace(`${DOCS}/`, 'docs/');

  if (lines.length - 1 < MIN_LINES) errors.push(`fewer than ${MIN_LINES} lines`);
  if (text.split('```').length % 2 === 0) errors.push('unbalanced code fences');
  if ((text.match(/^```mermaid$/gmu) ?? []).length < MIN_MERMAID) errors.push('too few Mermaid diagrams');
  if (INVISIBLE.test(text)) errors.push('invisible Unicode character');

  const headings = new Set(
    lines
      .filter((line) => /^#{1,6}\s+/u.test(line))
      .map((line) => headingSlug(line.replace(/^#{1,6}\s+/u, ''))),
  );
  for (const match of text.matchAll(/\]\(#([^)]*)\)/gu)) {
    if (!headings.has(match[1]) && !text.includes(`id="${match[1]}"`)) {
      errors.push(`missing anchor #${match[1]}`);
    }
  }

  for (const match of text.matchAll(/\]\(([^)]+)\)/gu)) {
    const target = match[1];
    if (/^(?:[a-z]+:)?\/\//iu.test(target) || target.startsWith('mailto:')) continue;
    if (!existsSync(localTarget(file, target))) errors.push(`missing local link ${target}`);
  }

  for (const match of text.matchAll(/<img[^>]+src="([^"]+)"/gu)) {
    const target = match[1];
    if (/^(?:[a-z]+:)?\/\//iu.test(target)) continue;
    if (!existsSync(localTarget(file, target))) errors.push(`missing local image ${target}`);
  }

  const lower = text.toLowerCase();
  const foundSlop = SLOP_WORDS.filter((word) => new RegExp(`\\b${word.replace(/[ -]/gu, '[ -]')}\\b`, 'u').test(lower));
  if (foundSlop.length) errors.push(`banned prose words: ${foundSlop.join(', ')}`);
  return { name, lines: lines.length - 1, mermaid: (text.match(/^```mermaid$/gmu) ?? []).length, errors };
}

function checkReadme() {
  const file = join(ROOT, 'README.md');
  const text = readFileSync(file, 'utf8');
  const errors = [];
  for (const match of text.matchAll(/\]\(([^)]+)\)/gu)) {
    const target = match[1];
    if (/^(?:[a-z]+:)?\/\//iu.test(target) || target.startsWith('mailto:')) continue;
    if (!existsSync(localTarget(file, target))) errors.push(`README missing local link ${target}`);
  }
  return errors;
}

const results = markdownFiles().map(checkFile);
const errors = results.flatMap((result) => result.errors.map((error) => `${result.name}: ${error}`));
errors.push(...checkReadme());

for (const result of results) {
  console.log(`${result.name}: ${result.lines} lines, ${result.mermaid} Mermaid diagrams`);
}
if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Docs check passed: ${results.length} guides and README links verified.`);
}
