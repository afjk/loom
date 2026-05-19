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
const cliPath = path.join(projectRoot, 'bin', 'loomlet.mjs');

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8'
  });
}

function runCliWithEnv(args, env) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env
    }
  });
}

async function runCliWithIsolatedConfig(args, env = {}) {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-config-'));
  return {
    result: spawnSync(process.execPath, [cliPath, ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        XDG_CONFIG_HOME: tmpDir,
        ...env
      }
    }),
    tmpDir
  };
}

test('run fizzbuzz tour sample prints expected lines', () => {
  const result = runCli(['run', 'examples/tour/language/07-fizzbuzz.loom', '--get', '_anon_1.out']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^1\\n2\\nFizz\\n4\\nBuzz\\nFizz/);
  assert.match(result.stdout, /FizzBuzz/);
});

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

test('console.log effect statement compiles', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-console-compile-'));
  const file = path.join(tmpDir, 'console.loom');
  await fsp.writeFile(file, 'import console\nmessage = constant(value: "hello")\nconsole.log(message)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(result.stdout);
  assert.ok(graph.nodes.some((node) => node.type === 'console.log'));
  assert.ok(graph.nodes.some((node) => node.id === '_effect1'));
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

test('format preserves qualified calls and effect statements', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-format-effects-'));
  const file = path.join(tmpDir, 'format-effects.loom');
  await fsp.writeFile(file, 'import console\nimport text\n\nmessage = text.upper("hello")\nconsole.log(message)\n', 'utf8');

  const result = runCli(['format', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^import console\nimport text\n\nmessage = text\.upper\("hello"\)\nconsole\.log\(message\)\n$/);
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

test('inspect includes qualified function node names', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-inspect-qualified-'));
  const file = path.join(tmpDir, 'inspect-qualified.loom');
  await fsp.writeFile(file, 'import text\nmessage = text.upper("hello")\n', 'utf8');

  const result = runCli(['inspect', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /text\.upper/);
});

test('scenesync help prints command group usage', () => {
  const result = runCli(['scenesync', '--help']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /loomlet scenesync <command>/);
  assert.match(result.stdout, /ping/);
  assert.match(result.stdout, /objects/);
});

test('scenesync requires room via arg or env', async () => {
  const { result, tmpDir } = await runCliWithIsolatedConfig(['scenesync', 'ping'], {
    LOOM_SCENESYNC_ROOM: '',
    LOOM_SCENESYNC_ENDPOINT: ''
  });
  try {
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Scene Sync room is required/);
  } finally {
    await fsp.rm(tmpDir, { recursive: true }).catch(() => {});
  }
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

test('run fails clearly when clock graph omits --time', () => {
  const result = runCli(['run', 'examples/cli-basic.loom', '--get', 'x.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MISSING_ENV_TIME/);
  assert.match(result.stderr, /env\.time/);
});

test('text.upper run returns uppercased string', () => {
  const result = runCli(['run', 'examples/cli-text.loom', '--get', 'message.out']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'HELLO LOOM');
});

test('text.replace run returns replaced string', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-text-replace-'));
  const file = path.join(tmpDir, 'text-replace.loom');
  await fsp.writeFile(file, 'import text\nmessage = text.replace("hello world", search: "world", replacement: "loom")\n', 'utf8');

  const result = runCli(['run', file, '--get', 'message.out']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'hello loom');
});

test('json.stringify run returns compact JSON string', () => {
  const result = runCli(['run', 'examples/cli-json.loom', '--get', 'message.out']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '{"name":"loom","version":1}');
});

test('json.parse invalid JSON fails clearly', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-json-invalid-'));
  const file = path.join(tmpDir, 'json-invalid.loom');
  await fsp.writeFile(file, 'import json\nvalue = json.parse("{bad")\n', 'utf8');

  const result = runCli(['run', file, '--get', 'value.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /JSON|INVALID_JSON|RUNTIME/);
});

test('run accepts --target cli', () => {
  const result = runCli([
    'run',
    'examples/cli-basic.loom',
    '--target',
    'cli',
    '--get',
    'x.out',
    '--time',
    '0.25'
  ]);

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

test('run rejects non-cli target', () => {
  const result = runCli([
    'run',
    'examples/cli-basic.loom',
    '--target',
    'web',
    '--get',
    'x.out'
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /only supports --target cli/);
});

test('run rejects target any', () => {
  const result = runCli([
    'run',
    'examples/cli-basic.loom',
    '--target',
    'any',
    '--get',
    'x.out'
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /only supports --target cli/);
});

test('run defaults to cli and rejects dom import', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-run-dom-'));
  const file = path.join(tmpDir, 'run-dom.loom');
  await fsp.writeFile(file, 'import dom\nx = constant(value: 1)\n', 'utf8');

  const result = runCli(['run', file, '--get', 'x.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNSUPPORTED_IMPORT/);
});

test('console.log run produces effect on stderr while keeping stdout clean', () => {
  const result = runCli(['run', 'examples/cli-console.loom', '--get', 'message.out']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), 'HELLO LOOMLET');
  assert.match(result.stderr, /\[log\] HELLO LOOMLET/);
});

test('run rejects browser-only nodes with a clear error', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-unsupported-'));
  const file = path.join(tmpDir, 'unsupported.loom');
  await fsp.writeFile(file, 'x = constant(value: 1)\ny = setText(x, target: "#app")\n', 'utf8');

  const result = runCli(['run', file, '--get', 'x.out']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UNSUPPORTED_RUNTIME_NODE/);
});

test('scene.setPosition effect statement compiles', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-setpos-'));
  const file = path.join(tmpDir, 'scene-setpos.loom');
  await fsp.writeFile(file, 'import scene\nscene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(result.stdout);
  assert.ok(graph.nodes.some((node) => node.type === 'scene.setPosition'));
  assert.ok(graph.nodes.some((node) => node.id === '_effect1'));
});

test('scene.setRotation effect statement compiles', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-setrot-'));
  const file = path.join(tmpDir, 'scene-setrot.loom');
  await fsp.writeFile(file, 'import scene\nscene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(result.stdout);
  assert.ok(graph.nodes.some((node) => node.type === 'scene.setRotation'));
  assert.ok(graph.nodes.some((node) => node.id === '_effect1'));
});

test('scene.setScale effect statement compiles', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-setscale-'));
  const file = path.join(tmpDir, 'scene-setscale.loom');
  await fsp.writeFile(file, 'import scene\nscene.setScale("sample-cube", x: 2, y: 2, z: 2)\n', 'utf8');

  const result = runCli(['compile', file]);
  assert.equal(result.status, 0, result.stderr);
  const graph = JSON.parse(result.stdout);
  assert.ok(graph.nodes.some((node) => node.type === 'scene.setScale'));
  assert.ok(graph.nodes.some((node) => node.id === '_effect1'));
});

test('scene.setPosition run produces effect on stderr', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-run-'));
  const file = path.join(tmpDir, 'scene-run.loom');
  await fsp.writeFile(file, 'import scene\nscene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)\n', 'utf8');

  const result = runCli(['run', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /\[scene\.setPosition\] sample-cube position=\(1, 0\.5, 0\)/);
});

test('scene.setRotation run produces effect on stderr', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-rot-'));
  const file = path.join(tmpDir, 'scene-rot.loom');
  await fsp.writeFile(file, 'import scene\nscene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)\n', 'utf8');

  const result = runCli(['run', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /\[scene\.setRotation\] sample-cube rotation=\(0, 0, 0, 1\)/);
});

test('scene.setScale run produces effect on stderr', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-scene-scale-'));
  const file = path.join(tmpDir, 'scene-scale.loom');
  await fsp.writeFile(file, 'import scene\nscene.setScale("sample-cube", x: 2, y: 2, z: 2)\n', 'utf8');

  const result = runCli(['run', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /\[scene\.setScale\] sample-cube scale=\(2, 2, 2\)/);
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
  engine.evaluateOnce({ env: { time: 0.25, deltaTime: 0 } });
  const value = engine.getValue('wave.out');

  assert.equal(Number.isFinite(value), true);
});

test('scenesync run prints dry-run payload', () => {
  const result = runCli(['scenesync', 'run', 'examples/scene-effects.loom']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync broadcast payload/);
  assert.match(result.stdout, /scene-batch/);
  assert.match(result.stdout, /sample-cube/);
  assert.match(result.stdout, /Dry run only/);
});

test('scenesync run --dry-run prints payload', () => {
  const result = runCli(['scenesync', 'run', 'examples/scene-effects.loom', '--dry-run']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync broadcast payload/);
  assert.match(result.stdout, /scene-batch/);
});

test('scenesync run --json prints JSON', () => {
  const result = runCli(['scenesync', 'run', 'examples/scene-effects.loom', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.equal(output.dryRun, true);
  assert.ok(output.payload);
  assert.ok(Array.isArray(output.effects));
});

test('scenesync run exits 0 with no scene effects', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-cli-no-effects-'));
  const file = path.join(tmpDir, 'no-effects.loom');
  await fsp.writeFile(file, 'x = constant(value: 1)\n', 'utf8');

  const result = runCli(['scenesync', 'run', file]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /No Scene Sync scene effects found/);
});

test('scenesync run without file exits 1', () => {
  const result = runCli(['scenesync', 'run']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /file path/);
});

test('scenesync run with invalid file exits 1', () => {
  const result = runCli(['scenesync', 'run', 'nonexistent.loom']);

  assert.equal(result.status, 1);
});

test('scenesync dev --dry-run --once compiles', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--dry-run', '--once']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync dev mode/);
  assert.match(result.stdout, /compiled/);
  assert.match(result.stdout, /nodes/);
  assert.match(result.stdout, /edges/);
});

test('scenesync dev --dry-run --once with --object', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--object', 'sample-cube', '--dry-run', '--once']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync dev mode/);
  assert.match(result.stdout, /sample-cube/);
});

test('scenesync dev --dry-run --once with --scene', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--scene', '--dry-run', '--once']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync dev mode/);
  assert.match(result.stdout, /Scope: scene/);
});

test('scenesync dev --object and --scene exits 1', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--object', 'cube', '--scene', '--dry-run', '--once']);

  assert.equal(result.status, 1);
  assert.match(result.stderr + result.stdout, /SCOPE_CONFLICT/);
});

test('scenesync dev invalid --debounce exits 1', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--debounce', 'abc', '--dry-run', '--once']);

  assert.equal(result.status, 1);
  assert.match(result.stderr + result.stdout, /INVALID_DEBOUNCE/);
});

test('scenesync dev without file exits 1', () => {
  const result = runCli(['scenesync', 'dev', '--dry-run', '--once']);

  assert.equal(result.status, 1);
  assert.match(result.stderr + result.stdout, /file path/);
});

test('scenesync dev --json outputs JSON', () => {
  const result = runCli(['scenesync', 'dev', 'examples/lissajous.loom', '--dry-run', '--once', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const lines = result.stdout.split('\n').filter(line => line.trim());
  const jsonLines = lines.filter(line => line.startsWith('{'));
  assert.ok(jsonLines.length > 0);
  const events = jsonLines.map(line => JSON.parse(line));
  assert.ok(events.some(e => e.event === 'start'));
  assert.ok(events.some(e => e.event === 'compiled'));
});

test('scenesync behavior compile with --object outputs scene-graph-set payload', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/lissajous.loom', '--object', 'sample-cube']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert.ok(Array.isArray(payload.graph.nodes));
  assert.ok(Array.isArray(payload.graph.edges));
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior compile with --object --json outputs payload JSON', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/lissajous.loom', '--object', 'sample-cube', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert.ok(Array.isArray(payload.graph.nodes));
  assert.ok(Array.isArray(payload.graph.edges));
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior compile with --scene outputs scene-graph-set payload with scene scope', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/lissajous.loom', '--scene']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.equal(payload.scope, 'scene');
  assert.ok(Array.isArray(payload.graph.nodes));
  assert.ok(Array.isArray(payload.graph.edges));
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior compile with --scene --json outputs payload JSON', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/lissajous.loom', '--scene', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.equal(payload.scope, 'scene');
  assert.ok(Array.isArray(payload.graph.nodes));
  assert.ok(Array.isArray(payload.graph.edges));
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior compile with offsetPosition example outputs scene-graph-set payload', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/scene-offset-position.loom', '--object', 'sample-cube', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert.ok(Array.isArray(payload.graph.nodes));
  assert.ok(payload.graph.nodes.some((n) => n.type === 'sceneOffsetPosition'));
  assert.ok(payload.graph.nodes.some((n) => n.type === 'sine'));
  assert.ok(payload.graph.nodes.some((n) => n.type === 'serverClock'));
});

test('scenesync behavior compile with circle offsetPosition example outputs multiple nodes', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', 'examples/scene-offset-circle.loom', '--object', 'sample-cube', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert.ok(payload.graph.nodes.some((n) => n.type === 'sceneOffsetPosition'));
  assert.ok(payload.graph.nodes.some((n) => n.type === 'cosine'));
  assert.ok(payload.graph.nodes.some((n) => n.type === 'sine'));
});

test('scenesync behavior set outputs payload JSON by default', () => {
  const result = runCli(['scenesync', 'behavior', 'set', 'examples/lissajous.loom', '--object', 'sample-cube']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior set with --json outputs payload JSON', () => {
  const result = runCli(['scenesync', 'behavior', 'set', 'examples/lissajous.loom', '--object', 'sample-cube', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior set with --scene outputs scene scope', () => {
  const result = runCli(['scenesync', 'behavior', 'set', 'examples/lissajous.loom', '--scene']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-set');
  assert.equal(payload.scope, 'scene');
  assert(!Object.hasOwn(payload, 'ok'));
  assert(!Object.hasOwn(payload, 'payload'));
});

test('scenesync behavior clear with --object outputs scene-graph-clear payload', () => {
  const result = runCli(['scenesync', 'behavior', 'clear', '--object', 'sample-cube']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-clear');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert(!Object.hasOwn(payload, 'ok'));
});

test('scenesync behavior clear with --object --json outputs payload JSON', () => {
  const result = runCli(['scenesync', 'behavior', 'clear', '--object', 'sample-cube', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-clear');
  assert.deepEqual(payload.scope, { object: 'sample-cube' });
  assert(!Object.hasOwn(payload, 'ok'));
});

test('scenesync behavior clear with --scene outputs scene-graph-clear payload with scene scope', () => {
  const result = runCli(['scenesync', 'behavior', 'clear', '--scene']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-clear');
  assert.equal(payload.scope, 'scene');
  assert(!Object.hasOwn(payload, 'ok'));
});

test('scenesync behavior clear with --scene --json outputs payload JSON', () => {
  const result = runCli(['scenesync', 'behavior', 'clear', '--scene', '--json']);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.type, 'scene-graph-clear');
  assert.equal(payload.scope, 'scene');
  assert(!Object.hasOwn(payload, 'ok'));
});

test('scenesync behavior clear without scope exits 1', () => {
  const result = runCli(['scenesync', 'behavior', 'clear']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /SCOPE_REQUIRED/);
});

test('scenesync behavior set with --object and --scene exits 1', () => {
  const result = runCli(['scenesync', 'behavior', 'set', 'examples/lissajous.loom', '--object', 'cube', '--scene']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /SCOPE_CONFLICT/);
});

test('scenesync behavior clear with --object and --scene exits 1', () => {
  const result = runCli(['scenesync', 'behavior', 'clear', '--object', 'cube', '--scene']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /SCOPE_CONFLICT/);
});

test('scenesync behavior compile without file exits 1', () => {
  const result = runCli(['scenesync', 'behavior', 'compile', '--object', 'cube']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /file path/);
});

test('scenesync behavior set without file exits 1', () => {
  const result = runCli(['scenesync', 'behavior', 'set', '--object', 'cube']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /file path/);
});
