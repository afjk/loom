import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { ReactPlugin, Presets } from 'rete-react-plugin';
import { NODE_TYPES } from '../../src/loom.js';
import { extractFormulaVars } from '../../src/nodes/math.js';
import { formatValuePreview } from '../../src/value-preview.js';
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
const VALUE_PREVIEW_CONTROL_KEY = '__preview';

function getPortName(port) {
  return typeof port === 'string' ? port : port.name;
}

function getNodeControl(node, key) {
  if (!node?.controls) return null;
  if (typeof node.controls.get === 'function') {
    return node.controls.get(key);
  }
  return node.controls[key] ?? null;
}

function createReteNode(editorNode, onControl, previewText) {
  const nodeTypeDef = NODE_TYPES[editorNode.type];
  const displayLabel = editorNode.label || editorNode.type;
  const node = new ClassicPreset.Node(displayLabel);
  node.id = editorNode.id;
  node._editorNode = editorNode;

  if (nodeTypeDef) {
    let inputDefs;
    if (nodeTypeDef.dynamicInputs) {
      const ports = editorNode.inputPorts
        || (editorNode.params?.formula ? extractFormulaVars(editorNode.params.formula) : []);
      inputDefs = ports.map(name => ({ name }));
    } else {
      inputDefs = nodeTypeDef.inputs || [];
    }
    for (const input of inputDefs) {
      const name = getPortName(input);
      node.addInput(name, new ClassicPreset.Input(socket, name));
    }
    for (const output of nodeTypeDef.outputs || []) {
      const name = getPortName(output);
      node.addOutput(name, new ClassicPreset.Output(socket, name));
    }
  } else if (editorNode.inputPorts || editorNode.outputPorts) {
    for (const name of editorNode.inputPorts || []) {
      node.addInput(name, new ClassicPreset.Input(socket, name));
    }
    for (const name of editorNode.outputPorts || []) {
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
        onControl({
          ...controlValueToUpdateParamOp(editorNode.id, key, v, controlType),
          source: 'nodeEditorControl'
        });
      }
    });
    node.addControl(key, ctrl);
  }

  if (previewText !== null) {
    node.addControl(VALUE_PREVIEW_CONTROL_KEY, new ClassicPreset.InputControl('text', {
      initial: previewText,
      readonly: true
    }));
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
  constructor(container, { onOperation, onError, onSelectNode, onContextMenu } = {}) {
    this.container = container;
    this.onOperation = onOperation || (() => {});
    this.onError = onError || ((e) => console.error('NodeEditorView:', e));
    this.onSelectNode = onSelectNode || (() => {});
    this.onContextMenu = onContextMenu || (() => {});
    this.isRendering = false;
    this.connectionMap = new Map();
    this._renderLock = null;
    this.currentEditorModel = null;
    this._valuePreviewEnabled = true;
    this._nodeValuePreviews = new Map();

    this.editor = new NodeEditor();
    this.area = new AreaPlugin(this.container);
    this.connectionPlugin = new ConnectionPlugin();
    this.renderPlugin = new ReactPlugin();

    this.renderPlugin.addPreset(Presets.classic.setup());
    this.connectionPlugin.addPreset(ConnectionPresets.classic.setup());

    this.editor.use(this.area);
    this.area.use(this.connectionPlugin);
    this.area.use(this.renderPlugin);

    this.selector = AreaExtensions.selector();
    this.nodeSelector = AreaExtensions.selectableNodes(this.area, this.selector, {
      accumulating: AreaExtensions.accumulateOnCtrl()
    });
    AreaExtensions.simpleNodesOrder(this.area);

    this._setupPipes();
    this._setupContextMenu();
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

  _setupContextMenu() {
    this._contextMenuHandler = (event) => {
      event.preventDefault();
      const nodeId = this._findNodeIdFromEventTarget(event.target);
      this.onContextMenu({
        clientX: event.clientX,
        clientY: event.clientY,
        graphPosition: this.clientPointToGraph(event.clientX, event.clientY),
        nodeId
      });
    };
    this.container.addEventListener('contextmenu', this._contextMenuHandler);
    this._setupLongPress();
  }

  // Touch devices have no right-click, so a long-press opens the same context
  // menu. Cancels if the finger moves (a drag/pan) or lifts before the delay.
  _setupLongPress() {
    const LONG_PRESS_MS = 500;
    const MOVE_CANCEL_PX = 12;
    let timer = null;
    let startX = 0;
    let startY = 0;
    let startTarget = null;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const onPointerDown = (event) => {
      if (event.pointerType !== 'touch') return;
      startX = event.clientX;
      startY = event.clientY;
      startTarget = event.target;
      clear();
      timer = setTimeout(() => {
        timer = null;
        const nodeId = this._findNodeIdFromEventTarget(startTarget);
        this.onContextMenu({
          clientX: startX,
          clientY: startY,
          graphPosition: this.clientPointToGraph(startX, startY),
          nodeId
        });
      }, LONG_PRESS_MS);
    };

    const onPointerMove = (event) => {
      if (!timer) return;
      if (Math.abs(event.clientX - startX) > MOVE_CANCEL_PX ||
          Math.abs(event.clientY - startY) > MOVE_CANCEL_PX) {
        clear();
      }
    };

    // Capture phase: rete's NodeView drag handler calls stopPropagation() on the
    // node element's pointerdown, so a bubble-phase listener on the container
    // would never see a press that lands on a node. Capturing runs the container
    // listener first, so long-press works on nodes (Inspect/Delete) too.
    this._longPress = { onPointerDown, onPointerMove, clear };
    this.container.addEventListener('pointerdown', onPointerDown, true);
    this.container.addEventListener('pointermove', onPointerMove, true);
    this.container.addEventListener('pointerup', clear, true);
    this.container.addEventListener('pointercancel', clear, true);
  }

  _findNodeIdFromEventTarget(target) {
    if (!target || !this.area?.nodeViews) return null;
    for (const [nodeId, view] of this.area.nodeViews) {
      if (view.element === target || view.element.contains(target)) {
        return nodeId;
      }
    }
    return null;
  }

  clientPointToGraph(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const { x, y, k } = this.area.area.transform;
    return {
      x: (clientX - rect.left - x) / k,
      y: (clientY - rect.top - y) / k
    };
  }

  getSelectedNodeIds() {
    return this.editor.getNodes().filter((node) => node.selected).map((node) => node.id);
  }

  async setSelection(nodeIds = []) {
    const ids = new Set(nodeIds);

    for (const node of this.editor.getNodes()) {
      if (node.selected && !ids.has(node.id)) {
        await this.nodeSelector.unselect(node.id);
      }
    }

    for (const id of ids) {
      const node = this.editor.getNode(id);
      if (node && !node.selected) {
        await this.nodeSelector.select(id, true);
      }
    }
  }

  async zoomToFit() {
    const nodes = this.editor.getNodes();
    if (nodes.length === 0) return false;

    try {
      await AreaExtensions.zoomAt(this.area, nodes);
      return true;
    } catch (e) {
      console.warn('zoomToFit failed:', e.message);
      return false;
    }
  }

  async zoomBy(factor) {
    const area = this.area.area;
    const { x, y, k } = area.transform;
    const nextK = Math.min(2.5, Math.max(0.1, k * factor));
    if (nextK === k) return;

    const rect = this.container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    await area.zoom(nextK, 0, 0);
    await area.translate(cx - ((cx - x) * nextK) / k, cy - ((cy - y) * nextK) / k);
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
    }, this._getNodePreviewText(editorNode.id));

    await this.editor.addNode(reteNode);

    const pos = editorNode.position ?? { x: 0, y: 0 };
    await this.area.translate(reteNode.id, { x: pos.x, y: pos.y });

    return reteNode;
  }

  _getNodePreviewText(nodeId) {
    if (!this._valuePreviewEnabled) return null;
    if (!this._nodeValuePreviews.has(nodeId)) return '—';
    return formatValuePreview(this._nodeValuePreviews.get(nodeId));
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

  setNodeValuePreviews(previews) {
    if (previews instanceof Map) {
      this._nodeValuePreviews = previews;
    } else if (previews && typeof previews === 'object') {
      this._nodeValuePreviews = new Map(Object.entries(previews));
    } else {
      this._nodeValuePreviews = new Map();
    }

    if (!this._valuePreviewEnabled) return;
    if (!this.currentEditorModel) return;

    for (const nodeId of this.currentEditorModel.order || []) {
      const node = this.editor.getNode(nodeId);
      if (!node) continue;
      const control = getNodeControl(node, VALUE_PREVIEW_CONTROL_KEY);
      if (!control) continue;

      const nextText = this._getNodePreviewText(nodeId);
      if (control.value === nextText) continue;
      control.setValue(nextText);
      this.area?.update?.('control', control.id);
    }
  }

  async setValuePreviewEnabled(enabled) {
    const nextEnabled = enabled !== false;
    if (this._valuePreviewEnabled === nextEnabled) return;
    this._valuePreviewEnabled = nextEnabled;
    if (!this.currentEditorModel) return;
    await this.renderModel(this.currentEditorModel, { force: true });
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
    if (this._contextMenuHandler) {
      this.container.removeEventListener('contextmenu', this._contextMenuHandler);
      this._contextMenuHandler = null;
    }
    if (this._longPress) {
      this._longPress.clear();
      this.container.removeEventListener('pointerdown', this._longPress.onPointerDown, true);
      this.container.removeEventListener('pointermove', this._longPress.onPointerMove, true);
      this.container.removeEventListener('pointerup', this._longPress.clear, true);
      this.container.removeEventListener('pointercancel', this._longPress.clear, true);
      this._longPress = null;
    }
    this.area.destroy();
    this.container.innerHTML = '';
    this.currentEditorModel = null;
  }
}
