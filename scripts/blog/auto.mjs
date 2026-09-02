import { DEBOUNCE_MS, editorialStatus, publishBlog, ROOT, watchEditorial } from './lib.mjs';

let timer;
let dirty = false;
let publishing = false;

function schedule(reason) {
  dirty = true;
  if (timer) clearTimeout(timer);
  console.log(`Change detected (${reason}); waiting ${DEBOUNCE_MS / 1000}s for quiet save.`);
  timer = setTimeout(run, DEBOUNCE_MS);
}

async function run() {
  timer = undefined;
  if (publishing || !dirty) return;
  dirty = false;
  if (!editorialStatus(ROOT)) return;
  publishing = true;
  try {
    const result = await publishBlog({ root: ROOT, push: true });
    console.log(result.published ? `${result.message} pushed.` : `Nothing to publish: ${result.reason}`);
  } catch (error) {
    console.error(`blog:auto publish failed: ${error instanceof Error ? error.message : error}`);
  } finally {
    publishing = false;
    if (dirty) schedule('save during publish');
  }
}

const close = watchEditorial((name) => schedule(name));
console.log(`blog:auto watching editorial paths with ${DEBOUNCE_MS / 1000}s debounce.`);
process.on('SIGINT', () => { close(); if (timer) clearTimeout(timer); process.exit(0); });
process.on('SIGTERM', () => { close(); if (timer) clearTimeout(timer); process.exit(0); });
