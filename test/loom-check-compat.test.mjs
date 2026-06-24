import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
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

function writeTemp(name, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'loom-compat-'));
  const file = path.join(dir, name);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

const SCENE_SOURCE = 'import scene\nscene.setColor("box", r: 1, g: 0, b: 0)\nscene.setPosition("box", x: clock())\n';

test('check-compat without a target reports every host', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /requires: env\.time\.seconds@1, scene\.object\.material\.write@1, scene\.object\.transform\.write@1/);
  assert.match(result.stdout, /web-scenesync: full/);
  assert.match(result.stdout, /export-viewer: full/);
  assert.match(result.stdout, /unity-runtime: partial/);
  assert.match(result.stdout, /cli: partial/);
});

test('check-compat exits non-zero when the target lacks a required capability', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file, '--target', 'unity-runtime']);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stdout, /unsupported: scene\.object\.material\.write@1/);
});

test('check-compat exits zero when the target supports the graph', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file, '--target', 'web-scenesync']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /web-scenesync: full/);
});

test('check-compat --json emits a structured report for a single target', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file, '--target', 'unity-runtime', '--json']);
  assert.equal(result.status, 1, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(payload.report.targetHost, 'unity-runtime');
  assert.equal(payload.report.status, 'partial');
  assert.equal(payload.report.unsupported[0].capability, 'scene.object.material.write@1');
  assert.ok(payload.requires.includes('scene.object.transform.write@1'));
});

test('check-compat accepts a compiled GraphJSON file', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const compiled = runCli(['compile', file, '-o', path.join(path.dirname(file), 'scene.json')]);
  assert.equal(compiled.status, 0, compiled.stderr);
  const result = runCli(['check-compat', path.join(path.dirname(file), 'scene.json'), '--target', 'web-scenesync']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /web-scenesync: full/);
});

test('check-compat rejects an unknown host profile', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file, '--target', 'bogus-host']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown host profile: bogus-host/);
});

test('check-compat requires a file argument', () => {
  const result = runCli(['check-compat']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /check-compat requires <file>/);
});

test('check-compat rejects an empty --target= value instead of silently passing', () => {
  const file = writeTemp('scene.loom', SCENE_SOURCE);
  const result = runCli(['check-compat', file, '--target=']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--target requires a host profile name/);
});
