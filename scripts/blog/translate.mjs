import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
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
import { BLOG_LOCALES, isLikelyTranslation, publishBlog, ROOT } from './lib.mjs';

export const MODEL = process.env.LLAMA_MODEL ?? 'translategemma:4b';
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

function localServerUrl(value) {
  let address;
  try {
    address = new URL(value);
  } catch {
    throw new Error('LLAMA_SERVER_URL must be a valid loopback HTTP URL.');
  }
  if (
    address.protocol !== 'http:'
    || !LOOPBACK_HOSTS.has(address.hostname)
    || address.username
    || address.password
    || address.search
    || address.hash
  ) {
    throw new Error('LLAMA_SERVER_URL must point to a loopback HTTP server.');
  }
  return value.replace(/\/+$/u, '');
}

export const LLAMA_SERVER_URL = localServerUrl(process.env.LLAMA_SERVER_URL ?? 'http://127.0.0.1:8080');
export const LLAMA_SERVER_BIN = process.env.LLAMA_SERVER_BIN ?? '/usr/lib/ollama/llama-server';
export const LLAMA_BACKEND_PATH = process.env.GGML_BACKEND_PATH ?? '/usr/lib/ollama/cuda_v13/libggml-cuda.so';
export const LLAMA_MODEL_PATH = process.env.LLAMA_MODEL_PATH ?? join(process.cwd(), 'models/translategemma-4b-it.Q8_0.gguf');
export const TARGET_LOCALES = BLOG_LOCALES.filter((locale) => locale !== 'pt');
const TARGET_LANGUAGES = {
  en: { name: 'English', code: 'en' },
  de: { name: 'German', code: 'de' },
  es: { name: 'Spanish', code: 'es' },
  fr: { name: 'French', code: 'fr' },
  ja: { name: 'Japanese', code: 'ja' },
  zh: { name: 'Simplified Chinese', code: 'zh-CN' },
};

const CONTENT_ROOT = resolve(process.cwd(), 'content/blog');
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/;
const TRANSLATABLE_ATTRIBUTES = new Set(['alt', 'caption', 'title']);
const PROTECTED_TYPES = new Set(['code', 'inlineCode', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm']);
const MAX_TRANSLATION_LENGTH = 20_000;
const UNSAFE_MDX_RE = /(?:^|\n)\s*(?:import|export)\s+|<\/?[A-Za-z][^>]*>|\{(?:[^{}]|\{[^{}]*\})*\}/mu;
const MARKDOWN_AUTOLINK_RE = /^<(https?:\/\/[^\s>]+)>$/u;
const PRESERVED_TERM_RE = /^(?:\p{Lu}[\p{L}\p{N}'’.-]*)(?:(?:\s+|\s*[|/&-]\s*)\p{Lu}[\p{L}\p{N}'’.-]*)*[.:]?$/u;
const PRESERVED_FRAGMENT_RE = /^[\p{L}\p{N}][\p{L}\p{N}'’./_-]*(?:\s+(?:[|/&-]\s*)?[\p{L}\p{N}][\p{L}\p{N}'’./_-]*)*\s*[.:→]?$/u;
const PORTUGUESE_COMMON_WORDS = new Set(['a', 'ah', 'afins', 'alta', 'ao', 'aos', 'arquivos', 'as', 'até', 'banco', 'bancos', 'bom', 'como', 'com', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'eu', 'filas', 'foi', 'imagens', 'mais', 'mas', 'meu', 'minha', 'muitas', 'na', 'nas', 'no', 'nos', 'o', 'olá', 'os', 'para', 'por', 'qualquer', 'que', 'se', 'sem', 'servidores', 'sites', 'simples', 'sua', 'suas', 'tem', 'trabalho', 'um', 'uma', 'vezes', 'voce']);
const SPANISH_SHARED_WORDS = new Set(['filas', 'servidores']);

function processor() {
  return unified().use(remarkParse).use(remarkFrontmatter).use(remarkMdx).use(remarkGfm);
}

function markdownProcessor() {
  return unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm);
}

function markdownAutolinks(source) {
  const ranges = [];
  const tree = markdownProcessor().parse(source);
  visitParents(tree, (node) => node.type === 'link', (node) => {
    if (!node.position) return;
    const start = node.position.start.offset;
    const end = node.position.end.offset;
    const match = MARKDOWN_AUTOLINK_RE.exec(source.slice(start, end));
    if (match) ranges.push({ start, end, url: match[1] });
  });
  return ranges;
}

