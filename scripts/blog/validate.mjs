import { spawnSync } from 'node:child_process';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBlog, ROOT } from './lib.mjs';

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/;

function printIssues(result) {
  console.error(`blog:validate failed (${result.issues.length} issue${result.issues.length === 1 ? '' : 's'})`);
  for (const issue of result.issues) console.error(`- ${issue.file}: ${issue.rule}; value=${JSON.stringify(issue.value)}`);
}

function isStaleTranslation(issue) {
  return issue.rule.includes('translation is stale') || issue.rule.includes('translation language mismatch');
}

export function promoteDraft(source) {
  const frontmatter = FRONTMATTER_RE.exec(source);
  if (!frontmatter) return source;
  const updated = frontmatter[0].replace(/^draft:[ \t]*true[ \t]*$/mu, 'draft: false');
  return `${source.slice(0, frontmatter.index)}${updated}${source.slice(frontmatter.index + frontmatter[0].length)}`;
}

function writeAtomic(path, content) {
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, 'utf8');
  renameSync(temporary, path);
}

export function promoteDrafts(result) {
  let promoted = 0;
  for (const bundle of result.bundles) {
    for (const file of bundle.files) {
      if (file.data.draft !== true) continue;
      const source = readFileSync(file.sourcePath, 'utf8');
      const updated = promoteDraft(source);
      if (updated === source) continue;
      writeAtomic(file.sourcePath, updated);
      promoted += 1;
    }
  }
  return promoted;
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
  const promoted = promoteDrafts(result);
  if (promoted) {
    console.log(`Promoted ${promoted} draft file${promoted === 1 ? '' : 's'} to published.`);
    result = await validateBlog({ root: ROOT });
  }
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`blog:validate failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
