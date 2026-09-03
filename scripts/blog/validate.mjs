import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { validateBlog, ROOT } from './lib.mjs';

function printIssues(result) {
  console.error(`blog:validate failed (${result.issues.length} issue${result.issues.length === 1 ? '' : 's'})`);
  for (const issue of result.issues) console.error(`- ${issue.file}: ${issue.rule}; value=${JSON.stringify(issue.value)}`);
}

function isStaleTranslation(issue) {
  return issue.rule.includes('translation is stale') || issue.rule.includes('translation language mismatch');
}

function fixStaleTranslations() {
  console.log('Stale localized translation detected; running blog:translate --stale automatically.');
  const script = resolve(ROOT, 'scripts/blog/translate.mjs');
  const child = spawnSync(process.execPath, [script, '--stale'], { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (child.error) throw child.error;
  return child.status ?? 1;
}

async function main() {
  let result = await validateBlog({ root: ROOT });
  const stale = result.issues.filter(isStaleTranslation);
  const blocking = result.issues.filter((issue) => !isStaleTranslation(issue));

  if (stale.length && !blocking.length) {
    const status = fixStaleTranslations();
    if (status !== 0) {
      process.exitCode = status;
      return;
    }
    result = await validateBlog({ root: ROOT });
  }

  if (result.issues.length) {
    printIssues(result);
    process.exitCode = 1;
  } else {
    console.log(`blog:validate passed (${result.bundles.length} bundle${result.bundles.length === 1 ? '' : 's'})`);
  }
}

main().catch((error) => {
  console.error(`blog:validate failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
