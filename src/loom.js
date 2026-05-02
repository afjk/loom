// Loom: ブラウザで動くステートレスなデータフロー実行エンジン

export class LoomError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LoomError';
    this.code = code;
    this.details = details;
  }
}

// ノード型レジストリ
const NODE_TYPES = {
  clock: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 't', type: 'number' }],
    params: [],
    evaluate: (inputs, params, ctx) => ({ t: ctx.time })
  },
  constant: {
    category: 'source',
    inputs: [],
    outputs: [{ name: 'out', type: 'number' }],
    params: [{ name: 'value', type: 'number', default: 0 }],
    evaluate: (inputs, params, ctx) => ({ out: params.value })
  },
  sine: {
    category: 'transform',
    inputs: [
      { name: 't', type: 'number', default: 0 },
      { name: 'freq', type: 'number', default: 1 },
      { name: 'amplitude', type: 'number', default: 1 },
      { name: 'phase', type: 'number', default: 0 },
      { name: 'offset', type: 'number', default: 0 }
    ],
    outputs: [{ name: 'out', type: 'number' }],
    params: [
      { name: 'freq', type: 'number', default: 1 },
      { name: 'amplitude', type: 'number', default: 1 },
      { name: 'phase', type: 'number', default: 0 },
      { name: 'offset', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => {
      const t = inputs.t;
      const freq = inputs.freq;
      const amplitude = inputs.amplitude;
      const phase = inputs.phase;
      const offset = inputs.offset;
      return { out: Math.sin(t * freq * 2 * Math.PI + phase) * amplitude + offset };
    }
  },
  add: {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 0 }
    ],
    outputs: [{ name: 'out', type: 'number' }],
    params: [
      { name: 'a', type: 'number', default: 0 },
      { name: 'b', type: 'number', default: 0 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a + inputs.b })
  },
  multiply: {
    category: 'transform',
    inputs: [
      { name: 'a', type: 'number', default: 1 },
      { name: 'b', type: 'number', default: 1 }
    ],
    outputs: [{ name: 'out', type: 'number' }],
    params: [
      { name: 'a', type: 'number', default: 1 },
      { name: 'b', type: 'number', default: 1 }
    ],
    evaluate: (inputs, params, ctx) => ({ out: inputs.a * inputs.b })
  }
};

export class Loom {
  constructor(graph) {
    this._currentGraph = null;
    this._pendingGraph = null;
    this._sortedNodeIds = [];
    this._values = new Map();
    this._rafId = null;
    this._startTime = null;

    // グラフの検証とソートを実行
    this._loadGraphInternal(graph);
  }

  evaluateAt(time) {
    // 保留中グラフがあれば切り替え
    if (this._pendingGraph !== null) {
      this._currentGraph = this._pendingGraph;
      this._sortedNodeIds = this._pendingNodeIds;
      this._pendingGraph = null;
    }

    // グラフが設定されていなければ何もしない
    if (!this._currentGraph) return;

    const ctx = { time };

    // トポロジカルソート順に各ノードを評価
    for (const nodeId of this._sortedNodeIds) {
      const node = this._currentGraph.nodes.find(n => n.id === nodeId);
      const nodeType = NODE_TYPES[node.type];

      // 入力値の解決（エッジ → params → メタデータの default）
      const inputs = {};
      for (const inputDef of nodeType.inputs) {
        const portName = inputDef.name;
        const ref = `${nodeId}.${portName}`;

        // エッジから入力値を取得
        const edge = this._currentGraph.edges.find(e => e.to === ref);
        if (edge) {
          inputs[portName] = this._values.get(edge.from);
        } else {
          // エッジがなければ params から取得
          const paramValue = node.params && node.params[portName];
          if (paramValue !== undefined) {
            inputs[portName] = paramValue;
          } else {
            // params もなければメタデータの default から取得
            inputs[portName] = inputDef.default;
          }
        }
      }

      // パラメータ値の解決（グラフ JSON の params → ノード型メタデータの default）
      const params = {};
      for (const paramDef of nodeType.params) {
        const paramName = paramDef.name;
        const paramValue = node.params && node.params[paramName];
        if (paramValue !== undefined) {
          params[paramName] = paramValue;
        } else {
          params[paramName] = paramDef.default;
        }
      }

      // ノードを評価
      const outputs = nodeType.evaluate(inputs, params, ctx);

      // 出力値を保存
      for (const outputDef of nodeType.outputs) {
        const portName = outputDef.name;
        const ref = `${nodeId}.${portName}`;
        this._values.set(ref, outputs[portName]);
      }
    }
  }

