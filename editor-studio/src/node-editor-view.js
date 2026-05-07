import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { ReactPlugin, Presets } from 'rete-react-plugin';
import { NODE_TYPES } from '../../src/loom.js';
import {
  connectionToAddEdgeOp,
  translateToMoveNodeOp,
  controlValueToUpdateParamOp
} from './rete-operation-helpers.js';
import {
  cloneEditorModelSnapshot,
  canPatchEditorModel,
  getAddedNodeIds,
  getRemovedNodeIds,
  getCommonNodeIds,
  getAddedEdgeIds,
  getRemovedEdgeIds,
  shouldRecreateNode,
  sameParams,
  samePosition
} from './node-editor-view-diff.js';

const socket = new ClassicPreset.Socket('value');

function getPortName(port) {
  return typeof port === 'string' ? port : port.name;
}

function getNormalizedLabelValue(value) {
  const text = String(value ?? '');
  return text.trim() === '' ? null : text;
}

function createReteNode(editorNode, onControl) {
  const nodeTypeDef = NODE_TYPES[editorNode.type];
  const displayLabel = editorNode.label || editorNode.type;
  const node = new ClassicPreset.Node(displayLabel);
  node.id = editorNode.id;
  node._editorNode = editorNode;

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


function findReteConnectionIdByEdgeId(connectionMap, edgeId) {
  for (const [connectionId, mappedEdgeId] of connectionMap.entries()) {
    if (mappedEdgeId === edgeId) return connectionId;
  }
  return null;
}

// --- NodeEditorView ---

export class NodeEditorView {
  constructor(container, { onOperation, onError, onSelectNode } = {}) {
    this.container = container;
    this.onOperation = onOperation || (() => {});
    this.onError = onError || ((e) => console.error('NodeEditorView:', e));
    this.onSelectNode = onSelectNode || (() => {});
    this.isRendering = false;
    this.connectionMap = new Map();
    this._renderLock = null;
    this.currentEditorModel = null;

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
    this._setupInlineLabelEditing();
  }

  _setupInlineLabelEditing() {
    if (!this.area || !this.container) return;

    this.container.addEventListener('dblclick', (event) => {
      const titleElement = this._findNodeTitleElement(event.target);
      if (!titleElement || titleElement.querySelector('input')) return;

      const nodeId = this._findNodeIdFromTitle(titleElement);
      if (!nodeId) return;

      this._startInlineNodeLabelEditing(nodeId, titleElement);
    }, true);
  }

  _findNodeTitleElement(target) {
    let element = target;
    while (element) {
      if (element.tagName === 'H2' && element.closest('[class*="node"]')) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  _findNodeIdFromTitle(titleElement) {
    const nodeElement = titleElement.closest('[class*="node"]');
    if (!nodeElement) return null;

    // 試み1: data-node-id属性を探す（もしあれば）
    const dataNodeId = nodeElement.getAttribute('data-node-id');
    if (dataNodeId) return dataNodeId;

    // 試み2: Rete nodeViews から逆引き
    if (this.area?.nodeViews instanceof Map) {
      for (const [nodeId, view] of this.area.nodeViews) {
        if (view && view.element === nodeElement) {
          return nodeId;
        }
      }
    }

    // 試み3: Rete editor のノードを列挙して近似マッチ
    if (this.editor && titleElement.textContent) {
      const labelText = titleElement.textContent.trim();
      for (const node of this.editor.getNodes()) {
        if (node.label === labelText || node.id === labelText) {
          return node.id;
        }
      }
    }

    return null;
  }

  _startInlineNodeLabelEditing(nodeId, titleElement) {
    const node = this.editor.getNode(nodeId);
    if (!node || !node._editorNode) return;

    const editorNode = node._editorNode;
    const initialValue = editorNode.label || '';

    const input = document.createElement('input');
    input.className = 'node-label-input';
    input.type = 'text';
    input.value = initialValue;
    input.placeholder = editorNode.id;
    input.spellcheck = false;

    let isEditingActive = true;

    const handleBlur = () => {
      if (isEditingActive) {
        commit();
      }
    };

    const handleKeydown = (event) => {
      event.stopPropagation();

      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        cancel();
      }
    };

    const handlePointerdown = (event) => {
      event.stopPropagation();
    };

    const handleClick = (event) => {
      event.stopPropagation();
    };

    const handleDblclick = (event) => {
      event.stopPropagation();
    };

    const commit = () => {
      if (!isEditingActive) return;
      isEditingActive = false;

      const nextLabel = getNormalizedLabelValue(input.value);
      const currentLabel = getNormalizedLabelValue(initialValue);

      if (nextLabel !== currentLabel && this.onOperation) {
        this.onOperation({
          type: 'updateNodeMetadata',
          id: nodeId,
          patch: { label: nextLabel }
        });
      }

      cleanup();
    };

    const cancel = () => {
      if (!isEditingActive) return;
      isEditingActive = false;
      cleanup();
    };

    const cleanup = () => {
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('keydown', handleKeydown);
      input.removeEventListener('pointerdown', handlePointerdown);
      input.removeEventListener('click', handleClick);
      input.removeEventListener('dblclick', handleDblclick);
      input.remove();
      titleElement.style.display = '';
    };

    input.addEventListener('blur', handleBlur);
    input.addEventListener('keydown', handleKeydown);
    input.addEventListener('pointerdown', handlePointerdown);
    input.addEventListener('click', handleClick);
    input.addEventListener('dblclick', handleDblclick);

    titleElement.style.display = 'none';
    const parent = titleElement.parentElement;
    if (parent) {
      parent.insertBefore(input, titleElement);
    }
    input.focus();
    input.select();
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

  async _addReteNode(editorNode) {
    const reteNode = createReteNode(editorNode, (op) => {
      if (!this.isRendering) {
        this.onOperation(op);
      }
    });

    await this.editor.addNode(reteNode);

    const pos = editorNode.position ?? { x: 0, y: 0 };
    await this.area.translate(reteNode.id, { x: pos.x, y: pos.y });

    return reteNode;
  }

  async _addReteConnection(edge) {
    const sourceNode = this.editor.getNode(edge.fromNodeId);
    const targetNode = this.editor.getNode(edge.toNodeId);

    if (!sourceNode || !targetNode) return false;

    try {
      const conn = new ClassicPreset.Connection(
        sourceNode,
        edge.fromPort,
        targetNode,
        edge.toPort
      );

      await this.editor.addConnection(conn);
      this.connectionMap.set(conn.id, edge.id);
      return true;
    } catch (e) {
      console.warn('renderModel: skipping connection', edge.id, e.message);
      return false;
    }
  }

  async _removeReteConnectionByEdgeId(edgeId) {
    const connectionId = findReteConnectionIdByEdgeId(this.connectionMap, edgeId);
    if (!connectionId) return false;

    const connection = this.editor.getConnection(connectionId);
    if (!connection) {
      this.connectionMap.delete(connectionId);
      return false;
    }

    await this.editor.removeConnection(connection.id);
    this.connectionMap.delete(connectionId);
    return true;
  }

  async _removeReteNode(nodeId) {
    const node = this.editor.getNode(nodeId);
    if (!node) return false;

    await this.editor.removeNode(nodeId);
    return true;
  }

  async _renderModelFull(editorModel) {
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
        await this._addReteNode(node);
      }

      for (const edge of Object.values(editorModel.edgesById)) {
        await this._addReteConnection(edge);
      }
    } finally {
      this.isRendering = false;
      resolve();
      this._renderLock = null;
    }
  }

  async _patchModel(previous, next) {
    if (this._renderLock) {
      await this._renderLock;
    }

    let resolve;
    this._renderLock = new Promise(r => { resolve = r; });
    this.isRendering = true;

    try {
      const removedNodeIds = getRemovedNodeIds(previous, next);
      const addedNodeIds = getAddedNodeIds(previous, next);
      const commonNodeIds = getCommonNodeIds(previous, next);

      const recreateNodeIds = new Set();

      for (const nodeId of commonNodeIds) {
        const prevNode = previous.nodesById[nodeId];
        const nextNode = next.nodesById[nodeId];

        if (
          shouldRecreateNode(prevNode, nextNode) ||
          !sameParams(prevNode.params, nextNode.params)
        ) {
          recreateNodeIds.add(nodeId);
        }
      }

      const removedEdgeIds = new Set(getRemovedEdgeIds(previous, next));
      const addedEdgeIds = new Set(getAddedEdgeIds(previous, next));

      for (const edge of Object.values(previous.edgesById || {})) {
        if (
          removedNodeIds.includes(edge.fromNodeId) ||
          removedNodeIds.includes(edge.toNodeId) ||
          recreateNodeIds.has(edge.fromNodeId) ||
          recreateNodeIds.has(edge.toNodeId)
        ) {
          removedEdgeIds.add(edge.id);
        }
      }

      for (const edgeId of removedEdgeIds) {
        await this._removeReteConnectionByEdgeId(edgeId);
      }

      for (const nodeId of removedNodeIds) {
        await this._removeReteNode(nodeId);
      }

      for (const nodeId of recreateNodeIds) {
        await this._removeReteNode(nodeId);
        await this._addReteNode(next.nodesById[nodeId]);
      }

      for (const nodeId of addedNodeIds) {
        await this._addReteNode(next.nodesById[nodeId]);
      }

      for (const nodeId of commonNodeIds) {
        if (recreateNodeIds.has(nodeId)) continue;

        const prevNode = previous.nodesById[nodeId];
        const nextNode = next.nodesById[nodeId];

        if (!samePosition(prevNode.position, nextNode.position)) {
          const pos = nextNode.position ?? { x: 0, y: 0 };
          await this.area.translate(nodeId, { x: pos.x, y: pos.y });
        }
      }

      for (const edge of Object.values(next.edgesById || {})) {
        if (
          addedEdgeIds.has(edge.id) ||
          recreateNodeIds.has(edge.fromNodeId) ||
          recreateNodeIds.has(edge.toNodeId)
        ) {
          await this._addReteConnection(edge);
        }
      }
    } finally {
      this.isRendering = false;
      resolve();
      this._renderLock = null;
    }
  }

  async renderModel(editorModel, { force = false } = {}) {
    if (force || !this.currentEditorModel) {
      await this._renderModelFull(editorModel);
      this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
      return;
    }

    const canPatch = canPatchEditorModel(this.currentEditorModel, editorModel);
    if (!canPatch) {
      await this._renderModelFull(editorModel);
      this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
      return;
    }

    try {
      await this._patchModel(this.currentEditorModel, editorModel);
    } catch (error) {
      console.warn('incremental render failed; falling back to full render', error);
      await this._renderModelFull(editorModel);
    }

    this.currentEditorModel = cloneEditorModelSnapshot(editorModel);
  }

  async focusNode(nodeId) {
    if (!nodeId || !this.editor || !this.area) {
      return false;
    }

    try {
      const node = this.editor.getNode(nodeId);
      if (!node) return false;

      await AreaExtensions.zoomAt(this.area, [node]);
      return true;
    } catch (e) {
      console.warn('focusNode failed:', e.message);
      return false;
    }
  }

  destroy() {
    this.area.destroy();
    this.container.innerHTML = '';
    this.currentEditorModel = null;
  }
}
