import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDSLToAST } from '../src/loom-dsl.js';
import { compileLoomSource } from '../src/toolchain/compile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures', 'stabilization', 'invalid');

function readInvalidFixture(name) {
  return fs.readFileSync(path.join(fixturesPath, name), 'utf8');
}

function assertParses(name) {
  const source = readInvalidFixture(name);
  const parsed = parseDSLToAST(source);
  assert.equal(
    parsed.errors.length,
    0,
    `Expected ${name} to parse without errors: ${JSON.stringify(parsed.errors)}`
  );
  return { source, parsed };
}

function assertParseFails(name) {
  const source = readInvalidFixture(name);
  const parsed = parseDSLToAST(source);
  assert.ok(
    parsed.errors.length > 0,
    `Expected ${name} to have parse errors`
  );
  return { source, parsed };
}

function assertCompileFails(name, options = { target: 'cli' }) {
  const source = readInvalidFixture(name);
  const compiled = compileLoomSource(source, options);
  assert.equal(compiled.ok, false, `Expected ${name} to fail compilation`);
  assert.ok(compiled.errors.length > 0, `Expected ${name} to report errors`);
  return compiled;
}

function assertHasErrorCode(errors, code) {
  assert.ok(
    errors.some((error) => error.code === code),
    `Expected error code ${code}, got ${JSON.stringify(errors.map(e => e.code))}`
  );
}

test('invalid/parse-error: parse fails', () => {
  assertParseFails('parse-error.loom');
});

test('invalid/parse-error: compile fails', () => {
  const compiled = assertCompileFails('parse-error.loom', { target: 'cli' });
  assert.ok(compiled.errors.length > 0);
});

test('invalid/unknown-import: compile fails with UNKNOWN_IMPORT', () => {
  assertParses('unknown-import.loom');
  const compiled = assertCompileFails('unknown-import.loom', { target: 'cli' });
  assertHasErrorCode(compiled.errors, 'UNKNOWN_IMPORT');
});

test('invalid/unsupported-import-cli: compile fails with UNSUPPORTED_IMPORT', () => {
  assertParses('unsupported-import-cli.loom');
  const compiled = assertCompileFails('unsupported-import-cli.loom', { target: 'cli' });
  assertHasErrorCode(compiled.errors, 'UNSUPPORTED_IMPORT');
});

test('invalid/unsupported-import-scenesync: compile fails with UNSUPPORTED_IMPORT', () => {
  assertParses('unsupported-import-scenesync.loom');
  const compiled = assertCompileFails('unsupported-import-scenesync.loom', { target: 'scenesync' });
  assertHasErrorCode(compiled.errors, 'UNSUPPORTED_IMPORT');
});

test('invalid/invalid-positional-comparison: compile fails with MISSING_ARGUMENT_NAME', () => {
  assertParses('invalid-positional-comparison.loom');
  const compiled = assertCompileFails('invalid-positional-comparison.loom', { target: 'cli' });
  assertHasErrorCode(compiled.errors, 'MISSING_ARGUMENT_NAME');
});

test('invalid/unknown-node: compile fails with UNKNOWN_NODE_TYPE', () => {
  assertParses('unknown-node.loom');
  const compiled = assertCompileFails('unknown-node.loom', { target: 'cli' });
  assertHasErrorCode(compiled.errors, 'UNKNOWN_NODE_TYPE');
});

test('invalid target: compile fails with UNKNOWN_RUNTIME_TARGET', () => {
  const compiled = compileLoomSource('import math\nvalue = math.add(a: 1, b: 2)\n', {
    target: 'not-a-target'
  });

  assert.equal(compiled.ok, false);
  assertHasErrorCode(compiled.errors, 'UNKNOWN_RUNTIME_TARGET');
});
