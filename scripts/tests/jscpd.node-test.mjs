import assert from "node:assert/strict";
import { chmod, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildJscpdArgs,
  DEFAULT_IGNORES,
  DEFAULT_MIN_TOKENS,
  DEFAULT_THRESHOLD,
  parseCliArgs,
  resolveJscpdBinary,
  runJscpd,
  summarizeReport,
} from "./jscpd.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "quality-jscpd-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("parseCliArgs applies universal duplication options and preserves paths", () => {
  const options = parseCliArgs(
    [
      "src",
      "lib",
      "--min-lines",
      "12",
      "--min-tokens",
      "80",
      "--threshold",
      "4.5",
      "--mode",
      "strict",
      "--reporters",
      "console,sarif",
      "--ignore",
      "vendor/**,fixtures/**",
      "--cross-formats",
      "js-ts",
      "--blame",
    ],
    { repoRoot: "/tmp/repo" },
  );
  assert.deepEqual(options.paths, ["src", "lib"]);
  assert.equal(options.minLines, 12);
  assert.equal(options.minTokens, 80);
  assert.equal(options.threshold, 4.5);
  assert.equal(options.mode, "strict");
  assert.deepEqual(options.reporters, ["console", "sarif", "json"]);
  assert.deepEqual(options.ignores.slice(-2), ["vendor/**", "fixtures/**"]);
  assert.deepEqual(options.crossFormats, ["js-ts"]);
  assert.equal(options.blame, true);
});

test("buildJscpdArgs emits deterministic documented CLI flags", () => {
  const options = parseCliArgs(["src"], { repoRoot: "/tmp/repo" });
  const args = buildJscpdArgs(options);
  assert.deepEqual(args.slice(0, 3), ["src", "--reporters", "console,json,sarif"]);
  assert.ok(args.includes("--min-lines"));
  assert.ok(args.includes("--min-tokens"));
  assert.ok(args.includes("--mode"));
  assert.ok(args.includes("--no-tips"));
  assert.equal(args.includes("--no-colors"), false);
});

test("default policy excludes generated/dependency output and keeps a bounded duplication gate", () => {
  const options = parseCliArgs([], { repoRoot: "/tmp/repo" });
  assert.equal(options.threshold, DEFAULT_THRESHOLD);
  assert.equal(options.minTokens, DEFAULT_MIN_TOKENS);
  assert.ok(options.ignores.includes("**/generated/**"));
  assert.ok(options.ignores.includes("**/node_modules/**"));
  assert.ok(options.ignores.includes("**/*.lock"));
  assert.deepEqual(options.ignores, DEFAULT_IGNORES);
});

test("summarizeReport extracts total and per-format metrics without hardcoding tool version", () => {
  const summary = summarizeReport(
    {
      statistics: {
        detectionDate: "2026-01-01T00:00:00.000Z",
        javascript: {
          clones: 1,
          duplicatedLines: 4,
          percentage: 1,
          sources: 2,
          lines: 200,
          tokens: 300,
        },
        total: {
          clones: 2,
          duplicatedLines: 8,
          percentage: 1.5,
          sources: 4,
          lines: 500,
          tokens: 900,
        },
      },
    },
    parseCliArgs(["src"], { repoRoot: "/tmp/repo" }),
    { version: "5.1.2" },
  );
  assert.deepEqual(summary.summary, {
    clones: 2,
    duplicated_lines: 8,
    duplication_percent: 1.5,
    files: 4,
    lines: 500,
    tokens: 900,
    threshold_exceeded: false,
  });
  assert.equal(summary.by_format.javascript.clones, 1);
  assert.equal(summary.version, "5.1.2");
});

test("invalid CLI values fail fast", () => {
  assert.throws(() => parseCliArgs(["--threshold", "101"]), /between 0 and 100/);
  assert.throws(() => parseCliArgs(["--min-tokens", "0"]), /positive integer/);
  assert.throws(() => parseCliArgs(["--mode", "fast"]), /strict, mild, or weak/);
  assert.throws(() => parseCliArgs(["--wat", "1"]), /Unknown argument/);
});

test("resolveJscpdBinary respects explicit and environment overrides", async (t) => {
  const root = await fixture(t);
  assert.equal(
    await resolveJscpdBinary({ repoRoot: root, explicit: "/custom/jscpd", env: {} }),
    "/custom/jscpd",
  );
  assert.equal(
    await resolveJscpdBinary({ repoRoot: root, env: { JSCPD_BIN: "/env/jscpd" } }),
    "/env/jscpd",
  );
});

test("runJscpd works with an injected executable and consumes its JSON report", async (t) => {
  if (process.platform === "win32") return t.skip("shell fixture is POSIX-only");
  const root = await fixture(t);
  const bin = path.join(root, "fake-jscpd");
  const output = path.join(root, "reports", "jscpd");
  const metrics = path.join(root, "reports", "metrics.json");
  await writeFile(
    bin,
    `#!/bin/sh\nif [ "$1" = "--version" ]; then echo "jscpd 5.9.0"; exit 0; fi\nout=""\nprev=""\nfor arg in "$@"; do\n  if [ "$prev" = "--output" ]; then out="$arg"; fi\n  prev="$arg"\ndone\nmkdir -p "$out"\ncat > "$out/jscpd-report.json" <<'JSON'\n{"statistics":{"total":{"clones":0,"duplicatedLines":0,"percentage":0,"sources":3,"lines":100,"tokens":200}}}\nJSON\nexit 0\n`,
  );
  await chmod(bin, 0o755);
  await mkdir(path.join(root, "src"), { recursive: true });

  const options = parseCliArgs(["src", "--binary", bin], { repoRoot: root });
  options.output = output;
  options.metrics = metrics;
  const result = await runJscpd(options);
  assert.equal(result.available, true);
  assert.equal(result.exitCode, 0);
  assert.equal(result.metrics.version, "5.9.0");
  assert.equal(result.metrics.summary.files, 3);
});
