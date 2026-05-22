import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Loom, LoomError, NODE_TYPES } from '../src/loom.js';
import { runLoomSource } from '../src/toolchain/run.js';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';
import { isLibraryAvailableInTarget } from '../src/toolchain/runtime-targets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'loomlet.mjs');

function evalNode(type, params = {}, id = 'n') {
  const engine = new Loom({ nodes: [{ id, type, params }], edges: [] });
  engine.evaluateOnce();
  return engine.getValue(`${id}.out`);
}

function evalGraph(nodes, edges, ref) {
  const engine = new Loom({ nodes, edges });
  engine.evaluateOnce();
  return { value: ref ? engine.getValue(ref) : undefined, effects: engine.getEffects() };
}

function evalGraphAt(nodes, edges, ref, evalOptions) {
  const engine = new Loom({ nodes, edges });
  engine.evaluateOnce(evalOptions);
  return { value: ref ? engine.getValue(ref) : undefined, effects: engine.getEffects() };
}

test('logic baseline nodes', () => {
  assert.equal(evalNode('logic.equals', { value: 1, other: 1 }), true);
  assert.equal(evalNode('logic.equals', { value: 1, other: 2 }), false);
  assert.equal(evalNode('logic.notEquals', { value: 1, other: 2 }), true);
  assert.equal(evalNode('logic.select', { condition: true, whenTrue: 'yes', whenFalse: 'no' }), 'yes');
  assert.equal(evalNode('logic.select', { condition: false, whenTrue: 'yes', whenFalse: 'no' }), 'no');
  assert.equal(evalNode('logic.greaterThan', { value: 3, other: 2 }), true);
  assert.equal(evalNode('logic.lessThan', { value: 3, other: 2 }), false);
  assert.equal(evalNode('logic.greaterOrEqual', { value: 2, other: 2 }), true);
  assert.equal(evalNode('logic.lessOrEqual', { value: 2, other: 2 }), true);
  assert.equal(evalNode('logic.and', { a: 1, b: 'x' }), true);
  assert.equal(evalNode('logic.or', { a: 0, b: 'x' }), true);
  assert.equal(evalNode('logic.not', { value: 0 }), true);
  assert.equal(evalNode('logic.when', { condition: false, value: 'hidden' }), null);
});

test('list baseline nodes', () => {
  assert.deepEqual(evalNode('list.range', { start: 1, end: 3 }), [1, 2, 3]);
  assert.deepEqual(evalNode('list.range', { start: 1, end: 5 }), [1, 2, 3, 4, 5]);
  assert.deepEqual(evalNode('list.range', { start: 5, end: 1 }), [5, 4, 3, 2, 1]);
  assert.equal(evalNode('list.length', { list: [1, 2, 3] }), 3);
  assert.equal(evalNode('list.first', { list: [1, 2, 3] }), 1);
  assert.equal(evalNode('list.last', { list: [1, 2, 3] }), 3);
  assert.equal(evalNode('list.at', { list: ['a', 'b'], index: 1 }), 'b');
  assert.equal(evalNode('list.at', { list: ['a', 'b'], index: -1 }), 'b');
  assert.equal(evalNode('list.join', { list: [1, 2, 3], separator: '-' }), '1-2-3');
  const original = [3, 1, 2];
  assert.deepEqual(evalNode('list.reverse', { list: original }), [2, 1, 3]);
  assert.deepEqual(original, [3, 1, 2]);
  assert.deepEqual(evalNode('list.sort', { list: original }), [1, 2, 3]);
  assert.deepEqual(evalNode('list.take', { list: [1, 2, 3], count: 2 }), [1, 2]);
  assert.deepEqual(evalNode('list.drop', { list: [1, 2, 3], count: 2 }), [3]);
  assert.deepEqual(evalNode('list.concat', { list1: [1], list2: [2, 3] }), [1, 2, 3]);
  assert.throws(() => evalNode('list.map', { list: [1], fn: null }), (error) => error instanceof LoomError && error.code === 'INVALID_FUNCTION_VALUE');
  assert.throws(() => evalNode('list.filter', { list: [1], fn: null }), /expected fn/);
  assert.throws(() => evalNode('list.reduce', { list: [1], fn: null, initial: 0 }), /expected fn/);
});

