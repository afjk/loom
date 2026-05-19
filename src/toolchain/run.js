import { Loom, LoomError, NODE_TYPES } from '../loom.js';
import { compileLoomSource } from './compile.js';
import { normalizeLoomError } from './errors.js';

const CLI_SAFE_CATEGORIES = new Set(['source', 'transform', 'state', 'output']);

function isCliSafeSink(nodeTypeName) {
  return nodeTypeName === 'console.log' || nodeTypeName === 'console.warn' || nodeTypeName === 'console.error' || nodeTypeName === 'console.table' || nodeTypeName === 'fs.writeText'
    || nodeTypeName === 'scene.setPosition' || nodeTypeName === 'scene.setRotation' || nodeTypeName === 'scene.setScale';
}

function getNodeTypes(options = {}) {
  if (options.nodeRegistry && typeof options.nodeRegistry.toObject === 'function') {
    return options.nodeRegistry.toObject();
  }
  if (options.nodeTypes && typeof options.nodeTypes === 'object') {
    return options.nodeTypes;
  }
  return NODE_TYPES;
}

function resolveEvaluationEnv(options = {}) {
  const env = options.env && typeof options.env === 'object' && !Array.isArray(options.env)
    ? { ...options.env }
    : {};

  if (!Number.isFinite(env.time) && Number.isFinite(options.time)) {
    env.time = options.time;
  }
  if (!Number.isFinite(env.deltaTime) && Number.isFinite(options.dt)) {
    env.deltaTime = Math.max(0, options.dt);
  }
  if (!Number.isFinite(env.tick) && Number.isFinite(options.tick)) {
    env.tick = options.tick;
  }

  return env;
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

function getDefaultOutputPort(node, nodeTypes) {
  const nodeType = nodeTypes[node.type];
  if (!nodeType || !Array.isArray(nodeType.outputs) || nodeType.outputs.length === 0) {
    return null;
  }
  if (nodeType.outputs.length === 1) {
    return nodeType.outputs[0].name;
  }
  const outPort = nodeType.outputs.find((output) => output.name === 'out');
  return outPort ? outPort.name : nodeType.outputs[0].name;
}

function validateCliRunnableGraph(graph, nodeTypes) {
  for (const node of graph.nodes) {
    const nodeType = nodeTypes[node.type];
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

function collectRequestedValues(engine, graph, get, nodeTypes) {
  const requestedRefs = getRefsToRead(graph, get);
  if (requestedRefs === null) {
    const values = {};
    for (const node of graph.nodes) {
      const nodeType = nodeTypes[node.type];
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
    const nodeTypes = getNodeTypes(options);
    validateCliRunnableGraph(graph, nodeTypes);
    const engine = new Loom(graph, {
      nodeRegistry: options.nodeRegistry,
      nodeTypes: options.nodeTypes
    });
    engine.evaluateOnce({
      env: resolveEvaluationEnv(options)
    });

    return {
      ok: true,
      values: collectRequestedValues(engine, graph, options.get, nodeTypes),
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
