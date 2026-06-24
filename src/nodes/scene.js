export function registerSceneNodes(registry) {
  registry.registerNodeType('scene.offsetPosition', {
    category: 'sink',
    effects: ['SceneWrite'],
    requires: ['scene.object.transform.write@1'],
    writes: ['object.self.position'],
    determinism: 'deterministic-with-env',
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
    effects: ['SceneWrite'],
    requires: ['scene.object.transform.write@1'],
    writes: ['object.self.position'],
    determinism: 'deterministic-with-env',
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
    effects: ['SceneWrite'],
    requires: ['scene.object.transform.write@1'],
    writes: ['object.self.rotation'],
    determinism: 'deterministic-with-env',
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
    effects: ['SceneWrite'],
    requires: ['scene.object.transform.write@1'],
    writes: ['object.self.scale'],
    determinism: 'deterministic-with-env',
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
  registry.registerNodeType('scene.setVisible', {
    category: 'sink',
    effects: ['SceneWrite'],
    requires: ['scene.object.visibility.write@1'],
    writes: ['object.self.visible'],
    determinism: 'deterministic-with-env',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'visible', type: 'boolean', default: true, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'visible', type: 'boolean', default: true }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setVisible',
        objectId: inputs.objectId,
        visible: Boolean(inputs.visible),
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
  registry.registerNodeType('scene.setColor', {
    category: 'sink',
    effects: ['SceneWrite'],
    requires: ['scene.object.material.write@1'],
    writes: ['object.self.material.color'],
    determinism: 'deterministic-with-env',
    inputs: [
      { name: 'objectId', type: 'string', default: '', kind: 'behavior' },
      { name: 'r', type: 'number', default: 1, kind: 'behavior' },
      { name: 'g', type: 'number', default: 1, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'objectId', type: 'string', default: '' },
      { name: 'r', type: 'number', default: 1 },
      { name: 'g', type: 'number', default: 1 },
      { name: 'b', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => {
      ctx.engine?._recordEffect({
        type: 'scene.setColor',
        objectId: inputs.objectId,
        color: [inputs.r, inputs.g, inputs.b].map(Number),
        target: 'scenesync',
        nodeId: ctx.currentNodeId
      });
      return {};
    }
  });
}
