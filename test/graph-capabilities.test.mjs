import test from 'node:test';
import assert from 'node:assert/strict';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { NODE_TYPES } from '../src/loom.js';
import {
  summarizeGraphCapabilities,
  checkHostCompatibility,
  resolveNodeCapabilities,
  listHostProfiles,
  HOST_CAPABILITIES
} from '../src/runtime/capabilities.js';

function compileGraph(source) {
  const compiled = compileLoomSource(source, { target: 'scenesync' });
  assert.equal(compiled.ok, true, JSON.stringify(compiled.errors));
  return compiled.graph;
}

test('built-in MVP nodes carry explicit capability metadata', () => {
  assert.deepEqual(NODE_TYPES.clock.requires, ['env.time.seconds@1']);
  assert.deepEqual(NODE_TYPES.input.requires, ['env.input@1']);
  assert.deepEqual(NODE_TYPES.onEvent.requires, ['env.events@1']);
  assert.deepEqual(NODE_TYPES.sendEvent.requires, ['event.emit@1']);
  assert.deepEqual(NODE_TYPES['scene.setPosition'].requires, ['scene.object.transform.write@1']);
  assert.deepEqual(NODE_TYPES['scene.setVisible'].requires, ['scene.object.visibility.write@1']);
  assert.deepEqual(NODE_TYPES['scene.setColor'].requires, ['scene.object.material.write@1']);
  assert.deepEqual(NODE_TYPES['audioSource.play'].requires, ['scene.object.audio.control@1']);
});

test('color/visibility graphs are full on web-scenesync and export-viewer, unsupported on unity/cli', () => {
  const graph = compileGraph('import scene\nscene.setColor("box", r: 1, g: 0, b: 0)\nscene.setVisible("box", visible: false)');
  for (const host of ['web-scenesync', 'export-viewer']) {
    assert.equal(checkHostCompatibility(graph, NODE_TYPES, host).status, 'full', host);
  }
  const unity = checkHostCompatibility(graph, NODE_TYPES, 'unity-runtime');
  assert.equal(unity.status, 'unsupported');
  const unityCaps = unity.unsupported.map((u) => u.capability).sort();
  assert.deepEqual(unityCaps, ['scene.object.material.write@1', 'scene.object.visibility.write@1']);
  assert.equal(checkHostCompatibility(graph, NODE_TYPES, 'cli').status, 'unsupported');
});

test('pure library nodes resolve to pure.compute via the built-in default', () => {
  const caps = resolveNodeCapabilities('math.add', NODE_TYPES['math.add']);
  assert.equal(caps.classified, true);
  assert.deepEqual(caps.requires, ['pure.compute@1']);
  assert.equal(caps.determinism, 'pure');
});

test('unknown custom nodes are left unclassified', () => {
  const caps = resolveNodeCapabilities('my.customNode', undefined);
  assert.equal(caps.classified, false);
  assert.deepEqual(caps.requires, []);
});

test('a node annotated with only reads is treated as explicitly classified', () => {
  const caps = resolveNodeCapabilities('sensor.read', {
    category: 'source',
    reads: ['env.sensor']
  });
  assert.equal(caps.classified, true);
  assert.deepEqual(caps.reads, ['env.sensor']);
});

test('an explicitly pure node without a determinism string is reported pure', () => {
  const caps = resolveNodeCapabilities('pure.custom', {
    category: 'transform',
    effects: [],
    requires: ['pure.compute@1']
  });
  assert.equal(caps.determinism, 'pure');
});

test('effectful log node is not classified pure', () => {
  const caps = resolveNodeCapabilities('log', NODE_TYPES.log);
  assert.equal(caps.classified, false);
});

test('summarizeGraphCapabilities aggregates requirements and weakest determinism', () => {
  const graph = compileGraph('import scene\nscene.setPosition("box", x: clock())');
  const summary = summarizeGraphCapabilities(graph, NODE_TYPES);

  assert.ok(summary.requires.includes('env.time.seconds@1'));
  assert.ok(summary.requires.includes('scene.object.transform.write@1'));
  assert.ok(summary.effects.includes('SceneWrite'));
  assert.ok(summary.effects.includes('TimeRead'));
  assert.ok(summary.writes.includes('object.self.position'));
  assert.equal(summary.determinism, 'deterministic-with-env');
  assert.deepEqual(summary.unclassified, []);
});

test('checkHostCompatibility reports full support on web-scenesync', () => {
  const graph = compileGraph('import scene\nscene.setPosition("box", x: clock())');
  const report = checkHostCompatibility(graph, NODE_TYPES, 'web-scenesync');

  assert.equal(report.targetHost, 'web-scenesync');
  assert.equal(report.status, 'full');
  assert.deepEqual(report.unsupported, []);
  assert.deepEqual(report.unclassified, []);
  assert.ok(report.supported.includes('scene.object.transform.write@1'));
});

test('checkHostCompatibility flags scene writes as unsupported on cli', () => {
  const graph = compileGraph('import scene\nscene.setPosition("box", x: clock())');
  const report = checkHostCompatibility(graph, NODE_TYPES, 'cli');

  assert.equal(report.status, 'partial');
  const sceneEntry = report.unsupported.find(
    (entry) => entry.capability === 'scene.object.transform.write@1'
  );
  assert.ok(sceneEntry, 'scene transform write should be unsupported on cli');
  assert.ok(sceneEntry.nodes.length >= 1);
  assert.match(sceneEntry.message, /cli does not provide/);
});

test('checkHostCompatibility reports unsupported when nothing is supported', () => {
  const graph = compileGraph('import audioSource\naudioSource.play("speaker")');
  const report = checkHostCompatibility(graph, NODE_TYPES, 'cli');
  assert.equal(report.status, 'unsupported');
  assert.deepEqual(report.supported, []);
});

test('checkHostCompatibility surfaces unclassified custom nodes', () => {
  const graph = { nodes: [{ id: 'custom1', type: 'my.customNode' }], edges: [] };
  const report = checkHostCompatibility(graph, NODE_TYPES, 'web-scenesync');
  assert.equal(report.status, 'partial');
  assert.equal(report.unclassified.length, 1);
  assert.equal(report.unclassified[0].nodeId, 'custom1');
});

test('checkHostCompatibility accepts an inline capability set', () => {
  const graph = compileGraph('import scene\nscene.setPosition("box", x: 1)');
  const report = checkHostCompatibility(graph, NODE_TYPES, {
    host: 'experimental-host',
    capabilities: ['scene.object.transform.write@1', 'pure.compute@1']
  });
  assert.equal(report.targetHost, 'experimental-host');
  assert.equal(report.status, 'full');
});

test('unknown host profile name throws', () => {
  assert.throws(() => checkHostCompatibility({ nodes: [] }, NODE_TYPES, 'no-such-host'), /Unknown host profile/);
});

test('host profiles are listed and stable', () => {
  assert.deepEqual(listHostProfiles(), ['cli', 'export-viewer', 'unity-runtime', 'web-scenesync']);
  for (const profile of listHostProfiles()) {
    assert.ok(Array.isArray(HOST_CAPABILITIES[profile]));
  }
});

test('unity-runtime does not declare audio control (no runtime implementation yet)', () => {
  assert.ok(!HOST_CAPABILITIES['unity-runtime'].includes('scene.object.audio.control@1'));
  // Scene Sync Web and Export Viewer do provide audio control.
  assert.ok(HOST_CAPABILITIES['web-scenesync'].includes('scene.object.audio.control@1'));
  assert.ok(HOST_CAPABILITIES['export-viewer'].includes('scene.object.audio.control@1'));
});
