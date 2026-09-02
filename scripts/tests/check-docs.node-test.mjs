import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./check-docs.mjs', import.meta.url));

test('documentation validation passes for current guides', () => {
  const output = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  assert.match(output, /Docs check passed/u);
  assert.match(output, /docs\/typescript\.md: \d+ lines/u);
  assert.match(output, /docs\/test\.md: \d+ lines/u);
});
