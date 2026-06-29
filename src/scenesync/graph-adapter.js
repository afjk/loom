import { compileLoomSource } from '../toolchain/compile.js';

const SUPPORTED_NODES = new Set([
  'constant',
  'clock',
  'onEvent',
  'list.length',
  'logic.greaterThan',
  'logic.select',
  'integrate',
  'add',
  'subtract',
  'multiply',
  'divide',
  'math.sine',
  'math.cosine',
  'math.add',
  'math.subtract',
  'math.multiply',
  'math.divide',
  'math.lerp',
  'scene.setPosition',
  'scene.offsetPosition',
  'scene.setRotation',
  'scene.setScale',
  'scene.setColor',
  'scene.setVisible',
  'audioSource.play',
  'audioSource.pause',
  'audioSource.stop',
  'audioSource.seek',
  'audioSource.playOneShot',
  'audioSource.setVolume',
  'audioSource.setClip',
  'audioSource.syncToAnimation',
  'audioSource.unsync'
]);

const NODE_TYPE_MAPPING = {
  'constant': 'constant',
  'clock': 'clock',
  'onEvent': 'onEvent',
  'list.length': 'list.length',
  'logic.greaterThan': 'logic.greaterThan',
  'logic.select': 'logic.select',
  'integrate': 'integrate',
  'add': 'add',
  'subtract': 'subtract',
  'multiply': 'multiply',
  'divide': 'divide',
  'math.sine': 'sine',
  'math.cosine': 'cosine',
  'math.add': 'add',
  'math.subtract': 'subtract',
  'math.multiply': 'multiply',
  'math.divide': 'divide',
  'math.lerp': 'lerp',
  'scene.setPosition': 'sceneSetPosition',
  'scene.offsetPosition': 'sceneOffsetPosition',
  'scene.setRotation': 'sceneSetRotation',
  'scene.setScale': 'sceneSetScale',
  'scene.setColor': 'sceneSetColor',
  'scene.setVisible': 'sceneSetVisible',
  'audioSource.play': 'audioSourcePlay',
  'audioSource.pause': 'audioSourcePause',
  'audioSource.stop': 'audioSourceStop',
  'audioSource.seek': 'audioSourceSeek',
  'audioSource.playOneShot': 'audioSourcePlayOneShot',
  'audioSource.setVolume': 'audioSourceSetVolume',
  'audioSource.setClip': 'audioSourceSetClip',
  'audioSource.syncToAnimation': 'audioSourceSyncToAnimation',
  'audioSource.unsync': 'audioSourceUnsync'
};

function isSceneSyncSink(nodeType) {
  return typeof nodeType === 'string'
    && (nodeType.startsWith('scene.') || nodeType.startsWith('audioSource.'));
}

const OUTPUT_PORT_MAPPING = {
  'constant': 'out',
  'clock': 't',
  'onEvent': 'event',
  'list.length': 'out',
  'logic.greaterThan': 'out',
  'logic.select': 'out',
  'integrate': 'out',
  'add': 'out',
  'subtract': 'out',
  'multiply': 'out',
  'divide': 'out',
  'math.subtract': 'out',
  'math.divide': 'out',
  'math.sine': 'out',
  'sine': 'out',
  'math.cosine': 'out',
  'cosine': 'out',
  'math.add': 'out',
  'add': 'out',
  'math.multiply': 'out',
  'multiply': 'out',
  'math.lerp': 'out',
  'lerp': 'out',
  'scene.setPosition': undefined,
  'sceneSetPosition': undefined,
  'scene.offsetPosition': undefined,
  'sceneOffsetPosition': undefined,
  'scene.setRotation': undefined,
  'sceneSetRotation': undefined,
  'scene.setScale': undefined,
  'sceneSetScale': undefined,
  'scene.setColor': undefined,
  'sceneSetColor': undefined,
  'scene.setVisible': undefined,
  'sceneSetVisible': undefined,
  'audioSource.play': undefined,
  'audioSourcePlay': undefined,
  'audioSource.pause': undefined,
  'audioSourcePause': undefined,
  'audioSource.stop': undefined,
  'audioSourceStop': undefined,
  'audioSource.seek': undefined,
  'audioSourceSeek': undefined,
  'audioSource.playOneShot': undefined,
  'audioSourcePlayOneShot': undefined,
  'audioSource.setVolume': undefined,
  'audioSourceSetVolume': undefined,
  'audioSource.setClip': undefined,
  'audioSourceSetClip': undefined,
  'audioSource.syncToAnimation': undefined,
  'audioSourceSyncToAnimation': undefined,
  'audioSource.unsync': undefined,
  'audioSourceUnsync': undefined
};

