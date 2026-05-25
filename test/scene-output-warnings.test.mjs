import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileLoomSource } from '../src/toolchain/compile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loomlet.mjs');

function compile(source) {
  return compileLoomSource(source, { target: 'scenesync' });
}

function findDuplicateWarnings(result) {
  return result.warnings.filter((warning) => warning.code === 'DUPLICATE_STATIC_SCENE_OUTPUT_TARGET');
}

test('compile warns when same static scene target is written twice', () => {
  const result = compile(`
import scene

scene.setPosition("sample-cube", x: 0, y: 0, z: 0)
scene.setPosition("sample-cube", x: 1, y: 1, z: 1)
`);

  assert.equal(result.ok, true);
  const warnings = findDuplicateWarnings(result);
  assert.equal(warnings.length, 1);
  assert.deepEqual(warnings[0].target, {
    objectId: 'sample-cube',
    property: 'position'
  });
});

test('compile does not warn for same scene object with different static properties', () => {
  const result = compile(`
import scene

scene.setPosition("sample-cube", x: 0, y: 0, z: 0)
scene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)
scene.setScale("sample-cube", x: 1, y: 1, z: 1)
`);

  assert.equal(result.ok, true);
  assert.equal(findDuplicateWarnings(result).length, 0);
});

test('compile skips dynamic scene targets for duplicate warnings', () => {
  const result = compile(`
import scene

target = constant(value: "sample-cube")
scene.setPosition(target, x: 0, y: 0, z: 0)
scene.setPosition("sample-cube", x: 1, y: 1, z: 1)
`);

  assert.equal(result.ok, true);
  assert.equal(findDuplicateWarnings(result).length, 0);
});

test('compile succeeds when duplicate static scene target warning is emitted', () => {
  const result = compile(`
import scene

scene.setScale("sample-cube", x: 1, y: 1, z: 1)
scene.setScale("sample-cube", x: 2, y: 2, z: 2)
`);

  assert.equal(result.ok, true);
  assert.ok(result.graph.nodes.some((node) => node.type === 'scene.setScale'));
  assert.equal(findDuplicateWarnings(result).length, 1);
  assert.deepEqual(result.errors, []);
});

test('loomlet compile prints duplicate static scene target warnings to stderr', async () => {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'loom-scene-output-warnings-'));
  const file = path.join(tmpDir, 'duplicate.loom');
  await fsp.writeFile(file, `
import scene

scene.setPosition("sample-cube", x: 0, y: 0, z: 0)
scene.setPosition("sample-cube", x: 1, y: 1, z: 1)
`, 'utf8');

  const result = spawnSync(process.execPath, [cliPath, 'compile', file], {
    cwd: projectRoot,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stderr, /Warning: DUPLICATE_STATIC_SCENE_OUTPUT_TARGET/);
  const graph = JSON.parse(result.stdout);
  assert.equal(graph.nodes.filter((node) => node.type === 'scene.setPosition').length, 2);
});
