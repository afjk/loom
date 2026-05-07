import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';

import { Loom, NODE_TYPES } from '../../src/loom.js';
import { parseDSLToAST, compileToGraph } from '../../src/loom-dsl.js';
import {
  graphToEditorModel,
  editorModelToGraph,
  applyNodeEditorOperationState
} from '../../src/node-editor-core.js';
import { graphToCanonicalDSL } from './canonical-dsl.js';
import { createStore } from './studio-store.js';
import { NodeEditorView } from './node-editor-view.js';
import {
  normalizeEditorCategory,
  createDefaultParamsForNodeType,
  createNodeIdFromType,
  createPositionForNewNode,
  getNodeTypeEntries
} from './node-palette-model.js';

const SAMPLE_DSL = `t = clock()
wave = sine(t, freq: 0.35)
smooth = smoothLerp(wave, rate: 5, initial: 0)
width = map(smooth, inMin: -1, inMax: 1, outMin: 80, outMax: 680, clamp: true)

render bar(width: width, color: "#80ed99", height: 48)
`;

const store = createStore();
let dslEditor = null;
let nodeEditor = null;
let engine = null;
let animationFrameId = null;
let panelsVisible = true;
let selectedNodeId = null;
let currentFileHandle = null;
let currentFileName = '';
let isDirty = false;
let isApplyingProgrammaticDslChange = false;
let hasUnsyncedDslText = false;

const elements = {
  dslEditorHost: document.getElementById('dsl-editor-host'),
  nodeEditorHost: document.getElementById('node-editor'),
  previewCanvas: document.getElementById('preview-canvas'),
  graphJson: document.getElementById('graph-json'),
  errorsList: document.getElementById('errors-list'),
  inspectorPanel: document.getElementById('inspector-panel'),
  applyDslBtn: document.getElementById('applyDslBtn'),
  generateDslBtn: document.getElementById('generateDslBtn'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  resetSampleBtn: document.getElementById('resetSampleBtn'),
  togglePanelsBtn: document.getElementById('toggle-panels'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  fileStatus: document.getElementById('file-status'),
  openFileBtn: document.getElementById('openFileBtn'),
  saveFileBtn: document.getElementById('saveFileBtn'),
  saveAsFileBtn: document.getElementById('saveAsFileBtn'),
  nodePaletteSearch: document.getElementById('node-palette-search'),
  nodePaletteCategory: document.getElementById('node-palette-category'),
  nodePaletteList: document.getElementById('node-palette-list')
};

function setPanelsVisible(visible) {
  panelsVisible = visible;
  document.body.classList.toggle('panels-hidden', !visible);

  const button = elements.togglePanelsBtn;
  if (button) {
    button.textContent = visible ? 'Hide Editors' : 'Show Editors';
  }
}

function resizePreviewCanvas() {
  const canvas = elements.previewCanvas;
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function initDslEditor() {
  const initialState = EditorState.create({
    doc: SAMPLE_DSL,
    extensions: [
      keymap.of(defaultKeymap),
      lineNumbers(),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' }
      }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        if (isApplyingProgrammaticDslChange) return;

        hasUnsyncedDslText = true;
        setDirty(true);
      })
    ]
  });

  dslEditor = new EditorView({
    state: initialState,
    parent: elements.dslEditorHost
  });
}

function getDslText() {
  return dslEditor ? dslEditor.state.doc.toString() : '';
}

function setDslText(text) {
  if (!dslEditor) return;

  const changes = dslEditor.state.doc.length > 0
    ? { from: 0, to: dslEditor.state.doc.length, insert: text }
    : { from: 0, insert: text };

  isApplyingProgrammaticDslChange = true;
  try {
    dslEditor.dispatch({ changes });
  } finally {
    isApplyingProgrammaticDslChange = false;
  }
}

function setDirty(dirty) {
  isDirty = dirty;
  renderFileStatus();
}

