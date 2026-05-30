import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = path.join(repoRoot, 'dist', 'loomlet-scenesync-runtime.browser.js');

test('Scene Sync browser runtime bundle builds as a self-contained ESM artifact', async () => {
  execFileSync(process.execPath, ['scripts/build-scenesync-runtime-browser.mjs'], {
    cwd: repoRoot,
    stdio: 'pipe'
  });

  const source = fs.readFileSync(bundlePath, 'utf8');
  assert.match(source, /Loomlet Scene Sync browser runtime bundle/);
  assert.doesNotMatch(source, /from\s+['"]/);
  assert.doesNotMatch(source, /parseDSL|compileToGraph|compileLoomSource|loom-dsl/);
  assert.doesNotMatch(source, /afjk\.jp|presence server|presence-server|cdn\.jsdelivr|unpkg/);
});

test('Scene Sync browser runtime imports in an ESM/browser-like path and evaluates graph JSON', async () => {
  const runtimeModule = await import(`${pathToFileURL(bundlePath).href}?case=${Date.now()}`);
  assert.equal(typeof runtimeModule.createSceneSyncRuntime, 'function');
  assert.equal(typeof runtimeModule.createSceneSyncBehaviorHost, 'function');

  const graph = {
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'wave', type: 'math.sine', params: { freq: 0.25, amplitude: 2, offset: 3 } },
      { id: 'sink', type: 'scene.setPosition', params: { objectId: 'cube', y: 1, z: 2 } }
    ],
    edges: [
      { from: 'clock.t', to: 'wave.t' },
      { from: 'wave.out', to: 'sink.x' }
    ]
  };

  const object = {
    position: {
      x: 0,
      y: 0,
      z: 0,
      set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
    }
  };
  const runtime = runtimeModule.createSceneSyncRuntime(graph, {
    resolveTarget: (objectId) => objectId === 'cube' ? object : null
  });

  runtime.evaluateAt({ time: 1, deltaTime: 0.016, events: [] });

  assert.ok(Math.abs(object.position.x - 5) < 1e-10);
  assert.equal(object.position.y, 1);
  assert.equal(object.position.z, 2);
  assert.deepEqual(runtime.getEffects()[0].position, [5, 1, 2]);
});

test('Scene Sync browser runtime supports host deltaTime and events through bundled entrypoint', async () => {
  const runtimeModule = await import(`${pathToFileURL(bundlePath).href}?case=events-${Date.now()}`);
  const graph = {
    nodes: [
      { id: 'events', type: 'onEvent', params: { channel: 'scene.start', targetMode: 'any' } },
      { id: 'one', type: 'constant', params: { value: 1 } },
      { id: 'send', type: 'sendEvent', params: { channel: 'scene.ack', target: 'cube' } },
      { id: 'dt', type: 'deltaTime' },
      { id: 'move', type: 'scene.offsetPosition', params: { objectId: 'cube', y: 0, z: 0 } }
    ],
    edges: [
      { from: 'events.event', to: 'send.trigger' },
      { from: 'one.out', to: 'send.payload' },
      { from: 'dt.dt', to: 'move.x' }
    ]
  };
  const effects = [];
  const runtime = runtimeModule.createSceneSyncRuntime(graph, {
    applyEffects: false,
    onEffect: (effect) => effects.push(effect)
  });

  runtime.evaluateAt({
    time: 10,
    deltaTime: 0.25,
    events: [{ channel: 'scene.start', timestamp: 10 }]
  });

  assert.equal(effects[0].kind, 'event.send');
  assert.equal(effects[0].timestampHint, 10);
  assert.equal(effects[1].type, 'scene.offsetPosition');
  assert.deepEqual(effects[1].offset, [0.25, 0, 0]);
});

test('Scene Sync browser runtime evaluates semantic swizzle graph nodes', async () => {
  const runtimeModule = await import(`${pathToFileURL(bundlePath).href}?case=swizzle-${Date.now()}`);
  const runtime = runtimeModule.createSceneSyncRuntime({
    nodes: [
      { id: 'vector', type: 'constant', params: { value: { right: 2, up: 3, front: 4 } } },
      { id: 'horizontal', type: 'swizzle', params: { components: ['right', 'front'] } }
    ],
    edges: [{ from: 'vector.out', to: 'horizontal.value' }]
  });

  runtime.evaluateAt({ time: 0, deltaTime: 0.016, events: [] });

  assert.deepEqual(runtime.getValue('horizontal.out'), [2, 4]);
});

test('Scene Sync browser runtime supports legacy adapter node aliases with target params', async () => {
  const runtimeModule = await import(`${pathToFileURL(bundlePath).href}?case=legacy-${Date.now()}`);
  const object = {
    position: {
      set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }
    }
  };
  const runtime = runtimeModule.createSceneSyncRuntime({
    nodes: [
      { id: 'clock', type: 'clock' },
      { id: 'sink', type: 'sceneSetPosition', params: { target: 'legacy-cube', y: 2, z: 3 } }
    ],
    edges: [{ from: 'clock.t', to: 'sink.x' }]
  }, {
    resolveTarget: (objectId) => objectId === 'legacy-cube' ? object : null
  });

  runtime.evaluateAt({ time: 4, events: [] });

  assert.deepEqual(runtime.getEffects()[0].position, [4, 2, 3]);
  assert.equal(object.position.x, 4);
  assert.equal(object.position.y, 2);
  assert.equal(object.position.z, 3);
});
