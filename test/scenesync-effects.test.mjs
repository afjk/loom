import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSceneSyncEffect,
  sceneEffectToBroadcastOp,
  sceneEffectsToBroadcastOps,
  sceneEffectsToBroadcastPayload
} from '../src/scenesync/effects.js';

test('isSceneSyncEffect returns true for scene.setPosition', () => {
  const effect = {
    type: 'scene.setPosition',
    target: 'scenesync',
    objectId: 'sample-cube',
    position: [1, 0.5, 0]
  };
  assert.equal(isSceneSyncEffect(effect), true);
});

test('isSceneSyncEffect returns true for scene.setRotation', () => {
  const effect = {
    type: 'scene.setRotation',
    target: 'scenesync',
    objectId: 'sample-cube',
    rotation: [0, 0, 0, 1]
  };
  assert.equal(isSceneSyncEffect(effect), true);
});

test('isSceneSyncEffect returns true for scene.setScale', () => {
  const effect = {
    type: 'scene.setScale',
    target: 'scenesync',
    objectId: 'sample-cube',
    scale: [2, 2, 2]
  };
  assert.equal(isSceneSyncEffect(effect), true);
});

test('isSceneSyncEffect returns true for audioSource.play', () => {
  const effect = {
    type: 'audioSource.play',
    target: 'scenesync',
    objectId: 'speaker',
    name: 'music'
  };
  assert.equal(isSceneSyncEffect(effect), true);
});

test('isSceneSyncEffect returns false for legacy scene.setAudio', () => {
  const effect = {
    type: 'scene.setAudio',
    target: 'scenesync',
    objectId: 'sample-cube',
    url: 'https://example.com/sound.mp3'
  };
  assert.equal(isSceneSyncEffect(effect), false);
});

test('isSceneSyncEffect returns false for non-scenesync target', () => {
  const effect = {
    type: 'scene.setPosition',
    target: 'other',
    objectId: 'sample-cube',
    position: [1, 0.5, 0]
  };
  assert.equal(isSceneSyncEffect(effect), false);
});

test('isSceneSyncEffect returns false for unknown type', () => {
  const effect = {
    type: 'scene.unknown',
    target: 'scenesync',
    objectId: 'sample-cube'
  };
  assert.equal(isSceneSyncEffect(effect), false);
});

test('sceneEffectToBroadcastOp converts position', () => {
  const effect = {
    type: 'scene.setPosition',
    objectId: 'sample-cube',
    position: [1, 0.5, 0]
  };

  const op = sceneEffectToBroadcastOp(effect);
  assert.deepEqual(op, {
    kind: 'scene-delta',
    objectId: 'sample-cube',
    position: [1, 0.5, 0]
  });
});

test('sceneEffectToBroadcastOp converts rotation', () => {
  const effect = {
    type: 'scene.setRotation',
    objectId: 'sample-cube',
    rotation: [0, 0, 0, 1]
  };

  const op = sceneEffectToBroadcastOp(effect);
  assert.deepEqual(op, {
    kind: 'scene-delta',
    objectId: 'sample-cube',
    rotation: [0, 0, 0, 1]
  });
});

test('sceneEffectToBroadcastOp converts scale', () => {
  const effect = {
    type: 'scene.setScale',
    objectId: 'sample-cube',
    scale: [2, 2, 2]
  };

  const op = sceneEffectToBroadcastOp(effect);
  assert.deepEqual(op, {
    kind: 'scene-delta',
    objectId: 'sample-cube',
    scale: [2, 2, 2]
  });
});

test('sceneEffectToBroadcastOp converts audioSource.play to an audio-command', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.play',
    objectId: 'speaker',
    name: 'music'
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'speaker',
    name: 'music',
    command: 'play'
  });
});

test('sceneEffectToBroadcastOp defaults the source name to "default"', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.stop',
    objectId: 'speaker'
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'speaker',
    name: 'default',
    command: 'stop'
  });
});

test('sceneEffectToBroadcastOp converts audioSource.seek with time', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.seek',
    objectId: 'speaker',
    name: 'music',
    time: 12.5
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'speaker',
    name: 'music',
    command: 'seek',
    time: 12.5
  });
});

test('sceneEffectToBroadcastOp converts audioSource.setVolume with volume', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.setVolume',
    objectId: 'speaker',
    name: 'music',
    volume: 0.5
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'speaker',
    name: 'music',
    command: 'setVolume',
    volume: 0.5
  });
});

test('sceneEffectToBroadcastOp converts audioSource.setClip with url', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.setClip',
    objectId: 'speaker',
    name: 'music',
    url: 'https://example.com/song.mp3'
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'speaker',
    name: 'music',
    command: 'setClip',
    url: 'https://example.com/song.mp3'
  });
});

test('sceneEffectToBroadcastOp converts audioSource.playOneShot', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.playOneShot',
    objectId: 'cube-01',
    name: 'click'
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'cube-01',
    name: 'click',
    command: 'playOneShot'
  });
});

test('sceneEffectToBroadcastOp converts audioSource.syncToAnimation with defaults', () => {
  const op = sceneEffectToBroadcastOp({
    type: 'audioSource.syncToAnimation',
    objectId: 'dancer',
    name: 'music',
    animation: 'Dance'
  });
  assert.deepEqual(op, {
    kind: 'audio-command',
    objectId: 'dancer',
    name: 'music',
    command: 'syncToAnimation',
    animation: 'Dance',
    offset: 0,
    resyncOnLoop: true
  });
});

