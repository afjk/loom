import { compileLoomSource } from '../toolchain/compile.js';

const SUPPORTED_NODES = new Set([
  'time.serverClock',
  'math.sine',
  'math.cosine',
  'math.add',
  'math.multiply',
  'scene.setPosition',
  'scene.offsetPosition',
  'scene.setRotation',
  'scene.setScale',
  'scene.setColor',
  'scene.setVisible'
]);

const NODE_TYPE_MAPPING = {
  'time.serverClock': 'serverClock',
  'math.sine': 'sine',
  'math.cosine': 'cosine',
  'math.add': 'add',
  'math.multiply': 'multiply',
  'scene.setPosition': 'sceneSetPosition',
  'scene.offsetPosition': 'sceneOffsetPosition',
  'scene.setRotation': 'sceneSetRotation',
  'scene.setScale': 'sceneSetScale',
  'scene.setColor': 'sceneSetColor',
  'scene.setVisible': 'sceneSetVisible'
};

const OUTPUT_PORT_MAPPING = {
  'time.serverClock': 't',
  'serverClock': 't',
  'math.sine': 'out',
  'sine': 'out',
  'math.cosine': 'out',
  'cosine': 'out',
  'math.add': 'out',
  'add': 'out',
  'math.multiply': 'out',
  'multiply': 'out',
  'scene.setPosition': undefined,
  'sceneSetPosition': undefined,
  'scene.offsetPosition': undefined,
  'sceneOffsetPosition': undefined,
  'scene.setRotation': undefined,
  'sceneSetRotation': undefined,
  'scene.setScale': undefined,
  'sceneSetScale': undefined,
  'scene.setColor': undefined,
  'sceneSetColor': undefined,
  'scene.setVisible': undefined,
  'sceneSetVisible': undefined
};

function generateStableNodeBase(nodeType) {
  const mapped = NODE_TYPE_MAPPING[nodeType] || nodeType;
  if (mapped === 'serverClock') return 'clock';
  if (mapped === 'sine') return 'sine';
  if (mapped === 'cosine') return 'cosine';
  if (mapped === 'add') return 'add';
  if (mapped === 'multiply') return 'multiply';
  if (mapped === 'sceneSetPosition') return 'pos';
  if (mapped === 'sceneOffsetPosition') return 'offset';
  if (mapped === 'sceneSetRotation') return 'rot';
  if (mapped === 'sceneSetScale') return 'scale';
  if (mapped === 'sceneSetColor') return 'color';
  if (mapped === 'sceneSetVisible') return 'visible';
  return mapped;
}

function makeUniqueId(base, usedIds) {
  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }
  let index = 2;
  while (usedIds.has(`${base}_${index}`)) index += 1;
  const id = `${base}_${index}`;
  usedIds.add(id);
  return id;
}

function normalizeScope(options = {}) {
  let scope = null;
  if (options.scope) {
    scope = options.scope;
  } else if (options.objectId) {
    scope = { object: options.objectId };
  } else {
    return null;
  }

  if (typeof scope === 'string' && scope === 'scene') {
    return 'scene';
  }
  if (typeof scope === 'object' && scope !== null && scope.scene === true) {
    return 'scene';
  }
  if (typeof scope === 'object' && scope !== null && scope.object) {
    return { object: scope.object };
  }
  if (typeof scope === 'string' && scope.length > 0) {
    return { object: scope };
  }

  return scope;
}

function pickParams(nodeType, params = {}) {
  if (nodeType === 'scene.setPosition' || nodeType === 'scene.offsetPosition' || nodeType === 'scene.setScale') {
    return { ...(params.x !== undefined ? { x: params.x } : {}), ...(params.y !== undefined ? { y: params.y } : {}), ...(params.z !== undefined ? { z: params.z } : {}) };
  }
  if (nodeType === 'scene.setRotation') {
    return {
      ...(params.x !== undefined ? { x: params.x } : {}),
      ...(params.y !== undefined ? { y: params.y } : {}),
      ...(params.z !== undefined ? { z: params.z } : {}),
      ...(params.w !== undefined ? { w: params.w } : {})
    };
  }
  if (nodeType === 'scene.setColor') {
    return { ...(params.r !== undefined ? { r: params.r } : {}), ...(params.g !== undefined ? { g: params.g } : {}), ...(params.b !== undefined ? { b: params.b } : {}) };
  }
  if (nodeType === 'scene.setVisible') {
    return { ...(params.visible !== undefined ? { visible: params.visible } : {}) };
  }
  if (nodeType === 'math.sine' || nodeType === 'math.cosine') {
    return {
      ...(params.freq !== undefined ? { freq: params.freq } : {}),
      ...(params.amplitude !== undefined ? { amplitude: params.amplitude } : {}),
      ...(params.offset !== undefined ? { offset: params.offset } : {})
    };
  }
  return {};
}

export function compileLoomToSceneSyncGraph(source, options = {}) {
  const result = compileLoomSource(source, { target: 'scenesync' });
  if (!result.ok) throw new Error(`Compilation failed: ${result.errors.map((e) => e.message).join(', ')}`);
  return loomGraphToSceneSyncGraph(result.graph, options);
}

export function loomGraphToSceneSyncGraph(loomGraph, options = {}) {
  if (!loomGraph || !loomGraph.nodes || !loomGraph.edges) throw new Error('loomGraph must have nodes and edges arrays');
  const nodes = [];
  const edges = [];
  const nodeIdMap = new Map();
  const usedIds = new Set();

  for (const node of loomGraph.nodes) {
    if (!SUPPORTED_NODES.has(node.type)) throw new Error(`Unsupported Scene Sync graph node: ${node.type}`);
    const sceneSyncType = NODE_TYPE_MAPPING[node.type];
    const baseId = (node.id && !node.id.startsWith('_')) ? node.id : generateStableNodeBase(node.type);
    const newId = makeUniqueId(baseId, usedIds);
    nodeIdMap.set(node.id, newId);
    const params = pickParams(node.type, node.params);
    nodes.push({ id: newId, type: sceneSyncType, ...(Object.keys(params).length > 0 ? { params } : {}) });
  }

  for (const edge of loomGraph.edges) {
    const [fromNodeId, fromPort] = edge.from.split('.');
    const [toNodeId, toPort] = edge.to.split('.');
    const newFromId = nodeIdMap.get(fromNodeId);
    const newToId = nodeIdMap.get(toNodeId);
    if (newFromId && newToId) edges.push({ from: `${newFromId}.${fromPort}`, to: `${newToId}.${toPort}` });
  }

  let scope = normalizeScope(options);
  if (!scope) {
    for (const node of loomGraph.nodes) {
      if ((node.type.startsWith('scene.set') || node.type === 'scene.offsetPosition') && node.params?.objectId) {
        scope = { object: node.params.objectId };
        break;
      }
    }
  }

  return { graph: { nodes, edges }, scope };
}
