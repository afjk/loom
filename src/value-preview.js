function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(3)).toString();
}

function formatString(value, maxLength = 32) {
  if (value.length <= maxLength) return JSON.stringify(value);
  return `${JSON.stringify(value.slice(0, maxLength))}…`;
}

function isNumericVector(value) {
  return Array.isArray(value)
    && value.length >= 2
    && value.length <= 4
    && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

function formatArray(value) {
  if (isNumericVector(value)) {
    return `vec${value.length}(${value.map(formatNumber).join(', ')})`;
  }
  if (value.length === 0) return '[]';
  const previewItems = value.slice(0, 3).map((item) => formatValuePreview(item, { depth: 1 }));
  const suffix = value.length > 3 ? ', …' : '';
  return `[${previewItems.join(', ')}${suffix}]`;
}

function formatObject(value, depth) {
  if (!value) return 'null';

  const keys = Object.keys(value);
  if (keys.length === 0) return '{}';

  const vectorKeys = ['x', 'y', 'z', 'w'];
  const presentVectorKeys = vectorKeys.filter((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
  if (presentVectorKeys.length >= 2) {
    const vals = presentVectorKeys.map((key) => formatNumber(value[key]));
    return `vec${presentVectorKeys.length}(${vals.join(', ')})`;
  }

  if (depth >= 1) return `{…${keys.length}}`;

  const shownKeys = keys.slice(0, 3);
  const shown = shownKeys.map((key) => `${key}: ${formatValuePreview(value[key], { depth: depth + 1 })}`);
  const suffix = keys.length > shownKeys.length ? ', …' : '';
  return `{${shown.join(', ')}${suffix}}`;
}

export function formatValuePreview(value, { depth = 0 } = {}) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return formatString(value);
  if (typeof value === 'function') return 'ƒ()';
  if (Array.isArray(value)) return formatArray(value);
  if (typeof value === 'object') return formatObject(value, depth);
  return String(value);
}

function summarizeNodeOutputs(node, nodeType, getValue) {
  const outputDefs = Array.isArray(nodeType?.outputs) ? nodeType.outputs : [];
  const getOutputName = (output) => (typeof output === 'string' ? output : output?.name);
  if (outputDefs.length === 0) return undefined;

  if (outputDefs.length === 1) {
    return getValue(`${node.id}.${getOutputName(outputDefs[0])}`);
  }

  const summary = {};
  for (const output of outputDefs) {
    const outputName = getOutputName(output);
    summary[outputName] = getValue(`${node.id}.${outputName}`);
  }
  return summary;
}

export function getLatestNodeValues(engine, graph, nodeTypes = {}) {
  if (!engine || !graph) return new Map();

  if (typeof engine.getLatestNodeValues === 'function') {
    const observed = engine.getLatestNodeValues();
    if (observed instanceof Map) {
      return observed;
    }
  }

  if (typeof engine.getValue !== 'function') {
    return new Map();
  }

  const values = new Map();
  for (const node of graph.nodes || []) {
    const nodeType = nodeTypes[node.type];
    values.set(
      node.id,
      summarizeNodeOutputs(node, nodeType, (ref) => engine.getValue(ref))
    );
  }
  return values;
}
