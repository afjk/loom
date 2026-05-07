export function normalizeEditorCategory(category) {
  return category === 'source' ? 'input' : (category || 'transform');
}

export function cloneDefaultValue(value) {
  if (Array.isArray(value)) return value.map(cloneDefaultValue);
  if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
  return value;
}

export function createDefaultParamsForNodeType(typeName, NODE_TYPES) {
  const def = NODE_TYPES[typeName];
  const params = {};

  for (const param of def?.params || []) {
    const hasDefault = Object.prototype.hasOwnProperty.call(param, 'default');
    params[param.name] = hasDefault ? cloneDefaultValue(param.default) : null;
  }

  return params;
}

export function createNodeIdFromType(typeName, existingNodeIds) {
  const base = typeName
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'node';

  if (!existingNodeIds || !existingNodeIds[base]) return base;

  let index = 2;
  while (existingNodeIds[`${base}_${index}`]) {
    index += 1;
  }

  return `${base}_${index}`;
}

export function createPositionForNewNode(category, nodes, findNonOverlappingPosition, NODE_LAYOUT_STEP_Y) {
  const categoryX = {
    input: 0,
    transform: 300,
    state: 600,
    sink: 900
  };

  const sameCategoryCount = (nodes || []).filter((node) => node.category === category).length;
  const desiredPosition = {
    x: categoryX[category] ?? 1200,
    y: sameCategoryCount * (NODE_LAYOUT_STEP_Y || 120)
  };

  if (!findNonOverlappingPosition) {
    return desiredPosition;
  }

  const existingPositions = (nodes || []).map((node) => node.position).filter(Boolean);
  return findNonOverlappingPosition(desiredPosition, existingPositions);
}

export function getNodeTypeEntries(NODE_TYPES) {
  return Object.entries(NODE_TYPES)
    .map(([typeName, def]) => ({
      typeName,
      category: normalizeEditorCategory(def.category),
      inputs: def.inputs || [],
      outputs: def.outputs || [],
      params: def.params || []
    }))
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.typeName.localeCompare(b.typeName);
    });
}
