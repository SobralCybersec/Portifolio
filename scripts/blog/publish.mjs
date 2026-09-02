import { publishBlog, ROOT } from './lib.mjs';

try {
  const result = await publishBlog({ root: ROOT, push: !process.argv.includes('--no-push') });
  console.log(result.published ? `${result.message}${result.pushed ? ' and pushed' : ' (push skipped)'}` : `Nothing to publish: ${result.reason}`);
} catch (error) {
  console.error(`blog:publish failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