test('text baseline additions', () => {
  assert.equal(evalNode('text.concat', { value1: 'a', value2: 2, value3: true }), 'a2true');
  assert.deepEqual(evalNode('text.split', { value: 'a,b', separator: ',' }), ['a', 'b']);
  assert.equal(evalNode('text.join', { list: ['a', 'b'], separator: ':' }), 'a:b');
  assert.equal(evalNode('text.includes', { value: 'loomlet', search: 'loom' }), true);
  assert.equal(evalNode('text.startsWith', { value: 'loomlet', search: 'loom' }), true);
  assert.equal(evalNode('text.endsWith', { value: 'loomlet', search: 'let' }), true);
  assert.equal(evalNode('text.length', { value: 'abc' }), 3);
  assert.equal(evalNode('text.isEmpty', { value: '' }), true);
  assert.equal(evalNode('text.stringify', { value: 3 }), '3');
  assert.equal(evalNode('text.stringify', { value: 'x' }), 'x');
  assert.equal(evalNode('text.stringify', { value: [1, 2] }), '[1,2]');
  assert.equal(evalNode('text.stringify', { value: { a: 1 } }), '{"a":1}');
  assert.equal(evalNode('text.stringify', { value: null }), '');
});

test('math baseline additions', () => {
  assert.equal(evalNode('math.floor', { value: 1.8 }), 1);
  assert.equal(evalNode('math.ceil', { value: 1.2 }), 2);
  assert.equal(evalNode('math.round', { value: 1.5 }), 2);
  assert.equal(evalNode('math.min', { a: 1, b: 2 }), 1);
  assert.equal(evalNode('math.max', { a: 1, b: 2 }), 2);
  assert.equal(evalNode('math.tan', { value: 0 }), 0);
  assert.equal(evalNode('math.sqrt', { value: 9 }), 3);
  assert.equal(evalNode('math.pow', { value: 2, exponent: 3 }), 8);
  assert.equal(evalNode('math.clamp', { value: 2, min: 0, max: 1 }), 1);
  assert.equal(evalNode('math.map', { value: 5, inMin: 0, inMax: 10, outMin: 0, outMax: 1 }), 0.5);
  assert.equal(evalNode('math.lerp', { a: 0, b: 10, t: 0.25 }), 2.5);
  assert.equal(evalNode('math.smoothstep', { x: 0.5, edge0: 0, edge1: 1 }), 0.5);
  assert.equal(evalNode('math.cosine', { t: 0, freq: 1, amplitude: 1, phase: 0, offset: 0 }), 1);
});

test('random baseline nodes', () => {
  const value = evalNode('random.value');
  assert.ok(value >= 0 && value < 1);
  const ranged = evalNode('random.range', { min: 10, max: 11 });
  assert.ok(ranged >= 10 && ranged < 11);
  const int = evalNode('random.int', { min: 2, max: 4 });
  assert.ok(Number.isInteger(int) && int >= 2 && int <= 4);
  assert.ok(['a', 'b'].includes(evalNode('random.choice', { list: ['a', 'b'] })));
  assert.equal(evalNode('random.choice', { list: [] }), null);
});

test('debug baseline nodes', () => {
  assert.equal(typeof evalNode('debug.inspect', { value: { a: 1 } }), 'string');
  const traced = evalGraph([{ id: 'trace', type: 'debug.trace', params: { value: 7, label: 'seven' } }], [], 'trace.out');
  assert.equal(traced.value, 7);
  assert.deepEqual(traced.effects[0], { type: 'debug.trace', label: 'seven', value: 7, nodeId: 'trace' });
  assert.equal(evalNode('debug.assert', { condition: true, message: 'ok' }), true);
  assert.throws(() => evalNode('debug.assert', { condition: false, message: 'bad' }), (error) => error instanceof LoomError && error.code === 'ASSERTION_FAILED' && /bad/.test(error.message));
});

test('clock reads host-provided env.time deterministically', () => {
  const graph = {
    nodes: [
      { id: 'timer', type: 'clock' },
      { id: 'wave', type: 'sine', params: { freq: 0.5 } }
    ],
    edges: [
      { from: 'timer.t', to: 'wave.t' }
    ]
  };

  const first = evalGraphAt(graph.nodes, graph.edges, 'wave.out', { env: { time: 0.25 } });
  const second = evalGraphAt(graph.nodes, graph.edges, 'wave.out', { env: { time: 0.25 } });
  const later = evalGraphAt(graph.nodes, graph.edges, 'wave.out', { env: { time: 0.75 } });

  assert.equal(first.value, second.value);
  assert.notEqual(first.value, later.value);
});

test('derived deltaTime is not clamped by core runtime', () => {
  const graph = {
    nodes: [
      { id: 'input', type: 'constant', params: { value: 1 } },
      { id: 'integrator', type: 'integrate' }
    ],
    edges: [
      { from: 'input.out', to: 'integrator.value' }
    ]
  };

  const engine = new Loom(graph);
  engine.evaluateAt({ time: 0 }, 0);
  engine.evaluateAt({ time: 1 }, 1000);

  assert.equal(engine.getValue('integrator.out'), 1);
});