function renderFileStatus() {
  const label = currentFileName || 'No file';
  const dirtyMark = isDirty ? ' *' : '';
  elements.fileStatus.textContent = `${label}${dirtyMark}`;
}

function isAbortError(error) {
  return error && (error.name === 'AbortError' || error.code === 20);
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getCurrentSavePayload() {
  if (hasUnsyncedDslText) {
    return {
      text: getDslText(),
      source: 'dsl'
    };
  }

  const state = store.getState();

  if (state.editorModel) {
    const graph = editorModelToGraph(state.editorModel, state.graph);
    return {
      text: graphToCanonicalDSL(graph),
      source: 'graph'
    };
  }

  return {
    text: getDslText(),
    source: 'dsl'
  };
}

async function saveDslAsFile() {
  try {
    const payload = getCurrentSavePayload();
    const text = payload.text;

    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: currentFileName || 'loomlet-scene.loom',
        types: [
          {
            description: 'Loomlet source',
            accept: {
              'text/plain': ['.loom', '.txt']
            }
          }
        ]
      });

      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();

      currentFileHandle = handle;
      currentFileName = handle.name || 'loomlet-scene.loom';
      setDslText(text);

      if (payload.source === 'graph') {
        hasUnsyncedDslText = false;
      }

      setDirty(false);
      return;
    }

    downloadTextFile(text, currentFileName || 'loomlet-scene.loom');

    if (payload.source === 'graph') {
      hasUnsyncedDslText = false;
    }

    setDirty(false);
  } catch (error) {
    if (isAbortError(error)) return;
    setEditorError(`Save failed: ${error.message}`);
  }
}

async function saveDslFile() {
  try {
    if (!currentFileHandle) {
      await saveDslAsFile();
      return;
    }

    const payload = getCurrentSavePayload();
    const text = payload.text;
    const writable = await currentFileHandle.createWritable();
    await writable.write(text);
    await writable.close();

    setDslText(text);

    if (payload.source === 'graph') {
      hasUnsyncedDslText = false;
    }

    setDirty(false);
  } catch (error) {
    if (isAbortError(error)) return;
    setEditorError(`Save failed: ${error.message}`);
  }
}

async function openLoomFile() {
  try {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Open another file anyway?')) {
        return;
      }
    }

    if ('showOpenFilePicker' in window) {
      const handles = await window.showOpenFilePicker({
        types: [
          {
            description: 'Loomlet source',
            accept: {
              'text/plain': ['.loom', '.txt']
            }
          }
        ]
      });

      const handle = handles[0];
      const file = await handle.getFile();
      const text = await file.text();

      setDslText(text);
      currentFileHandle = handle;
      currentFileName = handle.name;
      await applyDsl({ markDirty: false });
      hasUnsyncedDslText = false;
      setDirty(false);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.loom,.txt';
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      setDslText(text);
      currentFileName = file.name;
      currentFileHandle = null;
      await applyDsl({ markDirty: false });
      hasUnsyncedDslText = false;
      setDirty(false);
    });
    input.click();
  } catch (error) {
    if (isAbortError(error)) return;
    setEditorError(`Open failed: ${error.message}`);
  }
}

async function applyDsl({ markDirty = true } = {}) {
  const sourceText = getDslText();
  const { ast, errors: parseErrors } = parseDSLToAST(sourceText);

  if (parseErrors.length) {
    store.setState({ errors: parseErrors });
    selectedNodeId = null;
    renderErrors();
    renderInspector();
    if (markDirty) setDirty(true);
    return;
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);
  if (compileErrors.length) {
    store.setState({ errors: compileErrors });
    selectedNodeId = null;
    renderErrors();
    renderInspector();
    if (markDirty) setDirty(true);
    return;
  }

  const editorModel = graphToEditorModel(graph);

  store.setState({
    sourceText,
    sourceAst: ast,
    graph,
    editorModel,
    errors: []
  });

  selectedNodeId = null;
  await nodeEditor?.renderModel(editorModel);
  renderGraphJSON(graph);
  renderErrors();
  renderInspector();
  runPreview(graph);
  hasUnsyncedDslText = false;
  if (markDirty) setDirty(true);
}

