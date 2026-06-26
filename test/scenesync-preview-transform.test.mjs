import test from 'node:test';
import assert from 'node:assert/strict';
import {
  reduceSceneEffectsToObjects,
  graphHasSceneNodes,
  isScenePreviewEffect,
  createDefaultObjectState
} from '../src/index.js';

test('reduceSceneEffectsToObjects maps an offsetPosition effect to a position', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.offsetPosition', target: 'scenesync', objectId: 'cube', offset: [1, 2, 3] }
  ]);
  assert.deepEqual(objects.cube.position, [1, 2, 3]);
  // Untouched channels keep their defaults.
  assert.deepEqual(objects.cube.rotation, [0, 0, 0, 1]);
  assert.deepEqual(objects.cube.scale, [1, 1, 1]);
  assert.equal(objects.cube.visible, true);
  assert.equal(objects.cube.color, null);
});

test('reduceSceneEffectsToObjects supports position/rotation/scale/color/visible', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'c', position: [0, 5, 0] },
    { type: 'scene.setRotation', target: 'scenesync', objectId: 'c', rotation: [0, 0.7, 0, 0.7] },
    { type: 'scene.setScale', target: 'scenesync', objectId: 'c', scale: [2, 2, 2] },
    { type: 'scene.setColor', target: 'scenesync', objectId: 'c', color: [1, 0, 0] },
    { type: 'scene.setVisible', target: 'scenesync', objectId: 'c', visible: false }
  ]);
  assert.deepEqual(objects.c.position, [0, 5, 0]);
  assert.deepEqual(objects.c.rotation, [0, 0.7, 0, 0.7]);
  assert.deepEqual(objects.c.scale, [2, 2, 2]);
  assert.deepEqual(objects.c.color, [1, 0, 0]);
  assert.equal(objects.c.visible, false);
});

test('later effects override earlier ones within a frame', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'c', position: [1, 0, 0] },
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'c', position: [9, 0, 0] }
  ]);
  assert.deepEqual(objects.c.position, [9, 0, 0]);
});

test('multiple objects are tracked independently', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'a', position: [1, 0, 0] },
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'b', position: [0, 0, 2] }
  ]);
  assert.deepEqual(Object.keys(objects).sort(), ['a', 'b']);
  assert.deepEqual(objects.a.position, [1, 0, 0]);
  assert.deepEqual(objects.b.position, [0, 0, 2]);
});

test('non-scene effects and wrong targets are ignored', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'log', message: 'hi' },
    { type: 'scene.setPosition', target: 'audio', objectId: 'c', position: [1, 1, 1] },
    null,
    'nope'
  ]);
  assert.deepEqual(objects, {});
});

test('non-finite / missing vector components fall back to defaults', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.setPosition', target: 'scenesync', objectId: 'c', position: [null, 'x', 4] }
  ]);
  assert.deepEqual(objects.c.position, [0, 0, 4]);
});

test('empty objectId falls back to a placeholder bucket', () => {
  const objects = reduceSceneEffectsToObjects([
    { type: 'scene.setPosition', target: 'scenesync', objectId: '', position: [1, 1, 1] }
  ]);
  assert.deepEqual(Object.keys(objects), ['(unnamed)']);
});

test('isScenePreviewEffect and createDefaultObjectState behave as documented', () => {
  assert.equal(isScenePreviewEffect({ type: 'scene.setPosition', target: 'scenesync' }), true);
  assert.equal(isScenePreviewEffect({ type: 'scene.setPosition', target: 'unity' }), false);
  assert.equal(isScenePreviewEffect({ type: 'log' }), false);
  assert.deepEqual(createDefaultObjectState(), {
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
    color: null,
    visible: true
  });
});

test('graphHasSceneNodes detects scene sink nodes', () => {
  assert.equal(
    graphHasSceneNodes({ nodes: [{ type: 'clock' }, { type: 'scene.offsetPosition' }] }),
    true
  );
  assert.equal(graphHasSceneNodes({ nodes: [{ type: 'clock' }, { type: 'add' }] }), false);
  assert.equal(graphHasSceneNodes(null), false);
  assert.equal(graphHasSceneNodes({}), false);
});
