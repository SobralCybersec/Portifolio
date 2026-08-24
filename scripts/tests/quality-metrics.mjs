import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { summarizeTrivyReport } from "./quality-security.mjs";
export { summarizeTrivyReport } from "./quality-security.mjs";

const COVERAGE_FILE_RE = /^(?:lcov\.info|coverage\.xml|jacoco(?:TestReport)?\.xml)$/i;
const TEST_FILE_RE = /(?:^|[-_.])(?:junit|test-results?|surefire|failsafe)(?:[-_.]|$).*\.xml$/i;
const DISCOVERY_IGNORES = new Set([
  ".git",
  ".cache",
  ".venv",
  ".quality-venv",
  "node_modules",
  "vendor",
  "third_party",
]);

function percent(covered, found) {
  return found > 0 ? (covered / found) * 100 : null;
}

function round(value, digits = 2) {
  if (value == null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function numberAttribute(attributes, name) {
  const match = new RegExp(`\\b${name}=["']([0-9.]+)["']`, "i").exec(attributes);
  return match ? Number(match[1]) : null;
}

export function parseLcov(text) {
  let linesFound = 0;
  let linesHit = 0;
  let branchesFound = 0;
  let branchesHit = 0;
  let functionsFound = 0;
  let functionsHit = 0;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("LF:")) linesFound += Number(line.slice(3)) || 0;
    else if (line.startsWith("LH:")) linesHit += Number(line.slice(3)) || 0;
    else if (line.startsWith("BRF:")) branchesFound += Number(line.slice(4)) || 0;
    else if (line.startsWith("BRH:")) branchesHit += Number(line.slice(4)) || 0;
    else if (line.startsWith("FNF:")) functionsFound += Number(line.slice(4)) || 0;
    else if (line.startsWith("FNH:")) functionsHit += Number(line.slice(4)) || 0;
  }

  return {
    format: "lcov",
    lines: { found: linesFound, covered: linesHit, percent: round(percent(linesHit, linesFound)) },
    branches: {
      found: branchesFound,
      covered: branchesHit,
      percent: round(percent(branchesHit, branchesFound)),
    },
    functions: {
      found: functionsFound,
      covered: functionsHit,
      percent: round(percent(functionsHit, functionsFound)),
    },
  };
}

export function parseCoberturaXml(text) {
  const root = /<coverage\b([^>]*)>/i.exec(text);
  if (!root) throw new Error("Cobertura coverage root not found");
  const attributes = root[1];
  const linesFound = numberAttribute(attributes, "lines-valid");
  const linesCovered = numberAttribute(attributes, "lines-covered");
  const branchesFound = numberAttribute(attributes, "branches-valid");
  const branchesCovered = numberAttribute(attributes, "branches-covered");
  const lineRate = numberAttribute(attributes, "line-rate");
  const branchRate = numberAttribute(attributes, "branch-rate");

  return {
    format: "cobertura",
    lines: {
      found: linesFound,
      covered: linesCovered,
      percent: round(
        linesFound != null && linesCovered != null
          ? percent(linesCovered, linesFound)
          : lineRate == null
            ? null
            : lineRate * 100,
      ),
    },
    branches: {
      found: branchesFound,
      covered: branchesCovered,
      percent: round(
        branchesFound != null && branchesCovered != null
          ? percent(branchesCovered, branchesFound)
          : branchRate == null
            ? null
            : branchRate * 100,
      ),
    },
    functions: { found: null, covered: null, percent: null },
  };
}

export function parseJacocoXml(text) {
  const counters = new Map();
  const regex = /<counter\s+type=["']([A-Z]+)["']\s+missed=["'](\d+)["']\s+covered=["'](\d+)["']\s*\/>/g;
  for (const match of text.matchAll(regex)) {
    counters.set(match[1], { missed: Number(match[2]), covered: Number(match[3]) });
  }
  if (counters.size === 0) throw new Error("JaCoCo counters not found");
  const metric = (name) => {
    const value = counters.get(name);
    if (!value) return { found: null, covered: null, percent: null };
    const found = value.missed + value.covered;
    return { found, covered: value.covered, percent: round(percent(value.covered, found)) };
  };
  return {
    format: "jacoco",
    lines: metric("LINE"),
    branches: metric("BRANCH"),
    functions: metric("METHOD"),
  };
}

