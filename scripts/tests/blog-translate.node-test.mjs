import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { buildTranslatedDocument, collectTranslationSegments, parseArgs, translateSegments } from '../blog/translate.mjs';

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

test('translation command accepts no-push publish flag', async () => {
  assert.deepEqual(parseArgs(['lighthouse', '--stale', '--no-push']), {
    selectors: ['lighthouse'],
    all: false,
    stale: true,
    noPush: true,
  });
});