function generateStableNodeBase(nodeType) {
  const mapped = NODE_TYPE_MAPPING[nodeType] || nodeType;
  if (mapped === 'constant') return 'constant';
  if (mapped === 'clock') return 'clock';
  if (mapped === 'onEvent') return 'event';
  if (mapped === 'list.length') return 'length';
  if (mapped === 'logic.greaterThan') return 'greaterThan';
  if (mapped === 'logic.select') return 'select';
  if (mapped === 'integrate') return 'integrate';
  if (mapped === 'sine') return 'sine';
  if (mapped === 'cosine') return 'cosine';
  if (mapped === 'add') return 'add';
  if (mapped === 'multiply') return 'multiply';
  if (mapped === 'lerp') return 'lerp';
  if (mapped === 'sceneSetPosition') return 'pos';
  if (mapped === 'sceneOffsetPosition') return 'offset';
  if (mapped === 'sceneSetRotation') return 'rot';
  if (mapped === 'sceneSetScale') return 'scale';
  if (mapped === 'sceneSetColor') return 'color';
  if (mapped === 'sceneSetVisible') return 'visible';
  if (typeof mapped === 'string' && mapped.startsWith('audioSource')) {
    return 'audio' + mapped.slice('audioSource'.length);
  }
  return mapped;
}

function makeUniqueId(base, usedIds) {
  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }
  let index = 2;
  while (usedIds.has(`${base}_${index}`)) index += 1;
  const id = `${base}_${index}`;
  usedIds.add(id);
  return id;
}

function normalizeScope(options = {}) {
  let scope = null;
  if (options.scope) {
    scope = options.scope;
  } else if (options.objectId) {
    scope = { object: options.objectId };
  } else {
    return null;
  }

  if (typeof scope === 'string' && scope === 'scene') {
    return 'scene';
  }
  if (typeof scope === 'object' && scope !== null && scope.scene === true) {
    return 'scene';
  }
  if (typeof scope === 'object' && scope !== null && scope.object) {
    return { object: scope.object };
  }
  if (typeof scope === 'string' && scope.length > 0) {
    return { object: scope };
  }

  return scope;
}

