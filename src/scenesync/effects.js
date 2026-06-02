const SCENE_DELTA_TYPES = new Set([
  'scene.setPosition',
  'scene.setRotation',
  'scene.setScale'
]);

// Maps an AudioSource effect type to the host playback command name.
const AUDIO_COMMAND_TYPES = {
  'audioSource.play': 'play',
  'audioSource.pause': 'pause',
  'audioSource.stop': 'stop',
  'audioSource.seek': 'seek',
  'audioSource.playOneShot': 'playOneShot',
  'audioSource.setVolume': 'setVolume',
  'audioSource.setClip': 'setClip',
  'audioSource.syncToAnimation': 'syncToAnimation',
  'audioSource.unsync': 'unsync'
};

function isSceneSyncEffect(effect) {
  if (!effect || typeof effect !== 'object') {
    return false;
  }

  const isSupported = SCENE_DELTA_TYPES.has(effect.type) || Object.hasOwn(AUDIO_COMMAND_TYPES, effect.type);
  return isSupported && effect.target === 'scenesync';
}

function validateObjectId(objectId) {
  if (typeof objectId !== 'string' || objectId.trim().length === 0) {
    throw new Error('Invalid scene effect: objectId is required');
  }
}

function validateVector(value, length, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid scene effect: ${fieldName} must be an array`);
  }
  if (value.length !== length) {
    throw new Error(`Invalid scene effect: ${fieldName} must have length ${length}`);
  }
}

function resolveSourceName(name) {
  return typeof name === 'string' && name.length > 0 ? name : 'default';
}

function audioEffectToBroadcastOp(effect, command) {
  const op = {
    kind: 'audio-command',
    objectId: effect.objectId,
    name: resolveSourceName(effect.name),
    command
  };

  if (command === 'seek') {
    if (!Number.isFinite(effect.time)) {
      throw new Error('Invalid audio effect: seek time must be a finite number');
    }
    op.time = effect.time;
  } else if (command === 'setVolume') {
    if (!Number.isFinite(effect.volume)) {
      throw new Error('Invalid audio effect: setVolume volume must be a finite number');
    }
    op.volume = effect.volume;
  } else if (command === 'setClip') {
    if (typeof effect.url !== 'string' || effect.url.trim().length === 0) {
      throw new Error('Invalid audio effect: setClip url is required');
    }
    op.url = effect.url;
  } else if (command === 'syncToAnimation') {
    if (typeof effect.animation !== 'string' || effect.animation.trim().length === 0) {
      throw new Error('Invalid audio effect: syncToAnimation animation is required');
    }
    op.animation = effect.animation;
    op.offset = Number.isFinite(effect.offset) ? effect.offset : 0;
    op.resyncOnLoop = effect.resyncOnLoop !== false;
  }

  return op;
}

function sceneEffectToBroadcastOp(effect) {
  if (!effect || typeof effect !== 'object') {
    throw new Error('Invalid scene effect: effect must be an object');
  }

  validateObjectId(effect.objectId);

  const audioCommand = AUDIO_COMMAND_TYPES[effect.type];
  if (audioCommand) {
    return audioEffectToBroadcastOp(effect, audioCommand);
  }

  const op = {
    kind: 'scene-delta',
    objectId: effect.objectId
  };

  if (effect.type === 'scene.setPosition') {
    validateVector(effect.position, 3, 'position');
    op.position = effect.position;
  } else if (effect.type === 'scene.setRotation') {
    validateVector(effect.rotation, 4, 'rotation');
    op.rotation = effect.rotation;
  } else if (effect.type === 'scene.setScale') {
    validateVector(effect.scale, 3, 'scale');
    op.scale = effect.scale;
  } else {
    throw new Error(`Invalid scene effect: unknown type ${effect.type}`);
  }

  return op;
}

function sceneEffectsToBroadcastPayload(effects) {
  if (!Array.isArray(effects)) {
    return null;
  }

  const ops = effects
    .filter(isSceneSyncEffect)
    .map(sceneEffectToBroadcastOp);

  if (ops.length === 0) {
    return null;
  }

  if (ops.length === 1) {
    return ops[0];
  }

  return {
    kind: 'scene-batch',
    ops
  };
}

function sceneEffectsToBroadcastOps(effects) {
  return effects
    .filter(isSceneSyncEffect)
    .map(sceneEffectToBroadcastOp);
}

export {
  isSceneSyncEffect,
  sceneEffectToBroadcastOp,
  sceneEffectsToBroadcastOps,
  sceneEffectsToBroadcastPayload
};
