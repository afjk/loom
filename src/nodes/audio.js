function resolveName(value) {
  return typeof value === 'string' && value.length > 0 ? value : 'default';
}

export function registerAudioNodes(registry) {
  const objectIdInput = { name: 'objectId', type: 'string', default: '', kind: 'behavior' };
  const nameInput = { name: 'name', type: 'string', default: 'default', kind: 'behavior' };

  // Extra inputs per AudioSource operation, beyond the common (objectId, name) pair.
  const operations = {
    'audioSource.play': [],
    'audioSource.pause': [],
    'audioSource.stop': [],
    'audioSource.playOneShot': [],
    'audioSource.unsync': [],
    'audioSource.seek': [
      { name: 'time', type: 'number', default: 0, kind: 'behavior' }
    ],
    'audioSource.setVolume': [
      { name: 'volume', type: 'number', default: 1, kind: 'behavior' }
    ],
    'audioSource.setClip': [
      { name: 'url', type: 'string', default: '', kind: 'behavior' }
    ],
    'audioSource.syncToAnimation': [
      { name: 'animation', type: 'string', default: '', kind: 'behavior' },
      { name: 'offset', type: 'number', default: 0, kind: 'behavior' },
      { name: 'resyncOnLoop', type: 'boolean', default: true, kind: 'behavior' }
    ]
  };

  for (const [type, extraInputs] of Object.entries(operations)) {
    const slots = [objectIdInput, nameInput, ...extraInputs];
    registry.registerNodeType(type, {
      category: 'sink',
      effects: ['AudioControl'],
      requires: ['scene.object.audio.control@1'],
      writes: ['object.self.audioSource'],
      determinism: 'deterministic-with-env',
      inputs: slots,
      outputs: [],
      params: slots.map((slot) => ({ name: slot.name, type: slot.type, default: slot.default })),
      evaluate: (inputs, params, ctx) => {
        const effect = {
          type,
          objectId: inputs.objectId,
          name: resolveName(inputs.name),
          target: 'scenesync',
          nodeId: ctx.currentNodeId
        };
        for (const input of extraInputs) {
          effect[input.name] = inputs[input.name];
        }
        ctx.engine?._recordEffect(effect);
        return {};
      }
    });
  }
}