function generateDsl() {
  const state = store.getState();
  if (!state.editorModel) return;

  const graph = editorModelToGraph(state.editorModel, state.graph);
  const dsl = graphToCanonicalDSL(graph);

  setDslText(dsl);
  store.setState({
    sourceText: dsl,
    graph,
    errors: []
  });

  renderGraphJSON(graph);
  renderErrors();
  renderInspector();
  runPreview(graph);
  hasUnsyncedDslText = false;
  setDirty(true);
}

function renderGraphJSON(graph) {
  const json = JSON.stringify(graph, null, 2);
  elements.graphJson.textContent = json;
}

function renderErrors() {
  const state = store.getState();
  const html = state.errors.map(err => {
    const line = err.line ? `:${err.line}` : '';
    const col = err.column ? `:${err.column}` : '';
    return `<div class="error-item"><strong>${err.code || 'ERROR'}${line}${col}</strong>: ${err.message}</div>`;
  }).join('');
  elements.errorsList.innerHTML = html || '<div class="error-item">No errors</div>';
}

function getSelectedEditorNode() {
  const state = store.getState();
  if (!selectedNodeId || !state.editorModel) return null;
  return state.editorModel.nodesById[selectedNodeId] || null;
}

function setSelectedNodeId(nodeId) {
  const state = store.getState();
  if (nodeId && !state.editorModel?.nodesById[nodeId]) {
    selectedNodeId = null;
  } else {
    selectedNodeId = nodeId || null;
  }
  renderInspector();
}

function setEditorError(message) {
  store.setState({
    errors: [{ code: 'EDITOR_ERROR', message }]
  });
  renderErrors();
}

function renderInspector() {
  const panel = elements.inspectorPanel;
  const node = getSelectedEditorNode();

  if (!panel) return;

  if (!node) {
    panel.innerHTML = `
      <div class="inspector-empty">
        Select a node to edit its literal params.
      </div>
    `;
    return;
  }

  let html = `
    <div class="inspector-content">
      <div class="inspector-section">
        <div class="inspector-row">
          <label class="inspector-label" for="selected-node-id-input">ID:</label>
          <div class="inspector-inline-edit">
            <input
              id="selected-node-id-input"
              class="inspector-node-id-input"
              type="text"
              value="${escapeHtml(node.id)}"
              spellcheck="false"
            />
            <button id="rename-selected-node-btn" class="btn">Rename</button>
          </div>
        </div>
        <div class="inspector-row">
          <div class="inspector-label">Type:</div>
          <div class="inspector-value">${escapeHtml(node.type)}</div>
        </div>
        <div class="inspector-row">
          <div class="inspector-label">Category:</div>
          <div class="inspector-value">${escapeHtml(node.category)}</div>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-label" style="margin-bottom: 8px;">Params:</div>
  `;

  const params = node.params || {};
  if (Object.keys(params).length === 0) {
    html += '<div class="inspector-empty" style="padding: 0;">No params</div>';
  } else {
    for (const [key, value] of Object.entries(params)) {
      html += renderParamInput(key, value);
    }
  }

  html += `
      </div>

      <div class="inspector-section inspector-danger-section">
        <div class="inspector-label" style="margin-bottom: 8px;">Danger Zone:</div>
        <button id="delete-selected-node-btn" class="btn btn-danger">
          Delete Node
        </button>
      </div>
    </div>
  `;

  panel.innerHTML = html;
  attachParamListeners();
  attachInspectorActionListeners();
}