test('sceneEffectToBroadcastOp throws for audioSource.seek with non-finite time', () => {
  assert.throws(() => sceneEffectToBroadcastOp({
    type: 'audioSource.seek',
    objectId: 'speaker',
    name: 'music',
    time: Number.NaN
  }), /time/);
});

test('sceneEffectToBroadcastOp throws for audioSource.setClip with empty url', () => {
  assert.throws(() => sceneEffectToBroadcastOp({
    type: 'audioSource.setClip',
    objectId: 'speaker',
    name: 'music',
    url: ''
  }), /url/);
});

test('sceneEffectToBroadcastOp throws for missing objectId', () => {
  const effect = {
    type: 'scene.setPosition',
    position: [1, 0.5, 0]
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /objectId/);
});

test('sceneEffectToBroadcastOp throws for empty objectId', () => {
  const effect = {
    type: 'scene.setPosition',
    objectId: '',
    position: [1, 0.5, 0]
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /objectId/);
});

test('sceneEffectToBroadcastOp throws for non-array position', () => {
  const effect = {
    type: 'scene.setPosition',
    objectId: 'sample-cube',
    position: { x: 1, y: 0.5, z: 0 }
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /position/);
});

test('sceneEffectToBroadcastOp throws for wrong position length', () => {
  const effect = {
    type: 'scene.setPosition',
    objectId: 'sample-cube',
    position: [1, 0.5]
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /position/);
});

test('sceneEffectToBroadcastOp throws for wrong rotation length', () => {
  const effect = {
    type: 'scene.setRotation',
    objectId: 'sample-cube',
    rotation: [0, 0, 0]
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /rotation/);
});

test('sceneEffectToBroadcastOp throws for wrong scale length', () => {
  const effect = {
    type: 'scene.setScale',
    objectId: 'sample-cube',
    scale: [2, 2]
  };

  assert.throws(() => sceneEffectToBroadcastOp(effect), /scale/);
});

test('sceneEffectsToBroadcastPayload returns null for empty array', () => {
  const result = sceneEffectsToBroadcastPayload([]);
  assert.equal(result, null);
});

test('sceneEffectsToBroadcastPayload returns single op directly', () => {
  const effects = [
    {
      type: 'scene.setPosition',
      target: 'scenesync',
      objectId: 'sample-cube',
      position: [1, 0.5, 0]
    }
  ];

  const payload = sceneEffectsToBroadcastPayload(effects);
  assert.equal(payload.kind, 'scene-delta');
  assert.equal(payload.objectId, 'sample-cube');
  assert.deepEqual(payload.position, [1, 0.5, 0]);
});

test('sceneEffectsToBroadcastPayload returns scene-batch for multiple ops', () => {
  const effects = [
    {
      type: 'scene.setPosition',
      target: 'scenesync',
      objectId: 'sample-cube',
      position: [1, 0.5, 0]
    },
    {
      type: 'scene.setScale',
      target: 'scenesync',
      objectId: 'sample-cube',
      scale: [2, 2, 2]
    }
  ];

  const payload = sceneEffectsToBroadcastPayload(effects);
  assert.equal(payload.kind, 'scene-batch');
  assert.equal(payload.ops.length, 2);
  assert.equal(payload.ops[0].kind, 'scene-delta');
  assert.equal(payload.ops[0].position[0], 1);
  assert.equal(payload.ops[1].kind, 'scene-delta');
  assert.equal(payload.ops[1].scale[0], 2);
});

test('sceneEffectsToBroadcastPayload filters out non-scenesync effects', () => {
  const effects = [
    {
      type: 'scene.setPosition',
      target: 'scenesync',
      objectId: 'sample-cube',
      position: [1, 0.5, 0]
    },
    {
      type: 'log',
      target: 'console',
      message: 'test'
    },
    {
      type: 'scene.setScale',
      target: 'scenesync',
      objectId: 'sample-cube',
      scale: [2, 2, 2]
    }
  ];

  const payload = sceneEffectsToBroadcastPayload(effects);
  assert.equal(payload.kind, 'scene-batch');
  assert.equal(payload.ops.length, 2);
});

test('sceneEffectsToBroadcastPayload returns null for effects with no scenesync targets', () => {
  const effects = [
    {
      type: 'log',
      target: 'console',
      message: 'test'
    }
  ];

  const result = sceneEffectsToBroadcastPayload(effects);
  assert.equal(result, null);
});

test('sceneEffectsToBroadcastPayload handles null effects gracefully', () => {
  const result = sceneEffectsToBroadcastPayload(null);
  assert.equal(result, null);
});

test('sceneEffectsToBroadcastOps returns individual scene-delta operations', () => {
  const ops = sceneEffectsToBroadcastOps([
    {
      type: 'scene.setPosition',
      target: 'scenesync',
      objectId: 'sample-cube',
      position: [1, 0.5, 0]
    },
    {
      type: 'scene.setScale',
      target: 'scenesync',
      objectId: 'sample-cube',
      scale: [2, 2, 2]
    }
  ]);

  assert.deepEqual(ops, [
    {
      kind: 'scene-delta',
      objectId: 'sample-cube',
      position: [1, 0.5, 0]
    },
    {
      kind: 'scene-delta',
      objectId: 'sample-cube',
      scale: [2, 2, 2]
    }
  ]);
});
