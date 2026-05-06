function validateSceneGraph(graph) {
  if (!graph || typeof graph !== 'object') {
    throw new Error('graph must be an object');
  }

  if (!Array.isArray(graph.nodes)) {
    throw new Error('graph.nodes must be an array');
  }

  if (!Array.isArray(graph.edges)) {
    throw new Error('graph.edges must be an array');
  }

  for (const node of graph.nodes) {
    if (typeof node !== 'object' || node === null) {
      throw new Error('each node must be an object');
    }
    if (typeof node.id !== 'string' || node.id.length === 0) {
      throw new Error('each node must have a non-empty id string');
    }
    if (typeof node.type !== 'string' || node.type.length === 0) {
      throw new Error('each node must have a non-empty type string');
    }
  }

  for (const edge of graph.edges) {
    if (typeof edge !== 'object' || edge === null) {
      throw new Error('each edge must be an object');
    }
    if (typeof edge.from !== 'string' || edge.from.length === 0) {
      throw new Error('each edge must have a non-empty from string');
    }
    if (typeof edge.to !== 'string' || edge.to.length === 0) {
      throw new Error('each edge must have a non-empty to string');
    }
  }
}

export function createSceneGraphSetPayload(objectId, graph) {
  if (typeof objectId !== 'string' || objectId.length === 0) {
    throw new Error('objectId must be a non-empty string');
  }

  validateSceneGraph(graph);

  return {
    type: 'scene-graph-set',
    scope: { object: objectId },
    graph
  };
}

export function createSceneGraphClearPayload(objectId) {
  if (typeof objectId !== 'string' || objectId.length === 0) {
    throw new Error('objectId must be a non-empty string');
  }

  return {
    type: 'scene-graph-clear',
    scope: { object: objectId }
  };
}

export { validateSceneGraph };
