import { HARD_LIMIT, REVIEW_LIMIT } from "./check-file-size.mjs";

export const POLICY = {
  file: { review: REVIEW_LIMIT, hard: HARD_LIMIT },
  duplication: { reviewPercent: 3, hardPercent: 5 },
  complexity: {
    // UI rendering functions carry markup-heavy composition; keep review below hard limits.
    review: { ccn: 25, nloc: 300, length: 600, arguments: 8, nesting: 3 },
    hard: { ccn: 30, nloc: 350, length: 700, arguments: 10 },
  },
  coverage: { linePercentMin: 80 },
  churn: { days: 90, hotspotLimit: 20 },
};

export function evaluateQualityGate(summary, options) {
  const failures = [];
  const warnings = [];
  if (summary.file_size.oversized > 0) failures.push(`${summary.file_size.oversized} oversized source file(s)`);
  else if (summary.file_size.review > 0) warnings.push(`${summary.file_size.review} source file(s) need size review`);

  const duplication = summary.jscpd.duplication_percent;
  if (summary.jscpd.enabled && summary.jscpd.available && summary.jscpd.exit_code !== 0) {
    if (duplication == null || duplication > POLICY.duplication.hardPercent || options.strict) {
      failures.push(`duplication gate failed (${duplication ?? "unknown"}%)`);
    }
  }
  if (summary.jscpd.enabled && summary.jscpd.available && duplication != null && duplication > POLICY.duplication.reviewPercent) {
    if (duplication <= POLICY.duplication.hardPercent && summary.jscpd.exit_code === 0) {
      warnings.push(`duplication ${duplication}% > ${POLICY.duplication.reviewPercent}%`);
    }
  }
  if (summary.lizard.enabled && summary.lizard.available && summary.lizard.exit_code !== 0) {
    failures.push("complexity gate failed");
  } else if (summary.lizard.enabled && summary.lizard.available && summary.lizard.review_exit_code != null && summary.lizard.review_exit_code !== 0) {
    if (options.strict) failures.push("complexity review gate failed");
    else warnings.push("complexity review has findings");
  }
  if (summary.coverage.available && summary.coverage.lines_percent != null && summary.coverage.lines_percent < options.coverageMin) {
    failures.push(`line coverage ${summary.coverage.lines_percent}% < ${options.coverageMin}%`);
  }
  if (summary.tests.available && (summary.tests.failures > 0 || summary.tests.errors > 0)) {
    failures.push(`${summary.tests.failures + summary.tests.errors} failing/error test(s)`);
  }
  if (summary.security.enabled && summary.security.available && summary.security.exit_code !== 0) {
    failures.push(`${summary.security.findings ?? "security"} high/critical security finding(s)`);
  }
  for (const [name, tool] of Object.entries(summary.tools ?? {})) {
    if (tool.enabled && tool.available && tool.exit_code !== 0) failures.push(`${name} check failed`);
  }
  if (options.requireTools) {
    if (summary.jscpd.enabled && !summary.jscpd.available) failures.push("required tool missing: jscpd");
    if (summary.lizard.enabled && !summary.lizard.available) failures.push("required tool missing: lizard");
    if (summary.security.enabled && !summary.security.available) failures.push("required tool missing: trivy");
    for (const [name, tool] of Object.entries(summary.tools ?? {})) {
      if (tool.enabled && !tool.available) failures.push(`required tool missing: ${name}`);
    }
  }
  if (options.requireEvidence) {
    if (!summary.coverage.available) failures.push("coverage evidence missing");
    if (!summary.tests.available) failures.push("test-result evidence missing");
  }
  const status = failures.length || (options.strict && warnings.length) ? "fail" : "pass";
  return warnings.length ? { status, failures, warnings } : { status, failures };
}
