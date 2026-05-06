import assert from 'node:assert';
import { test } from 'node:test';
import { compileLoomToSceneSyncGraph, loomGraphToSceneSyncGraph } from '../src/scenesync/graph-adapter.js';

test('compiles lissajous example to Scene Sync graph', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()

x = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)
y = math.sine(t, freq: 0.3, amplitude: 0.5, offset: 1.2)

scene.setPosition("sample-cube", x: x, y: y, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.equal(result.objectId, 'sample-cube');
  assert.ok(result.graph.nodes.some((n) => n.type === 'serverClock'));
  assert.equal(result.graph.nodes.filter((n) => n.type === 'sine').length, 2);
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetPosition'));
  assert.equal(result.graph.edges.length, 4);
});

test('--object option overrides DSL object id', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()

x = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)
y = math.sine(t, freq: 0.3, amplitude: 0.5, offset: 1.2)

scene.setPosition("sample-cube", x: x, y: y, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source, { objectId: 'cube2' });
  assert.equal(result.objectId, 'cube2');
});

test('rejects unsupported node with clear error', () => {
  const source = `
import console

console.log("hello")
`;

  assert.throws(
    () => compileLoomToSceneSyncGraph(source),
    (error) => error.message.includes('Unsupported Scene Sync graph node: console.log')
  );
});

test('preserves literal position params', () => {
  const source = `
import scene

scene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source);
  const posNode = result.graph.nodes.find((n) => n.type === 'sceneSetPosition');

  assert.ok(posNode);
  assert.equal(posNode.params.x, 1);
  assert.equal(posNode.params.y, 0.5);
  assert.equal(posNode.params.z, 0);
  assert.equal(result.graph.edges.length, 0);
});

test('converts only supported nodes in mixed graph', () => {
  const loomGraph = {
    nodes: [
      { id: 'clock1', type: 'time.serverClock' },
      { id: 'sine1', type: 'math.sine', params: { freq: 1, amplitude: 1, offset: 0 } },
      { id: 'pos1', type: 'scene.setPosition', params: { objectId: 'cube', x: 0, y: 0, z: 0 } }
    ],
    edges: [
      { from: 'clock1.t', to: 'sine1.t' },
      { from: 'sine1.out', to: 'pos1.x' }
    ]
  };

  const result = loomGraphToSceneSyncGraph(loomGraph);

  assert.equal(result.graph.nodes.length, 3);
  assert.ok(result.graph.nodes.some((n) => n.type === 'serverClock'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sine'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetPosition'));
});

test('maps node IDs to stable identifiers', () => {
  const loomGraph = {
    nodes: [
      { id: '_anon1', type: 'time.serverClock' }
    ],
    edges: []
  };

  const result = loomGraphToSceneSyncGraph(loomGraph);
  const clockNode = result.graph.nodes.find((n) => n.type === 'serverClock');

  assert.equal(clockNode.id, 'clock');
});

test('preserves parameter values from Loom graph to Scene Sync graph', () => {
  const loomGraph = {
    nodes: [
      { id: 'sine1', type: 'math.sine', params: { freq: 2, amplitude: 3, offset: 4 } }
    ],
    edges: []
  };

  const result = loomGraphToSceneSyncGraph(loomGraph);
  const sineNode = result.graph.nodes.find((n) => n.type === 'sine');

  assert.equal(sineNode.params.freq, 2);
  assert.equal(sineNode.params.amplitude, 3);
  assert.equal(sineNode.params.offset, 4);
});
