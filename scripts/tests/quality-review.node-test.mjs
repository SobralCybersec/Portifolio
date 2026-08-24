import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_QUALITY_PATHS, evaluateQualityGate, parseQualityArgs, POLICY } from "./quality-review.mjs";

function passingSummary() {
  return {
    file_size: { oversized: 0 },
    jscpd: { enabled: true, available: true, exit_code: 0, duplication_percent: 1 },
    lizard: { enabled: true, available: true, exit_code: 0 },
    coverage: { available: true, lines_percent: 90 },
    tests: { available: true, failures: 0, errors: 0 },
    security: { enabled: false, available: false, exit_code: null, findings: null },
  };
}

test("parseQualityArgs keeps universal defaults and supports explicit evidence/security gates", () => {
  const options = parseQualityArgs(
    ["src", "lib", "--strict", "--require-tools", "--require-evidence", "--security", "--coverage-min", "85", "--churn-days", "30"],
    { repoRoot: "/tmp/repo" },
  );
  assert.deepEqual(options.paths, ["src", "lib"]);
  assert.equal(options.strict, true);
  assert.equal(options.requireTools, true);
  assert.equal(options.requireEvidence, true);
  assert.equal(options.security, true);
  assert.equal(options.coverageMin, 85);
  assert.equal(options.churnDays, 30);
});

test("quality gate passes when all available evidence satisfies policy", () => {
  const options = parseQualityArgs([], { repoRoot: "/tmp/repo" });
  assert.deepEqual(evaluateQualityGate(passingSummary(), options), { status: "pass", failures: [] });
});

test("quality gate reports independent failures instead of hiding them behind one score", () => {
  const options = parseQualityArgs(["--security", "--coverage-min", "80"], { repoRoot: "/tmp/repo" });
  const summary = passingSummary();
  summary.file_size.oversized = 2;
  summary.jscpd.exit_code = 1;
  summary.jscpd.duplication_percent = 7.5;
  summary.lizard.exit_code = 1;
  summary.coverage.lines_percent = 70;
  summary.tests.failures = 1;
  summary.security = { enabled: true, available: true, exit_code: 1, findings: 3 };
  const gate = evaluateQualityGate(summary, options);
  assert.equal(gate.status, "fail");
  assert.equal(gate.failures.length, 6);
  assert.match(gate.failures.join("\n"), /oversized/);
  assert.match(gate.failures.join("\n"), /duplication/);
  assert.match(gate.failures.join("\n"), /complexity/);
  assert.match(gate.failures.join("\n"), /coverage/);
  assert.match(gate.failures.join("\n"), /test/);
  assert.match(gate.failures.join("\n"), /security/);
});

test("quality gate classifies review findings as warnings and hard findings as failures", () => {
  const summary = passingSummary();
  summary.file_size.review = 1;
  summary.jscpd.duplication_percent = 4;
  summary.lizard.review_exit_code = 1;
  const gate = evaluateQualityGate(summary, parseQualityArgs([], { repoRoot: "/tmp/repo" }));
  assert.equal(gate.status, "pass");
  assert.equal(gate.failures.length, 0);
  assert.equal(gate.warnings.length, 3);
  assert.equal(evaluateQualityGate(summary, parseQualityArgs(["--strict"], { repoRoot: "/tmp/repo" })).status, "fail");
});

test("missing optional tools are explicit but do not fail unless required", () => {
  const summary = passingSummary();
  summary.jscpd.available = false;
  summary.jscpd.exit_code = null;
  summary.lizard.available = false;
  summary.lizard.exit_code = null;
  const normal = parseQualityArgs([], { repoRoot: "/tmp/repo" });
  assert.equal(evaluateQualityGate(summary, normal).status, "pass");
  const required = parseQualityArgs(["--require-tools"], { repoRoot: "/tmp/repo" });
  const gate = evaluateQualityGate(summary, required);
  assert.equal(gate.status, "fail");
  assert.deepEqual(gate.failures.sort(), ["required tool missing: jscpd", "required tool missing: lizard"].sort());
});

test("require-evidence distinguishes no report from zero coverage", () => {
  const summary = passingSummary();
  summary.coverage = { available: false, lines_percent: null };
  summary.tests = { available: false, failures: 0, errors: 0 };
  const gate = evaluateQualityGate(summary, parseQualityArgs(["--require-evidence"], { repoRoot: "/tmp/repo" }));
  assert.equal(gate.status, "fail");
  assert.deepEqual(gate.failures, ["coverage evidence missing", "test-result evidence missing"]);
});

test("policy separates review thresholds from hard fail thresholds", () => {
  assert.equal(POLICY.file.review, 700);
  assert.equal(POLICY.file.hard, 800);
  assert.equal(POLICY.duplication.reviewPercent, 3);
  assert.equal(POLICY.duplication.hardPercent, 5);
  assert.ok(POLICY.complexity.review.ccn < POLICY.complexity.hard.ccn);
  assert.ok(POLICY.complexity.review.nloc < POLICY.complexity.hard.nloc);
  assert.ok(POLICY.file.review < POLICY.file.hard);
});

test("default quality scope targets project source roots", () => {
  assert.deepEqual(parseQualityArgs([], { repoRoot: "/tmp/repo" }).paths, DEFAULT_QUALITY_PATHS);
});