test('node context exposes deltaTime and tick aliases', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.captureContext': {
      category: 'source',
      inputs: [],
      outputs: [
        { name: 'time', type: 'number', kind: 'behavior' },
        { name: 'dt', type: 'number', kind: 'behavior' },
        { name: 'deltaTime', type: 'number', kind: 'behavior' },
        { name: 'tick', type: 'number', kind: 'behavior' }
      ],
      params: [],
      evaluate: (inputs, params, ctx) => ({
        time: ctx.time,
        dt: ctx.dt,
        deltaTime: ctx.deltaTime,
        tick: ctx.tick
      })
    }
  };

  const engine = new Loom({ nodes: [{ id: 'ctx', type: 'test.captureContext' }], edges: [] }, { nodeTypes });
  engine.evaluateOnce({ env: { time: 1.5, deltaTime: 0.25, tick: 7 } });

  assert.equal(engine.getValue('ctx.time'), 1.5);
  assert.equal(engine.getValue('ctx.dt'), 0.25);
  assert.equal(engine.getValue('ctx.deltaTime'), 0.25);
  assert.equal(engine.getValue('ctx.tick'), 7);
});

test('ctx.state.get returns default when unset', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.stateDefault': {
      category: 'source',
      inputs: [],
      outputs: [{ name: 'out', type: 'any', kind: 'behavior' }],
      params: [],
      evaluate: (inputs, params, ctx) => ({ out: ctx.state.get('missing', false) })
    }
  };

  const engine = new Loom({ nodes: [{ id: 'n', type: 'test.stateDefault' }], edges: [] }, { nodeTypes });
  engine.evaluateOnce();
  assert.equal(engine.getValue('n.out'), false);
});

test('ctx.state.set persists across evaluations on same Loom instance', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.stateCounter': {
      category: 'source',
      inputs: [],
      outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const count = ctx.state.get('count', 0);
        ctx.state.set('count', count + 1);
        return { out: count };
      }
    }
  };

  const engine = new Loom({ nodes: [{ id: 'counter', type: 'test.stateCounter' }], edges: [] }, { nodeTypes });
  engine.evaluateOnce();
  assert.equal(engine.getValue('counter.out'), 0);
  engine.evaluateAt({ time: 1 }, 1000);
  assert.equal(engine.getValue('counter.out'), 1);
});

test('ctx.state is scoped by node id', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.stateCounter': {
      category: 'source',
      inputs: [],
      outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const count = ctx.state.get('count', 0);
        ctx.state.set('count', count + 1);
        return { out: count };
      }
    }
  };

  const engine = new Loom({
    nodes: [
      { id: 'a', type: 'test.stateCounter' },
      { id: 'b', type: 'test.stateCounter' }
    ],
    edges: []
  }, { nodeTypes });

  engine.evaluateOnce();
  assert.equal(engine.getValue('a.out'), 0);
  assert.equal(engine.getValue('b.out'), 0);

  engine.evaluateOnce({ env: { time: 1 } });
  assert.equal(engine.getValue('a.out'), 1);
  assert.equal(engine.getValue('b.out'), 1);
});

test('ctx.state is scoped by Loom instance', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.stateCounter': {
      category: 'source',
      inputs: [],
      outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const count = ctx.state.get('count', 0);
        ctx.state.set('count', count + 1);
        return { out: count };
      }
    }
  };
  const graph = { nodes: [{ id: 'counter', type: 'test.stateCounter' }], edges: [] };
  const first = new Loom(graph, { nodeTypes });
  const second = new Loom(graph, { nodeTypes });

  first.evaluateOnce();
  first.evaluateOnce({ env: { time: 1 } });
  second.evaluateOnce();

  assert.equal(first.getValue('counter.out'), 1);
  assert.equal(second.getValue('counter.out'), 0);
});

test('resetState clears ctx.state slots', () => {
  const nodeTypes = {
    ...NODE_TYPES,
    'test.stateCounter': {
      category: 'source',
      inputs: [],
      outputs: [{ name: 'out', type: 'number', kind: 'behavior' }],
      params: [],
      evaluate: (inputs, params, ctx) => {
        const count = ctx.state.get('count', 0);
        ctx.state.set('count', count + 1);
        return { out: count };
      }
    }
  };

  const engine = new Loom({ nodes: [{ id: 'counter', type: 'test.stateCounter' }], edges: [] }, { nodeTypes });
  engine.evaluateOnce();
  engine.evaluateOnce({ env: { time: 1 } });
  assert.equal(engine.getValue('counter.out'), 1);

  engine.resetState();
  engine.evaluateOnce({ env: { time: 2 } });
  assert.equal(engine.getValue('counter.out'), 0);
});

