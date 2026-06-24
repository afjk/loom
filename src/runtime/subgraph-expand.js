// Expand a compact graph that uses shared subgraph definitions (produced by the
// `functionLowering: 'subgraph'` compiler mode) back into an equivalent flat
// graph that the runtime evaluates with its normal path.
//
// A subgraph definition has the shape:
//   { params: ['x', ...], nodes: [...], edges: [...], output: 'nodeId.port' }
// where each parameter appears inside the body as a `subgraph.param` node.
// A call site is a `subgraph.call` node whose params include `subgraph: <name>`
// and whose arguments arrive as `argN` (an edge into `<id>.argN`, or a literal
// stored in `params.argN`).
//
// Expansion replaces each call with a freshly-id'd copy of the body. The body's
// output node is renamed to the call's id (so reads by the call/assignment name
// keep working, exactly like inline expansion); intermediate body nodes get a
// unique prefix. `subgraph.param` reads are rewired to the call's argument
// source (an edge for a port ref, or a literal written onto the consumer's
// params). This is the structural inverse of inline expansion, so the resulting
// graph evaluates identically.

function splitRef(ref) {
  const dot = ref.indexOf('.');
  return [ref.slice(0, dot), ref.slice(dot + 1)];
}

function applySource(src, toNodeId, toPort, edgesArr, nodeArr) {
  if (!src || src.missing) return;
  if ('ref' in src) {
    edgesArr.push({ from: src.ref, to: `${toNodeId}.${toPort}` });
  } else if ('literal' in src) {
    const node = nodeArr.find((n) => n.id === toNodeId);
    if (node) {
      node.params = node.params || {};
      node.params[toPort] = src.literal;
    }
  }
}

function cloneNode(node) {
  return { ...node, params: node.params ? { ...node.params } : undefined };
}

export function expandSubgraphs(graph) {
  const defs = graph && graph.subgraphs;
  if (!defs || Object.keys(defs).length === 0) {
    return graph;
  }

  let nodes = (graph.nodes || []).map(cloneNode);
  let edges = (graph.edges || []).map((e) => ({ ...e }));
  let counter = 0;
  let guard = 0;

  while (nodes.some((n) => n.type === 'subgraph.call')) {
    if (++guard > 100000) {
      throw new Error('Subgraph expansion did not terminate (possible cycle)');
    }

    const call = nodes.find((n) => n.type === 'subgraph.call');
    const name = call.params && call.params.subgraph;
    const def = defs[name];
    if (!def) {
      throw new Error(`Unknown subgraph referenced by ${call.id}: ${name}`);
    }

    const prefix = `${call.id}~${++counter}`;

    // Map param-node id -> param name, and resolve each param's argument source.
    const paramNodeName = new Map();
    for (const n of def.nodes) {
      if (n.type === 'subgraph.param') paramNodeName.set(n.id, n.params.name);
    }
    const argSourceByName = new Map();
    def.params.forEach((paramName, index) => {
      const port = `arg${index + 1}`;
      const argEdge = edges.find((e) => e.to === `${call.id}.${port}`);
      if (argEdge) {
        argSourceByName.set(paramName, { ref: argEdge.from });
      } else if (call.params && Object.prototype.hasOwnProperty.call(call.params, port)) {
        argSourceByName.set(paramName, { literal: call.params[port] });
      } else {
        argSourceByName.set(paramName, { missing: true });
      }
    });

    const [outNode, outPort] = splitRef(def.output);
    const outIsParam = paramNodeName.has(outNode);
    // The body's output node takes the call's id; everything else is prefixed.
    const remap = (id) => (id === outNode && !outIsParam ? call.id : `${prefix}~${id}`);

    const newNodes = def.nodes
      .filter((n) => n.type !== 'subgraph.param')
      .map((n) => ({ ...cloneNode(n), id: remap(n.id) }));

    const newEdges = [];
    for (const e of def.edges) {
      const [fromNode, fromPort] = splitRef(e.from);
      const [toNode, toPort] = splitRef(e.to);
      if (paramNodeName.has(fromNode)) {
        applySource(argSourceByName.get(paramNodeName.get(fromNode)), remap(toNode), toPort, newEdges, newNodes);
      } else {
        newEdges.push({ from: `${remap(fromNode)}.${fromPort}`, to: `${remap(toNode)}.${toPort}` });
      }
    }

    // Resolve how the call's output is materialized for outer consumers.
    let consumerSource;
    if (!outIsParam) {
      // The body output node was renamed to the call id (port may differ from 'out').
      consumerSource = { ref: `${call.id}.${outPort}` };
    } else {
      const paramSrc = argSourceByName.get(paramNodeName.get(outNode));
      if (paramSrc && 'literal' in paramSrc) {
        // Passthrough of a literal: inline mode emits a `constant` node named
        // after the call site, so reads by name still resolve. Mirror that.
        newNodes.push({ id: call.id, type: 'constant', params: { value: paramSrc.literal } });
        consumerSource = { ref: `${call.id}.out` };
      } else {
        // Passthrough of a port ref (or missing arg): consumers read it directly,
        // exactly as inline mode aliases the assignment to the source node.
        consumerSource = paramSrc;
      }
    }

    const keptEdges = [];
    for (const e of edges) {
      const [fromNode] = splitRef(e.from);
      const [toNode, toPort] = splitRef(e.to);
      if (toNode === call.id) continue; // drop argument edges into the call
      if (fromNode === call.id) {
        applySource(consumerSource, toNode, toPort, keptEdges, nodes);
        continue;
      }
      keptEdges.push(e);
    }

    nodes = nodes.filter((n) => n.id !== call.id).concat(newNodes);
    edges = keptEdges.concat(newEdges);
  }

  const result = { ...graph, nodes, edges };
  delete result.subgraphs;
  return result;
}
