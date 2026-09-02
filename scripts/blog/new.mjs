import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { slugify, ROOT } from './lib.mjs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) { console.error('Usage: pnpm blog:new "Article title"'); process.exit(1); }
const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const offset = -now.getTimezoneOffset();
const sign = offset >= 0 ? '+' : '-';
const zone = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${zone}`;
const year = String(now.getFullYear());
const month = pad(now.getMonth() + 1);
const day = pad(now.getDate());
const slug = slugify(title);
if (!slug) { console.error('Title does not produce a valid slug.'); process.exit(1); }
const bundle = resolve(ROOT, 'content/blog', year, month, day, slug);
const assets = resolve(ROOT, 'public/blog', year, month, day, slug);
if (existsSync(bundle) || existsSync(assets)) { console.error(`Article already exists: ${relative(ROOT, bundle)}`); process.exit(1); }
mkdirSync(bundle, { recursive: true });
mkdirSync(assets, { recursive: true });
const typoraRoot = relative(bundle, resolve(ROOT, 'public')).split('\\').join('/');
const typoraAssets = relative(bundle, assets).split('\\').join('/');
const content = `---\ntitle: ${JSON.stringify(title)}\ndescription: "TODO: write a concrete summary for this article."\ndate: "${iso}"\nupdated: "${iso}"\ntags: []\ndraft: true\npinned: false\ntypora-root-url: "${typoraRoot}"\ntypora-copy-images-to: "${typoraAssets}"\n---\n\n## Context\n\nWrite article here.\n`;
const file = join(bundle, 'index.mdx');
writeFileSync(file, content, 'utf8');
console.log(`Created content: ${relative(ROOT, file)}`);
console.log(`Created assets:  ${relative(ROOT, assets)}`);
