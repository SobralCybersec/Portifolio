import assert from "node:assert/strict";
import test from "node:test";
import { measure, parseBenchmarkArgs, runBenchmarks } from "./benchmark.mjs";

test("benchmark arguments expose iteration, warmup, and fixture scale parameters", () => {
  assert.deepEqual(parseBenchmarkArgs(["--iterations", "3", "--warmup", "2", "--scale", "4"]), {
    iterations: 3,
    warmupIterations: 2,
    fixtureScale: 4,
  });
  assert.throws(() => parseBenchmarkArgs(["--iterations"]), /requires a value/);
  assert.throws(() => parseBenchmarkArgs(["--scale", "0"]), /positive integer/);
});

test("benchmarks record parameters and scale fixture input", () => {
  const results = runBenchmarks({ iterations: 2, warmupIterations: 1, fixtureScale: 3 });

  assert.deepEqual(results.map(({ name }) => name), ["parse_lcov", "parse_junit_xml"]);
  for (const result of results) {
    assert.equal(result.iterations, 2);
    assert.equal(result.warmup_iterations, 1);
    assert.equal(result.parameters.fixture_scale, 3);
    assert.ok(result.parameters.input_bytes > 0);
    assert.ok(result.ops_per_second > 0);
  }
  assert.ok(results[0].parameters.input_bytes > 100);
  assert.ok(results[1].parameters.input_bytes > 100);
});

test("measure validates positive run parameters", () => {
  assert.throws(() => measure("invalid", () => {}, { iterations: 0 }), /iterations/);
  assert.throws(() => measure("invalid", () => {}, { warmupIterations: 0 }), /warmupIterations/);
});
