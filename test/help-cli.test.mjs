import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { listLibrariesForTarget } from '../src/toolchain/runtime-targets.js';

function runCli(args) {
  const result = spawnSync('node', ['bin/loom.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

test('docs lists implemented libraries by default', () => {
  const result = runCli(['docs']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('Loom libraries'));
  assert.ok(result.stdout.includes('text'));
  assert.ok(result.stdout.includes('json'));
  assert.ok(result.stdout.includes('console'));
  assert.ok(result.stdout.includes('scene'));
  assert.ok(result.stdout.includes('time'));
  assert.ok(result.stdout.includes('math'));
  assert.ok(result.stdout.includes('state'));
  // planned empty libraries are hidden
  assert.ok(!result.stdout.includes('- dom'));
  assert.ok(!result.stdout.includes('- canvas'));
  assert.ok(!result.stdout.includes('- three'));
  assert.ok(!result.stdout.includes('- unity'));
  assert.ok(!result.stdout.includes('- scenesync'));
});

test('docs text shows text library functions', () => {
  const result = runCli(['docs', 'text']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('text'));
  assert.ok(result.stdout.includes('text.upper'));
  assert.ok(result.stdout.includes('text.lower'));
  assert.ok(result.stdout.includes('text.trim'));
  assert.ok(result.stdout.includes('text.replace'));
});

test('docs text.upper shows function details', () => {
  const result = runCli(['docs', 'text.upper']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('text.upper(value)'));
  assert.ok(result.stdout.includes('Converts text to uppercase'));
  assert.ok(result.stdout.includes('Arguments'));
  assert.ok(result.stdout.includes('Example'));
});

test('docs --json outputs structured JSON', () => {
  const result = runCli(['docs', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.equal(json.type, 'libraries');
  assert.ok(Array.isArray(json.libraries));
  assert.ok(json.libraries.length > 0);
  const textLib = json.libraries.find(l => l.name === 'text');
  assert.ok(textLib);
  assert.ok(Array.isArray(textLib.targets));
});

test('docs text --json outputs library JSON', () => {
  const result = runCli(['docs', 'text', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.equal(json.type, 'library');
  assert.equal(json.library.name, 'text');
  assert.ok(Array.isArray(json.library.functions));
  assert.ok(json.library.functions.length > 0);
});

test('docs text.upper --json outputs function JSON', () => {
  const result = runCli(['docs', 'text.upper', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.equal(json.type, 'function');
  assert.equal(json.function.name, 'upper');
  assert.ok(json.function.signature);
  assert.ok(json.function.description);
  assert.ok(Array.isArray(json.function.args));
  assert.ok(json.function.returns);
  assert.ok(Array.isArray(json.function.targets));
  assert.ok(Array.isArray(json.function.examples));
});

test('docs --unknown option exits with error', () => {
  const result = runCli(['docs', '--unknown']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('Unknown option'));
});

test('docs text json exits with error', () => {
  const result = runCli(['docs', 'text', 'json']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('at most one positional argument'));
});

test('docs unknown-lib exits with error', () => {
  const result = runCli(['docs', 'unknown-lib']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('No Loom library'));
  assert.ok(result.stderr.includes('unknown-lib'));
});

test('docs text.unknown-func exits with error', () => {
  const result = runCli(['docs', 'text.unknown-func']);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('No Loom function'));
});

test('docs includes all libraries from LIBRARY_COMPATIBILITY with --include-planned', () => {
  const result = runCli(['docs', '--include-planned']);
  assert.equal(result.status, 0);
  const knownLibs = listLibrariesForTarget('cli');
  for (const lib of knownLibs) {
    assert.ok(result.stdout.includes(lib.name), `Missing library: ${lib.name}`);
  }
});

test('docs math.sine shows correct targets', () => {
  const result = runCli(['docs', 'math.sine', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.ok(Array.isArray(json.function.targets));
  assert.ok(json.function.targets.includes('cli'));
  assert.ok(json.function.targets.includes('web'));
});

test('docs scene.setPosition shows correct targets', () => {
  const result = runCli(['docs', 'scene.setPosition', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.ok(json.function.targets.includes('cli'));
  assert.ok(json.function.targets.includes('scenesync'));
  assert.ok(json.function.targets.includes('unity'));
  assert.ok(json.function.targets.includes('web'));
});

test('docs planned library shows status', () => {
  const result = runCli(['docs', 'fs']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('Status: planned'));
});

test('docs dom shows planned library info even when hidden from list', () => {
  const result = runCli(['docs', 'dom']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('dom'));
  assert.ok(result.stdout.includes('Status: planned'));
});

test('docs --include-planned shows all libraries including planned', () => {
  const result = runCli(['docs', '--include-planned']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('- dom'));
  assert.ok(result.stdout.includes('(planned)'));
});

test('docs --include-planned --json includes planned libraries', () => {
  const result = runCli(['docs', '--include-planned', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const json = JSON.parse(result.stdout);
  assert.equal(json.type, 'libraries');
  assert.ok(json.libraries.some(lib => lib.name === 'dom'));
  assert.ok(json.libraries.some(lib => lib.name === 'canvas'));
});

test('docs shows math functions', () => {
  const result = runCli(['docs', 'math']);
  assert.equal(result.status, 0, result.stderr);
  const mathFuncs = ['sine', 'cosine', 'add', 'multiply', 'subtract', 'divide', 'mod', 'clamp', 'map', 'abs', 'lerp', 'smoothstep'];
  for (const func of mathFuncs) {
    assert.ok(result.stdout.includes(func), `Missing math function: ${func}`);
  }
});

test('docs shows state library', () => {
  const result = runCli(['docs', 'state']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes('state'));
});

test('docs --help shows usage', () => {
  const result = runCli(['docs', '--help']);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.includes('Usage'));
  assert.ok(result.stdout.includes('loom docs'));
  assert.ok(result.stdout.includes('--json'));
});