test('clock requires env.time when evaluated', () => {
  const graph = {
    nodes: [{ id: 'timer', type: 'clock' }],
    edges: []
  };

  assert.throws(
    () => new Loom(graph).evaluateOnce(),
    (error) => error instanceof LoomError && error.code === 'MISSING_ENV_TIME' && /env\.time/.test(error.message)
  );

  const result = runLoomSource('t = clock()', { target: 'cli', get: 't.out' });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0]?.code, 'MISSING_ENV_TIME');
});

test('onEvent emits matching events from env.events', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'key.down' } }],
    edges: []
  };

  const engine = new Loom(graph);
  const keyDown = { channel: 'key.down', timestamp: 1.2, payload: { key: 'Space' } };
  const pointer = { channel: 'pointer.click', timestamp: 1.3, payload: { x: 10, y: 20 } };

  engine.evaluateOnce({ env: { time: 1.5, events: [keyDown, pointer] } });

  assert.deepEqual(engine.getValue('listener.event'), [keyDown]);
});

test('onEvent ignores non-matching channels', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'scene.start' } }],
    edges: []
  };

  const engine = new Loom(graph);
  engine.evaluateOnce({
    env: {
      time: 2,
      events: [{ channel: 'key.down', timestamp: 1.9, payload: { key: 'Enter' } }]
    }
  });

  assert.deepEqual(engine.getValue('listener.event'), []);
});

test('onEvent supports custom channels', () => {
  const graph = {
    nodes: [{ id: 'flash', type: 'onEvent', params: { channel: 'custom.flash' } }],
    edges: []
  };

  const engine = new Loom(graph);
  const customEvent = { channel: 'custom.flash', timestamp: 1.2, payload: { intensity: 0.8 } };
  engine.evaluateOnce({
    env: {
      time: 1.5,
      events: [
        customEvent,
        { channel: 'key.down', timestamp: 1.3, payload: { key: 'Space' } }
      ]
    }
  });

  assert.deepEqual(engine.getValue('flash.event'), [customEvent]);
});

test('onEvent preserves env.events order for matching events', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'app.score.changed' } }],
    edges: []
  };

  const engine = new Loom(graph);
  engine.evaluateOnce({
    env: {
      time: 3,
      events: [
        { channel: 'app.score.changed', timestamp: 2.1, payload: { score: 10 }, id: 'first' },
        { channel: 'key.down', timestamp: 2.2, payload: { key: 'A' } },
        { channel: 'app.score.changed', timestamp: 2.3, payload: { score: 20 }, id: 'second' },
        { channel: 'app.score.changed', timestamp: 2.4, payload: { score: 30 }, id: 'third' }
      ]
    }
  });

  assert.deepEqual(
    engine.getValue('listener.event').map((event) => event.id),
    ['first', 'second', 'third']
  );
});

test('env.events omitted behaves as empty array', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.flash' } }],
    edges: []
  };

  const engine = new Loom(graph);
  engine.evaluateOnce({ env: { time: 1 } });

  assert.deepEqual(engine.getValue('listener.event'), []);
});

test('invalid env.events shape fails clearly', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.flash' } }],
    edges: []
  };
  const engine = new Loom(graph);

  assert.throws(
    () => engine.evaluateOnce({ env: { time: 1, events: { channel: 'custom.flash', timestamp: 1 } } }),
    (error) => error instanceof LoomError && error.code === 'INVALID_ENV_EVENTS' && /env\.events must be an array/.test(error.message)
  );
});

test('invalid event missing channel fails clearly', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.flash' } }],
    edges: []
  };
  const engine = new Loom(graph);

  assert.throws(
    () => engine.evaluateOnce({ env: { time: 1, events: [{ timestamp: 1.2, payload: {} }] } }),
    (error) => error instanceof LoomError && error.code === 'INVALID_ENV_EVENTS' && /channel must be a string/.test(error.message)
  );
});

test('invalid event timestamp fails clearly', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.flash' } }],
    edges: []
  };
  const engine = new Loom(graph);

  assert.throws(
    () => engine.evaluateOnce({ env: { time: 1, events: [{ channel: 'custom.flash' }] } }),
    (error) => error instanceof LoomError && error.code === 'INVALID_ENV_EVENTS' && /timestamp must be a finite number/.test(error.message)
  );

  assert.throws(
    () => engine.evaluateOnce({ env: { time: 1, events: [{ channel: 'custom.flash', timestamp: Number.NaN }] } }),
    (error) => error instanceof LoomError && error.code === 'INVALID_ENV_EVENTS' && /timestamp must be a finite number/.test(error.message)
  );
});

