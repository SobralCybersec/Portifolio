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

test('MDX translator normalizes angle-bracket URLs automatically', () => {
  const source = `${fixture}\n\`<https://example.com/code>\`\nLink: <https://example.com/docs/>\n`;
  const segments = collectTranslationSegments(source);
  assert.equal(segments.some((segment) => segment.text.includes('https://example.com')), false);

  const translations = new Map(segments.map((segment) => [segment.id, `EN: ${segment.text}`]));
  const output = buildTranslatedDocument(source, translations);
  assert.match(output, /`<https:\/\/example\.com\/code>`/u);
  assert.match(output, /\[https:\/\/example\.com\/docs\/\]\(https:\/\/example\.com\/docs\/\)/u);
  const outputSegments = collectTranslationSegments(output);
  assert.equal(outputSegments.some((segment) => segment.text.includes('example.com')), false);
});

test('TranslateGemma receives its exact wrapped prompt per segment', async () => {
  const client = {
    chat: async ({ prompt, stop }) => {
      assert.equal(prompt, '<start_of_turn>user\nYou are a professional Portuguese (pt-BR) to English (en) translator. Your goal is to accurately convey the meaning and nuances of the original Portuguese text while adhering to English grammar, vocabulary, and cultural sensitivities.\nProduce only the English translation, without any additional explanations or commentary. Please translate the following Portuguese text into English:\n\n\nOlá<end_of_turn>\n<start_of_turn>model\n');
      assert.deepEqual(stop, ['<end_of_turn>']);
      return { message: { content: 'Translated Olá' } };
    },
  };
  const result = await translateSegments([{ id: 'segment-1', text: 'Olá' }], { client, model: 'test-model', glossary: { preserve: [], terms: {} } });
  assert.equal(result.get('segment-1'), 'Translated Olá');
});

test('trims plain llama-server completion response', async () => {
  const client = {
    chat: async () => ({
      choices: [{
        text: '\nHello\n',
      }],
    }),
  };
  const result = await translateSegments([{ id: 'segment-1', text: 'Olá' }], { client, glossary: { preserve: [], terms: {} } });
  assert.equal(result.get('segment-1'), 'Hello');
});

test('retries output when language validation rejects copied source text', async () => {
  let calls = 0;
  const client = {
    chat: async ({ prompt }) => {
      calls += 1;
      const text = calls === 1
        ? 'O resultado muda agora'
        : 'El resultado traducido es correcto';
      assert.match(prompt, /to Spanish \(es\) translator/u);
      return { message: { content: text } };
    },
  };
  const result = await translateSegments([
    { id: 'segment-1', text: 'O resultado muda agora' },
  ], { client, targetLocale: 'es', glossary: { preserve: [], terms: {} } });
  assert.equal(calls, 2);
  assert.equal(result.get('segment-1'), 'El resultado traducido es correcto');
});

test('keeps copied brand names without retrying', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Northflank' } };
    },
  };
  const result = await translateSegments([{ id: 'text-0002', text: 'Northflank', kind: 'text' }], { client });
  assert.equal(calls, 1);
  assert.equal(result.get('text-0002'), 'Northflank');
});

test('keeps copied technical fragments without retrying', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Ruby on Rails' } };
    },
  };
  const result = await translateSegments([{ id: 'text-0081', text: 'Ruby on Rails', kind: 'text' }], { client, targetLocale: 'de' });
  assert.equal(calls, 1);
  assert.equal(result.get('text-0081'), 'Ruby on Rails');
});

test('keeps a valid unchanged Spanish word without retrying', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Servidores' } };
    },
  };
  const result = await translateSegments([{ id: 'text-0137', text: 'Servidores', kind: 'text' }], { client, targetLocale: 'es' });
  assert.equal(calls, 1);
  assert.equal(result.get('text-0137'), 'Servidores');
});

test('keeps a valid unchanged Spanish technical fragment without retrying', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Filas HTTP' } };
    },
  };
  const result = await translateSegments([{ id: 'text-0219', text: 'Filas HTTP', kind: 'text' }], { client, targetLocale: 'es' });
  assert.equal(calls, 1);
  assert.equal(result.get('text-0219'), 'Filas HTTP');
});

test('keeps a valid unchanged Spanish accented word without retrying', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Vídeos' } };
    },
  };
  const result = await translateSegments([{ id: 'text-0233', text: 'Vídeos', kind: 'text' }], { client, targetLocale: 'es' });
  assert.equal(calls, 1);
  assert.equal(result.get('text-0233'), 'Vídeos');
});

test('does not keep copied Portuguese words as preserved terms', async () => {
  let calls = 0;
  const client = {
    chat: async () => {
      calls += 1;
      return { message: { content: 'Olá' } };
    },
  };
  await assert.rejects(
    translateSegments([{ id: 'segment-1', text: 'Olá', kind: 'text' }], { client, targetLocale: 'es' }),
    /copied source text/u,
  );
  assert.equal(calls, 2);
});

test('rejects model output that introduces executable MDX', async () => {
  const client = {
    chat: async () => ({ message: { content: '<Danger />' } }),
  };
  await assert.rejects(
    translateSegments([{ id: 'segment-1', text: 'Olá' }], { client }),
    /unsupported MDX syntax/u,
  );
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
    writeFileSync(join(directory, 'index.mdx'), `${fixture}\nLink: <https://example.com/docs/>\n`, 'utf8');
    const client = {
      chat: async ({ prompt }) => {
        assert.match(prompt, /<start_of_turn>user\nYou are a professional Portuguese \(pt-BR\) to .+ translator\./u);
        const translated = prompt.includes('to English (en) translator')
          ? 'The translated text is ready'
          : prompt.includes('to German (de) translator')
            ? 'Der übersetzte Text ist bereit'
            : prompt.includes('to Spanish (es) translator')
              ? 'El texto traducido es correcto'
              : prompt.includes('to French (fr) translator')
                ? 'Le texte traduit est correct'
                : prompt.includes('to Japanese (ja) translator')
                  ? '翻訳されたテキスト'
                  : '翻译后的文本';
        return { message: { content: translated } };
      },
    };
    const result = await translateBlog({ root: join(root, 'content/blog'), all: true, client });
    assert.equal(result.translated, TARGET_LOCALES.length);
    assert.match(readFileSync(join(directory, 'index.mdx'), 'utf8'), /\[https:\/\/example\.com\/docs\/\]\(https:\/\/example\.com\/docs\/\)/u);
    for (const locale of TARGET_LOCALES) assert.match(readFileSync(join(directory, `index.${locale}.mdx`), 'utf8'), /translation:/);

    let skippedCalls = 0;
    const skipped = await translateBlog({
      root: join(root, 'content/blog'),
      all: true,
      client: { chat: async () => { skippedCalls += 1; return { message: { content: 'unexpected' } }; } },
    });
    assert.deepEqual(skipped, { translated: 0, skipped: TARGET_LOCALES.length });
    assert.equal(skippedCalls, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
