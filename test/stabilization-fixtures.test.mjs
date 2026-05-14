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

function readFixture(name) {
  return fs.readFileSync(path.join(fixturesPath, name), 'utf8');
}

function parseFixture(name) {
  const source = readFixture(name);
  const parsed = parseDSLToAST(source);
  assert.equal(
    parsed.errors.length,
    0,
    `Parse errors in ${name}: ${JSON.stringify(parsed.errors)}`
  );
  return { source, parsed };
}

function compileFixture(name, options = { target: 'cli' }) {
  const { source } = parseFixture(name);
  const compiled = compileLoomSource(source, options);
  assert.equal(
    compiled.ok,
    true,
    `Compile errors in ${name}: ${JSON.stringify(compiled.errors)}`
  );
  assert.ok(compiled.graph, `Graph should exist for ${name}`);
  return { source, compiled, graph: compiled.graph };
}

function runFixture(name, options = { target: 'cli' }) {
  const source = readFixture(name);
  const run = runLoomSource(source, options);
  assert.equal(
    run.ok,
    true,
    `Runtime errors in ${name}: ${JSON.stringify(run.errors)}`
  );
  return run;
}

test('basic-math: parses without errors', () => {
  parseFixture('basic-math.loom');
});

test('basic-math: compiles without errors', () => {
  const { graph } = compileFixture('basic-math.loom');
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');
});

test('basic-math: semantic expectations', () => {
  const { graph } = compileFixture('basic-math.loom');
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');
  assert.equal(valueNode.type, 'math.add', 'value node should be math.add');

  const run = runFixture('basic-math.loom');
  assert.equal(run.values['value.out'], 3, 'value should be 3');
});

test('pipe-map-render: parses without errors', () => {
  parseFixture('pipe-map-render.loom');
});

test('pipe-map-render: compiles without errors', () => {
  const { graph } = compileFixture('pipe-map-render.loom');
  assert.ok(graph.render, 'Graph should have render config');
});

test('pipe-map-render: semantic expectations', () => {
  const { graph } = compileFixture('pipe-map-render.loom');
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');
  assert.ok(graph.render, 'Graph should have render config');

  const valueNode = findNode(graph, 'value');
  assert.ok(valueNode, 'Graph should have value node');

  const normalized = normalizeGraph(graph);
  assert.ok(normalized.render, 'Normalized graph should preserve render config');
});

test('function-capture: parses without errors', () => {
  parseFixture('function-capture.loom');
});

test('function-capture: compiles without errors', () => {
  compileFixture('function-capture.loom');
});

test('function-capture: semantic expectations', () => {
  const run = runFixture('function-capture.loom');
  assert.equal(run.values['value.out'], 15, 'value should be 15 (base=10, addBase(5) = 10+5)');
});

test('scene-set-transform: parses without errors', () => {
  parseFixture('scene-set-transform.loom');
});

test('scene-set-transform: compiles without errors', () => {
  compileFixture('scene-set-transform.loom');
});

test('scene-set-transform: has expected node types', () => {
  const { graph } = compileFixture('scene-set-transform.loom');
  const setPositionNode = findNodeByType(graph, 'scene.setPosition');
  const setRotationNode = findNodeByType(graph, 'scene.setRotation');
  const setScaleNode = findNodeByType(graph, 'scene.setScale');

  assert.ok(setPositionNode, 'Graph should have scene.setPosition node');
  assert.ok(setRotationNode, 'Graph should have scene.setRotation node');
  assert.ok(setScaleNode, 'Graph should have scene.setScale node');
});

test('scene-set-transform: runtime succeeds and produces effects', () => {
  const run = runFixture('scene-set-transform.loom');
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
  const run = runFixture('scene-set-transform.loom');
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
  parseFixture('scene-math-position.loom');
});

test('scene-math-position: compiles without errors', () => {
  compileFixture('scene-math-position.loom');
});

test('scene-math-position: has expected node structure', () => {
  const { graph } = compileFixture('scene-math-position.loom');
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
  const run = runFixture('scene-math-position.loom');
  assert.equal(run.values['x.out'], 3, 'x should be 3 (1+2)');
  assert.equal(run.values['y.out'], 6, 'y should be 6 (3*2)');
});

test('scene-math-position: produces correct position effect', () => {
  const run = runFixture('scene-math-position.loom');
  const effects = run.effects || [];
  const positionEffect = findEffect(effects, 'scene.setPosition');

  assert.ok(positionEffect, 'Should have position effect');
  assert.deepEqual(positionEffect.position, [3, 6, 0], 'Position should be [3, 6, 0]');
});

