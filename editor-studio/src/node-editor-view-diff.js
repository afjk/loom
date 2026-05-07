export function cloneEditorModelSnapshot(editorModel) {
  return JSON.parse(JSON.stringify(editorModel));
}

export function getAddedNodeIds(previous, next) {
  return next.order.filter((id) => !previous.nodesById[id]);
}

export function getRemovedNodeIds(previous, next) {
  return previous.order.filter((id) => !next.nodesById[id]);
}

export function getCommonNodeIds(previous, next) {
  return next.order.filter((id) => previous.nodesById[id] && next.nodesById[id]);
}

export function getAddedEdgeIds(previous, next) {
  return Object.keys(next.edgesById || {}).filter((id) => !previous.edgesById?.[id]);
}

export function getRemovedEdgeIds(previous, next) {
  return Object.keys(previous.edgesById || {}).filter((id) => !next.edgesById?.[id]);
}

export function shouldRecreateNode(previousNode, nextNode) {
  if (previousNode.type !== nextNode.type) return true;
  if (previousNode.category !== nextNode.category) return true;

  const prevParamKeys = Object.keys(previousNode.params || {}).sort();
  const nextParamKeys = Object.keys(nextNode.params || {}).sort();

  if (prevParamKeys.join('\0') !== nextParamKeys.join('\0')) return true;

  return false;
}

export function sameParams(a, b) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {});
}

export function samePosition(a, b) {
  return a?.x === b?.x && a?.y === b?.y;
}
