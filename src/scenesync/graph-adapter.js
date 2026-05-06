import { compileLoomSource } from '../toolchain/compile.js';

const SUPPORTED_NODES = new Set([
  'time.serverClock',
  'math.sine',
  'scene.setPosition'
]);

const NODE_TYPE_MAPPING = {
  'time.serverClock': 'serverClock',
  'math.sine': 'sine',
  'scene.setPosition': 'sceneSetPosition'
};

const OUTPUT_PORT_MAPPING = {
  'time.serverClock': 't',
  'serverClock': 't',
  'math.sine': 'out',
  'sine': 'out',
  'scene.setPosition': undefined,
  'sceneSetPosition': undefined
};

function getDefaultOutputPort(nodeType) {
  const mapped = NODE_TYPE_MAPPING[nodeType] || nodeType;
  return OUTPUT_PORT_MAPPING[mapped];
}

function generateStableNodeId(originalId, nodeType) {
  const mapped = NODE_TYPE_MAPPING[nodeType] || nodeType;
  if (mapped === 'serverClock') return 'clock';
  if (originalId && !originalId.startsWith('_')) return originalId;
  if (mapped === 'sine') {
    const match = originalId?.match(/sine[_x_y]?(.*)$/);
    if (match && match[1]) return `sine_${match[1]}`;
    return 'sine';
  }
  if (mapped === 'sceneSetPosition') return 'pos';
  return originalId;
}

function normalizeScope(options = {}) {
  if (options.scope) {
    return options.scope;
  }
  if (options.objectId) {
    return { object: options.objectId };
  }
  return null;
}

export function compileLoomToSceneSyncGraph(source, options = {}) {
  const result = compileLoomSource(source, { target: 'scenesync' });

  if (!result.ok) {
    throw new Error(`Compilation failed: ${result.errors.map(e => e.message).join(', ')}`);
  }

  return loomGraphToSceneSyncGraph(result.graph, options);
}

export function loomGraphToSceneSyncGraph(loomGraph, options = {}) {
  if (!loomGraph || !loomGraph.nodes || !loomGraph.edges) {
    throw new Error('loomGraph must have nodes and edges arrays');
  }

  const nodes = [];
  const edges = [];
  const nodeIdMap = new Map();

  for (const node of loomGraph.nodes) {
    if (!SUPPORTED_NODES.has(node.type)) {
      throw new Error(`Unsupported Scene Sync graph node: ${node.type}`);
    }

    const sceneSyncType = NODE_TYPE_MAPPING[node.type];
    const newId = generateStableNodeId(node.id, node.type);
    nodeIdMap.set(node.id, newId);

    const sceneSyncNode = {
      id: newId,
      type: sceneSyncType
    };

    if (node.type === 'scene.setPosition') {
      sceneSyncNode.params = {};
      if (node.params?.z !== undefined) {
        sceneSyncNode.params.z = node.params.z;
      }
      if (node.params?.x !== undefined) {
        sceneSyncNode.params.x = node.params.x;
      }
      if (node.params?.y !== undefined) {
        sceneSyncNode.params.y = node.params.y;
      }
    } else if (node.type === 'math.sine') {
      sceneSyncNode.params = {};
      if (node.params?.freq !== undefined) {
        sceneSyncNode.params.freq = node.params.freq;
      }
      if (node.params?.amplitude !== undefined) {
        sceneSyncNode.params.amplitude = node.params.amplitude;
      }
      if (node.params?.offset !== undefined) {
        sceneSyncNode.params.offset = node.params.offset;
      }
    }

    nodes.push(sceneSyncNode);
  }

  for (const edge of loomGraph.edges) {
    const [fromNodeId, fromPort] = edge.from.split('.');
    const [toNodeId, toPort] = edge.to.split('.');

    const newFromId = nodeIdMap.get(fromNodeId);
    const newToId = nodeIdMap.get(toNodeId);

    if (newFromId && newToId) {
      edges.push({
        from: `${newFromId}.${fromPort}`,
        to: `${newToId}.${toPort}`
      });
    }
  }

  let scope = normalizeScope(options);

  if (!scope) {
    for (const node of loomGraph.nodes) {
      if (node.type === 'scene.setPosition' && node.params?.objectId) {
        scope = { object: node.params.objectId };
        break;
      }
    }
  }

  return {
    graph: {
      nodes,
      edges
    },
    scope
  };
}