test('logic-select: parses without errors', () => {
  parseFixture('logic-select.loom');
});

test('logic-select: compiles without errors', () => {
  compileFixture('logic-select.loom');
});

test('logic-select: has expected node structure', () => {
  const { graph } = compileFixture('logic-select.loom');
  const isReadyNode = findNode(graph, 'isReady');
  const labelNode = findNode(graph, 'label');

  assert.ok(isReadyNode, 'Graph should have isReady node');
  assert.equal(isReadyNode.type, 'logic.equals', 'isReady node should be logic.equals');

  assert.ok(labelNode, 'Graph should have label node');
  assert.equal(labelNode.type, 'logic.select', 'label node should be logic.select');
});

test('logic-select: runtime values are correct', () => {
  const run = runFixture('logic-select.loom');
  assert.equal(run.values['isReady.out'], true, 'isReady should be true');
  assert.equal(run.values['label.out'], 'ready', 'label should be "ready"');
});

test('logic-render-bar: parses without errors', () => {
  parseFixture('logic-render-bar.loom');
});

test('logic-render-bar: compiles without errors', () => {
  compileFixture('logic-render-bar.loom');
});

test('logic-render-bar: has expected node structure', () => {
  const { graph } = compileFixture('logic-render-bar.loom');
  const isWideNode = findNode(graph, 'isWide');
  const widthNode = findNode(graph, 'width');

  assert.ok(isWideNode, 'Graph should have isWide node');
  assert.equal(isWideNode.type, 'logic.greaterThan', 'isWide node should be logic.greaterThan');

  assert.ok(widthNode, 'Graph should have width node');
  assert.equal(widthNode.type, 'logic.select', 'width node should be logic.select');
});

test('logic-render-bar: has expected render config', () => {
  const { graph } = compileFixture('logic-render-bar.loom');
  assert.ok(graph.render, 'Graph should have render config');
  assert.equal(graph.render.type, 'bar', 'Render type should be bar');
});

test('logic-render-bar: runtime values are correct', () => {
  const run = runFixture('logic-render-bar.loom');
  assert.equal(run.values['isWide.out'], true, 'isWide should be true (120 > 100)');
  assert.equal(run.values['width.out'], 300, 'width should be 300 (selected from whenTrue)');
});

test('logic-scene-position: parses without errors', () => {
  parseFixture('logic-scene-position.loom');
});

test('logic-scene-position: compiles without errors', () => {
  compileFixture('logic-scene-position.loom');
});

test('logic-scene-position: has expected node structure', () => {
  const { graph } = compileFixture('logic-scene-position.loom');
  const moveRightNode = findNode(graph, 'moveRight');
  const xNode = findNode(graph, 'x');
  const setPositionNode = findNodeByType(graph, 'scene.setPosition');

  assert.ok(moveRightNode, 'Graph should have moveRight node');
  assert.equal(moveRightNode.type, 'logic.lessThan', 'moveRight node should be logic.lessThan');

  assert.ok(xNode, 'Graph should have x node');
  assert.equal(xNode.type, 'logic.select', 'x node should be logic.select');

  assert.ok(setPositionNode, 'Graph should have scene.setPosition node');
});

test('logic-scene-position: runtime values are correct', () => {
  const run = runFixture('logic-scene-position.loom');
  assert.equal(run.values['moveRight.out'], true, 'moveRight should be true (1 < 2)');
  assert.equal(run.values['x.out'], 5, 'x should be 5 (selected from whenTrue)');
});

test('logic-scene-position: produces correct Scene Sync position effect', () => {
  const run = runFixture('logic-scene-position.loom');
  const effects = run.effects || [];
  const positionEffect = findEffect(effects, 'scene.setPosition');

  assert.ok(positionEffect, 'Should have position effect');
  assert.equal(positionEffect.objectId, 'sample-cube', 'objectId should be sample-cube');
  assert.deepEqual(positionEffect.position, [5, 0, 0], 'Position should be [5, 0, 0]');
});

test('multi-import-render: parses without errors', () => {
  parseFixture('multi-import-render.loom');
});

test('multi-import-render: compiles without errors', () => {
  const { graph } = compileFixture('multi-import-render.loom');
  assert.ok(graph.nodes.length > 0, 'Graph should have nodes');
});

