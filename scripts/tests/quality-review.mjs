import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkFileSizes,
  formatFileSizeReport,
  sourceFiles,
} from "./check-file-size.mjs";
import {
  DEFAULT_IGNORES,
  DEFAULT_MIN_LINES,
  DEFAULT_MIN_TOKENS,
  DEFAULT_THRESHOLD,
  runJscpd,
} from "./jscpd.mjs";

// Quality gate ignores short generated/UI boilerplate clones; standalone jscpd keeps its stricter defaults.
const QUALITY_MIN_LINES = 50;
const QUALITY_MIN_TOKENS = 100;
const LIZARD_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);
import {
  collectCoverage,
  collectGitChurn,
  collectTestResults,
  rankHotspots,
  runCommand,
  summarizeTrivyReport,
} from "./quality-metrics.mjs";
import { evaluateQualityGate, POLICY } from "./quality-policy.mjs";
export { evaluateQualityGate, POLICY } from "./quality-policy.mjs";
import { parseLizardFindings, writeQualityReport } from "./quality-report.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = resolve(scriptDir, "../..");
export const DEFAULT_QUALITY_PATHS = ["src"];

function positiveInteger(value, name) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function percentage(value, name) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) throw new Error(`${name} must be between 0 and 100`);
  return parsed;
}

function requiredValue(argv, index, argument) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
  return value;
}

export function parseQualityArgs(argv, { repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const options = {
    repoRoot,
    paths: [],
    strict: false,
    requireTools: false,
    requireEvidence: false,
    security: false,
    skipTools: false,
    skipJscpd: false,
    skipLizard: false,
    coverageMin: POLICY.coverage.linePercentMin,
    churnDays: POLICY.churn.days,
    coverageFiles: [],
    testFiles: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--strict") options.strict = true;
    else if (argument === "--require-tools") options.requireTools = true;
    else if (argument === "--require-evidence") options.requireEvidence = true;
    else if (argument === "--security") options.security = true;
    else if (argument === "--no-tools") options.skipTools = true;
    else if (argument === "--no-jscpd") options.skipJscpd = true;
    else if (argument === "--no-lizard") options.skipLizard = true;
    else if (!argument.startsWith("--")) options.paths.push(argument);
    else {
      const value = requiredValue(argv, index, argument);
      if (argument === "--root") options.repoRoot = resolve(value);
      else if (argument === "--coverage-min") options.coverageMin = percentage(value, argument);
      else if (argument === "--churn-days") options.churnDays = positiveInteger(value, argument);
      else if (argument === "--coverage") options.coverageFiles.push(value);
      else if (argument === "--test-report") options.testFiles.push(value);
      else throw new Error(`Unknown argument: ${argument}`);
      index += 1;
    }
  }
  if (options.paths.length === 0) options.paths.push(...DEFAULT_QUALITY_PATHS);
  return options;
}

async function writeReport(reportRoot, name, content) {
  await writeFile(resolve(reportRoot, name), `${String(content).trim()}\n`);
}

async function resolveLizardPython(repoRoot) {
  const configured = process.env.LIZARD_PYTHON;
  if (configured) return configured;
  const local = resolve(
    repoRoot,
    ".quality-venv",
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
  try {
    await access(local);
    return local;
  } catch {
    return "python";
  }
}

async function runLizardWithLimits(repoRoot, filesList, limits) {
  const args = [
    "-f",
    filesList,
    "-C",
    String(limits.ccn),
    "-L",
    String(limits.length),
    "-a",
    String(limits.arguments),
    "-T",
    `nloc=${limits.nloc}`,
    "--warnings_only",
  ];
  const direct = markLizardFindings(await runCommand("lizard", args, { cwd: repoRoot }));
  if (!direct.missing) return { ...direct, available: true };
  const fallback = markLizardFindings(
    await runCommand(await resolveLizardPython(repoRoot), ["-m", "lizard", ...args], { cwd: repoRoot }),
  );
  if (/No module named lizard/i.test(fallback.stderr) || fallback.missing) {
    return { ...fallback, available: false, missing: true };
  }
  return { ...fallback, available: true };
}

function markLizardFindings(result) {
  if (result.code === 0 && result.stdout.trim()) result.code = 1;
  return result;
}

async function runLizard(repoRoot, reportRoot, files, strict) {
  const lizardFiles = files.filter(({ file }) => LIZARD_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const listPath = resolve(reportRoot, "lizard-files.txt");
  await writeFile(listPath, `${lizardFiles.map(({ file }) => file).join("\n")}\n`);
  const review = await runLizardWithLimits(repoRoot, listPath, POLICY.complexity.review);
  if (!review.available) return { available: false, review, gate: review, input_files: lizardFiles.length, skipped_files: files.length - lizardFiles.length };
  const gate = strict ? review : await runLizardWithLimits(repoRoot, listPath, POLICY.complexity.hard);
  return { available: gate.available, review, gate, input_files: lizardFiles.length, skipped_files: files.length - lizardFiles.length };
}

async function listFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join("/"));
    }
  }
  await visit(root);
  return files.sort();
}

