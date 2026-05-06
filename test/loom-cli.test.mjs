import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loom.mjs');

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8'
  });
}

test('compile outputs GraphJSON', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom']);
  assert.equal(result.status, 0, result.stderr);

  const graph = JSON.parse(result.stdout);
  assert.ok(Array.isArray(graph.nodes));
  assert.ok(graph.nodes.some((node) => node.type === 'clock'));
  assert.ok(graph.nodes.some((node) => node.type === 'sine'));
  assert.ok(graph.nodes.some((node) => node.type === 'map'));
});

test('compile -o writes file', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-'));
  const outFile = path.join(tmpDir, 'graph.json');
  const result = runCli(['compile', 'examples/cli-basic.loom', '-o', outFile]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(outFile), true);
  const graph = JSON.parse(await fsp.readFile(outFile, 'utf8'));
  assert.ok(Array.isArray(graph.nodes));
});

test('compile -o without path exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '-o']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires a file path/);
});

test('compile --out without path exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '--out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires a file path/);
});

test('compile -o followed by another option exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '-o', '--pretty', 'false']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires a file path/);
});

test('compile --pretty without value exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '--pretty']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--pretty requires true or false/);
});

test('compile --pretty invalid value exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '--pretty', 'maybe']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /true or false|Invalid/);
});

test('compile unknown option exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '--unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option/);
});

test('compile includes imports in GraphJSON', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-imports-'));
  const file = path.join(tmpDir, 'imports.loom');
  await fsp.writeFile(file, 'import math\nimport fs\n\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(result.stdout);
  assert.deepEqual(graph.imports, ['math', 'fs']);
});

test('unknown import fails when target is specific', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-unknown-import-'));
  const file = path.join(tmpDir, 'unknown-import.loom');
  await fsp.writeFile(file, 'import doesNotExist\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['compile', file, '--target', 'cli']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNKNOWN_IMPORT/);
});

test('unsupported import fails for target', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-unsupported-import-'));
  const file = path.join(tmpDir, 'unsupported-import.loom');
  await fsp.writeFile(file, 'import fs\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['compile', file, '--target', 'web']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNSUPPORTED_IMPORT/);
});

test('compile default target any allows fs', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-any-import-'));
  const file = path.join(tmpDir, 'any-import.loom');
  await fsp.writeFile(file, 'import fs\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
});

test('compile invalid target exits 1', () => {
  const result = runCli(['compile', 'examples/cli-basic.loom', '--target', 'banana']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown runtime target/);
});

test('format outputs DSL', () => {
  const result = runCli(['format', 'examples/cli-basic.loom']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /t = clock\(\)/);
  assert.match(result.stdout, /\|>/);
});

test('format --check succeeds for formatted file', () => {
  const result = runCli(['format', 'examples/cli-basic.loom', '--check']);
  assert.equal(result.status, 0, result.stderr);
});

test('format unknown option exits 1', () => {
  const result = runCli(['format', 'examples/cli-basic.loom', '--unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option/);
});

test('format preserves imports', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-format-imports-'));
  const file = path.join(tmpDir, 'format-imports.loom');
  await fsp.writeFile(file, 'import math\nimport fs\n\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['format', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^import math\nimport fs\n\nx = constant\(value: 1\)\n$/);
});

test('inspect outputs summary', () => {
  const result = runCli(['inspect', 'examples/cli-basic.loom']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Nodes:/);
  assert.match(result.stdout, /Edges:/);
  assert.match(result.stdout, /Node list:/);
  assert.match(result.stdout, /clock/);
  assert.match(result.stdout, /sine/);
  assert.match(result.stdout, /map/);
});

test('inspect unknown option exits 1', () => {
  const result = runCli(['inspect', 'examples/cli-basic.loom', '--unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option/);
});

test('inspect shows imports and compatible targets', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-inspect-imports-'));
  const file = path.join(tmpDir, 'inspect-imports.loom');
  await fsp.writeFile(file, 'import math\nimport fs\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['inspect', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Imports:/);
  assert.match(result.stdout, /math/);
  assert.match(result.stdout, /fs/);
  assert.match(result.stdout, /Compatible targets:/);
  assert.match(result.stdout, /cli/);
});

test('parse error exits 1', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-invalid-'));
  const invalidFile = path.join(tmpDir, 'invalid.loom');
  await fsp.writeFile(invalidFile, 'x =\n', 'utf8');

  const result = runCli(['compile', invalidFile]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNEXPECTED_TOKEN|Expected assignment|Unexpected token/);
});

test('run --get returns finite number', () => {
  const result = runCli(['run', 'examples/cli-basic.loom', '--get', 'x.out', '--time', '0.25']);
  assert.equal(result.status, 0, result.stderr);
  const value = Number(result.stdout.trim());
  assert.equal(Number.isFinite(value), true);
});

test('run --json returns object', () => {
  const result = runCli(['run', 'examples/cli-basic.loom', '--get', 'x.out', '--time', '0.25', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const values = JSON.parse(result.stdout);
  assert.equal(typeof values['x.out'], 'number');
  assert.equal(Number.isFinite(values['x.out']), true);
});

test('run unknown option exits 1', () => {
  const result = runCli(['run', 'examples/cli-basic.loom', '--unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown option/);
});

test('run defaults to cli and rejects dom import', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-run-dom-'));
  const file = path.join(tmpDir, 'run-dom.loom');
  await fsp.writeFile(file, 'import dom\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['run', file, '--get', 'x.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNSUPPORTED_IMPORT/);
});

test('run rejects browser-only nodes with a clear error', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-unsupported-'));
  const file = path.join(tmpDir, 'unsupported.loom');
  await fsp.writeFile(file, 'x = constant(value: 1)\ny = setText(x, target: "#app")\n', 'utf8');

  const result = runCli(['run', file, '--get', 'x.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNSUPPORTED_RUNTIME_NODE/);
});

test('evaluateOnce supports Node-safe one-shot evaluation', async () => {
  const { Loom } = await import(path.join(projectRoot, 'src', 'loom.js'));
  const graph = {
    nodes: [
      { id: 't', type: 'clock' },
      { id: 'wave', type: 'sine', params: { freq: 0.5, amplitude: 2 } }
    ],
    edges: [
      { from: 't.t', to: 'wave.t' }
    ]
  };

  const engine = new Loom(graph);
  engine.evaluateOnce({ time: 0.25, dt: 0 });
  const value = engine.getValue('wave.out');

  assert.equal(Number.isFinite(value), true);
});
