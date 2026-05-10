import assert from 'node:assert';
import { test } from 'node:test';
import { compileLoomToSceneSyncGraph, loomGraphToSceneSyncGraph } from '../src/scenesync/graph-adapter.js';

function assertEdgesReferToExistingNodes(graph) {
  const ids = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.from.split('.')[0]));
    assert.ok(ids.has(edge.to.split('.')[0]));
  }
}

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

  assert.deepEqual(result.scope, { object: 'sample-cube' });
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

  const result = compileLoomToSceneSyncGraph(source, { scope: { object: 'cube2' } });
  assert.deepEqual(result.scope, { object: 'cube2' });
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

test('scope option can use object scope', () => {
  const source = `
import scene
scene.setPosition("cube1", x: 0, y: 0, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source, { scope: { object: 'other-cube' } });
  assert.deepEqual(result.scope, { object: 'other-cube' });
});

test('scope option can use scene scope', () => {
  const loomGraph = {
    nodes: [
      { id: 'clock1', type: 'time.serverClock' }
    ],
    edges: []
  };

  const result = loomGraphToSceneSyncGraph(loomGraph, { scope: { scene: true } });
  assert.equal(result.scope, 'scene');
});

test('objectId option normalizes to scope', () => {
  const loomGraph = {
    nodes: [
      { id: 'clock1', type: 'time.serverClock' }
    ],
    edges: []
  };

  const result = loomGraphToSceneSyncGraph(loomGraph, { objectId: 'cube3' });
  assert.deepEqual(result.scope, { object: 'cube3' });
});

test('supports rotation/scale scene sinks', () => {
  const source = `
import scene
scene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)
scene.setScale("sample-cube", x: 1.2, y: 1.2, z: 1.2)
`;

  const result = compileLoomToSceneSyncGraph(source);
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetRotation'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetScale'));
  assert.deepEqual(result.scope, { object: 'sample-cube' });
});


test('multiple sine nodes receive unique IDs and valid edges', () => {
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
  const sineNodes = result.graph.nodes.filter((n) => n.type === 'sine');
  assert.equal(sineNodes.length, 2);
  assert.notEqual(sineNodes[0].id, sineNodes[1].id);
  assertEdgesReferToExistingNodes(result.graph);
});

test('multiple scene.setPosition nodes receive unique IDs and valid edges', () => {
  const source = `
import scene
scene.setPosition("sample-cube", x: 0, y: 0, z: 0)
scene.setPosition("sample-cube", x: 1, y: 1, z: 1)
`;
  const result = compileLoomToSceneSyncGraph(source);
  const posNodes = result.graph.nodes.filter((n) => n.type === 'sceneSetPosition');
  assert.equal(posNodes.length, 2);
  assert.notEqual(posNodes[0].id, posNodes[1].id);
  assertEdgesReferToExistingNodes(result.graph);
});

test('math.multiply converts to multiply node', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
y = math.multiply(t, 2)

scene.setPosition("sample-cube", x: 0, y: y, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'multiply'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetPosition'));
  assert.deepEqual(result.scope, { object: 'sample-cube' });
});

test('math.add still converts to add', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
y = math.add(t, 2)

scene.setPosition("sample-cube", x: 0, y: y, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'add'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetPosition'));
});

test('math.cosine still converts to cosine', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
y = math.cosine(t)

scene.setPosition("sample-cube", x: 0, y: y, z: 0)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'cosine'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneSetPosition'));
});

test('scene.offsetPosition compiles without target to sceneOffsetPosition', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
dy = math.sine(t, freq: 0.8, amplitude: 0.5)

scene.offsetPosition(y: dy)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneOffsetPosition'));
  const offsetNode = result.graph.nodes.find((n) => n.type === 'sceneOffsetPosition');
  assert.ok(offsetNode);
  assert.ok(!offsetNode.params?.target);
  assert.ok(result.graph.edges.some((e) => e.to.split('.')[0] === offsetNode.id && e.to.split('.')[1] === 'y'));
});

test('scene.offsetPosition with explicit target includes target in params', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
dy = math.sine(t, freq: 0.8, amplitude: 0.5)

scene.offsetPosition("sample-cube", y: dy)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneOffsetPosition'));
  const offsetNode = result.graph.nodes.find((n) => n.type === 'sceneOffsetPosition');
  assert.ok(offsetNode);
  assert.deepEqual(result.scope, { object: 'sample-cube' });
  assert.ok(result.graph.edges.some((e) => e.to.split('.')[0] === offsetNode.id && e.to.split('.')[1] === 'y'));
});

test('scene.offsetPosition with x and z offsets creates edges to both', () => {
  const source = `
import time
import math
import scene

t = time.serverClock()
dx = math.cosine(t, freq: 0.2, amplitude: 1.5)
dz = math.sine(t, freq: 0.2, amplitude: 1.5)

scene.offsetPosition(x: dx, z: dz)
`;

  const result = compileLoomToSceneSyncGraph(source);

  assert.ok(result.graph.nodes.some((n) => n.type === 'cosine'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sine'));
  assert.ok(result.graph.nodes.some((n) => n.type === 'sceneOffsetPosition'));
  const offsetNode = result.graph.nodes.find((n) => n.type === 'sceneOffsetPosition');
  assert.ok(result.graph.edges.some((e) => e.to.split('.')[0] === offsetNode.id && e.to.split('.')[1] === 'x'));
  assert.ok(result.graph.edges.some((e) => e.to.split('.')[0] === offsetNode.id && e.to.split('.')[1] === 'z'));
});
