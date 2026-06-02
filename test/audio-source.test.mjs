import test from 'node:test';
import assert from 'node:assert/strict';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { compileLoomToSceneSyncGraph } from '../src/scenesync/graph-adapter.js';
import { Loom, NODE_TYPES } from '../src/loom.js';

function compileEffects(source) {
  const compiled = compileLoomSource(source, { target: 'scenesync' });
  assert.equal(compiled.ok, true, JSON.stringify(compiled.errors));
  const engine = new Loom(compiled.graph);
  engine.evaluateOnce();
  return engine.getEffects();
}

test('audioSource library nodes are registered for every documented operation', () => {
  for (const op of ['play', 'pause', 'stop', 'seek', 'playOneShot', 'setVolume', 'setClip', 'syncToAnimation', 'unsync']) {
    assert.ok(NODE_TYPES[`audioSource.${op}`], `audioSource.${op} should be registered`);
  }
});

test('audioSource.play records a scenesync effect with default source name', () => {
  const effects = compileEffects('import audioSource\naudioSource.play("speaker")');
  assert.deepEqual(effects[0], {
    type: 'audioSource.play',
    objectId: 'speaker',
    name: 'default',
    target: 'scenesync',
    nodeId: effects[0].nodeId
  });
});

test('audioSource playback operations record runtime effects with operation fields', () => {
  const effects = compileEffects(`import audioSource
audioSource.play("speaker", name: "music")
audioSource.seek("speaker", name: "music", time: 3)
audioSource.playOneShot("speaker", name: "hit")
audioSource.setVolume("speaker", name: "music", volume: 0.25)
audioSource.setClip("speaker", name: "music", url: "https://example.com/song.mp3")`);

  assert.deepEqual(effects.map((effect) => ({ ...effect, nodeId: undefined })), [
    { type: 'audioSource.play', objectId: 'speaker', name: 'music', target: 'scenesync', nodeId: undefined },
    { type: 'audioSource.seek', objectId: 'speaker', name: 'music', target: 'scenesync', nodeId: undefined, time: 3 },
    { type: 'audioSource.playOneShot', objectId: 'speaker', name: 'hit', target: 'scenesync', nodeId: undefined },
    { type: 'audioSource.setVolume', objectId: 'speaker', name: 'music', target: 'scenesync', nodeId: undefined, volume: 0.25 },
    { type: 'audioSource.setClip', objectId: 'speaker', name: 'music', target: 'scenesync', nodeId: undefined, url: 'https://example.com/song.mp3' }
  ]);
});

test('audioSource nodes compile into the Scene Sync graph runtime', () => {
  const result = compileLoomToSceneSyncGraph(`
import audioSource
audioSource.play("speaker", name: "music")
`);

  const node = result.graph.nodes.find((n) => n.type === 'audioSourcePlay');
  assert.ok(node, 'audioSourcePlay node should be present in the Scene Sync graph');
  assert.equal(node.params.target, 'speaker');
  assert.equal(node.params.name, 'music');
  assert.deepEqual(result.scope, { object: 'speaker' });
});

test('audioSource.seek and setClip carry operation params into the Scene Sync graph', () => {
  const result = compileLoomToSceneSyncGraph(`
import audioSource
audioSource.seek("speaker", name: "music", time: 4.5)
audioSource.setClip("speaker", name: "music", url: "https://example.com/song.mp3")
`);

  const seek = result.graph.nodes.find((n) => n.type === 'audioSourceSeek');
  assert.equal(seek.params.time, 4.5);
  const setClip = result.graph.nodes.find((n) => n.type === 'audioSourceSetClip');
  assert.equal(setClip.params.url, 'https://example.com/song.mp3');
});

test('legacy scene.setAudio is no longer available', () => {
  assert.equal(NODE_TYPES['scene.setAudio'], undefined);
  const compiled = compileLoomSource('import scene\nscene.setAudio("speaker", url: "https://example.com/sound.mp3")', { target: 'scenesync' });
  assert.equal(compiled.ok, false);
});