  getValue(ref) {
    return this._values.get(ref);
  }

  load(graph) {
    // グラフを検証（エラーなら LoomError をスロー）
    this._validateGraph(graph);

    // トポロジカルソートを実行（サイクルチェック含む）
    const sortedNodeIds = this._topologicalSort(graph);

    // 保留状態で保持
    this._pendingGraph = graph;
    this._pendingNodeIds = sortedNodeIds;
  }

  start() {
    if (this._rafId !== null) return; // 既に実行中なら何もしない

    this._startTime = performance.now() / 1000;
    const tick = () => {
      const elapsed = (performance.now() / 1000) - this._startTime;
      this.evaluateAt(elapsed);
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  // 内部メソッド：グラフの検証とソート
  _loadGraphInternal(graph) {
    // グラフを検証
    this._validateGraph(graph);

    // トポロジカルソートを実行
    const sortedNodeIds = this._topologicalSort(graph);

    // 現行グラフに設定
    this._currentGraph = graph;
    this._sortedNodeIds = sortedNodeIds;
    this._pendingGraph = null;
  }

  // グラフの検証
  _validateGraph(graph) {
    // 1. graph がオブジェクトで、nodes と edges が配列か
    if (!graph || typeof graph !== 'object') {
      throw new LoomError('INVALID_GRAPH', 'Graph must be an object', { reason: 'not an object' });
    }
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new LoomError('INVALID_GRAPH', 'Graph must have nodes and edges arrays', { reason: 'nodes or edges not an array' });
    }

    // 2. ノードの ID が重複していないか
    const nodeIds = new Set();
    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        throw new LoomError('DUPLICATE_NODE_ID', `Duplicate node id: ${node.id}`, { nodeId: node.id });
      }
      nodeIds.add(node.id);
    }

    // 3. 各ノードの type が NODE_TYPES に存在するか
    for (const node of graph.nodes) {
      if (!NODE_TYPES[node.type]) {
        throw new LoomError('UNKNOWN_NODE_TYPE', `Unknown node type: ${node.type}`, { nodeId: node.id, type: node.type });
      }
    }

    // 4. 各エッジの from/to が "nodeId.portName" 形式かつ参照先のノードが存在するか
    for (const edge of graph.edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');

      if (fromParts.length !== 2) {
        throw new LoomError('INVALID_GRAPH', 'Edge from must be in format "nodeId.portName"', { reason: 'invalid edge format' });
      }
      if (toParts.length !== 2) {
        throw new LoomError('INVALID_GRAPH', 'Edge to must be in format "nodeId.portName"', { reason: 'invalid edge format' });
      }

      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];

      if (!nodeIds.has(fromNodeId)) {
        throw new LoomError('UNKNOWN_NODE', `Edge references non-existent node: ${fromNodeId}`, { nodeId: fromNodeId });
      }
      if (!nodeIds.has(toNodeId)) {
        throw new LoomError('UNKNOWN_NODE', `Edge references non-existent node: ${toNodeId}`, { nodeId: toNodeId });
      }

      // 5. 参照先のポートがノード型のメタデータに存在するか
      const fromPortName = fromParts[1];
      const toPortName = toParts[1];

