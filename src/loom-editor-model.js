import { NODE_TYPES } from './loom.js';

/**
 * @typedef {Object} EditorNode
 * @property {string} id
 * @property {string} type        - NODE_TYPES のキー
 * @property {string} category    - "input" | "transform" | "sink" | "state"
 * @property {Object} params
 * @property {{ x: number, y: number }} position
 */

/**
 * @typedef {Object} EditorEdge
 * @property {string} id           - `${fromNodeId}.${fromPort}->${toNodeId}.${toPort}`
 * @property {string} fromNodeId
 * @property {string} fromPort
 * @property {string} toNodeId
 * @property {string} toPort
 */

/**
 * @typedef {Object} EditorModel
 * @property {Record<string, EditorNode>} nodesById
 * @property {Record<string, EditorEdge>} edgesById
 * @property {string[]} order      - ノード描画順、決定的レイアウトのため
 */

/**
 * @typedef {
 *   | { type: 'addNode',     node: EditorNode }
 *   | { type: 'removeNode',  id: string }
 *   | { type: 'updateParam', id: string, key: string, value: any }
 *   | { type: 'moveNode',    id: string, position: { x: number, y: number } }
 *   | { type: 'addEdge',     edge: EditorEdge }
 *   | { type: 'removeEdge',  edgeId: string }
 *   | { type: 'renameNode',  id: string, newId: string }
 * } EditorOperation
 */

function edgeId(fromNodeId, fromPort, toNodeId, toPort) {
  return `${fromNodeId}.${fromPort}->${toNodeId}.${toPort}`;
}

function validateNodeId(id) {
  if (typeof id !== 'string') {
    throw new Error('Node id must be a string');
  }

  const trimmed = id.trim();

  if (!trimmed) {
    throw new Error('Node id cannot be empty');
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
    throw new Error(
      `Invalid node id '${id}'. Use letters, numbers, and underscores, and do not start with a number.`
    );
  }

  return trimmed;
}

export function layoutFallback(nodes) {
  const categoryX = {
    input: 0,
    transform: 300,
    state: 600,
    sink: 900
  };
  const counts = {};

  return nodes.map((node) => {
    if (node.position && Number.isFinite(node.position.x) && Number.isFinite(node.position.y)) {
      return { ...node, position: { ...node.position } };
    }

    const category = node.category;
    const x = Object.prototype.hasOwnProperty.call(categoryX, category) ? categoryX[category] : 1200;
    const idx = counts[category] || 0;
    counts[category] = idx + 1;

    return {
      ...node,
      position: { x, y: idx * 120 }
    };
  });
}

export function graphToEditorModel(graph) {
  const rawNodes = (graph.nodes || []).map((node) => {
    const def = NODE_TYPES[node.type];
    let category = def?.category || 'transform';
    if (category === 'source') {
      category = 'input';
    }
    if (!def) {
      console.warn(`Unknown node type '${node.type}', fallback category 'transform'`);
    }

    const metaPosition = node.meta?.position;
    const position = metaPosition && Number.isFinite(metaPosition.x) && Number.isFinite(metaPosition.y)
      ? { x: metaPosition.x, y: metaPosition.y }
      : null;

    return {
      id: node.id,
      type: node.type,
      category,
      params: { ...(node.params || {}) },
      position
    };
  });

  const positioned = layoutFallback(rawNodes);
  const nodesById = {};
  for (const node of positioned) {
    nodesById[node.id] = node;
  }

  const edgesById = {};
  for (const edge of graph.edges || []) {
    const [fromNodeId, fromPort] = edge.from.split('.');
    const [toNodeId, toPort] = edge.to.split('.');
    const id = edgeId(fromNodeId, fromPort, toNodeId, toPort);
    edgesById[id] = { id, fromNodeId, fromPort, toNodeId, toPort };
  }

  return {
    nodesById,
    edgesById,
    order: (graph.nodes || []).map((n) => n.id)
  };
}

