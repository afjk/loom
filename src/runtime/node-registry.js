export function createNodeRegistry(initialNodeTypes = {}) {
  const nodeTypes = new Map();

  if (initialNodeTypes && typeof initialNodeTypes === 'object') {
    for (const [nodeType, definition] of Object.entries(initialNodeTypes)) {
      const normalized = normalizeNodeTypeDefinition(definition);
      validateNodeTypeName(nodeType);
      validateNodeTypeDefinition(nodeType, normalized);
      nodeTypes.set(nodeType, normalized);
    }
  }

  return {
    registerNodeType(nodeType, definition) {
      validateNodeTypeName(nodeType);
      const normalized = normalizeNodeTypeDefinition(definition);
      validateNodeTypeDefinition(nodeType, normalized);

      if (nodeTypes.has(nodeType)) {
        throw new Error(`Duplicate node type: ${nodeType}`);
      }

      nodeTypes.set(nodeType, normalized);
      return normalized;
    },

    getNodeType(nodeType) {
      return nodeTypes.get(nodeType);
    },

    hasNodeType(nodeType) {
      return nodeTypes.has(nodeType);
    },

    listNodeTypes() {
      return Array.from(nodeTypes.keys()).sort();
    },

    toObject() {
      const result = {};
      for (const [nodeType, definition] of nodeTypes) {
        result[nodeType] = definition;
      }
      return result;
    },

    get size() {
      return nodeTypes.size;
    }
  };
}

function validateNodeTypeName(nodeType) {
  if (typeof nodeType !== 'string') {
    throw new TypeError(`Node type name must be a string, got ${typeof nodeType}`);
  }

  if (nodeType.length === 0) {
    throw new TypeError('Node type name must not be empty');
  }

  if (/^\s+$/.test(nodeType)) {
    throw new TypeError('Node type name must not be whitespace-only');
  }

  if (/\s/.test(nodeType)) {
    throw new TypeError(`Node type name must not contain whitespace: ${nodeType}`);
  }

  if (nodeType.startsWith('.')) {
    throw new TypeError(`Node type name must not start with a dot: ${nodeType}`);
  }

  if (nodeType.endsWith('.')) {
    throw new TypeError(`Node type name must not end with a dot: ${nodeType}`);
  }
}

export function validateNodeTypeDefinition(nodeType, definition) {
  if (!definition || typeof definition !== 'object') {
    throw new TypeError(`Invalid node type ${nodeType}: definition must be an object`);
  }

  if (typeof definition.category !== 'string' || definition.category.length === 0) {
    throw new TypeError(`Invalid node type ${nodeType}: category must be a non-empty string`);
  }

  if (typeof definition.evaluate !== 'function') {
    throw new TypeError(`Invalid node type ${nodeType}: evaluate must be a function`);
  }

  const inputs = definition.inputs ?? [];
  const params = definition.params ?? [];
  const outputs = definition.outputs ?? [];

  if (!Array.isArray(inputs)) {
    throw new TypeError(`Invalid node type ${nodeType}: inputs must be an array`);
  }

  if (!Array.isArray(params)) {
    throw new TypeError(`Invalid node type ${nodeType}: params must be an array`);
  }

  if (!Array.isArray(outputs)) {
    throw new TypeError(`Invalid node type ${nodeType}: outputs must be an array`);
  }

  validatePortArray(nodeType, 'input', inputs);
  validatePortArray(nodeType, 'param', params);
  validatePortArray(nodeType, 'output', outputs);
}

function validatePortArray(nodeType, portCategory, ports) {
  const names = new Set();

  for (const port of ports) {
    if (!port || typeof port !== 'object') {
      throw new TypeError(
        `Invalid node type ${nodeType}: ${portCategory} must be an object`
      );
    }

    if (typeof port.name !== 'string' || port.name.length === 0) {
      throw new TypeError(
        `Invalid node type ${nodeType}: ${portCategory} name must be a non-empty string`
      );
    }

    if (typeof port.type !== 'string' || port.type.length === 0) {
      throw new TypeError(
        `Invalid node type ${nodeType}: ${portCategory} type must be a non-empty string`
      );
    }

    if ('kind' in port) {
      if (typeof port.kind !== 'string' || port.kind.length === 0) {
        throw new TypeError(
          `Invalid node type ${nodeType}: ${portCategory} kind must be a non-empty string`
        );
      }
    }

    if (names.has(port.name)) {
      throw new TypeError(
        `Invalid node type ${nodeType}: duplicate ${portCategory} name "${port.name}"`
      );
    }

    names.add(port.name);
  }
}

function normalizeNodeTypeDefinition(definition) {
  return {
    ...definition,
    inputs: definition.inputs ?? [],
    params: definition.params ?? [],
    outputs: definition.outputs ?? []
  };
}
