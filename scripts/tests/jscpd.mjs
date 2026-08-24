import { spawn } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = resolve(scriptDir, "../..");
export const DEFAULT_OUTPUT = resolve(DEFAULT_REPO_ROOT, "reports/quality/jscpd");
export const DEFAULT_METRICS = resolve(DEFAULT_REPO_ROOT, "reports/quality/jscpd-metrics.json");
export const DEFAULT_REPORTERS = ["console", "json", "sarif"];
export const DEFAULT_MIN_LINES = 10;
export const DEFAULT_MIN_TOKENS = 50;
export const DEFAULT_THRESHOLD = 5;
export const DEFAULT_MODE = "mild";
export const JSCPD_MODES = new Set(["strict", "mild", "weak"]);
export const DEFAULT_IGNORES = [
  "**/.git/**",
  "**/.cache/**",
  "**/.gradle/**",
  "**/.next/**",
  "**/.nuxt/**",
  "**/.parcel-cache/**",
  "**/.pytest_cache/**",
  "**/.ruff_cache/**",
  "**/.tox/**",
  "**/.venv/**",
  "**/__pycache__/**",
  "**/node_modules/**",
  "**/target/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/vendor/**",
  "**/third_party/**",
  "**/generated/**",
  "**/reports/**",
  "**/*.generated.*",
  "**/*.min.*",
  "**/*.map",
  "**/*.snap",
  "**/*.lock",
  "**/package-lock.json",
  "**/pnpm-lock.yaml",
  "**/yarn.lock",
];

function positiveInteger(value, name) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function percentage(value, name) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`${name} must be between 0 and 100`);
  }
  return parsed;
}

function requiredValue(argv, index, argument) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
  return value;
}

function commaList(value, argument) {
  const parsed = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (parsed.length === 0) throw new Error(`${argument} requires at least one value`);
  return parsed;
}

function unique(values) {
  return [...new Set(values)];
}

export function parseCliArgs(argv, { repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const options = {
    repoRoot,
    metrics: resolve(repoRoot, "reports/quality/jscpd-metrics.json"),
    minLines: DEFAULT_MIN_LINES,
    minTokens: DEFAULT_MIN_TOKENS,
    mode: DEFAULT_MODE,
    output: resolve(repoRoot, "reports/quality/jscpd"),
    reporters: [...DEFAULT_REPORTERS],
    threshold: DEFAULT_THRESHOLD,
    ignores: [...DEFAULT_IGNORES],
    paths: [],
    blame: false,
    crossFormats: [],
    binary: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--blame") {
      options.blame = true;
      continue;
    }
    if (!argument.startsWith("--")) {
      options.paths.push(argument);
      continue;
    }

    const value = requiredValue(argv, index, argument);
    if (argument === "--reporters") options.reporters = commaList(value, argument);
    else if (argument === "--output") options.output = resolve(repoRoot, value);
    else if (argument === "--metrics") options.metrics = resolve(repoRoot, value);
    else if (argument === "--min-lines") options.minLines = positiveInteger(value, argument);
    else if (argument === "--min-tokens") options.minTokens = positiveInteger(value, argument);
    else if (argument === "--threshold") options.threshold = percentage(value, argument);
    else if (argument === "--mode") {
      if (!JSCPD_MODES.has(value)) throw new Error(`--mode must be strict, mild, or weak`);
      options.mode = value;
    } else if (argument === "--ignore") options.ignores.push(...commaList(value, argument));
    else if (argument === "--cross-formats") {
      options.crossFormats.push(...commaList(value, argument));
    } else if (argument === "--binary") options.binary = value;
    else throw new Error(`Unknown argument: ${argument}`);
    index += 1;
  }

  options.reporters = unique([...options.reporters, "json"]);
  options.ignores = unique(options.ignores);
  options.crossFormats = unique(options.crossFormats);
  if (options.paths.length === 0) options.paths.push(".");
  return options;
}

export function buildJscpdArgs(options) {
  const args = [
    ...options.paths,
    "--reporters",
    unique([...options.reporters, "json"]).join(","),
    "--output",
    options.output,
    "--min-lines",
    String(options.minLines),
    "--min-tokens",
    String(options.minTokens),
    "--threshold",
    String(options.threshold),
    "--mode",
    options.mode,
    "--ignore",
    options.ignores.join(","),
    "--no-tips",
  ];
  if (options.blame) args.push("--blame");
  if (options.crossFormats.length) args.push("--cross-formats", options.crossFormats.join(","));
  return args;
}

function formatStatistics(report) {
  const statistics = report?.statistics ?? {};
  return Object.fromEntries(
    Object.entries(statistics)
      .filter(([name, value]) => name !== "total" && value && typeof value === "object")
      .map(([name, value]) => [
        name,
        {
          clones: Number(value.clones ?? 0),
          duplicated_lines: Number(value.duplicatedLines ?? 0),
          duplication_percent: Number(value.percentage ?? 0),
          files: Number(value.sources ?? 0),
          lines: Number(value.lines ?? 0),
          tokens: Number(value.tokens ?? 0),
        },
      ]),
  );
}

