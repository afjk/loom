import test from 'node:test';
import assert from 'node:assert/strict';
import { compileLoomSource } from '../src/toolchain/compile.js';
import { sceneEffectsToBroadcastOps } from '../src/scenesync/effects.js';
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

test('audioSource playback operations convert to audio-command broadcast ops', () => {
  const effects = compileEffects(`import audioSource
audioSource.play("speaker", name: "music")
audioSource.pause("speaker", name: "music")
audioSource.stop("speaker", name: "music")
audioSource.seek("speaker", name: "music", time: 3)
audioSource.playOneShot("speaker", name: "hit")
audioSource.setVolume("speaker", name: "music", volume: 0.25)
audioSource.setClip("speaker", name: "music", url: "https://example.com/song.mp3")`);

  const ops = sceneEffectsToBroadcastOps(effects);
  assert.deepEqual(ops, [
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'play' },
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'pause' },
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'stop' },
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'seek', time: 3 },
    { kind: 'audio-command', objectId: 'speaker', name: 'hit', command: 'playOneShot' },
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'setVolume', volume: 0.25 },
    { kind: 'audio-command', objectId: 'speaker', name: 'music', command: 'setClip', url: 'https://example.com/song.mp3' }
  ]);
});

test('audioSource.syncToAnimation and unsync convert to audio-command ops', () => {
  const effects = compileEffects(`import audioSource
audioSource.syncToAnimation("dancer", name: "music", animation: "Dance", offset: 0.25, resyncOnLoop: true)
audioSource.unsync("dancer", name: "music")`);

  const ops = sceneEffectsToBroadcastOps(effects);
  assert.deepEqual(ops, [
    { kind: 'audio-command', objectId: 'dancer', name: 'music', command: 'syncToAnimation', animation: 'Dance', offset: 0.25, resyncOnLoop: true },
    { kind: 'audio-command', objectId: 'dancer', name: 'music', command: 'unsync' }
  ]);
});

test('legacy scene.setAudio is no longer available', () => {
  assert.equal(NODE_TYPES['scene.setAudio'], undefined);
  const compiled = compileLoomSource('import scene\nscene.setAudio("speaker", url: "https://example.com/sound.mp3")', { target: 'scenesync' });
  assert.equal(compiled.ok, false);
});