const QUALITY_TOOLS = [
  {
    key: "eslint",
    report: "eslint.txt",
    command: "pnpm",
    args: ["exec", "eslint", "src", "scripts", "--max-warnings", "0"],
  },
  {
    key: "typescript",
    report: "typescript.txt",
    command: "pnpm",
    args: ["exec", "tsc", "--noEmit"],
  },
];

function commandMissing(result) {
  return result.missing || /(?:command .* not found|no such command|not found)/i.test(result.stderr);
}

async function runQualityTools(repoRoot, reportRoot) {
  const tools = {};
  for (const spec of QUALITY_TOOLS) {
    const result = await runCommand(spec.command, spec.args, { cwd: repoRoot });
    const missing = commandMissing(result);
    tools[spec.key] = {
      enabled: true,
      available: !missing,
      exit_code: missing ? null : result.code,
    };
    await writeReport(reportRoot, spec.report, result.stdout || result.stderr || (missing ? "tool unavailable" : "no findings"));
  }
  return tools;
}

async function runTrivy(repoRoot, reportRoot) {
  const reportPath = resolve(reportRoot, "trivy.json");
  const result = await runCommand(
    "trivy",
    [
      "fs",
      "--scanners",
      "vuln,misconfig,secret",
      "--severity",
      "HIGH,CRITICAL",
      "--exit-code",
      "1",
      "--format",
      "json",
      "--output",
      reportPath,
      ".",
    ],
    { cwd: repoRoot },
  );
  if (result.missing) return { available: false, exitCode: null, error: "trivy executable not found" };
  let metrics = null;
  try {
    metrics = summarizeTrivyReport(JSON.parse(await readFile(reportPath, "utf8")));
  } catch (error) {
    return { available: true, exitCode: result.code, error: error.message, stdout: result.stdout, stderr: result.stderr };
  }
  return { available: true, exitCode: result.code, reportPath, metrics, stdout: result.stdout, stderr: result.stderr };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseQualityArgs(argv);
  const repoRoot = options.repoRoot;
  const reportRoot = resolve(repoRoot, "reports/quality");
  await mkdir(reportRoot, { recursive: true });

  const fileSize = await checkFileSizes({ repoRoot, roots: options.paths });
  const srcRoot = resolve(repoRoot, "src");
  const discoveredSrcFiles = await listFiles(srcRoot);
  const checkedSrcFiles = new Set(fileSize.files.map(({ file }) => file.replaceAll("\\", "/").replace(/^src\//, "")));
  const excludedSrcFiles = discoveredSrcFiles.filter((file) => !checkedSrcFiles.has(file));
  await writeReport(reportRoot, "file-size.txt", formatFileSizeReport(fileSize));

  let jscpd = { available: false, exitCode: null, metrics: null, error: "disabled" };
  if (!options.skipJscpd) {
    try {
      jscpd = await runJscpd({
        repoRoot,
        paths: options.paths,
        output: resolve(reportRoot, "jscpd"),
        metrics: resolve(reportRoot, "jscpd-metrics.json"),
        reporters: ["json", "sarif"],
        minLines: QUALITY_MIN_LINES,
        minTokens: QUALITY_MIN_TOKENS,
        threshold: options.strict ? POLICY.duplication.reviewPercent : POLICY.duplication.hardPercent,
        mode: options.strict ? "strict" : "mild",
        ignores: DEFAULT_IGNORES,
        blame: false,
        crossFormats: [],
        binary: null,
      });
    } catch (error) {
      jscpd = { available: true, exitCode: 1, metrics: null, error: error.message };
    }
  }
  await writeReport(reportRoot, "jscpd.txt", jscpd.metrics ? JSON.stringify(jscpd.metrics, null, 2) : jscpd.error ?? "unavailable");

  const lizard = options.skipLizard
    ? { available: false, review: { code: null }, gate: { code: null }, disabled: true }
    : await runLizard(repoRoot, reportRoot, fileSize.files, options.strict);
  await writeReport(reportRoot, "lizard-review.txt", lizard.review?.stdout || lizard.review?.stderr || (lizard.available ? "lizard: no findings" : "lizard unavailable"));
  await writeReport(reportRoot, "lizard-gate.txt", lizard.gate?.stdout || lizard.gate?.stderr || (lizard.available ? "lizard: no findings" : "lizard unavailable"));

  const tools = options.skipTools ? {} : await runQualityTools(repoRoot, reportRoot);

  const coverage = await collectCoverage(repoRoot, options.coverageFiles);
  const tests = await collectTestResults(repoRoot, options.testFiles);
  const churn = await collectGitChurn(repoRoot, { days: options.churnDays });
  const hotspots = rankHotspots(fileSize.files, churn.files ?? [], {
    reviewLimit: POLICY.file.review,
    limit: POLICY.churn.hotspotLimit,
  });
  await writeReport(reportRoot, "coverage.json", JSON.stringify(coverage, null, 2));
  await writeReport(reportRoot, "tests.json", JSON.stringify(tests, null, 2));
  await writeReport(reportRoot, "churn.json", JSON.stringify(churn, null, 2));
  await writeReport(reportRoot, "hotspots.json", JSON.stringify(hotspots, null, 2));

  const security = options.security
    ? await runTrivy(repoRoot, reportRoot)
    : { available: false, exitCode: null, error: "not requested" };
  await writeReport(reportRoot, "security.json", JSON.stringify(security, null, 2));

  let benchmarks = { available: false, scenarios: 0 };
  try {
    const report = JSON.parse(await readFile(resolve(reportRoot, "benchmarks.json"), "utf8"));
    benchmarks = { available: Array.isArray(report.benchmarks), scenarios: report.benchmarks?.length ?? 0 };
  } catch {
    // quality:benchmark is run by the package script before this review.
  }

  const summary = {
    generated_at: new Date().toISOString(),
    mode: options.strict ? "strict" : "default",
    file_size: {
      files: fileSize.files.length,
      review: fileSize.review.length,
      oversized: fileSize.oversized.length,
    },
    jscpd: {
      enabled: !options.skipJscpd,
      available: Boolean(jscpd.available),
      exit_code: jscpd.exitCode,
      duplication_percent: jscpd.metrics?.summary?.duplication_percent ?? null,
      clones: jscpd.metrics?.summary?.clones ?? null,
    },
    lizard: {
      enabled: !options.skipLizard,
      available: Boolean(lizard.available),
      exit_code: lizard.gate?.code ?? null,
      review_exit_code: lizard.review?.code ?? null,
      findings: parseLizardFindings(lizard.review?.stdout ?? "").length,
      hard_findings: parseLizardFindings(lizard.gate?.stdout ?? "").length,
      input_files: lizard.input_files ?? 0,
      skipped_files: lizard.skipped_files ?? 0,
    },
    coverage: {
      available: coverage.available,
      reports: coverage.aggregate.reports,
      lines_percent: coverage.aggregate.lines.percent,
      branches_percent: coverage.aggregate.branches.percent,
      functions_percent: coverage.aggregate.functions.percent,
    },
    tests: {
      available: tests.available,
      ...tests.aggregate,
    },
    churn: {
      available: churn.available,
      days: churn.days,
      files_changed: churn.files?.length ?? 0,
      total_changes: churn.total_changes ?? 0,
      hotspots,
    },
    security: {
      enabled: options.security,
      available: Boolean(security.available),
      exit_code: security.exitCode,
      findings: security.metrics?.findings ?? null,
      high: security.metrics?.high ?? null,
      critical: security.metrics?.critical ?? null,
    },
    src_files: {
      root: "src",
      discovered: discoveredSrcFiles.length,
      checked: fileSize.files.length,
      excluded: excludedSrcFiles.length,
      excluded_files: excludedSrcFiles,
    },
    benchmarks,
    tools,
    policy: {
      file_lines_review: POLICY.file.review,
      file_lines_hard: POLICY.file.hard,
      duplication_percent_review: POLICY.duplication.reviewPercent,
      duplication_percent_max: POLICY.duplication.hardPercent,
      complexity_review: POLICY.complexity.review,
      complexity_hard: POLICY.complexity.hard,
      coverage_lines_min: options.coverageMin,
      churn_days: options.churnDays,
    },
  };
  summary.gate = evaluateQualityGate(summary, options);
  await writeReport(reportRoot, "summary.json", JSON.stringify(summary, null, 2));
  const report = await writeQualityReport({ repoRoot, reportRoot, summary, fileSize, testResults: tests });
  console.log(report);
  return summary.gate.status === "fail" ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exitCode = 1;
    });
}