function replaceRanges(source, ranges, replacement) {
  for (const range of [...ranges].sort((a, b) => b.start - a.start)) {
    source = `${source.slice(0, range.start)}${replacement(range)}${source.slice(range.end)}`;
  }
  return source;
}

function mdxParseSource(source) {
  return replaceRanges(source, markdownAutolinks(source), ({ url }) => `\`${url.replaceAll('`', ' ')}\``);
}

function normalizeMdxAutolinks(source) {
  return replaceRanges(source, markdownAutolinks(source), ({ url }) => `[${url}](${url})`);
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

function isLinkUrlLabel(node, ancestors) {
  return ancestors.some((ancestor) => ancestor.type === 'link' && normalizedText(node.value) === normalizedText(ancestor.url));
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
  const tree = processor().parse(mdxParseSource(source));
  let textIndex = 0;

  visitParents(tree, (node) => node.type === 'text' || node.type === 'image' || node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement', (node, ancestors) => {
    if (node.type === 'text') {
      if (!node.position || protectedByAncestors(ancestors) || isLinkUrlLabel(node, ancestors)) return;
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

export function translationPrompt(text, targetLocale) {
  const target = TARGET_LANGUAGES[targetLocale] ?? { name: targetLocale, code: targetLocale };
  return `<start_of_turn>user\nYou are a professional Portuguese (pt-BR) to ${target.name} (${target.code}) translator. Your goal is to accurately convey the meaning and nuances of the original Portuguese text while adhering to ${target.name} grammar, vocabulary, and cultural sensitivities.\nProduce only the ${target.name} translation, without any additional explanations or commentary. Please translate the following Portuguese text into ${target.name}:\n\n\n${text.trim()}<end_of_turn>\n<start_of_turn>model\n`;
}

async function requestLlamaServer(payload) {
  let response;
  try {
    response = await fetch(`${LLAMA_SERVER_URL}/v1/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // codeql[js/file-access-to-http] Source text is sent only to the loopback llama-server.
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(`llama-server is unavailable at ${LLAMA_SERVER_URL}. ${error.message}`);
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
    '--ctx-size', process.env.LLAMA_CTX_SIZE ?? '4096',
    '--batch-size', process.env.LLAMA_BATCH_SIZE ?? '512',
    '--ubatch-size', process.env.LLAMA_UBATCH_SIZE ?? '512',
    '--threads', process.env.LLAMA_THREADS ?? '6',
    '--threads-batch', process.env.LLAMA_THREADS_BATCH ?? '6',
    '--gpu-layers', process.env.LLAMA_GPU_LAYERS ?? 'all',
    '--split-mode', process.env.LLAMA_SPLIT_MODE ?? 'none',
    '--device', process.env.LLAMA_DEVICE ?? 'CUDA0',
    '--flash-attn', process.env.LLAMA_FLASH_ATTN ?? 'on',
    '--parallel', process.env.LLAMA_PARALLEL ?? '1',
    '--fit', process.env.LLAMA_FIT ?? 'on',
    '--fit-target', process.env.LLAMA_FIT_TARGET ?? '1024',
    '--kv-offload',
    '--cont-batching',
    '--cache-prompt',
    '--no-jinja',
    '--reasoning', 'off',
    '--no-ui',
  ];
}

async function startLlamaServer() {
  if (await serverIsReady()) return { process: null, owned: false };
  if (!existsSync(LLAMA_MODEL_PATH)) {
    throw new Error(`TranslateGemma GGUF model not found at ${LLAMA_MODEL_PATH}. Set LLAMA_MODEL_PATH to the installed model file.`);
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
  const handleSignal = (signal) => {
    void (async () => {
      await stopLlamaServer(child);
      process.exit(128 + (signal === 'SIGINT' ? 2 : 15));
    })();
  };
  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);
  const cleanupSignals = () => {
    process.removeListener('SIGINT', handleSignal);
    process.removeListener('SIGTERM', handleSignal);
  };
  for (let attempt = 0; attempt < 180; attempt += 1) {
    if (spawnError) {
      cleanupSignals();
      throw new Error(`Could not start llama-server at ${LLAMA_SERVER_BIN}: ${spawnError.message}`);
    }
    if (child.exitCode !== null) {
      cleanupSignals();
      throw new Error(`llama-server exited with code ${child.exitCode}. ${diagnostics.trim()}`);
    }
    if (await serverIsReady()) return { process: child, owned: true, cleanup: cleanupSignals };
    await delay(1000);
  }
  cleanupSignals();
  await stopLlamaServer(child);
  throw new Error(`Timed out waiting for llama-server at ${LLAMA_SERVER_URL}. ${diagnostics.trim()}`);
}

async function stopLlamaServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  for (let attempt = 0; attempt < 50 && child.exitCode === null; attempt += 1) await delay(100);
  if (child.exitCode === null) child.kill('SIGKILL');
}

function validateTranslationText(value, segment) {
  if (value.length > MAX_TRANSLATION_LENGTH) {
    throw new Error(`llama-server translation exceeded ${MAX_TRANSLATION_LENGTH} characters for ${segment.id}.`);
  }
  if (UNSAFE_MDX_RE.test(value)) {
    throw new Error(`llama-server translation contains unsupported MDX syntax for ${segment.id}.`);
  }
  return value;
}

function parseTranslationResponse(response, segment) {
  const content = response.choices?.[0]?.text ?? response.choices?.[0]?.message?.content ?? response.message?.content;
  if (typeof content !== 'string') throw new Error('llama-server returned no message content.');
  const translation = validateTranslationText(content.trim(), segment);
  if (!translation) throw new Error(`llama-server returned an empty translation for ${segment.id}.`);
  return translation;
}

function normalizedText(value) {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase();
}

function isPreservedTerm(segment) {
  const value = segment.text.trim();
  const words = normalizedText(value).match(/\p{L}+/gu) ?? [];
  return value.length <= 80
    && words.length <= 5
    && !/[áàâãéêíóôõúç]/iu.test(value)
    && !words.some((word) => PORTUGUESE_COMMON_WORDS.has(word))
    && (PRESERVED_TERM_RE.test(value) || PRESERVED_FRAGMENT_RE.test(value));
}

function isTargetLanguageCopy(segment, targetLocale) {
  if (targetLocale !== 'es') return false;
  const value = segment.text.trim();
  const words = normalizedText(value).match(/\p{L}+/gu) ?? [];
  const portugueseWords = words.filter((word) => PORTUGUESE_COMMON_WORDS.has(word));
  return words.length <= 3
    && !/[ãõâêôç]/iu.test(value)
    && !portugueseWords.some((word) => !SPANISH_SHARED_WORDS.has(word))
    && PRESERVED_FRAGMENT_RE.test(value);
}

function acceptsCopiedSource(segment, targetLocale) {
  return isPreservedTerm(segment) || isTargetLanguageCopy(segment, targetLocale);
}

export async function translateSegments(segments, { client, model = MODEL, targetLocale = 'en' } = {}) {
  const language = TARGET_LANGUAGES[targetLocale]?.name ?? targetLocale;
  const validateEachSegment = segments.length === 1;
  const translations = new Map();
  for (const segment of segments) {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const payload = {
        model,
        stream: false,
        temperature: 0,
        max_tokens: 4096,
        stop: ['<end_of_turn>'],
        prompt: translationPrompt(segment.text, targetLocale),
      };
      try {
        const response = client
          ? await client.chat(payload)
          : await requestLlamaServer(payload);
        const translation = parseTranslationResponse(response, segment);
        const copiedSource = normalizedText(translation) === normalizedText(segment.text);
        const copiedTerm = copiedSource && acceptsCopiedSource(segment, targetLocale);
        if ((copiedTerm || !copiedSource) && (copiedTerm || !validateEachSegment || isLikelyTranslation(translation, targetLocale))) {
          translations.set(segment.id, translation);
          break;
        }
        lastError = new Error(copiedSource
          ? `Translation response copied source text for ${segment.id}; source file was left untouched.`
          : `Translation response failed language validation for ${language}; source file was left untouched.`);
      } catch (error) {
        lastError = error;
      }
    }
    if (!translations.has(segment.id)) throw lastError;
  }
  const preservedOnly = validateEachSegment
    && acceptsCopiedSource(segments[0], targetLocale)
    && normalizedText(translations.get(segments[0].id) ?? '') === normalizedText(segments[0].text);
  if (validateEachSegment && !preservedOnly && !isLikelyTranslation([...translations.values()].join('\n'), targetLocale)) {
    throw new Error(`Translation response failed language validation for ${language}; source file was left untouched.`);
  }
  return translations;
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
  const translated = applyReplacements(source, segments, translations);
  return insertTranslationMetadata(normalizeMdxAutolinks(translated), sourceHash(source));
}

function findBundles(root = CONTENT_ROOT) {
  const bundles = [];
  const walk = (directory) => {
    if (!existsSync(directory)) return;
    const entries = readdirSync(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === 'index.mdx')) {
      bundles.push({
        directory,
        slug: relative(root, directory).split(sep).join('/').split('/').pop(),
        sourcePath: join(directory, 'index.mdx'),
        targetPaths: Object.fromEntries(TARGET_LOCALES.map((locale) => [locale, join(directory, `index.${locale}.mdx`)])),
      });
    }
    for (const entry of entries) if (entry.isDirectory()) walk(join(directory, entry.name));
  };
  walk(root);
  return bundles.sort((a, b) => a.directory.localeCompare(b.directory));
}

function isStale(sourcePath, targetPath, targetLocale) {
  if (!existsSync(targetPath)) return true;
  const source = readFileSync(sourcePath, 'utf8');
  const target = readFileSync(targetPath, 'utf8');
  const translation = matter(target).data.translation;
  if (!translation || translation.sourceHash !== sourceHash(source)) return true;
  return !isLikelyTranslation(collectTranslationSegments(target).map((segment) => segment.text).join('\n'), targetLocale);
}

function writeAtomic(path, content) {
  const temporary = `${path}.tmp-${process.pid}`;
  // codeql[js/http-to-file-access] Model output is validated before document assembly and this path is generated under the blog root.
  writeFileSync(temporary, content, 'utf8');
  renameSync(temporary, path);
}

function normalizeSources(bundles) {
  const sources = new Map();
  for (const bundle of bundles) {
    const original = readFileSync(bundle.sourcePath, 'utf8');
    const source = normalizeMdxAutolinks(original);
    const changed = source !== original;
    if (changed) {
      writeAtomic(bundle.sourcePath, source);
      console.log(`✓ normalized ${relative(process.cwd(), bundle.sourcePath)} (MDX autolinks)`);
    }
    sources.set(bundle.sourcePath, { source, changed });
  }
  return sources;
}

export function parseArgs(argv) {
  const selectors = argv.filter((arg) => !arg.startsWith('--'));
  return { selectors, all: argv.includes('--all'), stale: argv.includes('--stale'), noPush: argv.includes('--no-push') };
}

export async function translateBlog({ root = CONTENT_ROOT, selectors = [], all = false, stale = false, client, model = MODEL } = {}) {
  const bundles = findBundles(root);
  const selected = all || !selectors.length
    ? bundles
    : bundles.filter((bundle) => selectors.some((selector) => bundle.slug === selector || bundle.slug.startsWith(`${selector}-`) || relative(root, bundle.directory).split(sep).join('/') === selector));
  if (!selected.length) throw new Error(`No blog bundle matched: ${selectors.join(', ') || '(none)'}`);
  const sources = normalizeSources(selected);
  const candidates = selected.flatMap((bundle) => TARGET_LOCALES
    .filter((locale) => !existsSync(bundle.targetPaths[locale]) || ((stale || sources.get(bundle.sourcePath).changed) && isStale(bundle.sourcePath, bundle.targetPaths[locale], locale)))
    .map((locale) => ({ bundle, locale, targetPath: bundle.targetPaths[locale] })));
  if (!candidates.length) return { translated: 0, skipped: selected.length * TARGET_LOCALES.length };
  const server = client ? { process: null, owned: false } : await startLlamaServer();
  let translated = 0;
  try {
    for (const candidate of candidates) {
      const source = sources.get(candidate.bundle.sourcePath).source;
      const segments = collectTranslationSegments(source);
      const result = await translateSegments(segments, { client, model, targetLocale: candidate.locale });
      writeAtomic(candidate.targetPath, buildTranslatedDocument(source, result));
      translated += 1;
      console.log(`✓ ${relative(process.cwd(), candidate.targetPath)} (${segments.length} segments)`);
    }
  } finally {
    if (server.owned) {
      await stopLlamaServer(server.process);
      server.cleanup?.();
    }
  }
  return { translated, skipped: selected.length * TARGET_LOCALES.length - candidates.length };
}

async function main() {
  const { selectors, all, stale, noPush } = parseArgs(process.argv.slice(2));
  if (!all && !stale && !selectors.length) throw new Error('Usage: pnpm blog:translate <slug> | --all [--stale] [--no-push]');
  console.log(`blog:translate using ${MODEL} via llama.cpp at ${LLAMA_SERVER_URL}`);
  const result = await translateBlog({ selectors, all, stale });
  console.log(`blog:translate complete (${result.translated} translated, ${result.skipped} skipped)`);
  if (result.translated > 0) {
    const published = await publishBlog({ root: ROOT, push: !noPush });
    console.log(published.published
      ? `${published.message}${published.pushed ? ' and pushed' : ' (push skipped)'}`
      : `Nothing to publish: ${published.reason}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`blog:translate failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
