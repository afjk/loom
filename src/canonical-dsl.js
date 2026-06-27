import { NODE_TYPES } from './loom.js';

function splitRef(ref) {
  const dot = ref.indexOf('.');
  return dot === -1 ? [ref, ''] : [ref.slice(0, dot), ref.slice(dot + 1)];
}

// Count argN entries a subgraph.call node carries (edges + literal params),
// used as a fallback when the referenced definition is unavailable.
function subgraphCallArity(node, edges) {
  let arity = 0;
  for (let k = 1; ; k += 1) {
    const hasEdge = edges.some((e) => e.to === `${node.id}.arg${k}`);
    const hasParam = node.params && Object.prototype.hasOwnProperty.call(node.params, `arg${k}`);
    if (!hasEdge && !hasParam) break;
    arity = k;
  }
  return arity;
}

// Render a subgraph definition body ({nodes, edges, output}) back into a single
// nested expression. `subgraph.param` nodes become parameter names; nested
// `subgraph.call` nodes become positional function calls; regular nodes become
// named calls whose arguments are recursively rendered source expressions.
function renderSubgraphBody(def, subgraphs) {
  const byId = new Map(def.nodes.map((n) => [n.id, n]));

  const inEdges = (nodeId) => {
    const map = {};
    for (const edge of def.edges || []) {
      const [toNode, toPort] = splitRef(edge.to);
      if (toNode === nodeId) map[toPort] = edge.from;
    }
    return map;
  };

  function renderNode(nodeId) {
    const node = byId.get(nodeId);
    if (!node) return 'null';
    if (node.type === 'subgraph.param') return node.params.name;
    const incoming = inEdges(nodeId);

    if (node.type === 'subgraph.call') {
      const calledDef = subgraphs[node.params.subgraph];
      const arity = calledDef ? calledDef.params.length : subgraphCallArity(node, def.edges || []);
      const args = [];
      for (let k = 1; k <= arity; k += 1) {
        const port = `arg${k}`;
        if (incoming[port]) args.push(renderNode(splitRef(incoming[port])[0]));
        else if (node.params && node.params[port] !== undefined) args.push(formatValue(node.params[port]));
        else args.push('null');
      }
      return `${node.params.subgraph}(${args.join(', ')})`;
    }

    const nodeType = NODE_TYPES[node.type];
    const params = { ...node.params };
    const inputNames = (nodeType?.inputs || []).map((inp) => inp.name || inp);
    const args = [];
    for (const inputName of inputNames) {
      if (incoming[inputName]) {
        args.push(`${inputName}: ${renderNode(splitRef(incoming[inputName])[0])}`);
      } else if (params[inputName] !== undefined) {
        args.push(formatParam(inputName, params[inputName]));
        delete params[inputName];
      }
    }
    for (const paramName of Object.keys(params)) {
      if ((nodeType?.params || []).some((p) => (p.name || p) === paramName)) {
        args.push(formatParam(paramName, params[paramName]));
      }
    }
    return `${node.type}(${args.join(', ')})`;
  }

  return renderNode(splitRef(def.output)[0]);
}

// Describe each shared subgraph definition in a graph as a reusable function
// unit: { name, params, body, signature }. Intended for UI surfaces (the Node
// Editor "Functions" panel) that list the functions a graph defines without
// re-implementing body rendering. Returns [] when the graph defines none.
export function subgraphsToFnDefinitions(graph) {
  const subgraphs = (graph && graph.subgraphs) || {};
  return Object.entries(subgraphs).map(([name, def]) => {
    const params = [...def.params];
    const body = renderSubgraphBody(def, subgraphs);
    return {
      name,
      params,
      body,
      signature: `fn ${name}(${params.join(', ')}) => ${body}`
    };
  });
}

// Order nodes so that a node's dependencies (the `from` endpoints of its
// incoming edges) are emitted before it. Canonical DSL references nodes by name,
// and the compiler requires definition-before-use, so creation order is not
// enough for nested/anonymous subexpressions. Falls back to original order for
// any nodes left over (e.g. unexpected cycles).
function dependencyOrderedNodes(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const deps = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const edge of edges || []) {
    const [toNode] = splitRef(edge.to);
    const [fromNode] = splitRef(edge.from);
    if (deps.has(toNode) && byId.has(fromNode) && fromNode !== toNode) {
      deps.get(toNode).add(fromNode);
    }
  }
  const ordered = [];
  const emitted = new Set();
  const visiting = new Set();
  const visit = (id) => {
    if (emitted.has(id) || visiting.has(id)) return;
    visiting.add(id);
    for (const dep of deps.get(id)) visit(dep);
    visiting.delete(id);
    emitted.add(id);
    ordered.push(byId.get(id));
  };
  for (const node of nodes) visit(node.id);
  return ordered;
}

