import { Loom, LoomError, NODE_TYPES } from '../loom.js';
import { compileLoomSource } from './compile.js';
import { normalizeLoomError } from './errors.js';

const CLI_SAFE_CATEGORIES = new Set(['source', 'transform', 'state']);

function isCliSafeSink(nodeTypeName) {
  return nodeTypeName === 'console.log' || nodeTypeName === 'console.warn' || nodeTypeName === 'console.error' || nodeTypeName === 'console.table' || nodeTypeName === 'fs.writeText'
    || nodeTypeName === 'scene.setPosition' || nodeTypeName === 'scene.setRotation' || nodeTypeName === 'scene.setScale';
}

function getRefsToRead(graph, get) {
  if (Array.isArray(get)) {
    return get;
  }
  if (typeof get === 'string' && get.length > 0) {
    return [get];
  }
  return null;
}

function getDefaultOutputPort(node) {
  const nodeType = NODE_TYPES[node.type];
  if (!nodeType || !Array.isArray(nodeType.outputs) || nodeType.outputs.length === 0) {
    return null;
  }
  if (nodeType.outputs.length === 1) {
    return nodeType.outputs[0].name;
  }
  const outPort = nodeType.outputs.find((output) => output.name === 'out');
  return outPort ? outPort.name : nodeType.outputs[0].name;
}

function validateCliRunnableGraph(graph) {
  for (const node of graph.nodes) {
    const nodeType = NODE_TYPES[node.type];
    if (!nodeType) {
      throw new LoomError('UNKNOWN_NODE_TYPE', `Unknown node type: ${node.type}`, { nodeId: node.id, type: node.type });
    }
    if (!CLI_SAFE_CATEGORIES.has(nodeType.category) && !(nodeType.category === 'sink' && isCliSafeSink(node.type))) {
      throw new LoomError(
        'UNSUPPORTED_RUNTIME_NODE',
        `Node '${node.id}' of type '${node.type}' is not supported by CLI run`,
        { nodeId: node.id, type: node.type, category: nodeType.category }
      );
    }
  }
}

function collectRequestedValues(engine, graph, get) {
  const requestedRefs = getRefsToRead(graph, get);
  if (requestedRefs === null) {
    const values = {};
    for (const node of graph.nodes) {
      const nodeType = NODE_TYPES[node.type];
      if (!nodeType || !Array.isArray(nodeType.outputs)) {
        continue;
      }
      for (const output of nodeType.outputs) {
        values[`${node.id}.${output.name}`] = engine.getValue(`${node.id}.${output.name}`);
      }
    }
    return values;
  }

  const values = {};
  for (const ref of requestedRefs) {
    values[ref] = engine.getValue(ref);
  }
  return values;
}

export function runLoomGraph(graph, options = {}) {
  try {
    validateCliRunnableGraph(graph);
    const engine = new Loom(graph);
    engine.evaluateOnce({
      time: Number.isFinite(options.time) ? options.time : 0,
      dt: Number.isFinite(options.dt) ? options.dt : 0
    });

    return {
      ok: true,
      values: collectRequestedValues(engine, graph, options.get),
      effects: engine.getEffects(),
      graph,
      errors: []
    };
  } catch (error) {
    return {
      ok: false,
      values: {},
      effects: [],
      graph,
      errors: [normalizeLoomError(error)]
    };
  }
}

export function runLoomSource(source, options = {}) {
  const compiled = compileLoomSource(source, options);
  if (!compiled.ok || !compiled.graph) {
    return {
      ok: false,
      values: {},
      effects: [],
      graph: compiled.graph,
      errors: compiled.errors
    };
  }

  return runLoomGraph(compiled.graph, options);
}
