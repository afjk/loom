// Loom SceneSync アダプタ
// SceneSync メッセージプロトコルを処理し、複数グラフの独立評価をサポート

import { LoomError } from "./loom.js";

// グローバル registry でアダプタインスタンスを管理
const adapterRegistry = new Map();
let nextAdapterId = 0;

// ノード登録済み状態を LoomClass ごとに管理
const registeredLoomClasses = new WeakSet();

export class LoomSceneSync {
  constructor({ LoomClass, send, getServerTime, resolveTarget }) {
    this.LoomClass = LoomClass;
    this.send = send;
    this.getServerTime = getServerTime;
    this.resolveTarget = resolveTarget;

    // このアダプタの一意ID
    this.adapterId = `adapter-${nextAdapterId++}`;
    adapterRegistry.set(this.adapterId, this);

    // グラフ管理
    this._sceneGraph = new LoomClass({ nodes: [], edges: [] });
    this._objectGraphs = new Map();

    // 実行状態
    this._started = false;

    // ノード型登録（冪等性を保証）
    this._registerNodeTypes();
  }

  _registerNodeTypes() {
    // 既にこの LoomClass で登録済みならスキップ
    if (registeredLoomClasses.has(this.LoomClass)) {
      return;
    }

    const LoomClass = this.LoomClass;

    // serverClock ノード
    LoomClass.registerNodeType("serverClock", {
      category: "source",
      inputs: [],
      outputs: [{ name: "t", type: "number", kind: "behavior" }],
      params: [{ name: "adapterId", type: "string", default: "" }],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        const t = adapter ? adapter.getServerTime() : 0;
        return { t };
      }
    });

