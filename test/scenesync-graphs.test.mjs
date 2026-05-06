import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSceneGraphSetPayload,
  createSceneGraphClearPayload,
  validateSceneGraph
} from '../src/scenesync/index.js';

test('createSceneGraphSetPayload creates valid payload', () => {
  const graph = {
    nodes: [{ id: 'node1', type: 'sine' }],
    edges: [{ from: 'a.out', to: 'b.x' }]
  };
  const payload = createSceneGraphSetPayload('sample-cube', graph);
  assert.equal(payload.type, 'scene-graph-set');
  assert.equal(payload.scope.object, 'sample-cube');
  assert.deepEqual(payload.graph, graph);
});

test('createSceneGraphClearPayload creates valid payload', () => {
  const payload = createSceneGraphClearPayload('sample-cube');
  assert.equal(payload.type, 'scene-graph-clear');
  assert.equal(payload.scope.object, 'sample-cube');
  assert(!Object.hasOwn(payload, 'graph'));
});

test('validateSceneGraph throws on invalid objectId - empty string', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('', {
      nodes: [],
      edges: []
    });
  }, /objectId must be a non-empty string/);
});

test('validateSceneGraph throws on invalid objectId - not string', () => {
  assert.throws(() => {
    createSceneGraphSetPayload(123, {
      nodes: [],
      edges: []
    });
  }, /objectId must be a non-empty string/);
});

test('validateSceneGraph throws when graph is not an object', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', null);
  }, /graph must be an object/);
});

test('validateSceneGraph throws when nodes is not an array', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: 'not-array',
      edges: []
    });
  }, /graph.nodes must be an array/);
});

test('validateSceneGraph throws when edges is not an array', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [],
      edges: 'not-array'
    });
  }, /graph.edges must be an array/);
});

test('validateSceneGraph throws when node missing id', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ type: 'sine' }],
      edges: []
    });
  }, /each node must have a non-empty id string/);
});

test('validateSceneGraph throws when node id is empty', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: '', type: 'sine' }],
      edges: []
    });
  }, /each node must have a non-empty id string/);
});

test('validateSceneGraph throws when node missing type', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1' }],
      edges: []
    });
  }, /each node must have a non-empty type string/);
});

test('validateSceneGraph throws when node type is empty', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1', type: '' }],
      edges: []
    });
  }, /each node must have a non-empty type string/);
});

test('validateSceneGraph throws when edge missing from', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1', type: 'sine' }],
      edges: [{ to: 'node1.x' }]
    });
  }, /each edge must have a non-empty from string/);
});

test('validateSceneGraph throws when edge from is empty', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1', type: 'sine' }],
      edges: [{ from: '', to: 'node1.x' }]
    });
  }, /each edge must have a non-empty from string/);
});

test('validateSceneGraph throws when edge missing to', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1', type: 'sine' }],
      edges: [{ from: 'node1.out' }]
    });
  }, /each edge must have a non-empty to string/);
});

test('validateSceneGraph throws when edge to is empty', () => {
  assert.throws(() => {
    createSceneGraphSetPayload('obj', {
      nodes: [{ id: 'node1', type: 'sine' }],
      edges: [{ from: 'node1.out', to: '' }]
    });
  }, /each edge must have a non-empty to string/);
});

test('validateSceneGraph accepts graph with multiple nodes and edges', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'serverClock' },
      { id: 'sine', type: 'sine', params: { freq: 0.2 } },
      { id: 'pos', type: 'sceneSetPosition', params: { y: 0.5 } }
    ],
    edges: [
      { from: 'clock.t', to: 'sine.t' },
      { from: 'sine.out', to: 'pos.x' }
    ]
  };
  const payload = createSceneGraphSetPayload('sample-cube', graph);
  assert.equal(payload.scope.object, 'sample-cube');
  assert.equal(payload.graph.nodes.length, 3);
  assert.equal(payload.graph.edges.length, 2);
});

test('validateSceneGraph accepts graph with optional node params', () => {
  const graph = {
    nodes: [
      { id: 'node1', type: 'sine', params: { freq: 0.5, amplitude: 2 } }
    ],
    edges: []
  };
  const payload = createSceneGraphSetPayload('obj', graph);
  assert.equal(payload.graph.nodes[0].params.freq, 0.5);
  assert.equal(payload.graph.nodes[0].params.amplitude, 2);
});

test('createSceneGraphClearPayload throws on invalid objectId', () => {
  assert.throws(() => {
    createSceneGraphClearPayload('');
  }, /objectId must be a non-empty string/);
});

test('createSceneGraphClearPayload throws on non-string objectId', () => {
  assert.throws(() => {
    createSceneGraphClearPayload(null);
  }, /objectId must be a non-empty string/);
});
