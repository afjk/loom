// Loom 用の Three.js アダプタ
// コアエンジンと独立した形で Three.js Object3D を操作するためのシンクノード群を提供する
// Three.js への直接import は行わない（ユーザーから渡されたオブジェクトを操作するのみ）

const threeObjectsRegistry = new Map();
const registeredLoomClasses = new WeakSet();

export function registerThreeNodes(LoomClass, objects = {}) {
  // 2回目以降の呼び出しで渡された objects をレジストリに追加
  for (const [name, object] of Object.entries(objects)) {
    threeObjectsRegistry.set(name, object);
  }

  // 既に登録済みであれば、ここで終了（冪等性を保証）
  if (registeredLoomClasses.has(LoomClass)) {
    return;
  }

  const getObject = (target) => threeObjectsRegistry.get(target);

  LoomClass.registerNodeType('setPosition', {
    category: 'sink',
    inputs: [
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [{ name: 'target', type: 'string', default: '' }],
    evaluate: (inputs, params) => {
      const obj = getObject(params.target);
      if (obj && obj.position) {
        obj.position.set(inputs.x, inputs.y, inputs.z);
      }
      return {};
    }
  });

  LoomClass.registerNodeType('setRotation', {
    category: 'sink',
    inputs: [
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'z', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [{ name: 'target', type: 'string', default: '' }],
    evaluate: (inputs, params) => {
      const obj = getObject(params.target);
      if (obj && obj.rotation) {
        obj.rotation.set(inputs.x, inputs.y, inputs.z);
      }
      return {};
    }
  });

  LoomClass.registerNodeType('setScale', {
    category: 'sink',
    inputs: [
      { name: 'x', type: 'number', default: 1, kind: 'behavior' },
      { name: 'y', type: 'number', default: 1, kind: 'behavior' },
      { name: 'z', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [{ name: 'target', type: 'string', default: '' }],
    evaluate: (inputs, params) => {
      const obj = getObject(params.target);
      if (obj && obj.scale) {
        obj.scale.set(inputs.x, inputs.y, inputs.z);
      }
      return {};
    }
  });

  LoomClass.registerNodeType('setColor', {
    category: 'sink',
    inputs: [
      { name: 'r', type: 'number', default: 1, kind: 'behavior' },
      { name: 'g', type: 'number', default: 1, kind: 'behavior' },
      { name: 'b', type: 'number', default: 1, kind: 'behavior' }
    ],
    outputs: [],
    params: [{ name: 'target', type: 'string', default: '' }],
    evaluate: (inputs, params) => {
      const obj = getObject(params.target);
      if (obj && obj.material) {
        const material = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        if (material && material.color && material.color.setRGB) {
          material.color.setRGB(inputs.r, inputs.g, inputs.b);
        }
      }
      return {};
    }
  });

  LoomClass.registerNodeType('setVisible', {
    category: 'sink',
    inputs: [
      { name: 'visible', type: 'any', default: true, kind: 'behavior' }
    ],
    outputs: [],
    params: [{ name: 'target', type: 'string', default: '' }],
    evaluate: (inputs, params) => {
      const obj = getObject(params.target);
      if (obj && typeof obj.visible === 'boolean') {
        obj.visible = !!inputs.visible;
      }
      return {};
    }
  });

  // このLoomClassで登録済みとしてマーク
  registeredLoomClasses.add(LoomClass);
}

