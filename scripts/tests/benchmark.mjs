import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { parseJUnitXml, parseLcov } from "./quality-metrics.mjs";

const OUTPUT = "reports/quality/benchmarks.json";
const LCOV = "TN:\nSF:src/example.ts\nFNF:2\nFNH:2\nDA:1,1\nDA:2,1\nLF:2\nLH:2\nBRF:0\nBRH:0\nend_of_record\n";
const JUNIT = '<testsuites tests="2" failures="0" errors="0" skipped="0"><testcase name="one"/><testcase name="two"/></testsuites>';

function measure(name, operation, iterations = 1000) {
  for (let index = 0; index < 100; index += 1) operation();
  const start = performance.now();
  for (let index = 0; index < iterations; index += 1) operation();
  const elapsedMs = performance.now() - start;
  return {
    name,
    iterations,
    elapsed_ms: Number(elapsedMs.toFixed(3)),
    ops_per_second: Number(((iterations / Math.max(elapsedMs, 0.001)) * 1000).toFixed(2)),
  };
}

export function runBenchmarks() {
  return [
    measure("parse_lcov", () => parseLcov(LCOV)),
    measure("parse_junit_xml", () => parseJUnitXml(JUNIT)),
  ];
}

const benchmarks = runBenchmarks();
await mkdir("reports/quality", { recursive: true });
await writeFile(
  OUTPUT,
  `${JSON.stringify({ generated_at: new Date().toISOString(), benchmarks }, null, 2)}\n`,
);
console.log(`Benchmark report: ${OUTPUT}`);
for (const result of benchmarks) {
  console.log(`${result.name}: ${result.ops_per_second} ops/s (${result.elapsed_ms} ms)`);
}