function renderParamInput(key, value) {
  const valueType = typeof value;
  let input = '';

  if (valueType === 'number') {
    input = `<input type="number" class="inspector-param-input" data-param-key="${escapeHtml(key)}" value="${value}">`;
  } else if (valueType === 'boolean') {
    const checked = value ? 'checked' : '';
    input = `<input type="checkbox" class="inspector-param-input" data-param-key="${escapeHtml(key)}" ${checked}>`;
  } else if (valueType === 'string') {
    input = `<input type="text" class="inspector-param-input" data-param-key="${escapeHtml(key)}" value="${escapeHtml(value)}">`;
  } else {
    const jsonStr = JSON.stringify(value, null, 2);
    input = `<textarea class="inspector-param-input" data-param-key="${escapeHtml(key)}">${escapeHtml(jsonStr)}</textarea>`;
  }

  return `
    <div class="inspector-row">
      <label class="inspector-label" for="param-${escapeHtml(key)}">${escapeHtml(key)}:</label>
      <div style="flex: 1;">${input}</div>
    </div>
  `;
}

function attachParamListeners() {
  const inputs = elements.inspectorPanel.querySelectorAll('.inspector-param-input');
  inputs.forEach(input => {
    const key = input.getAttribute('data-param-key');

    if (input.type === 'checkbox') {
      input.addEventListener('change', () => {
        applyParamEdit(key, input.checked);
      });
    } else if (input.type === 'number') {
      input.addEventListener('change', () => {
        const value = Number(input.value);
        if (!Number.isFinite(value)) {
          setEditorError(`Invalid number for param '${key}'`);
          return;
        }
        applyParamEdit(key, value);
      });
    } else if (input.tagName === 'TEXTAREA') {
      input.addEventListener('change', () => {
        try {
          const value = JSON.parse(input.value);
          applyParamEdit(key, value);
        } catch (err) {
          setEditorError(`Invalid JSON for param '${key}': ${err.message}`);
        }
      });
    } else {
      input.addEventListener('change', () => {
        applyParamEdit(key, input.value);
      });
    }
  });
}

async function renameSelectedNode() {
  const node = getSelectedEditorNode();
  if (!node) return;

  const input = elements.inspectorPanel.querySelector('#selected-node-id-input');
  const newId = input?.value?.trim();

  if (!newId || newId === node.id) {
    return;
  }

  const result = await handleOperation({
    type: 'renameNode',
    id: node.id,
    newId
  });

  if (result && !result.error) {
    selectedNodeId = newId;
    renderInspector();
  }
}

function attachInspectorActionListeners() {
  const deleteButton = elements.inspectorPanel.querySelector('#delete-selected-node-btn');
  deleteButton?.addEventListener('click', deleteSelectedNode);

  const renameButton = elements.inspectorPanel.querySelector('#rename-selected-node-btn');
  renameButton?.addEventListener('click', renameSelectedNode);

  const idInput = elements.inspectorPanel.querySelector('#selected-node-id-input');
  idInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    renameSelectedNode();
  });
}

async function deleteSelectedNode() {
  const node = getSelectedEditorNode();
  if (!node) return;

  const message = `Delete node '${node.id}'? Connected edges will also be removed.`;
  if (!window.confirm(message)) return;

  const result = await handleOperation({
    type: 'removeNode',
    id: node.id
  });

  if (result && !result.error) {
    selectedNodeId = null;
    renderInspector();
  }
}

function applyParamEdit(key, value) {
  if (!selectedNodeId) return;

  handleOperation({
    type: 'updateParam',
    id: selectedNodeId,
    key,
    value
  });
}