export function graphToCanonicalDSL(graph) {
  const lines = [];
  const imports = graph.imports || [];
  const subgraphs = graph.subgraphs || {};

  for (const name of imports) {
    lines.push(`import ${name}`);
  }
  if (imports.length && (Object.keys(subgraphs).length || (graph.nodes || []).length || graph.render)) {
    lines.push('');
  }

  for (const [name, def] of Object.entries(subgraphs)) {
    lines.push(`fn ${name}(${def.params.join(', ')}) => ${renderSubgraphBody(def, subgraphs)}`);
  }
  if (Object.keys(subgraphs).length && ((graph.nodes || []).length || graph.render)) {
    lines.push('');
  }

  for (const node of dependencyOrderedNodes(graph.nodes || [], graph.edges || [])) {
    if (node.type === 'subgraph.call') {
      const def = subgraphs[node.params && node.params.subgraph];
      const arity = def ? def.params.length : subgraphCallArity(node, graph.edges || []);
      const args = [];
      for (let k = 1; k <= arity; k += 1) {
        const port = `arg${k}`;
        const edge = (graph.edges || []).find((e) => e.to === `${node.id}.${port}`);
        if (edge) args.push(splitRef(edge.from)[0]);
        else if (node.params && node.params[port] !== undefined) args.push(formatValue(node.params[port]));
        else args.push('null');
      }
      lines.push(`${node.id} = ${node.params.subgraph}(${args.join(', ')})`);
      continue;
    }

    if (node.type === 'constant') {
      const val = node.params?.value;
      lines.push(`${node.id} = ${formatValue(val)}`);
      continue;
    }

    if (node.type === 'formula') {
      const formula = node.params?.formula || '0';
      const inputEdges = {};
      for (const edge of graph.edges || []) {
        if (edge.to.startsWith(node.id + '.')) {
          const [, toPort] = edge.to.split('.');
          const [fromNodeId] = edge.from.split('.');
          inputEdges[toPort] = fromNodeId;
        }
      }
      let rendered = renderFormulaDSL(formula, inputEdges);
      if (rendered.startsWith('(') && rendered.endsWith(')')) rendered = rendered.slice(1, -1);
      lines.push(`${node.id} = ${rendered}`);
      continue;
    }

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
        allNamedArgs.push(formatInputRefParam(inputName, inputEdges[inputName]));
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
    const renderArgs = [];

    if (graph.render.width !== undefined) {
      renderArgs.push(formatRenderParam('width', graph.render.width));
    }
    if (graph.render.height !== undefined) {
      renderArgs.push(formatRenderParam('height', graph.render.height));
    }
    if (graph.render.color !== undefined) {
      renderArgs.push(formatRenderParam('color', graph.render.color));
    }
    if (graph.render.x !== undefined) {
      renderArgs.push(formatRenderParam('x', graph.render.x));
    }
    if (graph.render.y !== undefined) {
      renderArgs.push(formatRenderParam('y', graph.render.y));
    }

    lines.push('');
    lines.push(`render ${renderType}(${renderArgs.join(', ')})`);
  }

  return lines.join('\n') + '\n';
}

function renderFormulaDSL(formula, inputEdges) {
  let pos = 0;
  const len = formula.length;
  const skip = () => { while (pos < len && formula[pos] === ' ') pos++; };

  function parseAdd() {
    let left = parseMul();
    while (pos < len) {
      skip();
      if (formula[pos] === '+') { pos++; left = `${left} + ${parseMul()}`; }
      else if (formula[pos] === '-') { pos++; left = `${left} - ${parseMul()}`; }
      else break;
    }
    return left;
  }

  function parseMul() {
    let left = parseUnary();
    while (pos < len) {
      skip();
      const ch = formula[pos];
      if (ch === '*' || ch === '/' || ch === '%') { pos++; left = `${left} ${ch} ${parseUnary()}`; }
      else break;
    }
    return left;
  }

  function parseUnary() {
    skip();
    if (formula[pos] === '-') { pos++; return `-${parsePrimary()}`; }
    return parsePrimary();
  }

  function parsePrimary() {
    skip();
    if (formula[pos] === '(') {
      pos++;
      const inner = parseAdd();
      skip();
      if (formula[pos] === ')') pos++;
      return `(${inner})`;
    }
    if (/\d/.test(formula[pos]) || (formula[pos] === '.' && pos + 1 < len && /\d/.test(formula[pos + 1]))) {
      let num = '';
      while (pos < len && /[\d.]/.test(formula[pos])) num += formula[pos++];
      if (pos < len && /[eE]/.test(formula[pos])) {
        num += formula[pos++];
        if (pos < len && /[+-]/.test(formula[pos])) num += formula[pos++];
        while (pos < len && /\d/.test(formula[pos])) num += formula[pos++];
      }
      return num;
    }
    if (/[a-zA-Z_]/.test(formula[pos])) {
      let name = '';
      while (pos < len && /[a-zA-Z0-9_]/.test(formula[pos])) name += formula[pos++];
      return inputEdges[name] || name;
    }
    return '0';
  }

  return parseAdd();
}

function formatValue(val, options = {}) {
  const { allowIdentifierString = false } = options;
  if (val === null || val === undefined) {
    return 'null';
  }
  if (typeof val === 'string') {
    if (allowIdentifierString && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val)) {
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

function formatInputRefParam(name, value) {
  return `${name}: ${formatValue(value, { allowIdentifierString: true })}`;
}

// For render params: nodeId.portName references become bare identifiers (e.g. "width.out" → width)
function formatRenderParam(name, value) {
  if (typeof value === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return `${name}: ${value.split('.')[0]}`;
  }
  return formatParam(name, value);
}
