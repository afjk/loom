import { NODE_TYPES } from './loom.js';

export const DEFAULT_NODE_WIDTH = 220;
export const DEFAULT_NODE_HEIGHT = 120;
export const NODE_LAYOUT_GAP = 32;
export const NODE_LAYOUT_STEP_X = 260;
export const NODE_LAYOUT_STEP_Y = 160;
export const NODE_LAYOUT_MAX_ROWS = 50;
export const NODE_LAYOUT_MAX_COLS = 50;

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
 *   | { type: 'removeNodes', ids: string[] }
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

export function doRectsOverlap(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function makeNodeLayoutRect(position) {
  return {
    x: position.x,
    y: position.y,
    width: DEFAULT_NODE_WIDTH + NODE_LAYOUT_GAP,
    height: DEFAULT_NODE_HEIGHT + NODE_LAYOUT_GAP
  };
}

export function findNonOverlappingPosition(desiredPosition, occupiedPositions) {
  const occupiedRects = occupiedPositions
    .filter(Boolean)
    .map(makeNodeLayoutRect);

  for (let row = 0; row < NODE_LAYOUT_MAX_ROWS; row++) {
    for (let col = 0; col < NODE_LAYOUT_MAX_COLS; col++) {
      const candidate = {
        x: desiredPosition.x + col * NODE_LAYOUT_STEP_X,
        y: desiredPosition.y + row * NODE_LAYOUT_STEP_Y
      };

      const candidateRect = makeNodeLayoutRect(candidate);
      const overlaps = occupiedRects.some((rect) =>
        doRectsOverlap(candidateRect, rect)
      );

      if (!overlaps) {
        return candidate;
      }
    }
  }

  return desiredPosition;
}

export function layoutFallback(nodes) {
  const categoryX = {
    input: 0,
    transform: 300,
    state: 600,
    sink: 900
  };
  const counts = {};
  const occupiedPositions = [];

  return nodes.map((node) => {
    if (node.position && Number.isFinite(node.position.x) && Number.isFinite(node.position.y)) {
      occupiedPositions.push(node.position);
      return { ...node, position: { ...node.position } };
    }

    const category = node.category;
    const x = Object.prototype.hasOwnProperty.call(categoryX, category) ? categoryX[category] : 1200;
    const idx = counts[category] || 0;
    counts[category] = idx + 1;

    const desiredPosition = { x, y: idx * NODE_LAYOUT_STEP_Y };
    const finalPosition = findNonOverlappingPosition(desiredPosition, occupiedPositions);
    occupiedPositions.push(finalPosition);

    return {
      ...node,
      position: finalPosition
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

    const result = {
      id: node.id,
      type: node.type,
      category,
      params: { ...(node.params || {}) },
      position
    };
    if (node.inputs && node.inputs.length > 0) {
      result.inputPorts = node.inputs.map(i => i.name);
    }
    return result;
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

// Build a read-only editor model for a single function body, given a
// subgraph-lowered graph and a function name. Used by the Node Editor's
// function drill-in subview. `subgraph.param` nodes become labeled input nodes
// and `subgraph.call` nodes get a "ƒ name" label. Returns null when the named
// subgraph is absent.
export function subgraphBodyToEditorModel(graph, name) {
  const def = graph && graph.subgraphs && graph.subgraphs[name];
  if (!def) {
    return null;
  }
  const model = graphToEditorModel({ nodes: def.nodes || [], edges: def.edges || [] });

  // Unregistered node types (subgraph.param / subgraph.call) have no NODE_TYPES
  // definition, so derive their ports from the body's edges so the subview can
  // draw connections. Each subgraph.param also exposes an `out` output.
  const inPorts = new Map();
  const outPorts = new Map();
  for (const edge of def.edges || []) {
    const [fromNode, fromPort] = edge.from.split('.');
    const [toNode, toPort] = edge.to.split('.');
    if (fromPort) (outPorts.get(fromNode) || outPorts.set(fromNode, new Set()).get(fromNode)).add(fromPort);
    if (toPort) (inPorts.get(toNode) || inPorts.set(toNode, new Set()).get(toNode)).add(toPort);
  }

  for (const node of Object.values(model.nodesById)) {
    if (NODE_TYPES[node.type]) {
      continue;
    }
    const outs = new Set(outPorts.get(node.id) || []);
    if (node.type === 'subgraph.param') {
      node.category = 'input';
      node.label = node.params?.name || 'param';
      outs.add('out');
    } else if (node.type === 'subgraph.call') {
      node.label = `ƒ ${node.params?.subgraph || 'fn'}`;
      outs.add('out');
    }
    node.inputPorts = [...(inPorts.get(node.id) || [])];
    node.outputPorts = [...outs];
  }
  return model;
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
  if (originalGraph?.imports) {
    graph.imports = [...originalGraph.imports];
  }
  if (originalGraph && originalGraph.render) {
    graph.render = originalGraph.render;
  }
  return graph;
}

export function preserveEditorModelLayout(nextEditorModel, previousEditorModel) {
  if (!previousEditorModel) return nextEditorModel;

  const nodesById = {};
  for (const [id, node] of Object.entries(nextEditorModel.nodesById || {})) {
    const previousNode = previousEditorModel.nodesById?.[id];
    const nextNode = { ...node };

    if (
      previousNode?.position &&
      Number.isFinite(previousNode.position.x) &&
      Number.isFinite(previousNode.position.y)
    ) {
      nextNode.position = { ...previousNode.position };
    }

    if (typeof previousNode?.label === 'string' && previousNode.label !== '') {
      nextNode.label = previousNode.label;
    }

    if (typeof previousNode?.comment === 'string' && previousNode.comment !== '') {
      nextNode.comment = previousNode.comment;
    }

    nodesById[id] = nextNode;
  }

  return {
    ...nextEditorModel,
    nodesById
  };
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

  if (op.type === 'removeNodes') {
    const ids = new Set((op.ids || []).filter((id) => next.nodesById[id]));
    if (ids.size === 0) return next;
    for (const id of ids) {
      delete next.nodesById[id];
    }
    next.order = next.order.filter((id) => !ids.has(id));
    for (const id of Object.keys(next.edgesById)) {
      const edge = next.edgesById[id];
      if (ids.has(edge.fromNodeId) || ids.has(edge.toNodeId)) {
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

  if (op.type === 'updateNodeMetadata') {
    const node = next.nodesById[op.id];
    if (!node) throw new Error(`Node '${op.id}' does not exist`);

    const updated = { ...node };
    if (op.patch) {
      if ('label' in op.patch) {
        if (op.patch.label) {
          updated.label = op.patch.label;
        } else {
          delete updated.label;
        }
      }
      if ('comment' in op.patch) {
        if (op.patch.comment) {
          updated.comment = op.patch.comment;
        } else {
          delete updated.comment;
        }
      }
    }

    next.nodesById[op.id] = updated;
    return next;
  }

  throw new Error(`Unknown operation type: ${op.type}`);
}