function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(str).replace(/[&<>"']/g, char => map[char]);
}

function runPreview(graph) {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (engine && typeof engine.stop === 'function') {
    engine.stop();
  }

  resizePreviewCanvas();

  const state = store.getState();
  if (!graph) graph = state.graph;
  if (!graph) return;

  try {
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const graphForLoom = {
      nodes: graph.nodes || [],
      edges: graph.edges || []
    };

    engine = new Loom(graphForLoom);
    engine.start();

    animationFrameId = requestAnimationFrame(() => {
      tick(engine, graph);
    });
  } catch (err) {
    store.setState({ errors: [{ message: `Preview error: ${err.message}`, code: 'RUNTIME_ERROR' }] });
    renderErrors();
  }
}

function tick(engine, graph) {
  const canvas = elements.previewCanvas;
  const ctx = canvas.getContext('2d');

  if (engine) {
    const currentRender = graph?.render;
    const trail = currentRender?.trail !== undefined ? currentRender.trail : 0.1;

    if (trail > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${trail})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (currentRender?.type === 'point') {
      const x = resolveValue(engine, currentRender.x);
      const y = resolveValue(engine, currentRender.y);
      const color = currentRender.color || '#00ff00';
      ctx.fillStyle = color;
      ctx.beginPath();
      if (x !== null && y !== null && typeof x === 'number' && typeof y === 'number') {
        ctx.arc(x, y, 4, 0, Math.PI * 2);
      } else {
        ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
      }
      ctx.fill();
    } else if (currentRender?.type === 'bar') {
      const width = resolveValue(engine, currentRender.width);
      const color = currentRender.color || '#00ccff';
      const height = currentRender.height !== undefined ? currentRender.height : 40;
      const y = currentRender.y !== undefined ? resolveValue(engine, currentRender.y) : (canvas.height - height) / 2;
      if (width !== null && typeof width === 'number' && y !== null && typeof y === 'number') {
        ctx.fillStyle = color;
        ctx.fillRect(0, y, width, height);
      }
    }
  }

  animationFrameId = requestAnimationFrame(() => tick(engine, graph));
}

function resolveValue(engine, ref) {
  if (typeof ref === 'number') return ref;
  if (ref === null || ref === undefined) return null;
  const numVal = parseFloat(ref);
  if (!isNaN(numVal) && String(ref).trim() === String(numVal)) return numVal;
  return engine.getValue(ref);
}

async function resetSample() {
  setDslText(SAMPLE_DSL);
  currentFileHandle = null;
  currentFileName = '';
  await applyDsl({ markDirty: false });
  hasUnsyncedDslText = false;
  setDirty(false);
}

function renderNodePaletteItem(entry) {
  const inputs = entry.inputs.map((input) => input.name).join(', ') || 'none';
  const outputs = entry.outputs.map((output) => output.name).join(', ') || 'none';
  const params = entry.params.map((param) => param.name).join(', ') || 'none';

  return `
    <div class="node-palette-item">
      <div class="node-palette-main">
        <div class="node-palette-title">${escapeHtml(entry.typeName)}</div>
        <div class="node-palette-category-label">${escapeHtml(entry.category)}</div>
      </div>
      <div class="node-palette-meta">
        <div><strong>in</strong>: ${escapeHtml(inputs)}</div>
        <div><strong>out</strong>: ${escapeHtml(outputs)}</div>
        <div><strong>params</strong>: ${escapeHtml(params)}</div>
      </div>
      <button class="btn node-palette-add" data-add-node-type="${escapeHtml(entry.typeName)}">Add</button>
    </div>
  `;
}

function renderNodePalette() {
  const list = elements.nodePaletteList;
  if (!list) return;

  const query = (elements.nodePaletteSearch?.value || '').trim().toLowerCase();
  const selectedCategory = elements.nodePaletteCategory?.value || '';

  const entries = getNodeTypeEntries(NODE_TYPES).filter((entry) => {
    if (selectedCategory && entry.category !== selectedCategory) return false;
    if (!query) return true;

    return (
      entry.typeName.toLowerCase().includes(query) ||
      entry.category.toLowerCase().includes(query)
    );
  });

  list.innerHTML = entries.map(renderNodePaletteItem).join('');

  list.querySelectorAll('[data-add-node-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const typeName = button.getAttribute('data-add-node-type');
      addNodeFromPalette(typeName);
    });
  });
}

function renderNodePaletteCategories() {
  const select = elements.nodePaletteCategory;
  if (!select) return;

  const categories = Array.from(
    new Set(getNodeTypeEntries(NODE_TYPES).map((entry) => entry.category))
  ).sort();

  select.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');
}