test('multi-import-render: normalized graph preserves imports', () => {
  const { graph } = compileFixture('multi-import-render.loom');
  const normalized = normalizeGraph(graph);

  assert.ok(normalized.imports, 'Normalized graph should have imports');
  assert.ok(normalized.imports.includes('math'), 'Imports should include math');
  assert.ok(normalized.imports.includes('logic'), 'Imports should include logic');
});

test('multi-import-render: has expected node structure', () => {
  const { graph } = compileFixture('multi-import-render.loom');
  const baseNode = findNode(graph, 'base');
  const isLargeNode = findNode(graph, 'isLarge');
  const widthNode = findNode(graph, 'width');

  assert.ok(baseNode, 'Graph should have base node');
  assert.equal(baseNode.type, 'math.add', 'base node should be math.add');

  assert.ok(isLargeNode, 'Graph should have isLarge node');
  assert.equal(isLargeNode.type, 'logic.greaterThan', 'isLarge node should be logic.greaterThan');

  assert.ok(widthNode, 'Graph should have width node');
  assert.equal(widthNode.type, 'logic.select', 'width node should be logic.select');
});

test('multi-import-render: has expected render config', () => {
  const { graph } = compileFixture('multi-import-render.loom');
  assert.ok(graph.render, 'Graph should have render config');
  assert.equal(graph.render.type, 'bar', 'Render type should be bar');
});

test('multi-import-render: runtime values are correct', () => {
  const run = runFixture('multi-import-render.loom');
  assert.equal(run.values['base.out'], 30, 'base should be 30 (20+10)');
  assert.equal(run.values['isLarge.out'], true, 'isLarge should be true (30 > 25)');
  assert.equal(run.values['width.out'], 200, 'width should be 200 (selected from whenTrue)');
});

test('multi-import-scene: parses without errors', () => {
  parseFixture('multi-import-scene.loom');
});

test('multi-import-scene: compiles without errors', () => {
  compileFixture('multi-import-scene.loom');
});

test('multi-import-scene: normalized graph preserves imports', () => {
  const { graph } = compileFixture('multi-import-scene.loom');
  const normalized = normalizeGraph(graph);

  assert.ok(normalized.imports, 'Normalized graph should have imports');
  assert.ok(normalized.imports.includes('math'), 'Imports should include math');
  assert.ok(normalized.imports.includes('logic'), 'Imports should include logic');
  assert.ok(normalized.imports.includes('scene'), 'Imports should include scene');
});

test('multi-import-scene: has expected node structure', () => {
  const { graph } = compileFixture('multi-import-scene.loom');
  const rawXNode = findNode(graph, 'rawX');
  const moveRightNode = findNode(graph, 'moveRight');
  const xNode = findNode(graph, 'x');
  const setPositionNode = findNodeByType(graph, 'scene.setPosition');

  assert.ok(rawXNode, 'Graph should have rawX node');
  assert.equal(rawXNode.type, 'math.add', 'rawX node should be math.add');

  assert.ok(moveRightNode, 'Graph should have moveRight node');
  assert.equal(moveRightNode.type, 'logic.equals', 'moveRight node should be logic.equals');

  assert.ok(xNode, 'Graph should have x node');
  assert.equal(xNode.type, 'logic.select', 'x node should be logic.select');

  assert.ok(setPositionNode, 'Graph should have scene.setPosition node');
});

test('multi-import-scene: runtime values are correct', () => {
  const run = runFixture('multi-import-scene.loom');
  assert.equal(run.values['rawX.out'], 3, 'rawX should be 3 (1+2)');
  assert.equal(run.values['moveRight.out'], true, 'moveRight should be true (3 equals 3)');
  assert.equal(run.values['x.out'], 3, 'x should be 3 (selected from whenTrue using rawX)');
});

test('multi-import-scene: produces expected Scene Sync position effect', () => {
  const run = runFixture('multi-import-scene.loom');
  const effects = run.effects || [];
  const positionEffect = findEffect(effects, 'scene.setPosition');

  assert.ok(positionEffect, 'Should have position effect');
  assert.equal(positionEffect.objectId, 'sample-cube', 'objectId should be sample-cube');
  assert.equal(positionEffect.position[0], 3, 'Position x should be 3');
  assert.equal(positionEffect.position[1], 0, 'Position y should be 0');
  assert.equal(positionEffect.position[2], 0, 'Position z should be 0');
});