      const fromNode = graph.nodes.find(n => n.id === fromNodeId);
      const fromNodeType = NODE_TYPES[fromNode.type];
      const hasFromPort = fromNodeType.outputs.some(o => o.name === fromPortName);
      if (!hasFromPort) {
        throw new LoomError('UNKNOWN_PORT', `Unknown port: ${fromNodeId}.${fromPortName}`, { nodeId: fromNodeId, port: fromPortName, side: 'output' });
      }

      const toNode = graph.nodes.find(n => n.id === toNodeId);
      const toNodeType = NODE_TYPES[toNode.type];
      const hasToPort = toNodeType.inputs.some(i => i.name === toPortName);
      if (!hasToPort) {
        throw new LoomError('UNKNOWN_PORT', `Unknown port: ${toNodeId}.${toPortName}`, { nodeId: toNodeId, port: toPortName, side: 'input' });
      }
    }

    // 6. 同じ入力ポートに2本以上のエッジが向かっていないか
    const inputEdges = new Map();
    for (const edge of graph.edges) {
      const to = edge.to;
      if (inputEdges.has(to)) {
        const toParts = to.split('.');
        throw new LoomError('DUPLICATE_INPUT_EDGE', `Multiple edges connected to input port: ${to}`, { nodeId: toParts[0], port: toParts[1] });
      }
      inputEdges.set(to, edge);
    }

    // 7. グラフにサイクルがないか
    const hasCycle = this._hasCycle(graph);
    if (hasCycle) {
      const cycleNodeIds = this._findCycleNodeIds(graph);
      throw new LoomError('CYCLE', 'Graph contains a cycle', { nodeIds: cycleNodeIds });
    }
  }

  // トポロジカルソート（Kahn のアルゴリズム）
  _topologicalSort(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 入度マップを構築
    const inDegree = new Map();
    const adjList = new Map();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];

      adjList.get(fromNodeId).push(toNodeId);
      inDegree.set(toNodeId, inDegree.get(toNodeId) + 1);
    }

    // 入度が 0 のノードをキューに追加
    const queue = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted = [];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      sorted.push(nodeId);

      for (const neighbor of adjList.get(nodeId)) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return sorted;
  }

  // サイクル検出（DFS）
  _hasCycle(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 隣接リストを構築
    const adjList = new Map();
    for (const node of nodes) {
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];
      adjList.get(fromNodeId).push(toNodeId);
    }

    // 状態：0 = 未訪問、1 = 訪問中、2 = 訪問済み
    const state = new Map();
    for (const node of nodes) {
      state.set(node.id, 0);
    }

    for (const node of nodes) {
      if (state.get(node.id) === 0) {
        if (this._hasCycleDFS(node.id, adjList, state)) {
          return true;
        }
      }
    }

    return false;
  }

  // DFS ヘルパー
  _hasCycleDFS(nodeId, adjList, state) {
    state.set(nodeId, 1);

    for (const neighbor of adjList.get(nodeId)) {
      const neighborState = state.get(neighbor);
      if (neighborState === 1) {
        return true; // サイクル検出
      }
      if (neighborState === 0) {
        if (this._hasCycleDFS(neighbor, adjList, state)) {
          return true;
        }
      }
    }

    state.set(nodeId, 2);
    return false;
  }

  // サイクルに含まれるノード ID を見つける
  _findCycleNodeIds(graph) {
    const nodes = graph.nodes;
    const edges = graph.edges;

    // 隣接リストを構築
    const adjList = new Map();
    for (const node of nodes) {
      adjList.set(node.id, []);
    }

    for (const edge of edges) {
      const fromParts = edge.from.split('.');
      const toParts = edge.to.split('.');
      const fromNodeId = fromParts[0];
      const toNodeId = toParts[0];
      adjList.get(fromNodeId).push(toNodeId);
    }

    const visited = new Set();
    const recStack = new Set();
    const cycleNodes = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      for (const neighbor of adjList.get(nodeId)) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            cycleNodes.add(nodeId);
            return true;
          }
        } else if (recStack.has(neighbor)) {
          cycleNodes.add(nodeId);
          cycleNodes.add(neighbor);
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return Array.from(cycleNodes);
  }
}
