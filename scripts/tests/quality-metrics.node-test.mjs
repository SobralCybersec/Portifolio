import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  aggregateCoverage,
  aggregateTestResults,
  collectCoverage,
  collectTestResults,
  parseCoberturaXml,
  parseGitNumstat,
  parseJacocoXml,
  parseJUnitXml,
  parseLcov,
  rankHotspots,
  summarizeTrivyReport,
} from "./quality-metrics.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "quality-metrics-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("coverage parsers normalize LCOV, Cobertura, and JaCoCo", () => {
  const lcov = parseLcov("SF:a.js\nLF:100\nLH:80\nBRF:20\nBRH:10\nFNF:10\nFNH:9\nend_of_record\n");
  assert.equal(lcov.lines.percent, 80);
  assert.equal(lcov.branches.percent, 50);
  assert.equal(lcov.functions.percent, 90);

  const cobertura = parseCoberturaXml(
    '<coverage lines-valid="200" lines-covered="150" branches-valid="50" branches-covered="25" line-rate="0.75" branch-rate="0.5"/>',
  );
  assert.equal(cobertura.lines.percent, 75);
  assert.equal(cobertura.branches.percent, 50);

  const jacoco = parseJacocoXml(
    '<report><counter type="METHOD" missed="2" covered="8"/><counter type="BRANCH" missed="5" covered="15"/><counter type="LINE" missed="10" covered="90"/></report>',
  );
  assert.equal(jacoco.lines.percent, 90);
  assert.equal(jacoco.branches.percent, 75);
  assert.equal(jacoco.functions.percent, 80);
});

test("aggregateCoverage weights reports by executable counts", () => {
  const aggregate = aggregateCoverage([
    parseLcov("LF:100\nLH:80\n"),
    parseLcov("LF:300\nLH:150\n"),
  ]);
  assert.equal(aggregate.lines.found, 400);
  assert.equal(aggregate.lines.covered, 230);
  assert.equal(aggregate.lines.percent, 57.5);
});

test("JUnit parsing and aggregation expose reliability evidence", () => {
  const first = parseJUnitXml('<testsuite tests="10" failures="1" errors="1" skipped="2"></testsuite>');
  const second = parseJUnitXml('<testsuites tests="5" failures="0" errors="0" skipped="1"></testsuites>');
  assert.deepEqual(first, { tests: 10, failures: 1, errors: 1, skipped: 2, passed: 6 });
  assert.deepEqual(aggregateTestResults([first, second]), {
    reports: 2,
    tests: 15,
    failures: 1,
    errors: 1,
    skipped: 3,
    passed: 10,
  });
});

test("JUnit parsing counts Node test reporter cases without suite attributes", () => {
  const report = parseJUnitXml('<testsuites><testcase name="one"/><testcase name="two"><skipped/></testcase></testsuites>');
  assert.deepEqual(report, { tests: 2, failures: 0, errors: 0, skipped: 1, passed: 1 });
});

test("collectors discover common report files without requiring a language-specific test runner", async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, "coverage"), { recursive: true });
  await mkdir(path.join(root, "test-results"), { recursive: true });
  await writeFile(path.join(root, "coverage", "lcov.info"), "LF:10\nLH:9\n");
  await writeFile(
    path.join(root, "test-results", "junit.xml"),
    '<testsuite tests="4" failures="0" errors="0" skipped="1"></testsuite>',
  );
  const coverage = await collectCoverage(root);
  const tests = await collectTestResults(root);
  assert.equal(coverage.available, true);
  assert.equal(coverage.aggregate.lines.percent, 90);
  assert.equal(tests.available, true);
  assert.equal(tests.aggregate.passed, 3);
});

test("git numstat parser tracks additions, deletions, commits, renames, and binary changes", () => {
  const churn = parseGitNumstat(
    [
      "@@COMMIT:a",
      "10\t2\tsrc/a.ts",
      "3\t1\tsrc/{old => new}.rs",
      "-\t-\tassets/logo.png",
      "@@COMMIT:b",
      "5\t5\tsrc/a.ts",
    ].join("\n"),
  );
  const a = churn.find((item) => item.file === "src/a.ts");
  const renamed = churn.find((item) => item.file === "src/new.rs");
  assert.deepEqual(
    { additions: a.additions, deletions: a.deletions, changes: a.changes, commits: a.commits },
    { additions: 15, deletions: 7, changes: 22, commits: 2 },
  );
  assert.equal(renamed.changes, 4);
  assert.equal(churn.find((item) => item.file === "assets/logo.png").binary_changes, 1);
});

test("hotspots prioritize files that combine size and churn", () => {
  const hotspots = rankHotspots(
    [
      { file: "src/large.ts", lines: 800 },
      { file: "src/small.ts", lines: 80 },
      { file: "src/stable.ts", lines: 900 },
    ],
    [
      { file: "src/large.ts", additions: 120, deletions: 80, changes: 200, commits: 8 },
      { file: "src/small.ts", additions: 300, deletions: 300, changes: 600, commits: 20 },
    ],
    { reviewLimit: 500 },
  );
  assert.equal(hotspots[0].file, "src/large.ts");
  assert.ok(hotspots[0].risk_score > hotspots[1].risk_score);
  assert.equal(hotspots.some((entry) => entry.file === "src/stable.ts"), false);
});

test("Trivy JSON summary counts high/critical findings across security categories", () => {
  const summary = summarizeTrivyReport({
    Results: [
      { Vulnerabilities: [{ Severity: "HIGH" }, { Severity: "CRITICAL" }] },
      { Misconfigurations: [{ Severity: "HIGH" }] },
      { Secrets: [{ Severity: "CRITICAL" }] },
    ],
  });
  assert.deepEqual(summary, {
    vulnerabilities: 2,
    misconfigurations: 1,
    secrets: 1,
    high: 2,
    critical: 2,
    findings: 4,
  });
});
