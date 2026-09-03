import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildTranslatedDocument, collectTranslationSegments, parseArgs, TARGET_LOCALES, translateBlog, translateSegments } from '../blog/translate.mjs';

const fixture = `---
title: "Como medir performance"
description: "Um guia concreto para medir performance sem quebrar o MDX."
date: "2026-09-02T13:00:00-03:00"
tags:
  - nextjs
draft: false
---

## O resultado

Performance melhorou com [Server Components](https://nextjs.org/docs) e \`pnpm build\`.

![Resultado do Lighthouse](/blog/result.webp)

<YouTube id="Pw0E4OSJQTM" title="Demonstração da aplicação" />
`;

test('MDX translator collects human text and protects syntax', () => {
  const segments = collectTranslationSegments(fixture);
  const texts = segments.map((segment) => segment.text);
  assert.ok(texts.includes('Como medir performance'));
  assert.ok(texts.includes('O resultado'));
  assert.ok(texts.includes('Demonstração da aplicação'));
  assert.equal(texts.find((text) => text === 'https://nextjs.org/docs'), undefined);
  assert.ok(!texts.includes('pnpm build'));
  assert.ok(!texts.includes('Pw0E4OSJQTM'));

  const translations = new Map(segments.map((segment) => [segment.id, `EN: ${segment.text}`]));
  const output = buildTranslatedDocument(fixture, translations);
  const hash = createHash('sha256').update(fixture).digest('hex');
  assert.match(output, /title: "EN: Como medir performance"/);
  assert.deepEqual(
    output.split('\n').filter((line) => line.startsWith('EN: Performance')),
    ['EN: Performance melhorou com [EN: Server Components](https://nextjs.org/docs) EN: e `pnpm build`.'],
  );
  assert.match(output, /`pnpm build`/);
  assert.match(output, /id="Pw0E4OSJQTM"/);
  assert.match(output, new RegExp(`sourceHash: "${hash}"`));
});

test('structured llama.cpp response is validated and mapped by id', async () => {
  const client = {
    list: async () => ({ models: [{ name: 'test-model' }] }),
    chat: async ({ messages, response_format }) => {
      assert.equal(response_format.type, 'json_schema');
      assert.equal(response_format.schema.type, 'object');
      const request = JSON.parse(messages[1].content);
      return { message: { content: JSON.stringify({ segments: request.segments.map(({ id, text }) => ({ id, text: `Translated ${text}` })) }) } };
    },
  };
  const result = await translateSegments([{ id: 'segment-1', text: 'Olá' }], { client, model: 'test-model', glossary: { preserve: [], terms: {} } });
  assert.equal(result.get('segment-1'), 'Translated Olá');
});

test('normalizes fenced and nested model responses', async () => {
  const client = {
    chat: async () => ({
      choices: [{
        message: {
          content: '```json\n{"response":{"translations":[{"id":"segment-1","translation":"Hello"}]}}\n```',
        },
      }],
    }),
  };
  const result = await translateSegments([{ id: 'segment-1', text: 'Olá' }], { client, glossary: { preserve: [], terms: {} } });
  assert.equal(result.get('segment-1'), 'Hello');
});

test('retries output when language validation rejects copied source text', async () => {
  let calls = 0;
  const client = {
    chat: async ({ messages }) => {
      calls += 1;
      const request = JSON.parse(messages[1].content);
      const text = calls === 1
        ? request.segments.map(({ id, text: value }) => ({ id, text: value }))
        : request.segments.map(({ id }) => ({ id, text: 'El resultado traducido' }));
      return { message: { content: JSON.stringify({ segments: text }) } };
    },
  };
  const result = await translateSegments([
    { id: 'segment-1', text: 'O resultado' },
    { id: 'segment-2', text: 'O conteúdo muda' },
  ], { client, targetLocale: 'es', glossary: { preserve: [], terms: {} } });
  assert.equal(calls, 2);
  assert.equal(result.get('segment-1'), 'El resultado traducido');
});

test('translation command accepts no-push publish flag', async () => {
  assert.deepEqual(parseArgs(['lighthouse', '--stale', '--no-push']), {
    selectors: ['lighthouse'],
    all: false,
    stale: true,
    noPush: true,
  });
});

test('translates every configured locale sibling', async () => {
  const root = mkdtempSync(join(tmpdir(), 'blog-translate-all-'));
  try {
    const directory = join(root, 'content/blog/2026/01/01/localized');
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'index.mdx'), fixture, 'utf8');
    const client = {
      chat: async ({ messages }) => {
        const request = JSON.parse(messages[1].content);
        const translated = {
          English: 'The translated text',
          German: 'Der übersetzte Text',
          Spanish: 'El texto traducido',
          French: 'Le texte traduit',
          Japanese: '翻訳されたテキスト',
          'Simplified Chinese': '翻译后的文本',
        }[request.targetLanguage];
        return { message: { content: JSON.stringify({ segments: request.segments.map(({ id }) => ({ id, text: translated })) }) } };
      },
    };
    const result = await translateBlog({ root: join(root, 'content/blog'), all: true, client });
    assert.equal(result.translated, TARGET_LOCALES.length);
    for (const locale of TARGET_LOCALES) assert.match(readFileSync(join(directory, `index.${locale}.mdx`), 'utf8'), /translation:/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
