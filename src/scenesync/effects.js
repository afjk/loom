function isSceneSyncEffect(effect) {
  if (!effect || typeof effect !== 'object') {
    return false;
  }

  const validTypes = new Set([
    'scene.setPosition',
    'scene.setRotation',
    'scene.setScale'
  ]);

  return validTypes.has(effect.type) && effect.target === 'scenesync';
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

function sceneEffectToBroadcastOp(effect) {
  if (!effect || typeof effect !== 'object') {
    throw new Error('Invalid scene effect: effect must be an object');
  }

  validateObjectId(effect.objectId);

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

export {
  isSceneSyncEffect,
  sceneEffectToBroadcastOp,
  sceneEffectsToBroadcastPayload
};