export function editorModelToGraph(em, originalGraph = null) {
  const nodes = em.order.map((id) => {
    const node = em.nodesById[id];
    return {
      id: node.id,
      type: node.type,
      params: { ...(node.params || {}) },
      meta: {
        position: { ...node.position }
      }
    };
  });

  const edgeIds = Object.keys(em.edgesById).sort();
  const edges = edgeIds.map((id) => {
    const edge = em.edgesById[id];
    return {
      from: `${edge.fromNodeId}.${edge.fromPort}`,
      to: `${edge.toNodeId}.${edge.toPort}`
    };
  });

  const graph = { nodes, edges };
  if (originalGraph && originalGraph.render) {
    graph.render = originalGraph.render;
  }
  return graph;
}

export function applyEditorOperation(em, op) {
  const next = {
    nodesById: { ...em.nodesById },
    edgesById: { ...em.edgesById },
    order: [...em.order]
  };

  if (op.type === 'addNode') {
    if (next.nodesById[op.node.id]) throw new Error(`Node '${op.node.id}' already exists`);
    next.nodesById[op.node.id] = {
      ...op.node,
      params: { ...(op.node.params || {}) },
      position: { ...op.node.position }
    };
    next.order.push(op.node.id);
    return next;
  }

  if (op.type === 'removeNode') {
    if (!next.nodesById[op.id]) return next;
    delete next.nodesById[op.id];
    next.order = next.order.filter((id) => id !== op.id);
    for (const id of Object.keys(next.edgesById)) {
      const edge = next.edgesById[id];
      if (edge.fromNodeId === op.id || edge.toNodeId === op.id) {
        delete next.edgesById[id];
      }
    }
    return next;
  }

  if (op.type === 'updateParam') {
    const node = next.nodesById[op.id];
    if (!node) throw new Error(`Node '${op.id}' does not exist`);
    next.nodesById[op.id] = { ...node, params: { ...(node.params || {}), [op.key]: op.value } };
    return next;
  }

  if (op.type === 'moveNode') {
    const node = next.nodesById[op.id];
    if (!node) throw new Error(`Node '${op.id}' does not exist`);
    next.nodesById[op.id] = { ...node, position: { ...op.position } };
    return next;
  }

  if (op.type === 'addEdge') {
    const edge = op.edge;
    const normalizedId = edgeId(edge.fromNodeId, edge.fromPort, edge.toNodeId, edge.toPort);
    const normalizedEdge = { ...edge, id: normalizedId };
    if (next.edgesById[normalizedId]) throw new Error(`Edge '${normalizedId}' already exists`);
    if (!next.nodesById[edge.fromNodeId] || !next.nodesById[edge.toNodeId]) {
      throw new Error('Edge endpoint does not exist');
    }
    next.edgesById[normalizedId] = normalizedEdge;
    return next;
  }

  if (op.type === 'removeEdge') {
    if (!next.edgesById[op.edgeId]) return next;
    delete next.edgesById[op.edgeId];
    return next;
  }

  if (op.type === 'renameNode') {
    if (!next.nodesById[op.id]) throw new Error(`Node '${op.id}' does not exist`);
    const newId = validateNodeId(op.newId);
    if (newId === op.id) return next;
    if (next.nodesById[newId]) throw new Error(`Node '${newId}' already exists`);

    const node = next.nodesById[op.id];
    delete next.nodesById[op.id];
    next.nodesById[newId] = { ...node, id: newId };

    next.order = next.order.map((id) => (id === op.id ? newId : id));

    const renamedEdgesById = {};
    for (const edge of Object.values(next.edgesById)) {
      const renamedEdge = {
        ...edge,
        fromNodeId: edge.fromNodeId === op.id ? newId : edge.fromNodeId,
        toNodeId: edge.toNodeId === op.id ? newId : edge.toNodeId
      };

      const renamedEdgeId = edgeId(
        renamedEdge.fromNodeId,
        renamedEdge.fromPort,
        renamedEdge.toNodeId,
        renamedEdge.toPort
      );

      renamedEdgesById[renamedEdgeId] = {
        ...renamedEdge,
        id: renamedEdgeId
      };
    }
    next.edgesById = renamedEdgesById;

    return next;
  }

  throw new Error(`Unknown operation type: ${op.type}`);
}
