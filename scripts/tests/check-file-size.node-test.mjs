import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkFileSizes,
  countPhysicalLines,
  formatFileSizeReport,
  isSourceFile,
  sourceFiles,
} from "./check-file-size.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "quality-size-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "src", "nested"), { recursive: true });
  await mkdir(path.join(root, "node_modules", "pkg"), { recursive: true });
  await mkdir(path.join(root, "dist"), { recursive: true });
  await mkdir(path.join(root, ".quality-venv", "lib"), { recursive: true });
  return root;
}

function lines(count, value = "x") {
  return Array.from({ length: count }, () => value).join("\n");
}

test("countPhysicalLines handles empty, LF, CRLF, CR, and missing final newline", async (t) => {
  const root = await fixture(t);
  const cases = new Map([
    ["empty.rs", ["", 0]],
    ["lf.rs", ["a\nb\n", 2]],
    ["crlf.rs", ["a\r\nb\r\n", 2]],
    ["cr.rs", ["a\rb\r", 2]],
    ["unterminated.rs", ["a\nb", 2]],
  ]);
  for (const [name, [content, expected]] of cases) {
    const file = path.join(root, "src", name);
    await writeFile(file, content);
    assert.equal(await countPhysicalLines(file), expected, name);
  }
});

test("source discovery spans ecosystems, special filenames, and shebang scripts", async (t) => {
  const root = await fixture(t);
  const files = {
    "src/main.py": "print('ok')\n",
    "src/messages.json": "{\"hello\": \"world\"}\n",
    "src/lib.rs": "fn main() {}\n",
    "src/bridge.mjs": "export const ready = true;\n",
    "src/App.java": "class App {}\n",
    "src/widget.vue": "<template/>\n",
    "src/query.sql": "select 1;\n",
    "src/module.ex": "defmodule X do\nend\n",
    "src/tool": "#!/usr/bin/env python3\nprint('ok')\n",
    "src/Makefile": "all:\n\t@true\n",
    "src/notes.md": lines(30),
    "node_modules/pkg/huge.js": lines(100),
    "dist/generated.rs": lines(100),
    ".quality-venv/lib/package.py": lines(100),
  };
  for (const [relative, content] of Object.entries(files)) {
    await writeFile(path.join(root, relative), content);
  }

  const discovered = await sourceFiles(".", { repoRoot: root });
  const relative = discovered.map((file) => path.relative(root, file).split(path.sep).join("/"));
  assert.deepEqual(relative.sort(), [
    "src/App.java",
    "src/Makefile",
    "src/bridge.mjs",
    "src/lib.rs",
    "src/main.py",
    "src/messages.json",
    "src/module.ex",
    "src/query.sql",
    "src/tool",
    "src/widget.vue",
  ]);
  assert.equal(await isSourceFile(path.join(root, "src", "tool")), true);
  assert.equal(await isSourceFile(path.join(root, "src", "notes.md")), false);
});

test("checkFileSizes is cwd-independent, de-duplicates overlapping roots, and classifies limits", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "src", "small.go"), lines(4));
  await writeFile(path.join(root, "src", "review.ts"), lines(8));
  await writeFile(path.join(root, "src", "nested", "hard.cpp"), lines(12));

  const previous = process.cwd();
  process.chdir(os.tmpdir());
  t.after(() => process.chdir(previous));

  const result = await checkFileSizes({
    repoRoot: root,
    roots: ["src", "src/nested"],
    reviewLimit: 5,
    hardLimit: 10,
  });
  assert.deepEqual(result.files.map(({ file }) => file), [
    "src/nested/hard.cpp",
    "src/review.ts",
    "src/small.go",
  ]);
  assert.deepEqual(result.review, [{ file: "src/review.ts", lines: 8 }]);
  assert.deepEqual(result.oversized, [{ file: "src/nested/hard.cpp", lines: 12 }]);

  const report = formatFileSizeReport(result, { reviewLimit: 5, hardLimit: 10 });
  assert.match(report, /review: src\/review\.ts \(8 lines\)/);
  assert.match(report, /error: src\/nested\/hard\.cpp has 12 lines \(limit 10\)/);
});

test("extraExtensions makes uncommon languages configurable without code changes", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "src", "example.xyzlang"), "alpha\nbeta\n");
  assert.equal((await sourceFiles("src", { repoRoot: root })).length, 0);
  const result = await checkFileSizes({
    repoRoot: root,
    roots: ["src"],
    extraExtensions: ["xyzlang"],
  });
  assert.deepEqual(result.files, [{ file: "src/example.xyzlang", lines: 2 }]);
});

test("invalid limits fail fast", async () => {
  await assert.rejects(() => checkFileSizes({ reviewLimit: 0 }), /reviewLimit/);
  await assert.rejects(
    () => checkFileSizes({ reviewLimit: 10, hardLimit: 9 }),
    /hardLimit/,
  );
});