    // SceneSync sink ノード：setPosition
    LoomClass.registerNodeType("sceneSetPosition", {
      category: "sink",
      inputs: [
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "y", type: "number", default: 0, kind: "behavior" },
        { name: "z", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "adapterId", type: "string", default: "" }
      ],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        if (!adapter) return {};
        const obj = adapter.resolveTarget(params.target);
        if (obj && obj.position && typeof obj.position.set === "function") {
          obj.position.set(inputs.x, inputs.y, inputs.z);
        }
        return {};
      }
    });

    // SceneSync sink ノード：setRotation
    LoomClass.registerNodeType("sceneSetRotation", {
      category: "sink",
      inputs: [
        { name: "x", type: "number", default: 0, kind: "behavior" },
        { name: "y", type: "number", default: 0, kind: "behavior" },
        { name: "z", type: "number", default: 0, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "adapterId", type: "string", default: "" }
      ],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        if (!adapter) return {};
        const obj = adapter.resolveTarget(params.target);
        if (obj && obj.rotation && typeof obj.rotation.set === "function") {
          obj.rotation.set(inputs.x, inputs.y, inputs.z);
        }
        return {};
      }
    });

    // SceneSync sink ノード：setScale
    LoomClass.registerNodeType("sceneSetScale", {
      category: "sink",
      inputs: [
        { name: "x", type: "number", default: 1, kind: "behavior" },
        { name: "y", type: "number", default: 1, kind: "behavior" },
        { name: "z", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "adapterId", type: "string", default: "" }
      ],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        if (!adapter) return {};
        const obj = adapter.resolveTarget(params.target);
        if (obj && obj.scale && typeof obj.scale.set === "function") {
          obj.scale.set(inputs.x, inputs.y, inputs.z);
        }
        return {};
      }
    });

    // SceneSync sink ノード：setColor
    LoomClass.registerNodeType("sceneSetColor", {
      category: "sink",
      inputs: [
        { name: "r", type: "number", default: 1, kind: "behavior" },
        { name: "g", type: "number", default: 1, kind: "behavior" },
        { name: "b", type: "number", default: 1, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "adapterId", type: "string", default: "" }
      ],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        if (!adapter) return {};
        const obj = adapter.resolveTarget(params.target);
        const material = Array.isArray(obj?.material) ? obj.material[0] : obj?.material;
        if (material && material.color && typeof material.color.setRGB === "function") {
          material.color.setRGB(inputs.r, inputs.g, inputs.b);
        }
        return {};
      }
    });

    // SceneSync sink ノード：setVisible
    LoomClass.registerNodeType("sceneSetVisible", {
      category: "sink",
      inputs: [
        { name: "visible", type: "boolean", default: true, kind: "behavior" }
      ],
      outputs: [],
      params: [
        { name: "target", type: "string", default: "" },
        { name: "adapterId", type: "string", default: "" }
      ],
      evaluate: (inputs, params) => {
        const adapter = adapterRegistry.get(params.adapterId);
        if (!adapter) return {};
        const obj = adapter.resolveTarget(params.target);
        if (obj) {
          obj.visible = Boolean(inputs.visible);
        }
        return {};
      }
    });

    registeredLoomClasses.add(LoomClass);
  }

  handleMessage(msg) {
    if (!msg || typeof msg !== "object") {
      throw new LoomError("INVALID_MESSAGE", "Message must be an object", { reason: "not an object" });
    }

    switch (msg.type) {
      case "scene-graph-set":
        this._handleGraphSet(msg);
        break;
      case "scene-graph-clear":
        this._handleGraphClear(msg);
        break;
      case "scene-graph-patch":
        this._handleGraphPatch(msg);
        break;
      case "scene-graph-input":
        this._handleGraphInput(msg);
        break;
      default:
        throw new LoomError("INVALID_MESSAGE", `Unknown message type: ${msg.type}`, { type: msg.type });
    }
  }

  _validateScope(scope) {
    if (typeof scope === "string" && scope === "scene") {
      return;
    }
    if (typeof scope === "object" && scope !== null && typeof scope.object === "string") {
      return;
    }
    throw new LoomError("INVALID_SCOPE", "scope must be 'scene' or { object: targetId }", { scope });
  }

  _injectAdapterId(graph) {
    if (!graph || typeof graph !== "object" || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new LoomError("INVALID_GRAPH", "graph must have nodes and edges arrays", { reason: "invalid graph" });
    }

    // グラフをコピー（元を破壊しない）
    const nodes = graph.nodes.map(node => {
      const nodeId = node.type;
      if (!["serverClock", "sceneSetPosition", "sceneSetRotation", "sceneSetScale", "sceneSetColor", "sceneSetVisible"].includes(nodeId)) {
        return node;
      }

      // adapterId を注入
      const newNode = { ...node };
      newNode.params = { ...(node.params || {}), adapterId: this.adapterId };
      return newNode;
    });

    return { nodes, edges: graph.edges };
  }

  _handleGraphSet(msg) {
    this._validateScope(msg.scope);

    if (!msg.graph || typeof msg.graph !== "object") {
      throw new LoomError("INVALID_GRAPH", "graph field is required", { reason: "missing graph" });
    }

    const injectedGraph = this._injectAdapterId(msg.graph);

    if (typeof msg.scope === "string" && msg.scope === "scene") {
      // シーングラフの置き換え
      this._sceneGraph.stop();
      this._sceneGraph = new this.LoomClass(injectedGraph);
      if (this._started) {
        this._sceneGraph.start();
      }
    } else {
      // オブジェクト単位グラフ
      const targetId = msg.scope.object;
      if (this._objectGraphs.has(targetId)) {
        this._objectGraphs.get(targetId).stop();
      }
      const engine = new this.LoomClass(injectedGraph);
      this._objectGraphs.set(targetId, engine);
      if (this._started) {
        engine.start();
      }
    }
  }

  _handleGraphClear(msg) {
    this._validateScope(msg.scope);

    if (typeof msg.scope === "string" && msg.scope === "scene") {
      // シーングラフをクリア
      this._sceneGraph.stop();
      this._sceneGraph = new this.LoomClass({ nodes: [], edges: [] });
    } else {
      // オブジェクト単位グラフをクリア
      const targetId = msg.scope.object;
      if (this._objectGraphs.has(targetId)) {
        this._objectGraphs.get(targetId).stop();
        this._objectGraphs.delete(targetId);
      }
    }
  }

  _handleGraphPatch(msg) {
    this._validateScope(msg.scope);

    // Phase 1 では graph フィールドがあれば scene-graph-set と等価に処理
    if (msg.graph) {
      this._handleGraphSet({
        type: "scene-graph-set",
        scope: msg.scope,
        graph: msg.graph
      });
    } else {
      throw new LoomError("INVALID_GRAPH", "graph field is required for scene-graph-patch", { reason: "missing graph" });
    }
  }

  _handleGraphInput(msg) {
    // Phase 1 では no-op。入力は各クライアントでローカル評価
    console.warn("scene-graph-input is not yet supported. Phase 2 での実装予定です。");
  }

  start() {
    this._started = true;
    this._sceneGraph.start();
    for (const engine of this._objectGraphs.values()) {
      engine.start();
    }
  }

  stop() {
    this._started = false;
    this._sceneGraph.stop();
    for (const engine of this._objectGraphs.values()) {
      engine.stop();
    }
  }

  sendGraph(scope, graph) {
    this.send({
      type: "scene-graph-set",
      scope,
      graph
    });
  }

  clearGraph(scope) {
    this.send({
      type: "scene-graph-clear",
      scope
    });
  }
}
