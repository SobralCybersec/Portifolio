import assert from "node:assert/strict";
import test from "node:test";
import {
  formatQualityReport,
  formatTable,
  parseJUnitCases,
  parseLizardFindings,
  summarizeExtensions,
  summarizeSourceAreas,
} from "./quality-report.mjs";

test("quality report formats box tables", () => {
  const table = formatTable(["Metric", "Result"], [["Clones", 0], ["Duplication", "0.00%"]]);
  assert.match(table, /┌/);
  assert.match(table, /│ Metric/);
  assert.match(table, /Duplication/);
  assert.match(table, /└/);
});

test("quality report parses Lizard metrics and source extensions", () => {
  assert.deepEqual(parseLizardFindings("src/main.rs:12: warning: start_proxy has 153 NLOC, 17 CCN, 1058 token, 2 PARAM, 153 length, 0 ND\n"), [
    { function: "start_proxy", file: "src/main.rs:12", nloc: 153, ccn: 17, token: 1058, params: 2, length: 153, nesting: 0 },
  ]);
  assert.deepEqual(summarizeExtensions([{ file: "src/main.rs", lines: 10 }, { file: "bridge/flow.mjs", lines: 20 }]), [
    { extension: ".mjs", files: 1, lines: 20 },
    { extension: ".rs", files: 1, lines: 10 },
  ]);
});

test("quality report separates Rust, bridge, and frontend source areas", () => {
  assert.deepEqual(summarizeSourceAreas({
    files: [
      { file: "src/main.rs", lines: 10 },
      { file: "bridge/rustproxyhub/index.mjs", lines: 20 },
      { file: "frontend/src/App.tsx", lines: 30 },
    ],
    review: [{ file: "src/main.rs", lines: 10 }],
    oversized: [],
  }), [
    { area: "Bridge / bridge/rustproxyhub", files: 1, lines: 20, review: 0, bad: 0 },
    { area: "Frontend / frontend/src", files: 1, lines: 30, review: 0, bad: 0 },
    { area: "Rust / src", files: 1, lines: 10, review: 1, bad: 0 },
  ]);
});

test("quality report includes test, duplication, coverage, and gate metrics", () => {
  const report = formatQualityReport({
    summary: {
      jscpd: { clones: 0 },
      src_files: { discovered: 3, checked: 3, excluded: 0, excluded_files: [] },
      coverage: { lines_percent: 80, branches_percent: 70, functions_percent: 60 },
      gate: { status: "fail", failures: ["complexity gate failed"] },
    },
    jscpd: { summary: { files: 2, lines: 30, clones: 0, duplicated_lines: 0, duplication_percent: 0 } },
    lizard: [],
    fileSize: { files: [{ file: "src/main.rs", lines: 10 }] },
    tests: { aggregate: { tests: 1, passed: 1, failures: 0, errors: 0, skipped: 0 } },
    cases: parseJUnitCases("<testsuites><testcase name=\"works\"/></testsuites>"),
    benchmarks: [{ name: "run", iterations: 10, elapsed_ms: 1, ops_per_second: 10000 }],
  });
  assert.match(report, /LIZARD — Complexity/);
  assert.match(report, /SRC — Inventory/);
  assert.match(report, /JSCPD — Duplication/);
  assert.match(report, /TESTS — Results/);
  assert.match(report, /TEST CASES — Detail/);
  assert.match(report, /SOURCE — Extensions/);
  assert.match(report, /COVERAGE — LCOV/);
  assert.match(report, /BENCHMARKS — Throughput/);
  assert.match(report, /FINAL STATUS/);
  assert.match(report, /BAD\(FAIL\)/);
  assert.match(report, /MUST FIX\(WARNING\)/);
  assert.match(report, /complexity gate failed/);
});