export function summarizeReport(report, options, { version = "unknown" } = {}) {
  const total = report?.statistics?.total ?? {};
  const duplicationPercent = Number(total.percentage ?? 0);
  return {
    generated_at: report?.statistics?.detectionDate ?? null,
    input: {
      min_lines: options.minLines,
      min_tokens: options.minTokens,
      mode: options.mode,
      paths: options.paths,
      reporters: options.reporters,
      ignores: options.ignores,
      threshold_percent: options.threshold,
      blame: Boolean(options.blame),
      cross_formats: options.crossFormats ?? [],
    },
    summary: {
      clones: Number(total.clones ?? 0),
      duplicated_lines: Number(total.duplicatedLines ?? 0),
      duplication_percent: duplicationPercent,
      files: Number(total.sources ?? 0),
      lines: Number(total.lines ?? 0),
      tokens: Number(total.tokens ?? 0),
      threshold_exceeded: duplicationPercent > options.threshold,
    },
    by_format: formatStatistics(report),
    tool: "jscpd",
    version,
  };
}

function spawnCapture(command, args, { cwd }) {
  return new Promise((resolveRun) => {
    let child;
    try {
      child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
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

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function resolveJscpdBinary({
  repoRoot = DEFAULT_REPO_ROOT,
  env = process.env,
  explicit = null,
} = {}) {
  if (explicit) return explicit;
  if (env.JSCPD_BIN) return env.JSCPD_BIN;
  const local = resolve(
    repoRoot,
    `node_modules/.bin/jscpd${process.platform === "win32" ? ".cmd" : ""}`,
  );
  if (await exists(local)) return local;
  return "jscpd";
}

export async function detectJscpdVersion(binary, { repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const result = await spawnCapture(binary, ["--version"], { cwd: repoRoot });
  if (result.missing || result.code !== 0) return "unknown";
  return (result.stdout || result.stderr).trim().split(/\s+/).at(-1) || "unknown";
}

export async function runJscpd(options) {
  const repoRoot = options.repoRoot ?? DEFAULT_REPO_ROOT;
  const binary = await resolveJscpdBinary({
    repoRoot,
    explicit: options.binary,
  });
  await mkdir(options.output, { recursive: true });
  const run = await spawnCapture(binary, buildJscpdArgs(options), { cwd: repoRoot });
  if (run.missing) {
    return {
      available: false,
      exitCode: null,
      binary,
      error: `jscpd executable not found: ${binary}`,
      stdout: run.stdout,
      stderr: run.stderr,
    };
  }

  const reportPath = resolve(options.output, "jscpd-report.json");
  let report;
  try {
    report = JSON.parse(await readFile(reportPath, "utf8"));
  } catch (error) {
    const detail = (run.stderr || run.stdout).trim();
    throw new Error(
      `jscpd exited ${run.code} but JSON report was not readable at ${reportPath}: ${error.message}${detail ? `\n${detail}` : ""}`,
    );
  }

  const version = await detectJscpdVersion(binary, { repoRoot });
  const metrics = summarizeReport(report, options, { version });
  await mkdir(dirname(options.metrics), { recursive: true });
  await writeFile(options.metrics, `${JSON.stringify(metrics, null, 2)}\n`);
  return {
    available: true,
    exitCode: run.code,
    binary,
    metrics,
    reportPath,
    stdout: run.stdout,
    stderr: run.stderr,
  };
}

export function helpText() {
  return `Usage: node scripts/jscpd.mjs [PATH...] [options]

Options:
  --reporters LIST      Comma-separated reporters; json is always added
  --output PATH         Reporter directory (default: reports/quality/jscpd)
  --metrics PATH        Normalized metrics JSON output
  --min-lines N         Minimum duplicated lines (default: ${DEFAULT_MIN_LINES})
  --min-tokens N        Minimum duplicated tokens (default: ${DEFAULT_MIN_TOKENS})
  --threshold N         Maximum project duplication percentage (default: ${DEFAULT_THRESHOLD})
  --mode MODE           strict | mild | weak (default: ${DEFAULT_MODE})
  --ignore LIST         Additional comma-separated ignore globs
  --cross-formats LIST  jscpd v5 cross-format groups, e.g. js-ts
  --blame               Add git blame metadata to duplicate findings
  --binary PATH         Explicit jscpd/cpd executable`;
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  if (options.help) {
    console.log(helpText());
    return 0;
  }
  const result = await runJscpd(options);
  if (!result.available) {
    console.error(result.error);
    return 127;
  }
  if (result.stdout.trim()) console.log(result.stdout.trim());
  if (result.stderr.trim()) console.error(result.stderr.trim());
  console.log(`Metrics written to ${options.metrics}`);
  return result.exitCode;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