// onEvent targetMode filtering tests

test('onEvent: no scope + no targetMode receives all matching channel events (backward compat)', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0 };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-01' };
  const e3 = { channel: 'pointer.click', timestamp: 1.2, target: 'cube-02' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2, e3] } });
  assert.deepEqual(engine.getValue('listener.event'), [e1, e2, e3]);
});

test('onEvent: targetMode=any receives all matching channel events regardless of target', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click', targetMode: 'any' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0 };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-01' };
  const e3 = { channel: 'pointer.click', timestamp: 1.2, target: 'cube-02' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2, e3] } });
  assert.deepEqual(engine.getValue('listener.event'), [e1, e2, e3]);
});

test('onEvent: targetMode=explicit receives only events with matching params.target', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.enterRange', targetMode: 'explicit', target: 'zone-a' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'custom.enterRange', timestamp: 3.0, target: 'zone-a' };
  const e2 = { channel: 'custom.enterRange', timestamp: 3.1, target: 'zone-b' };
  const e3 = { channel: 'custom.enterRange', timestamp: 3.2 };
  engine.evaluateOnce({ env: { time: 4, events: [e1, e2, e3] } });
  assert.deepEqual(engine.getValue('listener.event'), [e1]);
});

test('onEvent: targetMode=explicit ignores events with different target', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.enterRange', targetMode: 'explicit', target: 'zone-a' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'custom.enterRange', timestamp: 3.0, target: 'zone-b' };
  engine.evaluateOnce({ env: { time: 4, events: [e1] } });
  assert.deepEqual(engine.getValue('listener.event'), []);
});

test('onEvent: targetMode=self receives only events whose target matches current scope id', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click', targetMode: 'self' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0, target: 'cube-01' };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-02' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), [e1]);
});

test('onEvent: targetMode=self ignores events targeted at another id', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click', targetMode: 'self' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0, target: 'cube-99' };
  engine.evaluateOnce({ env: { time: 2, events: [e1], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), []);
});

test('onEvent: targetMode=self ignores untargeted events', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click', targetMode: 'self' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0 };
  engine.evaluateOnce({ env: { time: 2, events: [e1], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), []);
});

test('onEvent: scopeDefault behaves as any for scene scope', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0 };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-01' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2], scope: { type: 'scene' } } });
  assert.deepEqual(engine.getValue('listener.event'), [e1, e2]);
});

test('onEvent: scopeDefault behaves as any for unknown scope', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0 };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-01' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2] } });
  assert.deepEqual(engine.getValue('listener.event'), [e1, e2]);
});

test('onEvent: scopeDefault behaves as self for object scope', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const e1 = { channel: 'pointer.click', timestamp: 1.0, target: 'cube-01' };
  const e2 = { channel: 'pointer.click', timestamp: 1.1, target: 'cube-02' };
  engine.evaluateOnce({ env: { time: 2, events: [e1, e2], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), [e1]);
});

test('onEvent: object-scoped default receives self-targeted events only', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'pointer.click' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const selfEvent = { channel: 'pointer.click', timestamp: 1.2, target: 'cube-01' };
  const otherEvent = { channel: 'pointer.click', timestamp: 1.3, target: 'cube-02' };
  engine.evaluateOnce({ env: { time: 2, events: [selfEvent, otherEvent], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), [selfEvent]);
});

test('onEvent: object-scoped with targetMode=any can receive global/untargeted events', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'scene.start', targetMode: 'any' } }],
    edges: []
  };
  const engine = new Loom(graph);
  const untargeted = { channel: 'scene.start', timestamp: 0.1 };
  const selfEvent = { channel: 'scene.start', timestamp: 0.2, target: 'cube-01' };
  engine.evaluateOnce({ env: { time: 1, events: [untargeted, selfEvent], scope: { type: 'object', id: 'cube-01' } } });
  assert.deepEqual(engine.getValue('listener.event'), [untargeted, selfEvent]);
});

test('onEvent: targetMode=explicit without target fails clearly', () => {
  const graph = {
    nodes: [{ id: 'listener', type: 'onEvent', params: { channel: 'custom.event', targetMode: 'explicit' } }],
    edges: []
  };
  const engine = new Loom(graph);
  assert.throws(
    () => engine.evaluateOnce({ env: { time: 1, events: [{ channel: 'custom.event', timestamp: 1 }] } }),
    (error) => error instanceof LoomError && error.code === 'INVALID_ONEVENT_PARAMS'
  );
});