async function addNodeFromPalette(typeName) {
  const def = NODE_TYPES[typeName];
  if (!def) {
    setEditorError(`Unknown node type: ${typeName}`);
    return;
  }

  const category = normalizeEditorCategory(def.category);
  const state = store.getState();
  const existingNodeIds = state.editorModel?.nodesById || {};
  const id = createNodeIdFromType(typeName, existingNodeIds);
  const nodes = Object.values(existingNodeIds || {});

  const node = {
    id,
    type: typeName,
    category,
    params: createDefaultParamsForNodeType(typeName, NODE_TYPES),
    position: createPositionForNewNode(category, nodes)
  };

  await handleOperation({
    type: 'addNode',
    node
  });

  setSelectedNodeId(id);
}

function isTextEditingTarget(target) {
  if (!target) return false;

  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  if (target.isContentEditable) return true;

  if (target.closest?.('.cm-editor')) return true;

  return false;
}

function handleGlobalKeyDown(event) {
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  if (!selectedNodeId) return;
  if (isTextEditingTarget(event.target)) return;

  event.preventDefault();
  deleteSelectedNode();
}

function setupEventListeners() {
  elements.applyDslBtn.addEventListener('click', applyDsl);
  elements.generateDslBtn.addEventListener('click', generateDsl);
  elements.runPreviewBtn.addEventListener('click', () => {
    const state = store.getState();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    runPreview(state.graph);
  });
  elements.resetSampleBtn.addEventListener('click', resetSample);
  elements.togglePanelsBtn.addEventListener('click', () => {
    setPanelsVisible(!panelsVisible);
  });
  elements.openFileBtn.addEventListener('click', openLoomFile);
  elements.saveFileBtn.addEventListener('click', saveDslFile);
  elements.saveAsFileBtn.addEventListener('click', saveDslAsFile);

  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      elements.tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${tabName}-tab`)?.classList.add('active');
    });
  });

  elements.nodePaletteSearch?.addEventListener('input', renderNodePalette);
  elements.nodePaletteCategory?.addEventListener('change', renderNodePalette);

  window.addEventListener('resize', resizePreviewCanvas);
  window.addEventListener('keydown', handleGlobalKeyDown);
}

async function handleOperation(operation) {
  const state = store.getState();
  if (!state.editorModel) return null;

  const result = applyNodeEditorOperationState(
    {
      graph: state.graph,
      editorModel: state.editorModel,
      errors: state.errors || []
    },
    operation
  );

  store.setState(result.state);

  if (!result.error) {
    if (result.change.shouldRerenderView) {
      await nodeEditor?.renderModel(result.state.editorModel);
    }

    if (result.change.operation.type === 'renameNode' && selectedNodeId === result.change.operation.id) {
      selectedNodeId = result.change.operation.newId;
    } else if (selectedNodeId && !result.state.editorModel.nodesById[selectedNodeId]) {
      selectedNodeId = null;
    }

    renderGraphJSON(result.state.graph);
    renderErrors();
    renderInspector();
    runPreview(result.state.graph);
    hasUnsyncedDslText = false;
    setDirty(true);
    return result;
  }

  const currentModel = state.editorModel;
  if (currentModel && result.change.shouldRerenderView) {
    await nodeEditor?.renderModel(currentModel);
  }

  renderErrors();
  return result;
}

async function init() {
  resizePreviewCanvas();
  setPanelsVisible(true);

  initDslEditor();
  nodeEditor = new NodeEditorView(elements.nodeEditorHost, {
    onOperation: handleOperation,
    onError: (error) => {
      store.setState({ errors: [{ message: `Editor error: ${error.message}`, code: 'EDITOR_ERROR' }] });
      renderErrors();
    },
    onSelectNode: setSelectedNodeId
  });

  setupEventListeners();
  renderFileStatus();
  renderNodePaletteCategories();
  renderNodePalette();
  await applyDsl({ markDirty: false });
  setDirty(false);
}

init();
