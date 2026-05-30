import test from 'node:test';
import assert from 'node:assert/strict';
import { Loom } from '../src/loom.js';
import { LoomSceneSync } from '../src/loom-scenesync.js';

test('LoomSceneSync.start() passes getEnv provider to scene graph', () => {
  let sceneGraphStarted = false;
  let getEnvCalled = false;
  let getEnvReceivedScope = null;

  const mockGraphClass = function() {
    this.nodes = [];
    this.edges = [];
    this._started = false;
    this.start = function(options) {
      sceneGraphStarted = true;
      assert.ok(options.getEnv, 'getEnv should be provided to start()');
      // Simulate calling getEnv during graph evaluation
      const env = options.getEnv({ elapsed: 0, timestamp: 0 });
      assert.ok(env, 'getEnv should return an environment object');
      assert.equal(typeof env.time, 'number', 'env should have a time property');
    };
    this.stop = function() { this._started = false; };
    this.evaluateAt = function() { return {}; };
  };
  mockGraphClass.registerNodeType = function() {};

  const adapter = new LoomSceneSync({
    LoomClass: mockGraphClass,
    getEnv: (opts) => {
      getEnvCalled = true;
      getEnvReceivedScope = opts.scope;
      return {
        time: 42.5
      };
    },
    send: () => {},
    resolveTarget: () => null
  });

  adapter.start();

  assert.ok(sceneGraphStarted, 'scene graph should be started');
  assert.ok(getEnvCalled, 'getEnv should be called during graph start');
  assert.deepEqual(getEnvReceivedScope, { type: 'scene' }, 'getEnv should receive scene scope');
});

test('LoomSceneSync.start() passes getEnv provider to object graphs', () => {
  const getEnvCalls = [];

  const mockGraphClass = function() {
    this.nodes = [];
    this.edges = [];
    this.start = function(options) {
      const env = options.getEnv({ elapsed: 0, timestamp: 0 });
      assert.ok(env.time !== undefined, 'env should have time property');
    };
    this.stop = function() {};
    this.evaluateAt = function() { return {}; };
  };
  mockGraphClass.registerNodeType = function() {};

  const adapter = new LoomSceneSync({
    LoomClass: mockGraphClass,
    getEnv: (opts) => {
      getEnvCalls.push(opts.scope);
      return { time: 100 };
    },
    send: () => {},
    resolveTarget: () => null
  });

  // Simulate setting an object graph
  adapter.handleMessage({
    type: 'scene-graph-set',
    scope: { object: 'cube1' },
    graph: { nodes: [], edges: [] }
  });

  adapter.start();

  // Verify getEnv was called for both scene and object scopes
  assert.ok(getEnvCalls.some(scope => scope.type === 'scene'), 'getEnv should be called for scene scope');
  assert.ok(getEnvCalls.some(scope => scope.type === 'object' && scope.id === 'cube1'), 'getEnv should be called for object scope');
});

test('LoomSceneSync._makeEnvProvider merges environment with scope', () => {
  const mockGraphClass = function() {
    this.nodes = [];
    this.edges = [];
    this.start = function() {};
    this.stop = function() {};
  };
  mockGraphClass.registerNodeType = function() {};

  const adapter = new LoomSceneSync({
    LoomClass: mockGraphClass,
    getEnv: (opts) => {
      return {
        time: 123.45,
        custom: 'value'
      };
    },
    send: () => {},
    resolveTarget: () => null
  });

  const envProvider = adapter._makeEnvProvider({ type: 'scene' });
  const env = envProvider({ elapsed: 0, timestamp: 0 });

  assert.equal(env.time, 123.45, 'environment should include time from getEnv');
  assert.equal(env.custom, 'value', 'environment should include custom values from getEnv');
  assert.deepEqual(env.scope, { type: 'scene' }, 'environment should include scope');
  assert.ok(Array.isArray(env.events), 'environment should include events array');
});

test('LoomSceneSync evaluateAt passes time through getEnv', (t) => {
  const mockGraphClass = class {
    constructor() {
      this.nodes = [];
      this.edges = [];
      this._started = false;
    }
    start() { this._started = true; }
    stop() { this._started = false; }
    evaluateAt({ time }) {
      // Verify time is received
      assert.equal(typeof time, 'number', 'time should be a number');
      return {};
    }
  };
  mockGraphClass.registerNodeType = function() {};

  const adapter = new LoomSceneSync({
    LoomClass: mockGraphClass,
    getEnv: (opts) => {
      return { time: opts.elapsed !== undefined ? opts.elapsed : 0 };
    },
    send: () => {},
    resolveTarget: () => null
  });

  // Verify that evaluateAt would use the provided time
  adapter._sceneGraph.evaluateAt({ time: 55.5 });
});

test('LoomSceneSync._makeEnvProvider throws on invalid getEnv return', () => {
  const mockGraphClass = function() {
    this.nodes = [];
    this.edges = [];
    this.start = function() {};
    this.stop = function() {};
  };
  mockGraphClass.registerNodeType = function() {};

  const adapter = new LoomSceneSync({
    LoomClass: mockGraphClass,
    getEnv: () => null,  // Invalid: should return an object
    send: () => {},
    resolveTarget: () => null
  });

  const envProvider = adapter._makeEnvProvider({ type: 'scene' });

  assert.throws(
    () => envProvider({ elapsed: 0, timestamp: 0 }),
    (err) => err.code === 'INVALID_ENV',
    'should throw INVALID_ENV when getEnv returns non-object'
  );
});
