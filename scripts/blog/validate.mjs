import { validateBlog, ROOT } from './lib.mjs';

const result = await validateBlog({ root: ROOT });
if (result.issues.length) {
  console.error(`blog:validate failed (${result.issues.length} issue${result.issues.length === 1 ? '' : 's'})`);
  for (const issue of result.issues) console.error(`- ${issue.file}: ${issue.rule}; value=${JSON.stringify(issue.value)}`);
  process.exitCode = 1;
} else {
  console.log(`blog:validate passed (${result.bundles.length} bundle${result.bundles.length === 1 ? '' : 's'})`);
}