function pickParams(nodeType, params = {}) {
  if (
    nodeType === 'constant' ||
    nodeType === 'onEvent' ||
    nodeType === 'integrate' ||
    nodeType === 'add' ||
    nodeType === 'subtract' ||
    nodeType === 'multiply' ||
    nodeType === 'divide' ||
    nodeType === 'math.add' ||
    nodeType === 'math.subtract' ||
    nodeType === 'math.multiply' ||
    nodeType === 'math.divide' ||
    nodeType === 'math.lerp' ||
    nodeType === 'logic.greaterThan' ||
    nodeType === 'logic.select' ||
    nodeType === 'list.length'
  ) {
    return { ...params };
  }
  if (nodeType === 'scene.offsetPosition') {
    return {
      ...(params.objectId ? { target: params.objectId } : {}),
      ...(params.x !== undefined ? { x: params.x } : {}),
      ...(params.y !== undefined ? { y: params.y } : {}),
      ...(params.z !== undefined ? { z: params.z } : {})
    };
  }
  if (nodeType === 'scene.setPosition' || nodeType === 'scene.setScale') {
    return { ...(params.x !== undefined ? { x: params.x } : {}), ...(params.y !== undefined ? { y: params.y } : {}), ...(params.z !== undefined ? { z: params.z } : {}) };
  }
  if (nodeType === 'scene.setRotation') {
    return {
      ...(params.x !== undefined ? { x: params.x } : {}),
      ...(params.y !== undefined ? { y: params.y } : {}),
      ...(params.z !== undefined ? { z: params.z } : {}),
      ...(params.w !== undefined ? { w: params.w } : {})
    };
  }
  if (nodeType === 'scene.setColor') {
    return { ...(params.r !== undefined ? { r: params.r } : {}), ...(params.g !== undefined ? { g: params.g } : {}), ...(params.b !== undefined ? { b: params.b } : {}) };
  }
  if (nodeType === 'scene.setVisible') {
    return { ...(params.visible !== undefined ? { visible: params.visible } : {}) };
  }
  if (nodeType.startsWith('audioSource.')) {
    return {
      ...(params.objectId ? { target: params.objectId } : {}),
      ...(params.name !== undefined ? { name: params.name } : {}),
      ...(params.time !== undefined ? { time: params.time } : {}),
      ...(params.volume !== undefined ? { volume: params.volume } : {}),
      ...(params.url !== undefined ? { url: params.url } : {}),
      ...(params.animation !== undefined ? { animation: params.animation } : {}),
      ...(params.offset !== undefined ? { offset: params.offset } : {}),
      ...(params.resyncOnLoop !== undefined ? { resyncOnLoop: params.resyncOnLoop } : {})
    };
  }
  if (nodeType === 'math.sine' || nodeType === 'math.cosine') {
    return {
      ...(params.freq !== undefined ? { freq: params.freq } : {}),
      ...(params.amplitude !== undefined ? { amplitude: params.amplitude } : {}),
      ...(params.offset !== undefined ? { offset: params.offset } : {})
    };
  }
  return {};
}

// --- Formula lowering -------------------------------------------------------
//
// Inline arithmetic in the DSL (e.g. `dy / 10`) compiles to a single `formula`
// node, which the Scene Sync runtime does not implement. Before mapping to the
// Scene Sync graph we expand every `formula` node into the equivalent tree of
// runtime-supported math nodes (add / subtract / multiply / divide) plus
// `constant` nodes for literals, so inline operators "just work" on export.

// Recursive-descent parser for the formula grammar:
//   expr := add ; add := mul (('+'|'-') mul)* ; mul := unary (('*'|'/') unary)*
//   unary := '-' unary | primary ; primary := number | ident | '(' expr ')'
function parseFormulaExpression(formula) {
  const text = String(formula);
  let pos = 0;
  const skipWs = () => { while (pos < text.length && /\s/.test(text[pos])) pos++; };

  function parseExpr() { return parseAdd(); }
  function parseAdd() {
    let node = parseMul();
    skipWs();
    while (text[pos] === '+' || text[pos] === '-') {
      const op = text[pos++];
      node = { t: 'op', op, l: node, r: parseMul() };
      skipWs();
    }
    return node;
  }
  function parseMul() {
    let node = parseUnary();
    skipWs();
    while (text[pos] === '*' || text[pos] === '/') {
      const op = text[pos++];
      node = { t: 'op', op, l: node, r: parseUnary() };
      skipWs();
    }
    return node;
  }
  function parseUnary() {
    skipWs();
    if (text[pos] === '-') { pos++; return { t: 'neg', x: parseUnary() }; }
    if (text[pos] === '+') { pos++; return parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary() {
    skipWs();
    const ch = text[pos];
    if (ch === '(') {
      pos++;
      const node = parseExpr();
      skipWs();
      if (text[pos] !== ')') throw new Error(`Unbalanced parentheses in formula: ${formula}`);
      pos++;
      return node;
    }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (pos < text.length && /[0-9.]/.test(text[pos])) num += text[pos++];
      return { t: 'num', value: Number(num) };
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let name = '';
      while (pos < text.length && /[a-zA-Z0-9_]/.test(text[pos])) name += text[pos++];
      return { t: 'var', name };
    }
    throw new Error(`Unsupported character '${ch ?? ''}' in formula: ${formula}`);
  }

  const ast = parseExpr();
  skipWs();
  if (pos < text.length) throw new Error(`Unexpected '${text[pos]}' in formula: ${formula}`);
  return ast;
}

const FORMULA_OP_TYPE = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };

