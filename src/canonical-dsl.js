import { NODE_TYPES } from './loom.js';

export function graphToCanonicalDSL(graph) {
  const lines = [];

  for (const node of graph.nodes || []) {
    const nodeType = NODE_TYPES[node.type];
    if (!nodeType) continue;

    const inputEdges = {};
    for (const edge of graph.edges || []) {
      if (edge.to.startsWith(node.id + '.')) {
        const [, toPort] = edge.to.split('.');
        const [fromNodeId] = edge.from.split('.');
        inputEdges[toPort] = fromNodeId;
      }
    }

    const params = { ...node.params };
    const inputNames = (nodeType.inputs || []).map(inp => inp.name || inp);
    const paramNames = (nodeType.params || []).map(p => p.name || p);

    // All args are emitted as named to avoid positional-arg restrictions in the compiler
    // (non-commutative nodes allow at most 1 positional; commutative disallows mixing).
    const allNamedArgs = [];
    for (const inputName of inputNames) {
      if (inputEdges[inputName]) {
        allNamedArgs.push(formatParam(inputName, inputEdges[inputName]));
      } else if (params[inputName] !== undefined) {
        allNamedArgs.push(formatParam(inputName, params[inputName]));
        delete params[inputName];
      }
    }
    for (const paramName of Object.keys(params)) {
      if (paramNames.includes(paramName)) {
        allNamedArgs.push(formatParam(paramName, params[paramName]));
      }
    }

    const callStr = `${node.type}(${allNamedArgs.join(', ')})`;

    lines.push(`${node.id} = ${callStr}`);
  }

  if (graph.render) {
    const renderType = graph.render.type || 'bar';
    const renderArgs = Object.keys(graph.render)
      .filter((key) => key !== 'type' && graph.render[key] !== undefined)
      .map((key) => formatRenderParam(key, graph.render[key]));

    lines.push('');
    lines.push(`render ${renderType}(${renderArgs.join(', ')})`);
  }

  return lines.join('\n') + '\n';
}

function formatValue(val) {
  if (val === null || val === undefined) {
    return 'null';
  }
  if (typeof val === 'string') {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val)) {
      return val;
    }
    return `"${val.replace(/"/g, '\\"')}"`;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  return JSON.stringify(val);
}

function formatParam(name, value) {
  return `${name}: ${formatValue(value)}`;
}

// For render params: nodeId.portName references become bare identifiers (e.g. "width.out" → width)
function formatRenderParam(name, value) {
  if (typeof value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return `${name}: ${value.split('.')[0]}`;
  }
  return formatParam(name, value);
}
