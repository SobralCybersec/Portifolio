import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { parseJUnitXml, parseLcov } from "./quality-metrics.mjs";

const OUTPUT = "reports/quality/benchmarks.json";
const LCOV = "TN:\nSF:src/example.ts\nFNF:2\nFNH:2\nDA:1,1\nDA:2,1\nLF:2\nLH:2\nBRF:0\nBRH:0\nend_of_record\n";
const JUNIT = '<testsuites tests="2" failures="0" errors="0" skipped="0"><testcase name="one"/><testcase name="two"/></testsuites>';
const DEFAULT_ITERATIONS = 1000;
const DEFAULT_WARMUP_ITERATIONS = 100;
const DEFAULT_FIXTURE_SCALE = 1;

function positiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function fixtureScale(value) {
  return positiveInteger(value, "fixtureScale");
}

function scaledLcov(scale) {
  return Array.from({ length: scale }, (_, index) =>
    LCOV.replace("src/example.ts", `src/example-${index}.ts`),
  ).join("");
}

function scaledJUnit(scale) {
  const cases = Array.from(
    { length: scale * 2 },
    (_, index) => `<testcase name="case-${index}"/>`,
  ).join("");
  return `<testsuites tests="${scale * 2}" failures="0" errors="0" skipped="0">${cases}</testsuites>`;
}

export function measure(
  name,
  operation,
  { iterations = DEFAULT_ITERATIONS, warmupIterations = DEFAULT_WARMUP_ITERATIONS, parameters = {} } = {},
) {
  positiveInteger(iterations, "iterations");
  positiveInteger(warmupIterations, "warmupIterations");

  for (let index = 0; index < warmupIterations; index += 1) operation();
  const start = performance.now();
  for (let index = 0; index < iterations; index += 1) operation();
  const elapsedMs = performance.now() - start;
  return {
    name,
    parameters,
    warmup_iterations: warmupIterations,
    iterations,
    elapsed_ms: Number(elapsedMs.toFixed(3)),
    ops_per_second: Number(((iterations / Math.max(elapsedMs, 0.001)) * 1000).toFixed(2)),
  };
}

export function runBenchmarks({
  iterations = DEFAULT_ITERATIONS,
  warmupIterations = DEFAULT_WARMUP_ITERATIONS,
  fixtureScale: scale = DEFAULT_FIXTURE_SCALE,
} = {}) {
  positiveInteger(iterations, "iterations");
  positiveInteger(warmupIterations, "warmupIterations");
  fixtureScale(scale);

  const lcov = scaledLcov(scale);
  const junit = scaledJUnit(scale);
  const shared = { iterations, warmupIterations };
  const parameters = { fixture_scale: scale };

  return [
    measure("parse_lcov", () => parseLcov(lcov), {
      ...shared,
      parameters: { ...parameters, input_bytes: Buffer.byteLength(lcov) },
    }),
    measure("parse_junit_xml", () => parseJUnitXml(junit), {
      ...shared,
      parameters: { ...parameters, input_bytes: Buffer.byteLength(junit) },
    }),
  ];
}

function requiredValue(argv, index, argument) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
  return value;
}

export function parseBenchmarkArgs(argv) {
  const options = {
    iterations: DEFAULT_ITERATIONS,
    warmupIterations: DEFAULT_WARMUP_ITERATIONS,
    fixtureScale: DEFAULT_FIXTURE_SCALE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) throw new Error(`Unknown argument: ${argument}`);
    const value = requiredValue(argv, index, argument);
    if (argument === "--iterations") options.iterations = positiveInteger(Number(value), argument);
    else if (argument === "--warmup") options.warmupIterations = positiveInteger(Number(value), argument);
    else if (argument === "--scale") options.fixtureScale = fixtureScale(Number(value));
    else throw new Error(`Unknown argument: ${argument}`);
    index += 1;
  }

  return options;
}

export async function main(argv = process.argv.slice(2)) {
  const parameters = parseBenchmarkArgs(argv);
  const benchmarks = runBenchmarks(parameters);
  await mkdir("reports/quality", { recursive: true });
  await writeFile(
    OUTPUT,
    `${JSON.stringify({ generated_at: new Date().toISOString(), parameters, benchmarks }, null, 2)}\n`,
  );
  console.log(`Benchmark report: ${OUTPUT}`);
  for (const result of benchmarks) {
    console.log(`${result.name}: ${result.ops_per_second} ops/s (${result.elapsed_ms} ms)`);
  }
  return benchmarks;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
