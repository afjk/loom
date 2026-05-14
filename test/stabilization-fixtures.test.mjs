import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDSLToAST } from '../src/loom-dsl.js';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { runLoomSource } from '../src/toolchain/run.js';
import { normalizeGraph, findNode } from './helpers/normalize-graph.mjs';
import {
  isSceneSyncEffect,
  sceneEffectsToBroadcastPayload
} from '../src/scenesync/effects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesPath = path.join(__dirname, 'fixtures', 'stabilization');

function findEffect(effects, type) {
  return effects.find((effect) => effect.type === type);
}

function findNodeByType(graph, type) {
  return (graph.nodes ?? []).find((node) => node.type === type);
}

test('basic-math: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('basic-math: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('basic-math: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'basic-math.loom'), 'utf8');
  const compiled = compileLoomSource(source, { target: 'cli' });
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');
  assert.equal(valueNode.type, 'math.add', 'value node should be math.add');

  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true);
  assert.equal(run.values['value.out'], 3, 'value should be 3');
});

test('pipe-map-render: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('pipe-map-render: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('pipe-map-render: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'pipe-map-render.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');
  assert.ok(graph.render, 'Graph should have render config');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');

  const normalized = normalizeGraph(graph);
  assert.ok(normalized.render, 'Normalized graph should preserve render config');
});

test('function-capture: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('function-capture: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const compiled = compileLoomSource(source, { target: 'cli' });
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('function-capture: semantic expectations', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'function-capture.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true, `Runtime errors: ${JSON.stringify(run.errors)}`);
  assert.equal(run.values['value.out'], 15, 'value should be 15 (base=10, addBase(5) = 10+5)');
});

test('scene-set-transform: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-set-transform.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('scene-set-transform: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-set-transform.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('scene-set-transform: has expected node types', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-set-transform.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  const setPositionNode = findNodeByType(graph, 'scene.setPosition');
  const setRotationNode = findNodeByType(graph, 'scene.setRotation');
  const setScaleNode = findNodeByType(graph, 'scene.setScale');

  assert.ok(setPositionNode, 'Graph should have scene.setPosition node');
  assert.ok(setRotationNode, 'Graph should have scene.setRotation node');
  assert.ok(setScaleNode, 'Graph should have scene.setScale node');
});

test('scene-set-transform: runtime succeeds and produces effects', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-set-transform.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true, `Runtime errors: ${JSON.stringify(run.errors)}`);

  const effects = run.effects || [];
  assert.ok(effects.length >= 3, 'Should have at least 3 effects');

  const positionEffect = findEffect(effects, 'scene.setPosition');
  const rotationEffect = findEffect(effects, 'scene.setRotation');
  const scaleEffect = findEffect(effects, 'scene.setScale');

  assert.ok(positionEffect, 'Should have position effect');
  assert.ok(rotationEffect, 'Should have rotation effect');
  assert.ok(scaleEffect, 'Should have scale effect');

  assert.deepEqual(positionEffect.position, [1, 2, 3], 'Position should be [1, 2, 3]');
  assert.deepEqual(rotationEffect.rotation, [0, 0, 0, 1], 'Rotation should be [0, 0, 0, 1]');
  assert.deepEqual(scaleEffect.scale, [2, 2, 2], 'Scale should be [2, 2, 2]');
});

test('scene-set-transform: effects are recognized as Scene Sync', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-set-transform.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true);

  const effects = run.effects || [];
  const sceneEffects = effects.filter(isSceneSyncEffect);
  assert.equal(sceneEffects.length, 3, 'All three effects should be Scene Sync effects');

  const payload = sceneEffectsToBroadcastPayload(effects);
  assert.ok(payload, 'Payload should exist');
  assert.equal(payload.kind, 'scene-batch', 'Payload should be scene-batch for multiple effects');
  assert.ok(Array.isArray(payload.ops), 'Payload should have ops array');
  assert.equal(payload.ops.length, 3, 'Payload should have 3 ops');
  assert.ok(payload.ops.every(op => op.objectId === 'sample-cube'), 'All ops should be for sample-cube');
});

test('scene-math-position: parses without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-math-position.loom'), 'utf8');
  const parsed = parseDSLToAST(source);
  assert.equal(parsed.errors.length, 0, `Parse errors: ${JSON.stringify(parsed.errors)}`);
});

test('scene-math-position: compiles without errors', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-math-position.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true, `Compile errors: ${JSON.stringify(compiled.errors)}`);
  assert.ok(compiled.graph, 'Graph should exist');
});

test('scene-math-position: has expected node structure', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-math-position.loom'), 'utf8');
  const compiled = compileLoomSource(source);
  assert.equal(compiled.ok, true);

  const graph = compiled.graph;
  const xNode = findNode(graph, 'x');
  const yNode = findNode(graph, 'y');
  const setPositionNode = findNodeByType(graph, 'scene.setPosition');

  assert.ok(xNode, 'Graph should have x node');
  assert.equal(xNode.type, 'math.add', 'x node should be math.add');

  assert.ok(yNode, 'Graph should have y node');
  assert.equal(yNode.type, 'math.multiply', 'y node should be math.multiply');

  assert.ok(setPositionNode, 'Graph should have scene.setPosition node');
});

test('scene-math-position: runtime values are correct', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-math-position.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true, `Runtime errors: ${JSON.stringify(run.errors)}`);

  assert.equal(run.values['x.out'], 3, 'x should be 3 (1+2)');
  assert.equal(run.values['y.out'], 6, 'y should be 6 (3*2)');
});

test('scene-math-position: produces correct position effect', () => {
  const source = fs.readFileSync(path.join(fixturesPath, 'scene-math-position.loom'), 'utf8');
  const run = runLoomSource(source, { target: 'cli' });
  assert.equal(run.ok, true);

  const effects = run.effects || [];
  const positionEffect = findEffect(effects, 'scene.setPosition');

  assert.ok(positionEffect, 'Should have position effect');
  assert.deepEqual(positionEffect.position, [3, 6, 0], 'Position should be [3, 6, 0]');
});