export function parseCoverageReport(file, text) {
  const basename = path.basename(file).toLowerCase();
  if (basename === "lcov.info" || /^(?:TN:|SF:|DA:)/m.test(text)) return parseLcov(text);
  if (/<coverage\b/i.test(text)) return parseCoberturaXml(text);
  if (/<report\b/i.test(text) && /<counter\s+type=["'](?:LINE|BRANCH|METHOD)["']/i.test(text)) {
    return parseJacocoXml(text);
  }
  throw new Error(`Unsupported coverage report format: ${file}`);
}

export function aggregateCoverage(reports) {
  const total = (key) => {
    let found = 0;
    let covered = 0;
    let hasCounts = false;
    const rates = [];
    for (const report of reports) {
      const metric = report[key];
      if (metric?.found != null && metric?.covered != null) {
        found += metric.found;
        covered += metric.covered;
        hasCounts = true;
      } else if (metric?.percent != null) rates.push(metric.percent);
    }
    return {
      found: hasCounts ? found : null,
      covered: hasCounts ? covered : null,
      percent: hasCounts
        ? round(percent(covered, found))
        : rates.length
          ? round(rates.reduce((sum, value) => sum + value, 0) / rates.length)
          : null,
    };
  };
  return {
    reports: reports.length,
    lines: total("lines"),
    branches: total("branches"),
    functions: total("functions"),
  };
}

export function parseJUnitXml(text) {
  const root = /<(testsuites|testsuite)\b([^>]*)>/i.exec(text);
  if (!root) throw new Error("JUnit testsuite root not found");
  const attributes = root[2];
  const countTags = (tag) => [...text.matchAll(new RegExp(`<${tag}\\b`, "gi"))].length;
  const tests = numberAttribute(attributes, "tests") ?? countTags("testcase");
  const failures = numberAttribute(attributes, "failures") ?? countTags("failure");
  const errors = numberAttribute(attributes, "errors") ?? countTags("error");
  const skipped = numberAttribute(attributes, "skipped") ?? countTags("skipped");
  return {
    tests,
    failures,
    errors,
    skipped,
    passed: Math.max(0, tests - failures - errors - skipped),
  };
}

export function aggregateTestResults(reports) {
  return reports.reduce(
    (total, report) => ({
      reports: total.reports + 1,
      tests: total.tests + report.tests,
      failures: total.failures + report.failures,
      errors: total.errors + report.errors,
      skipped: total.skipped + report.skipped,
      passed: total.passed + report.passed,
    }),
    { reports: 0, tests: 0, failures: 0, errors: 0, skipped: 0, passed: 0 },
  );
}

export async function discoverMetricFiles(repoRoot, { maxDepth = 6 } = {}) {
  const coverage = [];
  const tests = [];

  async function visit(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "EACCES") return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!DISCOVERY_IGNORES.has(entry.name)) await visit(absolute, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      if (COVERAGE_FILE_RE.test(entry.name)) coverage.push(absolute);
      if (TEST_FILE_RE.test(entry.name) || entry.name === "junit.xml") tests.push(absolute);
    }
  }

  await visit(repoRoot, 0);
  return { coverage: coverage.sort(), tests: tests.sort() };
}

export async function collectCoverage(repoRoot, explicitFiles = []) {
  const discovered = explicitFiles.length
    ? explicitFiles.map((file) => path.resolve(repoRoot, file))
    : (await discoverMetricFiles(repoRoot)).coverage;
  const reports = [];
  const errors = [];
  for (const file of [...new Set(discovered)]) {
    try {
      const parsed = parseCoverageReport(file, await readFile(file, "utf8"));
      reports.push({ file: path.relative(repoRoot, file).split(path.sep).join("/"), ...parsed });
    } catch (error) {
      errors.push({ file: path.relative(repoRoot, file).split(path.sep).join("/"), error: error.message });
    }
  }
  return { available: reports.length > 0, aggregate: aggregateCoverage(reports), reports, errors };
}