test('risingEdge emits only on false -> true and never on initial evaluation', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edge', type: 'risingEdge' }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edge.value' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getValue('edge.event'), [{ timestamp: 2 }]);
  assert.equal(Object.hasOwn(engine.getValue('edge.event')[0], 'previous'), false);
  assert.equal(Object.hasOwn(engine.getValue('edge.event')[0], 'current'), false);
  assert.equal(Object.hasOwn(engine.getValue('edge.event')[0], 'payload'), false);

  engine.evaluateOnce({ env: { time: 3 } });
  assert.deepEqual(engine.getValue('edge.event'), []);
});

test('fallingEdge emits only on true -> false and never on initial evaluation', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edge', type: 'fallingEdge' }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edge.value' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateOnce({ env: { time: 3 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getValue('edge.event'), [{ timestamp: 0 }]);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getValue('edge.event'), []);
});

test('edge state persists across evaluateOnce and evaluateAt on same Loom instance', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edge', type: 'risingEdge' }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edge.value' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getValue('edge.event'), []);

  engine.evaluateAt({ time: 2 }, 2000);
  assert.deepEqual(engine.getValue('edge.event'), [{ timestamp: 2 }]);
});

test('edge state is isolated per node id and per Loom instance and resetState clears it', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edgeA', type: 'risingEdge' },
      { id: 'edgeB', type: 'risingEdge' }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edgeA.value' },
      { from: 'gt.out', to: 'edgeB.value' }
    ]
  };

  const engine = new Loom(graph);
  engine.evaluateOnce({ env: { time: 0 } });
  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getValue('edgeA.event'), [{ timestamp: 2 }]);
  assert.deepEqual(engine.getValue('edgeB.event'), [{ timestamp: 2 }]);

  const second = new Loom(graph);
  second.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(second.getValue('edgeA.event'), []);

  engine.resetState();
  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getValue('edgeA.event'), []);
});

test('risingEdge -> sendEvent emits one effect only on transition', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edge', type: 'risingEdge' },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.enterRange' } }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edge.value' },
      { from: 'edge.event', to: 'sender.trigger' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getEffects(), []);

  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getEffects(), [
    { kind: 'event.send', channel: 'custom.enterRange', timestampHint: 2 }
  ]);
});

test('fallingEdge -> sendEvent emits one effect only on transition', () => {
  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'gt', type: 'logic.greaterThan', params: { other: 1 } },
      { id: 'edge', type: 'fallingEdge' },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.leaveRange' } }
    ],
    edges: [
      { from: 'clock.t', to: 'gt.value' },
      { from: 'gt.out', to: 'edge.value' },
      { from: 'edge.event', to: 'sender.trigger' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({ env: { time: 2 } });
  assert.deepEqual(engine.getEffects(), []);

  engine.evaluateOnce({ env: { time: 0 } });
  assert.deepEqual(engine.getEffects(), [
    { kind: 'event.send', channel: 'custom.leaveRange', timestampHint: 0 }
  ]);
});

test('sendEvent emits one event.send effect when trigger receives one event', () => {
  const graph = {
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({
    env: {
      time: 1.5,
      events: [{ channel: 'custom.input', timestamp: 1.0, payload: { key: 'Enter' } }]
    }
  });

  assert.deepEqual(engine.getEffects(), [
    { kind: 'event.send', channel: 'custom.output', timestampHint: 1.5 }
  ]);
});

test('sendEvent emits no effect when trigger receives no event', () => {
  const graph = {
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  };
  const engine = new Loom(graph);
  engine.evaluateOnce({ env: { time: 1.5, events: [] } });
  assert.deepEqual(engine.getEffects(), []);
});

test('sendEvent emits one effect per trigger and uses channel/target/timestampHint from params/env', () => {
  const graph = {
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output', target: 'object-1' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({
    env: {
      time: 2.25,
      events: [
        { channel: 'custom.input', timestamp: 1.0, payload: 1 },
        { channel: 'custom.input', timestamp: 1.1, payload: 2 }
      ]
    }
  });

  assert.deepEqual(engine.getEffects(), [
    { kind: 'event.send', channel: 'custom.output', target: 'object-1', timestampHint: 2.25 },
    { kind: 'event.send', channel: 'custom.output', target: 'object-1', timestampHint: 2.25 }
  ]);
});