// Expand every `formula` node in a loom graph into supported math/constant
// nodes. The expression root reuses the formula node's id so downstream edges
// (formula.out -> ...) stay valid. Returns a new graph; non-formula graphs are
// returned unchanged.
export function expandFormulaNodes(loomGraph) {
  const formulaNodes = loomGraph.nodes.filter((n) => n.type === 'formula');
  if (formulaNodes.length === 0) return loomGraph;

  const usedIds = new Set(loomGraph.nodes.map((n) => n.id));
  const removedNodeIds = new Set();
  const removedEdgeKeys = new Set();
  const newNodes = [];
  const newEdges = [];

  for (const formula of formulaNodes) {
    const fid = formula.id;

    // Map each formula input variable to the endpoint feeding it.
    const varSources = new Map();
    for (const edge of loomGraph.edges) {
      const [toNode, toPort] = edge.to.split('.');
      if (toNode === fid) {
        varSources.set(toPort, edge.from);
        removedEdgeKeys.add(`${edge.from}->${edge.to}`);
      }
    }

    const uniqueId = (base) => {
      let id = `${fid}_${base}`;
      let i = 2;
      while (usedIds.has(id)) id = `${fid}_${base}_${i++}`;
      usedIds.add(id);
      return id;
    };
    const constNode = (value) => {
      const id = uniqueId('const');
      newNodes.push({ id, type: 'constant', params: { value } });
      return `${id}.out`;
    };

    // Lower an AST node, returning its output endpoint. `forcedId` pins the
    // root to the formula node's id.
    const lower = (ast, forcedId = null) => {
      if (ast.t === 'num') {
        if (!forcedId) return constNode(ast.value);
        newNodes.push({ id: forcedId, type: 'constant', params: { value: ast.value } });
        return `${forcedId}.out`;
      }
      if (ast.t === 'var') {
        const src = varSources.get(ast.name);
        if (!src) throw new Error(`Formula references unconnected variable '${ast.name}'`);
        if (!forcedId) return src;
        // Bare-variable root: identity via add(var, 0) so the root keeps fid.
        newNodes.push({ id: forcedId, type: 'add' });
        newEdges.push({ from: src, to: `${forcedId}.a` });
        newEdges.push({ from: constNode(0), to: `${forcedId}.b` });
        return `${forcedId}.out`;
      }
      if (ast.t === 'neg') {
        const id = forcedId || uniqueId('subtract');
        newNodes.push({ id, type: 'subtract' });
        newEdges.push({ from: constNode(0), to: `${id}.a` });
        newEdges.push({ from: lower(ast.x), to: `${id}.b` });
        return `${id}.out`;
      }
      if (ast.t === 'op') {
        const type = FORMULA_OP_TYPE[ast.op];
        const id = forcedId || uniqueId(type);
        const left = lower(ast.l);
        const right = lower(ast.r);
        newNodes.push({ id, type });
        newEdges.push({ from: left, to: `${id}.a` });
        newEdges.push({ from: right, to: `${id}.b` });
        return `${id}.out`;
      }
      throw new Error('Unsupported formula expression');
    };

    lower(parseFormulaExpression(formula.params?.formula ?? '0'), fid);
    removedNodeIds.add(fid);
  }

  const nodes = loomGraph.nodes.filter((n) => !removedNodeIds.has(n.id)).concat(newNodes);
  const edges = loomGraph.edges.filter((e) => !removedEdgeKeys.has(`${e.from}->${e.to}`)).concat(newEdges);
  return { ...loomGraph, nodes, edges };
}

