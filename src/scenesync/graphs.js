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

function validateScope(scope) {
  if (!scope || typeof scope !== 'object') {
    throw new Error('scope must be an object');
  }
  if (scope.object && (typeof scope.object !== 'string' || scope.object.length === 0)) {
    throw new Error('scope.object must be a non-empty string');
  }
  if (scope.scene !== undefined && typeof scope.scene !== 'boolean') {
    throw new Error('scope.scene must be a boolean');
  }
  if (!scope.object && !scope.scene) {
    throw new Error('scope must have either object or scene');
  }
}

export function createSceneGraphSetPayload(scopeOrObjectId, graphOrUndefined) {
  let scope;
  let graph;

  if (typeof scopeOrObjectId === 'string') {
    if (scopeOrObjectId.length === 0) {
      throw new Error('objectId must be a non-empty string');
    }
    scope = { object: scopeOrObjectId };
    graph = graphOrUndefined;
  } else if (typeof scopeOrObjectId === 'object' && scopeOrObjectId !== null) {
    scope = scopeOrObjectId;
    graph = graphOrUndefined;
  } else {
    throw new Error('objectId must be a non-empty string');
  }

  validateScope(scope);
  validateSceneGraph(graph);

  return {
    type: 'scene-graph-set',
    scope,
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