test('sendEvent includes target only when provided', () => {
  const withTarget = new Loom({
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output', target: 'object-2' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  });
  const withoutTarget = new Loom({
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  });

  const env = { time: 1, events: [{ channel: 'custom.input', timestamp: 0.1, payload: null }] };
  withTarget.evaluateOnce({ env });
  withoutTarget.evaluateOnce({ env });

  assert.equal(withTarget.getEffects()[0].target, 'object-2');
  assert.equal(Object.hasOwn(withoutTarget.getEffects()[0], 'target'), false);
});

test('sendEvent uses explicit payload input and does not implicitly copy trigger.payload', () => {
  const explicitPayload = { intensity: 0.8 };
  const graph = {
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'payload', type: 'constant', params: { value: explicitPayload } },
      { id: 'senderWithPayload', type: 'sendEvent', params: { channel: 'custom.explicit' } },
      { id: 'senderWithoutPayload', type: 'sendEvent', params: { channel: 'custom.implicit' } }
    ],
    edges: [
      { from: 'listener.event', to: 'senderWithPayload.trigger' },
      { from: 'payload.out', to: 'senderWithPayload.payload' },
      { from: 'listener.event', to: 'senderWithoutPayload.trigger' }
    ]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({
    env: {
      time: 1.5,
      events: [{ channel: 'custom.input', timestamp: 1.0, payload: { fromTrigger: true } }]
    }
  });

  const effects = engine.getEffects();
  const explicit = effects.find((effect) => effect.channel === 'custom.explicit');
  const implicit = effects.find((effect) => effect.channel === 'custom.implicit');
  assert.deepEqual(explicit, {
    kind: 'event.send',
    channel: 'custom.explicit',
    payload: explicitPayload,
    timestampHint: 1.5
  });
  assert.equal(Object.hasOwn(implicit, 'payload'), false);
});

test('sendEvent does not mutate env.events', () => {
  const graph = {
    nodes: [
      { id: 'listener', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'sender', type: 'sendEvent', params: { channel: 'custom.output' } }
    ],
    edges: [{ from: 'listener.event', to: 'sender.trigger' }]
  };
  const engine = new Loom(graph);
  const envEvents = [{ channel: 'custom.input', timestamp: 1.0, payload: { nested: true } }];
  const before = JSON.stringify(envEvents);

  engine.evaluateOnce({ env: { time: 1.5, events: envEvents } });

  assert.equal(JSON.stringify(envEvents), before);
});

test('onEvent -> sendEvent works with custom channels', () => {
  const graph = {
    nodes: [
      { id: 'in', type: 'onEvent', params: { channel: 'custom.input' } },
      { id: 'out', type: 'sendEvent', params: { channel: 'custom.output' } }
    ],
    edges: [{ from: 'in.event', to: 'out.trigger' }]
  };
  const engine = new Loom(graph);

  engine.evaluateOnce({
    env: {
      time: 1.5,
      events: [{ channel: 'custom.input', timestamp: 1.0 }]
    }
  });

  assert.deepEqual(engine.getEffects(), [
    { kind: 'event.send', channel: 'custom.output', timestampHint: 1.5 }
  ]);
});

test('console.table records table effect', () => {
  const { effects } = evalGraph([{ id: 'table', type: 'console.table', params: { value: [{ a: 1 }] } }], [], null);
  assert.equal(effects[0].type, 'console.table');
});

test('fs baseline nodes are CLI-only and access local files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loomlet-fs-'));
  const file = path.join(tmpDir, 'sample.txt');
  evalGraph([{ id: 'write', type: 'fs.writeText', params: { path: file, value: 'hello' } }], []);
  assert.equal(fs.readFileSync(file, 'utf8'), 'hello');
  assert.equal(evalNode('fs.readText', { path: file }), 'hello');
  assert.equal(evalNode('fs.exists', { path: file }), true);
  assert.equal(evalNode('fs.exists', { path: path.join(tmpDir, 'missing.txt') }), false);
  assert.ok(evalNode('fs.list', { path: tmpDir }).includes('sample.txt'));
  assert.equal(isLibraryAvailableInTarget('fs', 'cli'), true);
  assert.equal(isLibraryAvailableInTarget('fs', 'web'), false);
});


