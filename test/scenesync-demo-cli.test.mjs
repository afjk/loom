import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SCENESYNC_DEMOS, getSceneSyncDemoByName } from '../src/scenesync/demo-registry.js';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cliPath = path.join(projectRoot, 'bin', 'loom.mjs');

function runCli(args, env = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env }
  });
}

test('demo registry includes lissajous', () => {
  assert.ok(SCENESYNC_DEMOS.some((demo) => demo.name === 'lissajous'));
  const demo = getSceneSyncDemoByName('lissajous');
  assert.equal(demo.file, 'examples/tour/scenesync/demos/02-lissajous.loom');
});

test('scenesync demo list includes lissajous', () => {
  const result = runCli(['scenesync', 'demo', 'list']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Scene Sync demos:/);
  assert.match(result.stdout, /lissajous/);
});

test('scenesync demo unknown demo gives clear error', () => {
  const result = runCli(['scenesync', 'demo', 'run', 'unknown-demo']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown Scene Sync demo/);
});

test('scenesync demo run without saved session prints guidance', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'loom-demo-empty-'));
  const result = runCli(['scenesync', 'demo', 'run', 'lissajous'], { HOME: tmpHome });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No saved Scene Sync session/);
  assert.match(result.stdout, /redeem <code> --save/);
});