export async function collectTestResults(repoRoot, explicitFiles = []) {
  const discovered = explicitFiles.length
    ? explicitFiles.map((file) => path.resolve(repoRoot, file))
    : (await discoverMetricFiles(repoRoot)).tests;
  const reports = [];
  const errors = [];
  for (const file of [...new Set(discovered)]) {
    try {
      reports.push({
        file: path.relative(repoRoot, file).split(path.sep).join("/"),
        ...parseJUnitXml(await readFile(file, "utf8")),
      });
    } catch (error) {
      errors.push({ file: path.relative(repoRoot, file).split(path.sep).join("/"), error: error.message });
    }
  }
  return { available: reports.length > 0, aggregate: aggregateTestResults(reports), reports, errors };
}

export function runCommand(command, args, { cwd = process.cwd(), env = process.env } = {}) {
  return new Promise((resolveRun) => {
    let child;
    try {
      child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      resolveRun({ code: 127, missing: error.code === "ENOENT", stdout: "", stderr: error.message });
      return;
    }
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) =>
      resolveRun({
        code: 127,
        missing: error.code === "ENOENT",
        stdout,
        stderr: `${stderr}${error.message}`,
      }),
    );
    child.on("close", (code) => resolveRun({ code: code ?? 1, missing: false, stdout, stderr }));
  });
}

export function parseGitNumstat(text) {
  const byFile = new Map();
  let commit = null;
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("@@COMMIT:")) {
      commit = line.slice("@@COMMIT:".length);
      continue;
    }
    const match = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(line);
    if (!match) continue;
    const rawFile = match[3];
    const file = rawFile.includes("{") && rawFile.includes(" => ")
      ? rawFile.replace(/\{[^{}]* => ([^{}]*)\}/g, "$1")
      : rawFile.includes(" => ")
        ? rawFile.split(" => ").at(-1).trim()
        : rawFile;
    const current = byFile.get(file) ?? {
      file,
      additions: 0,
      deletions: 0,
      changes: 0,
      commits: new Set(),
      binary_changes: 0,
    };
    if (match[1] === "-" || match[2] === "-") current.binary_changes += 1;
    else {
      current.additions += Number(match[1]);
      current.deletions += Number(match[2]);
      current.changes += Number(match[1]) + Number(match[2]);
    }
    if (commit) current.commits.add(commit);
    byFile.set(file, current);
  }
  return [...byFile.values()]
    .map((entry) => ({ ...entry, commits: entry.commits.size }))
    .sort((left, right) => right.changes - left.changes || right.commits - left.commits || left.file.localeCompare(right.file));
}

export async function collectGitChurn(repoRoot, { days = 90 } = {}) {
  if (!Number.isInteger(days) || days < 1) throw new Error("churn days must be a positive integer");
  const result = await runCommand(
    "git",
    ["log", `--since=${days}.days`, "--numstat", "--format=@@COMMIT:%H", "--", "."],
    { cwd: repoRoot },
  );
  if (result.missing || result.code !== 0) {
    return {
      available: false,
      days,
      files: [],
      error: result.missing ? "git executable not found" : (result.stderr || result.stdout).trim(),
    };
  }
  const files = parseGitNumstat(result.stdout);
  return {
    available: true,
    days,
    files,
    total_changes: files.reduce((sum, item) => sum + item.changes, 0),
  };
}

export function rankHotspots(fileMetrics, churnFiles, { reviewLimit = 500, limit = 20 } = {}) {
  const churn = new Map(churnFiles.map((entry) => [entry.file.split(path.sep).join("/"), entry]));
  return fileMetrics
    .map(({ file, lines }) => {
      const history = churn.get(file) ?? { additions: 0, deletions: 0, changes: 0, commits: 0 };
      const sizeFactor = Math.max(0.25, lines / reviewLimit);
      const changeFactor = history.changes > 0 || history.commits > 0
        ? Math.log2(1 + history.changes + history.commits * 5)
        : 0;
      return {
        file,
        lines,
        additions: history.additions,
        deletions: history.deletions,
        changes: history.changes,
        commits: history.commits,
        risk_score: round(sizeFactor * changeFactor, 3),
      };
    })
    .filter((entry) => entry.risk_score > 0)
    .sort((left, right) => right.risk_score - left.risk_score || right.changes - left.changes || left.file.localeCompare(right.file))
    .slice(0, limit);
}