test('function literals can be assigned, called, and capture outer scope', () => {
  const result = runLoomSource(`double = fn(x) => math.multiply(x, 2)
double(21)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.values['_effect1.out'], 42);

  const captured = runLoomSource(`base = 10
addBase = fn(x) => math.add(x, base)
addBase(5)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(captured.ok, true, JSON.stringify(captured.errors));
  assert.equal(captured.values['_effect1.out'], 15);
});

test('list higher-order nodes accept inline and named functions', () => {
  const mapped = runLoomSource(`numbers = list.range(1, end: 3)
list.map(numbers, fn: fn(n) => math.multiply(n, 10))`, { target: 'cli', get: '_effect1.out' });
  assert.equal(mapped.ok, true, JSON.stringify(mapped.errors));
  assert.deepEqual(mapped.values['_effect1.out'], [10, 20, 30]);

  const filtered = runLoomSource(`numbers = list.range(1, end: 5)
isEven = fn(n) => logic.equals(math.mod(n, 2), other: 0)
list.filter(numbers, fn: isEven)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(filtered.ok, true, JSON.stringify(filtered.errors));
  assert.deepEqual(filtered.values['_effect1.out'], [2, 4]);

  const reduced = runLoomSource(`numbers = list.range(1, end: 4)
sum = list.reduce(numbers, initial: 0, fn: fn(acc, n) => math.add(acc, n))`, { target: 'cli', get: 'sum.out' });
  assert.equal(reduced.ok, true, JSON.stringify(reduced.errors));
  assert.equal(reduced.values['sum.out'], 10);
});


test('function body node calls enforce positional and named argument rules', () => {
  const positionalBinary = runLoomSource(`a = math.add(1, 2)
b = math.subtract(10, 3)
c = math.multiply(a, b)
d = math.divide(c, 3)
e = math.mod(d, 5)
console.log(e)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(positionalBinary.ok, true, JSON.stringify(positionalBinary.errors));

  const bodyPositionalBinary = runLoomSource(`modBy = fn(n, divisor) => math.mod(n, divisor)
console.log(modBy(10, 3))`, { target: 'cli', get: '_effect1.out' });
  assert.equal(bodyPositionalBinary.ok, true, JSON.stringify(bodyPositionalBinary.errors));

  const result = runLoomSource(`bad = fn(x) => logic.greaterThan(x, 2)
bad(3)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0]?.code, 'MISSING_ARGUMENT_NAME');

  const topLevelComparison = runLoomSource('logic.greaterThan(10, 3)', { target: 'cli', get: '_effect1.out' });
  assert.equal(topLevelComparison.ok, false);
  assert.equal(topLevelComparison.errors[0]?.code, 'MISSING_ARGUMENT_NAME');

  const multiPositional = runLoomSource('math.map(0.5, 0, 1, 0, 100)', { target: 'cli', get: '_effect1.out' });
  assert.equal(multiPositional.ok, false);
  assert.equal(multiPositional.errors[0]?.code, 'MISSING_ARGUMENT_NAME');

  const unknown = runLoomSource(`bad = fn(x) => logic.greaterThan(x, nope: 2)
bad(3)`, { target: 'cli', get: '_effect1.out' });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.errors[0]?.code, 'UNKNOWN_ARGUMENT');

  const unknownTopLevel = runLoomSource('math.add(1, wrong: 2)', { target: 'cli', get: '_effect1.out' });
  assert.equal(unknownTopLevel.ok, false);
  assert.equal(unknownTopLevel.errors[0]?.code, 'UNKNOWN_ARGUMENT');
});

test('stdlib metadata corrections', () => {
  assert.equal(isLibraryAvailableInTarget('random', 'cli'), true);
  assert.equal(isLibraryAvailableInTarget('random', 'web'), true);
  assert.equal(isLibraryAvailableInTarget('random', 'scenesync'), false);
  assert.equal(LIBRARY_METADATA.fs.status, 'implemented');
  assert.equal(NODE_TYPES['list.reduce'].outputs[0].type, 'any');
  assert.equal(NODE_TYPES['text.concat'].commutative, undefined);
  assert.equal(NODE_TYPES['list.of'].commutative, undefined);
  assert.equal(NODE_TYPES['list.concat'].commutative, undefined);
});

test('CLI docs and conditions smoke tests', () => {
  for (const args of [
    ['docs', 'logic'],
    ['docs', 'list'],
    ['docs', 'fs'],
    ['docs', 'text.stringify'],
    ['docs', 'random.value'],
    ['docs', 'debug.trace'],
    ['docs', 'logic.select'],
    ['docs', 'list.range']
  ]) {
    const result = spawnSync(process.execPath, [cliPath, ...args], { cwd: projectRoot, encoding: 'utf8' });
    assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr}`);
  }

  const fsDocs = spawnSync(process.execPath, [cliPath, 'docs', 'fs'], { cwd: projectRoot, encoding: 'utf8' });
  assert.match(fsDocs.stdout, /fs\.readText/);
  assert.match(fsDocs.stdout, /fs\.writeText/);
  assert.match(fsDocs.stdout, /fs\.exists/);
  assert.match(fsDocs.stdout, /fs\.list/);

  const sample = runLoomSource('import logic\nvalue = logic.select(constant(value: true), whenTrue: "three", whenFalse: "other")', { target: 'cli', get: 'value.out' });
  assert.equal(sample.ok, true, JSON.stringify(sample.errors));
  assert.equal(sample.values['value.out'], 'three');
});