export function compileLoomToSceneSyncGraph(source, options = {}) {
  const result = compileLoomSource(source, { target: 'scenesync' });
  if (!result.ok) throw new Error(`Compilation failed: ${result.errors.map((e) => e.message).join(', ')}`);
  return loomGraphToSceneSyncGraph(result.graph, options);
}

export function loomGraphToSceneSyncGraph(loomGraph, options = {}) {
  if (!loomGraph || !loomGraph.nodes || !loomGraph.edges) throw new Error('loomGraph must have nodes and edges arrays');

  // Expand inline-arithmetic `formula` nodes into runtime-supported math nodes.
  loomGraph = expandFormulaNodes(loomGraph);

  // Phase 1: Find all Scene Sync sink nodes (scene.* and audioSource.* nodes)
  const sinkNodeIds = new Set();
  let sceneSyncNodeIds = new Set();

  // Find all scene.* / audioSource.* sink nodes
  for (const node of loomGraph.nodes) {
    if (isSceneSyncSink(node.type)) {
      sinkNodeIds.add(node.id);
      sceneSyncNodeIds.add(node.id);
    }
  }

  // Phase 2: If sink nodes found, recursively find their dependencies
  if (sinkNodeIds.size > 0) {
    function findDependencies(nodeId, visited = new Set()) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      sceneSyncNodeIds.add(nodeId);

      for (const edge of loomGraph.edges) {
        const [toNodeId] = edge.to.split('.');
        if (toNodeId === nodeId) {
          const [fromNodeId] = edge.from.split('.');
          const fromNode = loomGraph.nodes.find(n => n.id === fromNodeId);
          if (fromNode) {
            findDependencies(fromNodeId, visited);
          }
        }
      }
    }

    for (const sinkId of sinkNodeIds) {
      findDependencies(sinkId);
    }
  } else {
    // No scene.* nodes found: include all supported nodes (backwards compatibility)
    for (const node of loomGraph.nodes) {
      sceneSyncNodeIds.add(node.id);
    }
  }

  // Phase 3: Validate that all included nodes are supported
  for (const node of loomGraph.nodes) {
    if (sceneSyncNodeIds.has(node.id) && !SUPPORTED_NODES.has(node.type)) {
      throw new Error(`Unsupported Scene Sync graph node: ${node.type}`);
    }
  }

  // Phase 4: Build Scene Sync graph with only the identified nodes
  const nodes = [];
  const edges = [];
  const nodeIdMap = new Map();
  const usedIds = new Set();

  for (const node of loomGraph.nodes) {
    if (!sceneSyncNodeIds.has(node.id)) continue;
    const sceneSyncType = NODE_TYPE_MAPPING[node.type];
    const baseId = (node.id && !node.id.startsWith('_')) ? node.id : generateStableNodeBase(node.type);
    const newId = makeUniqueId(baseId, usedIds);
    nodeIdMap.set(node.id, newId);
    const params = pickParams(node.type, node.params);
    nodes.push({ id: newId, type: sceneSyncType, ...(Object.keys(params).length > 0 ? { params } : {}) });
  }

  for (const edge of loomGraph.edges) {
    const [fromNodeId, fromPort] = edge.from.split('.');
    const [toNodeId, toPort] = edge.to.split('.');
    if (!sceneSyncNodeIds.has(fromNodeId) || !sceneSyncNodeIds.has(toNodeId)) continue;
    const newFromId = nodeIdMap.get(fromNodeId);
    const newToId = nodeIdMap.get(toNodeId);
    if (newFromId && newToId) edges.push({ from: `${newFromId}.${fromPort}`, to: `${newToId}.${toPort}` });
  }

  let scope = normalizeScope(options);
  if (!scope) {
    for (const node of loomGraph.nodes) {
      if ((node.type.startsWith('scene.set') || node.type === 'scene.offsetPosition' || node.type.startsWith('audioSource.')) && node.params?.objectId) {
        scope = { object: node.params.objectId };
        break;
      }
    }
  }

  return { graph: { nodes, edges }, scope };
}
