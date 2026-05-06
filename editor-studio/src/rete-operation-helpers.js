/**
 * Pure helpers that convert Rete.js v2 event payloads into EditorModel operations.
 * Kept separate from node-editor-view.js so they can be imported and tested without
 * loading Rete.js packages (which use bare specifiers and require a bundler).
 */

export function connectionToAddEdgeOp(connection) {
  return {
    type: 'addEdge',
    edge: {
      id: '',
      fromNodeId: connection.source,
      fromPort: connection.sourceOutput,
      toNodeId: connection.target,
      toPort: connection.targetInput,
    }
  };
}

export function translateToMoveNodeOp(data) {
  return {
    type: 'moveNode',
    id: data.id,
    position: { x: data.position.x, y: data.position.y }
  };
}

export function controlValueToUpdateParamOp(nodeId, key, rawValue, controlType) {
  const parsed = controlType === 'number' ? Number(rawValue) : rawValue;
  return {
    type: 'updateParam',
    id: nodeId,
    key,
    value: controlType === 'number' && Number.isFinite(parsed) ? parsed : rawValue
  };
}
