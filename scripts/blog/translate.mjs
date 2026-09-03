import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import matter from 'gray-matter';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visitParents } from 'unist-util-visit-parents';
import { z } from 'zod';

export const MODEL = process.env.LLAMA_MODEL ?? 'qwen3:8b';
export const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL ?? 'http://127.0.0.1:8080';
export const LLAMA_SERVER_BIN = process.env.LLAMA_SERVER_BIN ?? '/usr/lib/ollama/llama-server';
export const LLAMA_BACKEND_PATH = process.env.GGML_BACKEND_PATH ?? '/usr/lib/ollama/cuda_v13/libggml-cuda.so';
export const LLAMA_MODEL_PATH = process.env.LLAMA_MODEL_PATH ?? join(homedir(), '.ollama/models/blobs/sha256-a3de86cd1c132c822487ededd47a324c50491393e6565cd14bafa40d0b8e686f');
export const TRANSLATION_GLOSSARY = resolve(process.cwd(), 'data/blog-translation-glossary.yml');

const CONTENT_ROOT = resolve(process.cwd(), 'content/blog');
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/;
const TRANSLATABLE_ATTRIBUTES = new Set(['alt', 'caption', 'title']);
const PROTECTED_TYPES = new Set(['code', 'inlineCode', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm']);
const TranslationResponse = z.object({
  segments: z.array(z.object({ id: z.string().min(1), text: z.string() })),
});
const TRANSLATION_SCHEMA = z.toJSONSchema(TranslationResponse);

function processor() {
  return unified().use(remarkParse).use(remarkFrontmatter).use(remarkMdx).use(remarkGfm);
}

function sourceHash(source) {
  return createHash('sha256').update(source).digest('hex');
}

function parseFrontmatter(source) {
  const match = FRONTMATTER_RE.exec(source);
  if (!match) throw new Error('Source MDX must start with YAML front matter.');
  const parsed = matter(source);
  const headerStart = match.index + match[0].indexOf(match[1]);
  return { data: parsed.data, header: match[1], headerStart };
}

function addSegment(segments, id, text, start, kind) {
  const value = text.trim();
  if (!value || !/[A-Za-zÀ-ÿ]/u.test(value)) return;
  const leading = text.search(/\S/u);
  const trailing = text.length - text.search(/\s*$/u);
  segments.push({ id, text: value, start: start + leading, end: start + text.length - trailing, kind });
}

function frontmatterSegments(source, segments) {
  const { header, headerStart } = parseFrontmatter(source);
  const lineRe = /^(title|description):[ \t]*(?:("[^"\r\n]*")|('[^'\r\n]*')|([^\r\n]*))[ \t]*$/gm;
  for (const match of header.matchAll(lineRe)) {
    const key = match[1];
    const token = match[2] ?? match[3] ?? match[4] ?? '';
    const lineStart = headerStart + match.index;
    const tokenStart = lineStart + match[0].indexOf(token);
    const value = token.replace(/^['"]|['"]$/g, '').trim();
    addSegment(segments, `frontmatter-${key}`, value, tokenStart + (token.startsWith('"') || token.startsWith("'") ? 1 : 0), 'frontmatter');
  }
}

function protectedByAncestors(ancestors) {
  return ancestors.some((ancestor) => PROTECTED_TYPES.has(ancestor.type));
}

function jsxAttributeSegment(segments, source, node) {
  if (!TRANSLATABLE_ATTRIBUTES.has(node.name) || typeof node.value !== 'string' || !node.position) return;
  const start = node.position.start.offset;
  const raw = source.slice(start, node.position.end.offset);
  const match = /=[ \t]*("([^"\r\n]*)"|'([^'\r\n]*)')/.exec(raw);
  if (!match) return;
  const value = match[2] ?? match[3] ?? '';
  const valueStart = start + match.index + match[0].indexOf(value);
  addSegment(segments, `jsx-${start}-${node.name}`, value, valueStart, 'attribute');
}

function imageAltSegment(segments, source, node) {
  if (!node.alt || !node.position) return;
  const start = node.position.start.offset;
  const raw = source.slice(start, node.position.end.offset);
  const open = raw.indexOf('![');
  const close = open < 0 ? -1 : raw.indexOf('](', open + 2);
  if (close < 0) return;
  addSegment(segments, `image-${start}`, node.alt, start + open + 2, 'attribute');
}

export function collectTranslationSegments(source) {
  const segments = [];
  frontmatterSegments(source, segments);
  const tree = processor().parse(source);
  let textIndex = 0;

  visitParents(tree, (node) => node.type === 'text' || node.type === 'image' || node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement', (node, ancestors) => {
    if (node.type === 'text') {
      if (!node.position || protectedByAncestors(ancestors)) return;
      const start = node.position.start.offset;
      addSegment(segments, `text-${String(textIndex++).padStart(4, '0')}`, node.value, start, 'text');
      return;
    }
    if (node.type === 'image') imageAltSegment(segments, source, node);
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      for (const attribute of node.attributes ?? []) jsxAttributeSegment(segments, source, attribute);
    }
  });

  return segments.sort((a, b) => a.start - b.start);
}

function readGlossary(path = TRANSLATION_GLOSSARY) {
  if (!existsSync(path)) return { preserve: [], terms: {} };
  const data = matter(`---\n${readFileSync(path, 'utf8')}\n---`).data;
  return {
    preserve: Array.isArray(data.preserve) ? data.preserve.filter((value) => typeof value === 'string') : [],
    terms: data.terms && typeof data.terms === 'object' ? data.terms : {},
  };
}

function translationPrompt(segments, glossary) {
  return JSON.stringify({
    sourceLanguage: 'Brazilian Portuguese',
    targetLanguage: 'English',
    rules: [
      'Translate naturally and preserve the author\'s technical tone.',
      'Do not summarize, add information, or remove meaning.',
      'Preserve product, project, library, framework, protocol, and person names when appropriate.',
      'Return every segment exactly once with the same id. Return no extra fields or commentary.',
      'Keep leading and trailing whitespace out of translated text; the caller preserves source whitespace.',
    ],
    glossary,
    segments: segments.map(({ id, text }) => ({ id, text })),
  }, null, 2);
}

function parseJsonContent(content) {
  const normalized = content.trim()
    .replace(/^```(?:json)?\s*/iu, '')
    .replace(/\s*```$/u, '')
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/giu, '')
    .trim();
  try {
    return JSON.parse(normalized);
  } catch {
    const start = normalized.indexOf('{');
    const end = normalized.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(normalized.slice(start, end + 1));
    throw new Error('llama-server returned non-JSON message content.');
  }
}

function responseSegments(value, expectedIds) {
  const candidates = [value, value?.response, value?.result, value?.data, value?.output];
  for (const candidate of candidates) {
    const collection = candidate?.segments
      ?? candidate?.translations
      ?? candidate?.translated_segments
      ?? candidate?.translatedSegments
      ?? candidate?.translation
      ?? candidate;
    if (Array.isArray(collection)) {
      return collection.map((segment) => ({
        id: segment?.id ?? segment?.segmentId ?? segment?.segment_id ?? segment?.key,
        text: segment?.text
          ?? segment?.translation
          ?? segment?.translatedText
          ?? segment?.translated_text
          ?? segment?.translated
          ?? segment?.content
          ?? segment?.value,
      }));
    }
    if (typeof collection === 'string' && expectedIds.length === 1) {
      return [{ id: expectedIds[0], text: collection }];
    }
    if (collection && typeof collection === 'object' && expectedIds.every((id) => id in collection)) {
      return expectedIds.map((id) => ({ id, text: collection[id] }));
    }
  }
  return undefined;
}

async function requestLlamaServer(payload) {
  let response;
  try {
    response = await fetch(`${LLAMA_SERVER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(`llama-server is unavailable at ${LLAMA_SERVER_URL}. Start it with the CUDA model command. ${error.message}`);
  }
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`llama-server request failed (${response.status}): ${body.slice(0, 500)}`);
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(`llama-server returned invalid JSON: ${error.message}`);
  }
}

async function serverIsReady() {
  try {
    const response = await fetch(`${LLAMA_SERVER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

function serverArguments() {
  const address = new URL(LLAMA_SERVER_URL);
  return [
    '-m', LLAMA_MODEL_PATH,
    '--host', address.hostname,
    '--port', address.port || '8080',
    '--ctx-size', process.env.LLAMA_CTX_SIZE ?? '8192',
    '--gpu-layers', process.env.LLAMA_GPU_LAYERS ?? '99',
    '--device', process.env.LLAMA_DEVICE ?? 'CUDA0',
    '--flash-attn', process.env.LLAMA_FLASH_ATTN ?? 'on',
    '--parallel', process.env.LLAMA_PARALLEL ?? '1',
    '--reasoning', 'off',
    '--no-ui',
  ];
}

async function startLlamaServer() {
  if (await serverIsReady()) return { process: null, owned: false };
  if (!existsSync(LLAMA_MODEL_PATH)) {
    throw new Error(`Qwen3 GGUF model not found at ${LLAMA_MODEL_PATH}. Set LLAMA_MODEL_PATH to a local GGUF file.`);
  }
  const child = spawn(LLAMA_SERVER_BIN, serverArguments(), {
    env: { ...process.env, GGML_BACKEND_PATH: LLAMA_BACKEND_PATH },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let diagnostics = '';
  let spawnError;
  const collect = (chunk) => {
    diagnostics = `${diagnostics}${chunk}`.slice(-4000);
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('error', (error) => {
    spawnError = error;
  });
  for (let attempt = 0; attempt < 180; attempt += 1) {
    if (spawnError) throw new Error(`Could not start llama-server at ${LLAMA_SERVER_BIN}: ${spawnError.message}`);
    if (child.exitCode !== null) throw new Error(`llama-server exited with code ${child.exitCode}. ${diagnostics.trim()}`);
    if (await serverIsReady()) return { process: child, owned: true };
    await delay(1000);
  }
  await stopLlamaServer(child);
  throw new Error(`Timed out waiting for llama-server at ${LLAMA_SERVER_URL}. ${diagnostics.trim()}`);
}

async function stopLlamaServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  for (let attempt = 0; attempt < 50 && child.exitCode === null; attempt += 1) await delay(100);
  if (child.exitCode === null) child.kill('SIGKILL');
}

export async function translateSegments(segments, { client, model = MODEL, glossary = readGlossary() } = {}) {
  const messages = [
    {
      role: 'system',
      content: 'You translate structured Brazilian Portuguese technical blog segments into professional English.',
    },
    { role: 'user', content: translationPrompt(segments, glossary) },
  ];
  const payload = {
    model,
    stream: false,
    temperature: 0,
    max_tokens: 4096,
    reasoning_effort: 'none',
    chat_template_kwargs: { enable_thinking: false },
    response_format: { type: 'json_schema', schema: TRANSLATION_SCHEMA },
    messages,
  };
  const response = client
    ? await client.chat(payload)
    : await requestLlamaServer(payload);
  const content = response.choices?.[0]?.message?.content ?? response.message?.content;
  if (typeof content !== 'string') throw new Error('llama-server returned no message content.');
  let parsed;
  try {
    const raw = parseJsonContent(content);
    const segmentsWithAliases = responseSegments(raw, segments.map((segment) => segment.id));
    parsed = TranslationResponse.parse(segmentsWithAliases ? { segments: segmentsWithAliases } : raw);
  } catch (error) {
    throw new Error(`Translation response failed schema validation: ${error.message}`);
  }
  const expected = new Set(segments.map((segment) => segment.id));
  const received = new Set(parsed.segments.map((segment) => segment.id));
  if (received.size !== parsed.segments.length || received.size !== expected.size || [...expected].some((id) => !received.has(id))) {
    throw new Error('Translation response changed segment ids; source file was left untouched.');
  }
  return new Map(parsed.segments.map((segment) => [segment.id, segment.text.trim()]));
}

function applyReplacements(source, segments, translations) {
  const replacements = segments.map((segment) => {
    const translated = translations.get(segment.id);
    if (!translated) throw new Error(`Missing translation for ${segment.id}; source file was left untouched.`);
    const original = source.slice(segment.start, segment.end);
    const leading = original.match(/^\s*/u)?.[0] ?? '';
    const trailing = original.match(/\s*$/u)?.[0] ?? '';
    const quote = source[segment.start - 1];
    const safe = segment.kind === 'frontmatter'
      ? (quote === '"' ? translated.replaceAll('\\', '\\\\').replaceAll('"', '\\"') : quote === "'" ? translated.replaceAll("'", "''") : translated).replace(/\r?\n/gu, ' ')
      : translated;
    return { start: segment.start, end: segment.end, text: `${leading}${safe}${trailing}` };
  });
  for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
    source = `${source.slice(0, replacement.start)}${replacement.text}${source.slice(replacement.end)}`;
  }
  return source;
}

function insertTranslationMetadata(source, hash) {
  const lineEnding = source.includes('\r\n') ? '\r\n' : '\n';
  const block = `translation:${lineEnding}  sourceLocale: pt-BR${lineEnding}  sourceHash: "${hash}"${lineEnding}`;
  const existing = /(?:^|\r?\n)translation:\r?\n(?:  [^\r\n]*\r?\n)*/m;
  if (existing.test(source)) return source.replace(existing, `${lineEnding}${block}`);
  const typora = /^typora-root-url:/m.exec(source);
  if (typora) return `${source.slice(0, typora.index)}${block}${source.slice(typora.index)}`;
  const frontmatter = FRONTMATTER_RE.exec(source);
  if (!frontmatter) throw new Error('Cannot add translation metadata without front matter.');
  const close = frontmatter.index + frontmatter[0].lastIndexOf(`${lineEnding}---`);
  return `${source.slice(0, close)}${lineEnding}${block}${source.slice(close)}`;
}

export function buildTranslatedDocument(source, translations) {
  const segments = collectTranslationSegments(source);
  return insertTranslationMetadata(applyReplacements(source, segments, translations), sourceHash(source));
}

function findBundles(root = CONTENT_ROOT) {
  const bundles = [];
  const walk = (directory) => {
    if (!existsSync(directory)) return;
    const entries = readdirSync(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === 'index.mdx')) {
      bundles.push({ directory, slug: relative(root, directory).split(sep).join('/').split('/').pop(), sourcePath: join(directory, 'index.mdx'), englishPath: join(directory, 'index.en.mdx') });
    }
    for (const entry of entries) if (entry.isDirectory()) walk(join(directory, entry.name));
  };
  walk(root);
  return bundles.sort((a, b) => a.directory.localeCompare(b.directory));
}

function isStale(bundle) {
  if (!existsSync(bundle.englishPath)) return true;
  const source = readFileSync(bundle.sourcePath, 'utf8');
  const translation = matter(readFileSync(bundle.englishPath, 'utf8')).data.translation;
  return !translation || translation.sourceHash !== sourceHash(source);
}

function writeAtomic(path, content) {
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, 'utf8');
  renameSync(temporary, path);
}

function parseArgs(argv) {
  const selectors = argv.filter((arg) => !arg.startsWith('--'));
  return { selectors, all: argv.includes('--all'), stale: argv.includes('--stale') };
}

export async function translateBlog({ root = CONTENT_ROOT, selectors = [], all = false, stale = false, client, model = MODEL } = {}) {
  const bundles = findBundles(root);
  const selected = all || !selectors.length
    ? bundles
    : bundles.filter((bundle) => selectors.some((selector) => bundle.slug === selector || bundle.slug.startsWith(`${selector}-`) || relative(root, bundle.directory).split(sep).join('/') === selector));
  if (!selected.length) throw new Error(`No blog bundle matched: ${selectors.join(', ') || '(none)'}`);
  const candidates = selected.filter((bundle) => !existsSync(bundle.englishPath) || (stale && isStale(bundle)));
  if (!candidates.length) return { translated: 0, skipped: selected.length };
  const server = client ? { process: null, owned: false } : await startLlamaServer();
  let translated = 0;
  try {
    for (const bundle of candidates) {
      const source = readFileSync(bundle.sourcePath, 'utf8');
      const segments = collectTranslationSegments(source);
      const result = await translateSegments(segments, { client, model });
      writeAtomic(bundle.englishPath, buildTranslatedDocument(source, result));
      translated += 1;
      console.log(`✓ ${relative(process.cwd(), bundle.englishPath)} (${segments.length} segments)`);
    }
  } finally {
    if (server.owned) await stopLlamaServer(server.process);
  }
  return { translated, skipped: selected.length - candidates.length };
}

async function main() {
  const { selectors, all, stale } = parseArgs(process.argv.slice(2));
  if (!all && !stale && !selectors.length) throw new Error('Usage: pnpm blog:translate <slug> | --all [--stale]');
  console.log(`blog:translate using ${MODEL} via llama.cpp at ${LLAMA_SERVER_URL}`);
  const result = await translateBlog({ selectors, all, stale });
  console.log(`blog:translate complete (${result.translated} translated, ${result.skipped} skipped)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`blog:translate failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
