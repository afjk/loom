import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { ReactPlugin, Presets } from 'rete-react-plugin';
import { NODE_TYPES } from '../../src/loom.js';
import {
  connectionToAddEdgeOp,
  translateToMoveNodeOp,
  controlValueToUpdateParamOp
} from './rete-operation-helpers.js';

const socket = new ClassicPreset.Socket('value');

function getPortName(port) {
  return typeof port === 'string' ? port : port.name;
}

function createReteNode(editorNode, onControl) {
  const nodeTypeDef = NODE_TYPES[editorNode.type];
  const node = new ClassicPreset.Node(editorNode.type);
  node.id = editorNode.id;

  if (nodeTypeDef) {
    for (const input of nodeTypeDef.inputs || []) {
      const name = getPortName(input);
      node.addInput(name, new ClassicPreset.Input(socket, name));
    }
    for (const output of nodeTypeDef.outputs || []) {
      const name = getPortName(output);
      node.addOutput(name, new ClassicPreset.Output(socket, name));
    }
  }

  const paramDefs = nodeTypeDef?.params || [];
  for (const [key, value] of Object.entries(editorNode.params || {})) {
    const paramDef = paramDefs.find(p => p.name === key);
    const controlType = (paramDef?.type === 'number' || typeof value === 'number') ? 'number' : 'text';
    const ctrl = new ClassicPreset.InputControl(controlType, {
      initial: value,
      change(v) {
        onControl(controlValueToUpdateParamOp(editorNode.id, key, v, controlType));
      }
    });
    node.addControl(key, ctrl);
  }

  return node;
}

export class NodeEditorView {
  constructor(container, { onOperation, onError, onSelectNode } = {}) {
    this.container = container;
    this.onOperation = onOperation || (() => {});
    this.onError = onError || ((e) => console.error('NodeEditorView:', e));
    this.onSelectNode = onSelectNode || (() => {});
    this.isRendering = false;
    this.connectionMap = new Map();
    this._renderLock = null;

    this.editor = new NodeEditor();
    this.area = new AreaPlugin(this.container);
    this.connectionPlugin = new ConnectionPlugin();
    this.renderPlugin = new ReactPlugin();

    this.renderPlugin.addPreset(Presets.classic.setup());
    this.connectionPlugin.addPreset(ConnectionPresets.classic.setup());

    this.editor.use(this.area);
    this.area.use(this.connectionPlugin);
    this.area.use(this.renderPlugin);

    this._setupPipes();
  }

  _setupPipes() {
    this.editor.addPipe((context) => {
      if (!this.isRendering) {
        if (context.type === 'connectioncreated') {
          this._onConnectionCreated(context.data);
        } else if (context.type === 'connectionremoved') {
          this._onConnectionRemoved(context.data);
        }
      }
      return context;
    });

    this.area.addPipe((context) => {
      if (!this.isRendering && context.type === 'nodetranslated') {
        this._onNodeTranslated(context.data);
      }

      if (!this.isRendering && context.type === 'nodepicked') {
        const nodeId = context.data?.id;
        if (nodeId && this.editor.getNode(nodeId)) {
          this.onSelectNode(nodeId);
        }
      }

      return context;
    });
  }

  _onConnectionCreated(connection) {
    try {
      const edgeId = `${connection.source}.${connection.sourceOutput}->${connection.target}.${connection.targetInput}`;
      this.connectionMap.set(connection.id, edgeId);
      this.onOperation(connectionToAddEdgeOp(connection));
    } catch (e) {
      this.onError(e);
    }
  }

  _onConnectionRemoved(connection) {
    const edgeId = this.connectionMap.get(connection.id);
    if (edgeId) {
      this.connectionMap.delete(connection.id);
      this.onOperation({ type: 'removeEdge', edgeId });
    }
  }

  _onNodeTranslated(data) {
    this.onOperation(translateToMoveNodeOp(data));
  }

  async renderModel(editorModel) {
    if (this._renderLock) {
      await this._renderLock;
    }

    let resolve;
    this._renderLock = new Promise(r => { resolve = r; });
    this.isRendering = true;
    this.connectionMap.clear();

    try {
      await this.editor.clear();

      for (const nodeId of editorModel.order) {
        const node = editorModel.nodesById[nodeId];
        if (!node) continue;
        const reteNode = createReteNode(node, (op) => {
          if (!this.isRendering) {
            this.onOperation(op);
          }
        });
        await this.editor.addNode(reteNode);
        const pos = node.position ?? { x: 0, y: 0 };
        await this.area.translate(reteNode.id, { x: pos.x, y: pos.y });
      }

      for (const edge of Object.values(editorModel.edgesById)) {
        const sourceNode = this.editor.getNode(edge.fromNodeId);
        const targetNode = this.editor.getNode(edge.toNodeId);
        if (!sourceNode || !targetNode) continue;
        try {
          const conn = new ClassicPreset.Connection(
            sourceNode, edge.fromPort,
            targetNode, edge.toPort
          );
          await this.editor.addConnection(conn);
          this.connectionMap.set(conn.id, edge.id);
        } catch (e) {
          console.warn('renderModel: skipping connection', edge.id, e.message);
        }
      }
    } finally {
      this.isRendering = false;
      resolve();
      this._renderLock = null;
    }
  }

  destroy() {
    this.area.destroy();
    this.container.innerHTML = '';
  }
}
