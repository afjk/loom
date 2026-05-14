export function registerSceneNodes(registry) {
  registry.registerNodeType('scene.offsetPosition', {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 0 },
      { name: 'y', type: 'number', default: 0 },
      { name: 'z', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.offsetPosition',
        objectId: inputs.objectId,
        offset: [inputs.x, inputs.y, inputs.z],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
  registry.registerNodeType('scene.setPosition', {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 0 },
      { name: 'y', type: 'number', default: 0 },
      { name: 'z', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setPosition',
        objectId: inputs.objectId,
        position: [inputs.x, inputs.y, inputs.z],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
  registry.registerNodeType('scene.setRotation', {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' },
      { name: 'w', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 0 },
      { name: 'y', type: 'number', default: 0 },
      { name: 'z', type: 'number', default: 0 },
      { name: 'w', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setRotation',
        objectId: inputs.objectId,
        rotation: [inputs.x, inputs.y, inputs.z, inputs.w],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
  registry.registerNodeType('scene.setScale', {
    category: 'sink',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'x', type: 'number', default: 1, kind: 'behavior' },
      { name: 'y', type: 'number', default: 1, kind: 'behavior' },
      { name: 'z', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'x', type: 'number', default: 1 },
      { name: 'y', type: 'number', default: 1 },
      { name: 'z', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setScale',
        objectId: inputs.objectId,
        scale: [inputs.x, inputs.y, inputs.z],
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
}