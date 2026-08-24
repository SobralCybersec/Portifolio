import { readFile, writeFile } from "node:fs/promises";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = resolve(scriptDir, "../..");

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readText(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

function decodeXml(value = "") {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function xmlAttributes(raw) {
  const values = {};
  for (const match of raw.matchAll(/([\w:-]+)=(['"])(.*?)\2/g)) values[match[1]] = decodeXml(match[3]);
  return values;
}

export function parseJUnitCases(text, repoRoot = DEFAULT_REPO_ROOT) {
  const cases = [];
  const pattern = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/gi;
  for (const match of text.matchAll(pattern)) {
    const attrs = xmlAttributes(match[1]);
    const body = match[2] ?? "";
    const status = /<failure\b/i.test(body)
      ? "failed"
      : /<error\b/i.test(body)
        ? "error"
        : /<skipped\b/i.test(body)
          ? "skipped"
          : "passed";
    const file = attrs.file
      ? path.relative(repoRoot, attrs.file).split(path.sep).join("/")
      : attrs.classname ?? "unknown";
    cases.push({
      name: attrs.name ?? "unnamed test",
      file,
      status,
      time_ms: Number.isFinite(Number(attrs.time)) ? Number(attrs.time) * 1000 : null,
    });
  }
  return cases;
}

export function parseLizardFindings(text) {
  const findings = [];
  const pattern = /^(.*?):(\d+): warning: (.+?) has (\d+) NLOC, (\d+) CCN, (\d+) token, (\d+) PARAM, (\d+) length, (\d+) ND$/gm;
  for (const match of text.matchAll(pattern)) {
    findings.push({
      function: match[3],
      file: `${match[1]}:${match[2]}`,
      nloc: Number(match[4]),
      ccn: Number(match[5]),
      token: Number(match[6]),
      params: Number(match[7]),
      length: Number(match[8]),
      nesting: Number(match[9]),
    });
  }
  return findings.sort((left, right) => right.ccn - left.ccn || right.nloc - left.nloc);
}

export function summarizeExtensions(files) {
  const byExtension = new Map();
  for (const item of files) {
    const extension = path.posix.extname(item.file.replaceAll("\\", "/")).toLowerCase() || "[none]";
    const current = byExtension.get(extension) ?? { extension, files: 0, lines: 0 };
    current.files += 1;
    current.lines += item.lines;
    byExtension.set(extension, current);
  }
  return [...byExtension.values()].sort((left, right) => right.files - left.files || left.extension.localeCompare(right.extension));
}

function sourceArea(file) {
  const normalized = file.replaceAll("\\", "/");
  const fileOnly = normalized.replace(/:\d+$/, "");
  const extension = path.posix.extname(fileOnly).toLowerCase();
  if (extension === ".rs") return `Rust / ${path.posix.dirname(fileOnly)}`;
  if (fileOnly.startsWith("bridge/")) return "Bridge / bridge/rustproxyhub";
  if (fileOnly.startsWith("frontend/")) return "Frontend / frontend/src";
  if (fileOnly.startsWith("src/")) return "Application / src";
  return "Other";
}

export function summarizeSourceAreas(fileSize) {
  const review = new Set((fileSize.review ?? []).map(({ file }) => file));
  const oversized = new Set((fileSize.oversized ?? []).map(({ file }) => file));
  const areas = new Map();
  for (const item of fileSize.files ?? []) {
    const area = sourceArea(item.file);
    const current = areas.get(area) ?? { area, files: 0, lines: 0, review: 0, bad: 0 };
    current.files += 1;
    current.lines += item.lines;
    current.review += review.has(item.file) ? 1 : 0;
    current.bad += oversized.has(item.file) ? 1 : 0;
    areas.set(area, current);
  }
  return [...areas.values()].sort((left, right) => left.area.localeCompare(right.area));
}

function valueOf(value) {
  return value == null ? "—" : String(value);
}

export function formatTable(headers, rows) {
  const values = [headers, ...rows].map((row) => row.map(valueOf));
  const widths = headers.map((header, index) => Math.max(...values.map((row) => row[index].length), header.length));
  const line = (left, fill, middle, right) => left + widths.map((width) => fill.repeat(width + 2)).join(middle) + right;
  const row = (valuesRow) => `│ ${valuesRow.map((value, index) => value.padEnd(widths[index])).join(" │ ")} │`;
  return [
    line("┌", "─", "┬", "┐"),
    row(values[0]),
    line("├", "─", "┼", "┤"),
    ...values.slice(1).map(row),
    line("└", "─", "┴", "┘"),
  ].join("\n");
}

function section(title, headers, rows) {
  return `${title}\n\n${formatTable(headers, rows)}`;
}

const STATUS_BAD = "BAD(FAIL)";
const STATUS_WARNING = "MUST FIX(WARNING)";
const STATUS_GOOD = "GOOD";

function statusForDuplication(value, policy = {}) {
  const percent = Number(value);
  if (!Number.isFinite(percent)) return STATUS_WARNING;
  if (percent > (policy.duplication_percent_max ?? 5)) return STATUS_BAD;
  return percent > (policy.duplication_percent_review ?? 3) ? STATUS_WARNING : STATUS_GOOD;
}

function statusForCoverage(value, minimum, required = true) {
  if (value == null || !Number.isFinite(Number(value))) return STATUS_WARNING;
  if (required && Number(value) < minimum) return STATUS_BAD;
  return STATUS_GOOD;
}

function statusForTestCase(status) {
  return status === "passed" ? STATUS_GOOD : status === "skipped" ? STATUS_WARNING : STATUS_BAD;
}

function statusForBenchmark(item) {
  return Number(item?.iterations) > 0 && Number(item?.ops_per_second) > 0 ? STATUS_GOOD : STATUS_WARNING;
}

function complexityStatus(item, policy = {}) {
  const review = policy.complexity_review ?? { ccn: 10, nloc: 50, length: 80, arguments: 4, nesting: 3 };
  const hard = policy.complexity_hard ?? { ccn: 15, nloc: 80, length: 120, arguments: 6 };
  const bad = item.ccn > hard.ccn || item.nloc > hard.nloc || item.length > hard.length || item.params > hard.arguments;
  const warning = item.ccn > review.ccn || item.nloc > review.nloc || item.length > review.length
    || item.params > review.arguments || item.nesting > review.nesting;
  return bad ? "BAD" : warning ? "MUST FIX" : "GOOD";
}

function finalStatusRows(summary, jscpd, lizard, fileSize) {
  const bad = [];
  const warnings = [];
  const good = [];
  const add = (label, state) => (state === "BAD" ? bad : state === "MUST FIX" ? warnings : good).push(label);
  add("File size", fileSize.oversized?.length ? "BAD" : fileSize.review?.length ? "MUST FIX" : "GOOD");
  const duplication = summary.jscpd?.duplication_percent ?? jscpd?.summary?.duplication_percent;
  const duplicateState = duplication == null
    ? "MUST FIX"
    : duplication > (summary.policy?.duplication_percent_max ?? 5)
      ? "BAD"
      : duplication > (summary.policy?.duplication_percent_review ?? 3) ? "MUST FIX" : "GOOD";
  add("JSCPD", duplicateState);
  const complexityStates = lizard.map((item) => complexityStatus(item, summary.policy));
  add("Lizard", complexityStates.includes("BAD") ? "BAD" : complexityStates.includes("MUST FIX") ? "MUST FIX" : "GOOD");
  const coverage = summary.coverage?.lines_percent;
  add("Line coverage", coverage == null ? "MUST FIX" : coverage < (summary.policy?.coverage_lines_min ?? 80) ? "BAD" : "GOOD");
  const tests = summary.tests;
  add("Tests", tests?.failures || tests?.errors ? "BAD" : tests?.available === false ? "MUST FIX" : "GOOD");
  for (const [name, tool] of Object.entries(summary.tools ?? {})) {
    add(name, !tool.available ? "BAD" : tool.exit_code ? "BAD" : "GOOD");
  }
  return [[bad.join(", ") || "—", warnings.join(", ") || "—", good.join(", ") || "—"]];
}

function testRows(testResults, cases) {
  const aggregate = testResults?.aggregate ?? {};
  return [
    ["Total", aggregate.tests ?? cases.length, aggregate.tests > 0 || cases.length > 0 ? STATUS_GOOD : STATUS_WARNING],
    ["Passed", aggregate.passed ?? cases.filter(({ status }) => status === "passed").length, aggregate.failures || aggregate.errors ? STATUS_BAD : STATUS_GOOD],
    ["Failed", aggregate.failures ?? cases.filter(({ status }) => status === "failed").length, (aggregate.failures ?? 0) > 0 ? STATUS_BAD : STATUS_GOOD],
    ["Errors", aggregate.errors ?? cases.filter(({ status }) => status === "error").length, (aggregate.errors ?? 0) > 0 ? STATUS_BAD : STATUS_GOOD],
    ["Skipped", aggregate.skipped ?? cases.filter(({ status }) => status === "skipped").length, (aggregate.skipped ?? 0) > 0 ? STATUS_WARNING : STATUS_GOOD],
  ];
}

export function formatQualityReport({ summary, jscpd, lizard, fileSize, tests, cases, benchmarks }) {
  const lines = ["Code Quality Report", "─".repeat(61), ""];
  const lizardRows = lizard.length
    ? lizard.map((item) => [complexityStatus(item, summary.policy), sourceArea(item.file), item.function, item.file, item.nloc, item.ccn, item.params, item.nesting])
    : [["GOOD", "—", "No findings", "—", "—", "—", "—", "—"]];
  lines.push(section("LIZARD — Complexity", ["Status", "Area", "Function", "File:Line", "NLOC", "CCN", "Params", "Nesting"], lizardRows));
  lines.push("");
  lines.push(section("LIZARD — Scope", ["Metric", "Result", "Status"], [
    ["Files analyzed", summary.lizard?.input_files ?? "—", summary.lizard?.input_files != null ? STATUS_GOOD : STATUS_WARNING],
    ["Non-code files skipped", summary.lizard?.skipped_files ?? "—", summary.lizard?.skipped_files != null ? STATUS_GOOD : STATUS_WARNING],
  ]));
  lines.push("");

  const srcFiles = summary.src_files ?? {};
  const excludedSrcFiles = srcFiles.excluded_files ?? [];
  lines.push(section("SRC — Inventory", ["Metric", "Result", "Status"], [
    ["Files discovered", srcFiles.discovered ?? "—", srcFiles.discovered != null ? STATUS_GOOD : STATUS_WARNING],
    ["Files checked", srcFiles.checked ?? "—", srcFiles.checked != null ? STATUS_GOOD : STATUS_WARNING],
    ["Files excluded", srcFiles.excluded ?? "—", srcFiles.excluded === 0 ? STATUS_GOOD : STATUS_WARNING],
    ["Excluded paths", excludedSrcFiles.length ? excludedSrcFiles.join(", ") : "none", excludedSrcFiles.length ? STATUS_WARNING : STATUS_GOOD],
  ]));
  lines.push("");

  const duplication = jscpd?.summary ?? {};
  const duplicationStatus = statusForDuplication(duplication.duplication_percent, summary.policy);
  lines.push(section("JSCPD — Duplication", ["Metric", "Result", "Status"], [
    ["Input source files", srcFiles.checked ?? "—", srcFiles.checked > 0 ? STATUS_GOOD : STATUS_WARNING],
    ["Files above clone floor", duplication.files ?? "—", duplication.files > 0 ? STATUS_GOOD : STATUS_WARNING],
    ["Total lines", duplication.lines ?? "—", duplication.lines > 0 ? STATUS_GOOD : STATUS_WARNING],
    ["Clones", duplication.clones ?? summary.jscpd?.clones ?? "—", duplicationStatus],
    ["Duplicate LOC", duplication.duplicated_lines ?? "—", duplicationStatus],
    ["Duplication", duplication.duplication_percent == null ? "—" : `${Number(duplication.duplication_percent).toFixed(2)}%`, duplicationStatus],
  ]));
  lines.push("");

  lines.push(section("TESTS — Results", ["Metric", "Result", "Status"], testRows(tests, cases)));
  lines.push("");
  lines.push(section("TEST CASES — Detail", ["Test", "File", "Result", "Status", "Time ms"], cases.length
    ? cases.map((item) => [item.name, item.file, item.status, statusForTestCase(item.status), item.time_ms == null ? "—" : item.time_ms.toFixed(2)])
    : [["No JUnit cases", "—", "—", STATUS_WARNING, "—"]]));
  lines.push("");
  lines.push(section("SOURCE — Extensions", ["Extension", "Files", "Lines"], summarizeExtensions(fileSize.files).map((item) => [item.extension, item.files, item.lines])));
  lines.push("");
  lines.push(section("SOURCE — Areas", ["Area", "Files", "Lines", "Review", "Bad"], summarizeSourceAreas(fileSize).map((item) => [item.area, item.files, item.lines, item.review, item.bad])));
  lines.push("");

  const coverage = summary.coverage;
  const coverageMinimum = summary.policy?.coverage_lines_min ?? 80;
  lines.push(section("COVERAGE — LCOV", ["Metric", "Result", "Status"], [
    ["Lines", coverage?.lines_percent == null ? "not reported" : `${coverage.lines_percent.toFixed(2)}%`, statusForCoverage(coverage?.lines_percent, coverageMinimum)],
    ["Branches", coverage?.branches_percent == null ? "not reported" : `${coverage.branches_percent.toFixed(2)}%`, statusForCoverage(coverage?.branches_percent, 0, false)],
    ["Functions", coverage?.functions_percent == null ? "not reported" : `${coverage.functions_percent.toFixed(2)}%`, statusForCoverage(coverage?.functions_percent, 0, false)],
  ]));
  lines.push("");

  lines.push(section("BENCHMARKS — Throughput", ["Scenario", "Iterations", "Total ms", "Ops/s", "Status"], benchmarks.length
    ? benchmarks.map((item) => [item.name, item.iterations, item.elapsed_ms, item.ops_per_second, statusForBenchmark(item)])
    : [["No benchmark report", "—", "—", "—", STATUS_WARNING]]));
  lines.push("");
  lines.push(section("FINAL STATUS", ["BAD(FAIL)", "MUST FIX(WARNING)", "GOOD"], finalStatusRows(summary, jscpd, lizard, fileSize)));
  lines.push("");
  lines.push(`Gate: ${(summary.gate?.status ?? "unknown").toUpperCase()}`);
  for (const failure of summary.gate?.failures ?? []) lines.push(`  ! ${failure}`);
  if (summary.gate?.warnings?.length) {
    lines.push("Advisories:");
    for (const warning of summary.gate.warnings) lines.push(`  ~ ${warning}`);
  }
  return lines.join("\n");
}

async function loadCases(repoRoot, testResults) {
  const cases = [];
  for (const file of [...new Set((testResults?.reports ?? []).map(({ file }) => file).filter(Boolean))]) {
    cases.push(...parseJUnitCases(await readText(resolve(repoRoot, file)), repoRoot));
  }
  return cases;
}

export async function writeQualityReport({
  repoRoot = DEFAULT_REPO_ROOT,
  reportRoot = resolve(repoRoot, "reports/quality"),
  summary,
  fileSize,
  testResults,
} = {}) {
  const [jscpd, lizardText, lizardReviewText, benchmarks] = await Promise.all([
    readJson(resolve(reportRoot, "jscpd-metrics.json"), null),
    readText(resolve(reportRoot, "lizard-gate.txt")),
    readText(resolve(reportRoot, "lizard-review.txt")),
    readJson(resolve(reportRoot, "benchmarks.json"), { benchmarks: [] }),
  ]);
  const cases = await loadCases(repoRoot, testResults);
  const report = formatQualityReport({
    summary,
    jscpd,
    lizard: parseLizardFindings(lizardReviewText || lizardText),
    fileSize,
    tests: testResults,
    cases,
    benchmarks: benchmarks.benchmarks ?? [],
  });
  await writeFile(resolve(reportRoot, "quality-report.txt"), `${report}\n`);
  return report;
}
