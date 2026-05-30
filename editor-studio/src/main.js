import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { forceLinting } from '@codemirror/lint';

import { Loom, NODE_TYPES } from '../../src/loom.js';
import { getLatestNodeValues } from '../../src/value-preview.js';
import { loomletDslExtensions } from './loomlet-codemirror.js';
import { parseDSLToAST, compileToGraph } from '../../src/loom-dsl.js';
import { compileLoomToSceneSyncGraph } from '../../src/scenesync/graph-adapter.js';
import { createSceneGraphSetPayload, createSceneGraphClearPayload } from '../../src/scenesync/graphs.js';
import {
  graphToEditorModel,
  editorModelToGraph,
  applyNodeEditorOperationState,
  preserveEditorModelLayout,
  findNonOverlappingPosition,
  NODE_LAYOUT_STEP_Y
} from '../../src/node-editor-core.js';
import { graphToCanonicalDSL } from '../../src/canonical-dsl.js';
import { patchOrCanonicalDslSource } from '../../src/source-dsl-patch.js';
import { createStore } from './studio-store.js';
import { NodeEditorView } from './node-editor-view.js';
import { syncPendingDslBeforeNodeOperation } from './live-sync-guards.js';
import {
  normalizeEditorCategory,
  createDefaultParamsForNodeType,
  createNodeIdFromType,
  createPositionForNewNode,
  getNodeTypeEntries
} from './node-palette-model.js';
import {
  extractEditorMetadataFromDsl,
  appendEditorMetadataToDsl,
  createEditorLayoutMetadata,
  applyLayoutMetadataToEditorModel,
  stripEditorMetadataFromDsl
} from '../../src/editor-metadata.js';

const SAMPLE_DSL = `t = clock()
wave = sine(t, freq: 0.35)
smooth = smoothLerp(wave, rate: 5, initial: 0)
width = map(smooth, inMin: -1, inMax: 1, outMin: 80, outMax: 680, clamp: true)
logged = log(smooth, label: "wave")

render bar(width: width, color: "#80ed99", height: 48)
`;

// Scene Sync Presets
const SCENE_SYNC_JUMP_PRESET = `import time
import math
import scene

t = time.serverClock()
dy = math.sine(t, freq: 0.8, amplitude: 0.5)

scene.offsetPosition(y: dy)

previewY = math.add(200, math.multiply(dy, -120))
render point(x: 300, y: previewY, radius: 8, color: "#ff70a6", trail: 0.08)
`;

const SCENE_SYNC_CIRCLE_PRESET = `import time
import math
import scene

t = time.serverClock()

dx = math.cosine(t, freq: 0.2, amplitude: 1.5)
dz = math.sine(t, freq: 0.2, amplitude: 1.5)

scene.offsetPosition(x: dx, z: dz)

previewX = math.add(300, math.multiply(dx, 80))
previewY = math.add(200, math.multiply(dz, 80))

render point(x: previewX, y: previewY, radius: 8, color: "#80ed99", trail: 0.08)
`;

const BOTTOM_PANEL_HEIGHT_KEY = 'loomlet.editorStudio.bottomPanelHeight';
const BOTTOM_PANEL_COLLAPSED_KEY = 'loomlet.editorStudio.bottomPanelCollapsed';
const EDITOR_SPLIT_WIDTH_KEY = 'loomlet.editorStudio.editorSplitWidth';
const ACTIVE_BOTTOM_TAB_KEY = 'loomlet.editorStudio.activeBottomTab';
const EDITOR_MAXIMIZE_MODE_KEY = 'loomlet.editorStudio.editorMaximizeMode';

const SCENE_SYNC_STORAGE_KEYS = {
  endpoint: 'loomlet.editorStudio.sceneSync.endpoint',
  room: 'loomlet.editorStudio.sceneSync.room',
  scope: 'loomlet.editorStudio.sceneSync.scope',
  objectId: 'loomlet.editorStudio.sceneSync.objectId',
  nickname: 'loomlet.editorStudio.sceneSync.nickname'
};

const MAX_HISTORY_ENTRIES = 100;
const MOVE_HISTORY_COALESCE_MS = 250;
const PARAM_HISTORY_COALESCE_MS = 750;
const NODE_VALUE_PREVIEW_INTERVAL_MS = 100;

let outputEntries = [];
const MAX_OUTPUT_ENTRIES = 500;

const DEFAULT_BOTTOM_PANEL_HEIGHT = 260;
const MIN_BOTTOM_PANEL_HEIGHT = 120;
const MAX_BOTTOM_PANEL_RATIO = 0.6;

const DEFAULT_DSL_PANE_WIDTH = 520;
const MIN_DSL_PANE_WIDTH = 280;
const MIN_NODE_PANE_WIDTH = 320;
const EDITOR_SPLIT_HANDLE_WIDTH = 8;
const EDITOR_SPLIT_GRID_GAP = 12;
const EDITOR_SPLIT_GRID_GAP_COUNT = 2;

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
let autoApplyTimer = null;
const AUTO_APPLY_DSL_ENABLED = true;
const AUTO_SYNC_GRAPH_TO_DSL_ENABLED = true;
const AUTO_APPLY_DELAY_MS = 200;
let autoApplyRequestId = 0;
let latestSuccessfulDslText = '';
let bottomPanelHeight = DEFAULT_BOTTOM_PANEL_HEIGHT;
let isBottomPanelCollapsed = false;
let isResizingBottomPanel = false;
let dslPaneWidth = DEFAULT_DSL_PANE_WIDTH;
let isResizingEditorSplit = false;

let undoStack = [];
let redoStack = [];
let isApplyingHistory = false;
let activeMoveHistoryNodeId = null;
let moveHistoryCoalesceTimer = null;
let activeParamHistoryKey = null;
let paramHistoryCoalesceTimer = null;
let editorMaximizeMode = 'split';
let lastNodeValuePreviewAtMs = 0;

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
  nodePaletteList: document.getElementById('node-palette-list'),
  nodeListSearch: document.getElementById('node-list-search'),
  nodeListCategory: document.getElementById('node-list-category'),
  nodeList: document.getElementById('node-list'),
  autoApplyStatus: document.getElementById('auto-apply-status'),
  bottomPanel: document.getElementById('bottom-panel'),
  bottomPanelResizeHandle: document.getElementById('bottom-panel-resize-handle'),
  bottomPanelCollapseBtn: document.getElementById('bottom-panel-collapse-btn'),
  editorPanels: document.querySelector('.editor-panels'),
  editorSplitResizeHandle: document.getElementById('editor-split-resize-handle'),
  undoBtn: document.getElementById('undo-btn'),
  redoBtn: document.getElementById('redo-btn'),
  dirtyStatus: document.getElementById('dirty-status'),
  autoSyncStatusPill: document.getElementById('auto-sync-status-pill'),
  outputLog: document.getElementById('output-log'),
  clearOutputBtn: document.getElementById('clear-output-btn'),
  sceneSyncEndpoint: document.getElementById('sceneSyncEndpoint'),
  sceneSyncRoom: document.getElementById('sceneSyncRoom'),
  sceneSyncScope: document.getElementById('sceneSyncScope'),
  sceneSyncObjectId: document.getElementById('sceneSyncObjectId'),
  sceneSyncNickname: document.getElementById('sceneSyncNickname'),
  compileSceneSyncPayloadBtn: document.getElementById('compileSceneSyncPayloadBtn'),
  applySceneSyncBehaviorBtn: document.getElementById('applySceneSyncBehaviorBtn'),
  clearSceneSyncBehaviorBtn: document.getElementById('clearSceneSyncBehaviorBtn'),
  sceneSyncPayloadPreview: document.getElementById('sceneSyncPayloadPreview'),
  loadSceneSyncJumpPresetBtn: document.getElementById('loadSceneSyncJumpPresetBtn'),
  loadSceneSyncCirclePresetBtn: document.getElementById('loadSceneSyncCirclePresetBtn')
};

function setPanelsVisible(visible) {
  panelsVisible = visible;
  document.body.classList.toggle('panels-hidden', !visible);

  const button = elements.togglePanelsBtn;
  if (button) {
    button.textContent = visible ? 'Hide Editors' : 'Show Editors';
  }
}

function getMaxBottomPanelHeight() {
  return Math.max(
    MIN_BOTTOM_PANEL_HEIGHT,
    Math.floor(window.innerHeight * MAX_BOTTOM_PANEL_RATIO)
  );
}

function clampBottomPanelHeight(height) {
  return Math.min(
    Math.max(height, MIN_BOTTOM_PANEL_HEIGHT),
    getMaxBottomPanelHeight()
  );
}

function applyBottomPanelLayout() {
  const panel = elements.bottomPanel;
  const handle = elements.bottomPanelResizeHandle;
  const button = elements.bottomPanelCollapseBtn;

  if (!panel) return;

  if (isBottomPanelCollapsed) {
    panel.style.height = '0px';
    panel.classList.add('collapsed');
    handle?.classList.add('collapsed');
    if (button) {
      button.textContent = 'Expand';
      button.title = 'Expand bottom panel';
    }
    return;
  }

  const height = clampBottomPanelHeight(bottomPanelHeight);
  bottomPanelHeight = height;
  panel.style.height = `${height}px`;
  panel.classList.remove('collapsed');
  handle?.classList.remove('collapsed');

  if (button) {
    button.textContent = 'Collapse';
    button.title = 'Collapse bottom panel';
  }
}

function loadBottomPanelLayout() {
  const savedHeight = Number(localStorage.getItem(BOTTOM_PANEL_HEIGHT_KEY));
  if (Number.isFinite(savedHeight)) {
    bottomPanelHeight = clampBottomPanelHeight(savedHeight);
  }

  isBottomPanelCollapsed =
    localStorage.getItem(BOTTOM_PANEL_COLLAPSED_KEY) === 'true';

  applyBottomPanelLayout();
}

function saveBottomPanelLayout() {
  localStorage.setItem(BOTTOM_PANEL_HEIGHT_KEY, String(bottomPanelHeight));
  localStorage.setItem(BOTTOM_PANEL_COLLAPSED_KEY, String(isBottomPanelCollapsed));
}

function startBottomPanelResize(event) {
  if (isBottomPanelCollapsed) {
    isBottomPanelCollapsed = false;
  }

  isResizingBottomPanel = true;
  document.body.classList.add('resizing-bottom-panel');
  event.preventDefault();
}

function resizeBottomPanel(event) {
  if (!isResizingBottomPanel) return;

  const viewportHeight = window.innerHeight;
  const newHeight = viewportHeight - event.clientY;

  bottomPanelHeight = clampBottomPanelHeight(newHeight);
  applyBottomPanelLayout();
}

function stopBottomPanelResize() {
  if (!isResizingBottomPanel) return;

  isResizingBottomPanel = false;
  document.body.classList.remove('resizing-bottom-panel');
  saveBottomPanelLayout();
}

function handleWindowResizeForBottomPanel() {
  bottomPanelHeight = clampBottomPanelHeight(bottomPanelHeight);
  applyBottomPanelLayout();

  dslPaneWidth = clampDslPaneWidth(dslPaneWidth);
  applyEditorSplitLayout();

  saveBottomPanelLayout();
  saveEditorSplitLayout();
}

function toggleBottomPanelCollapsed() {
  isBottomPanelCollapsed = !isBottomPanelCollapsed;
  applyBottomPanelLayout();
  saveBottomPanelLayout();
}

function getMaxDslPaneWidth() {
  const panels = elements.editorPanels;
  if (!panels) return DEFAULT_DSL_PANE_WIDTH;

  const rect = panels.getBoundingClientRect();
  // editor-panels has three columns with two horizontal grid gaps:
  // DSL pane | gap | splitter | gap | Node pane
  const maxWidth =
    rect.width
    - MIN_NODE_PANE_WIDTH
    - EDITOR_SPLIT_HANDLE_WIDTH
    - EDITOR_SPLIT_GRID_GAP * EDITOR_SPLIT_GRID_GAP_COUNT;

  return Math.max(MIN_DSL_PANE_WIDTH, Math.floor(maxWidth));
}

function clampDslPaneWidth(width) {
  return Math.min(
    Math.max(width, MIN_DSL_PANE_WIDTH),
    getMaxDslPaneWidth()
  );
}

function applyEditorSplitLayout() {
  const panels = elements.editorPanels;
  if (!panels) return;

  dslPaneWidth = clampDslPaneWidth(dslPaneWidth);
  panels.style.setProperty('--dsl-pane-width-px', `${dslPaneWidth}px`);
}

function loadEditorSplitLayout() {
  const savedWidth = Number(localStorage.getItem(EDITOR_SPLIT_WIDTH_KEY));
  if (Number.isFinite(savedWidth)) {
    dslPaneWidth = savedWidth;
  }

  applyEditorSplitLayout();
}

function saveEditorSplitLayout() {
  localStorage.setItem(EDITOR_SPLIT_WIDTH_KEY, String(dslPaneWidth));
}

function applyEditorMaximizeMode() {
  const panels = elements.editorPanels;
  if (!panels) return;

  panels.classList.remove('is-maximized-dsl', 'is-maximized-node');

  if (editorMaximizeMode === 'dsl') {
    panels.classList.add('is-maximized-dsl');
  } else if (editorMaximizeMode === 'node') {
    panels.classList.add('is-maximized-node');
  }

  updateEditorMaximizeButtons();
}

function notifyNodeEditorLayoutChanged() {
  window.requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    if (nodeEditor?.resize) {
      nodeEditor.resize();
    }
  });
}

function setEditorMaximizeMode(mode) {
  if (!['split', 'dsl', 'node'].includes(mode)) return;

  if (mode === 'split') {
    editorMaximizeMode = 'split';
    applyEditorSplitLayout();
  } else if (mode === 'dsl') {
    editorMaximizeMode = 'dsl';
  } else if (mode === 'node') {
    editorMaximizeMode = 'node';
  }

  applyEditorMaximizeMode();
  notifyNodeEditorLayoutChanged();
  saveEditorMaximizeMode();
}

function updateEditorMaximizeButtons() {
  const panels = elements.editorPanels;
  if (!panels) return;

  panels.querySelectorAll('[data-action="maximize-dsl"]').forEach((btn) => {
    btn.style.display = editorMaximizeMode === 'split' ? 'block' : 'none';
  });

  panels.querySelectorAll('[data-action="maximize-node"]').forEach((btn) => {
    btn.style.display = editorMaximizeMode === 'split' ? 'block' : 'none';
  });

  panels.querySelectorAll('[data-action="restore-split"]').forEach((btn) => {
    btn.style.display = editorMaximizeMode !== 'split' ? 'block' : 'none';
  });
}

function selectBottomTab(tabName) {
  elements.tabBtns.forEach(b => b.classList.remove('active'));
  elements.tabPanes.forEach(p => p.classList.remove('active'));

  const button = document.querySelector(`[data-tab="${tabName}"]`);
  const pane = document.getElementById(`${tabName}-tab`);

  if (button) {
    button.classList.add('active');
  }
  if (pane) {
    pane.classList.add('active');
  }

  localStorage.setItem(ACTIVE_BOTTOM_TAB_KEY, tabName);
}

function getActiveBottomTab() {
  const activeButton = document.querySelector('.tab-btn.active');
  return activeButton?.getAttribute('data-tab') || null;
}

function loadActiveBottomTab() {
  const savedTab = localStorage.getItem(ACTIVE_BOTTOM_TAB_KEY);
  if (!savedTab) return;

  const button = document.querySelector(`[data-tab="${savedTab}"]`);
  const pane = document.getElementById(`${savedTab}-tab`);

  if (!button || !pane) return;

  selectBottomTab(savedTab);
}

function loadEditorMaximizeMode() {
  const saved = localStorage.getItem(EDITOR_MAXIMIZE_MODE_KEY);
  if (saved && ['split', 'dsl', 'node'].includes(saved)) {
    editorMaximizeMode = saved;
  }
}

function saveEditorMaximizeMode() {
  localStorage.setItem(EDITOR_MAXIMIZE_MODE_KEY, editorMaximizeMode);
}

function startEditorSplitResize(event) {
  isResizingEditorSplit = true;
  document.body.classList.add('resizing-editor-split');
  event.preventDefault();
}

function resizeEditorSplit(event) {
  if (!isResizingEditorSplit) return;

  const panels = elements.editorPanels;
  if (!panels) return;

  const rect = panels.getBoundingClientRect();
  const nextWidth = event.clientX - rect.left;

  dslPaneWidth = clampDslPaneWidth(nextWidth);
  applyEditorSplitLayout();
}

function stopEditorSplitResize() {
  if (!isResizingEditorSplit) return;

  isResizingEditorSplit = false;
  document.body.classList.remove('resizing-editor-split');
  saveEditorSplitLayout();
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
      lineNumbers(),
      history(),
      foldGutter(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        ...completionKeymap
      ]),
      ...loomletDslExtensions({
        nodeTypes: NODE_TYPES,
        getErrors: () => store.getState().errors || []
      }),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        if (isApplyingProgrammaticDslChange) return;

        hasUnsyncedDslText = true;
        setDirty(true);
        scheduleAutoApplyDsl();
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
  renderDirtyStatus();
}

function renderFileStatus() {
  const label = currentFileName || 'No file';
  const dirtyMark = isDirty ? ' *' : '';
  elements.fileStatus.textContent = `${label}${dirtyMark}`;
}

function renderAutoApplyStatus(status = null) {
  if (!elements.autoApplyStatus) return;

  if (status === 'pending') {
    elements.autoApplyStatus.textContent = 'DSL->Node: pending';
    elements.autoApplyStatus.className = 'auto-apply-status pending';
    return;
  }

  if (status === 'ok') {
    elements.autoApplyStatus.textContent = 'DSL->Node: synced';
    elements.autoApplyStatus.className = 'auto-apply-status ok';
    return;
  }

  if (status === 'error') {
    elements.autoApplyStatus.textContent = 'DSL->Node: error';
    elements.autoApplyStatus.className = 'auto-apply-status error';
    return;
  }

  elements.autoApplyStatus.textContent = 'DSL->Node: live';
  elements.autoApplyStatus.className = 'auto-apply-status';
}

function renderAutoSyncGraphToDslStatus(status = null) {
  if (!elements.autoSyncStatusPill) return;

  elements.autoSyncStatusPill.className = 'status-pill';

  if (status === 'ok') {
    elements.autoSyncStatusPill.textContent = 'Node->DSL: synced';
    elements.autoSyncStatusPill.classList.add('is-on');
    return;
  }

  elements.autoSyncStatusPill.textContent = 'Node->DSL: live';
  elements.autoSyncStatusPill.classList.add('is-on');
}

function renderDirtyStatus() {
  if (!elements.dirtyStatus) return;

  elements.dirtyStatus.textContent = isDirty ? 'Dirty' : 'Saved';
  elements.dirtyStatus.classList.toggle('is-dirty', isDirty);
  elements.dirtyStatus.classList.toggle('is-saved', !isDirty);
}


function scheduleAutoApplyDsl() {
  if (isApplyingProgrammaticDslChange) return;

  if (autoApplyTimer) {
    clearTimeout(autoApplyTimer);
  }

  renderAutoApplyStatus('pending');

  const requestId = ++autoApplyRequestId;

  autoApplyTimer = window.setTimeout(() => {
    autoApplyTimer = null;
    autoApplyDslFromEditor(requestId);
  }, AUTO_APPLY_DELAY_MS);
}

function cancelPendingAutoApplyDsl() {
  if (autoApplyTimer) {
    clearTimeout(autoApplyTimer);
    autoApplyTimer = null;
  }

  autoApplyRequestId += 1;
  renderAutoApplyStatus('ok');
}

function interruptPendingAutoApplyDsl() {
  if (autoApplyTimer) {
    clearTimeout(autoApplyTimer);
    autoApplyTimer = null;
  }

  autoApplyRequestId += 1;
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

function createDslTextForSave(baseDslText) {
  const state = store.getState();

  if (!state.editorModel) return baseDslText;

  const cleanDsl = stripEditorMetadataFromDsl(baseDslText);
  const metadata = createEditorLayoutMetadata(state.editorModel);
  return appendEditorMetadataToDsl(cleanDsl, metadata);
}

function getCurrentSavePayload() {
  const text = getDslText();
  const textWithMetadata = createDslTextForSave(text);

  return {
    text: textWithMetadata,
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

      if (payload.source === 'graph') {
        hasUnsyncedDslText = false;
      }

      setDirty(false);
      appendOutput({ level: 'info', message: 'File saved.' });
      return;
    }

    downloadTextFile(text, currentFileName || 'loomlet-scene.loom');

    if (payload.source === 'graph') {
      hasUnsyncedDslText = false;
    }

    setDirty(false);
    appendOutput({ level: 'info', message: 'File saved.' });
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

    if (payload.source === 'graph') {
      hasUnsyncedDslText = false;
    }

    setDirty(false);
    appendOutput({ level: 'info', message: 'File saved.' });
  } catch (error) {
    if (isAbortError(error)) return;
    setEditorError(`Save failed: ${error.message}`);
  }
}

async function applyEditorMetadataToCurrentModel(metadata) {
  const state = store.getState();
  if (!state.editorModel) return;

  const editorModel = applyLayoutMetadataToEditorModel(state.editorModel, metadata);

  store.setState({ editorModel });
  await nodeEditor?.renderModel(editorModel, { force: true });
  renderGraphJSON(store.getState().graph);
  renderInspector();
  updateNodeListCategories();
  renderNodeList();
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

      const { textWithoutMetadata, metadata } = extractEditorMetadataFromDsl(text);
      setDslText(textWithoutMetadata);
      currentFileHandle = handle;
      currentFileName = handle.name;
      const result = await applyDsl({ markDirty: false });

      if (result.ok && metadata) {
        await applyEditorMetadataToCurrentModel(metadata);
      }

      hasUnsyncedDslText = false;
      setDirty(false);
      clearEditorHistory();
      appendOutput({ level: 'info', message: 'File opened.' });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.loom,.txt';
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const { textWithoutMetadata, metadata } = extractEditorMetadataFromDsl(text);
      setDslText(textWithoutMetadata);
      currentFileName = file.name;
      currentFileHandle = null;
      const result = await applyDsl({ markDirty: false });

      if (result.ok && metadata) {
        await applyEditorMetadataToCurrentModel(metadata);
      }

      hasUnsyncedDslText = false;
      setDirty(false);
      clearEditorHistory();
      appendOutput({ level: 'info', message: 'File opened.' });
    });
    input.click();
  } catch (error) {
    if (isAbortError(error)) return;
    setEditorError(`Open failed: ${error.message}`);
  }
}

async function applyDslTextToGraph(sourceText, { markDirty = true, preserveGraphOnError = false, shouldCommit = null } = {}) {
  const { textWithoutMetadata, metadata } = extractEditorMetadataFromDsl(sourceText);

  const { ast, errors: parseErrors } = parseDSLToAST(textWithoutMetadata);

  if (parseErrors.length) {
    store.setState({ errors: parseErrors });

    if (!preserveGraphOnError) {
      selectedNodeId = null;
      renderInspector();
    }

    renderErrors();
    if (markDirty) setDirty(true);

    return {
      ok: false,
      errors: parseErrors
    };
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);

  if (compileErrors.length) {
    store.setState({ errors: compileErrors });

    if (!preserveGraphOnError) {
      selectedNodeId = null;
      renderInspector();
    }

    renderErrors();
    if (markDirty) setDirty(true);

    return {
      ok: false,
      errors: compileErrors
    };
  }

  const previousEditorModel = store.getState().editorModel;
  let editorModel = preserveEditorModelLayout(
    graphToEditorModel(graph),
    previousEditorModel
  );

  if (metadata) {
    editorModel = applyLayoutMetadataToEditorModel(editorModel, metadata);
  }

  if (shouldCommit && !shouldCommit()) {
    return { ok: false, stale: true, errors: [] };
  }

  store.setState({
    sourceText: textWithoutMetadata,
    sourceAst: ast,
    graph,
    editorModel,
    errors: []
  });

  if (selectedNodeId && !editorModel.nodesById[selectedNodeId]) {
    selectedNodeId = null;
  }
  await nodeEditor?.renderModel(editorModel);

  renderGraphJSON(graph);
  renderErrors();
  renderInspector();
  updateNodeListCategories();
  renderNodeList();
  runPreview(graph);

  hasUnsyncedDslText = false;
  latestSuccessfulDslText = textWithoutMetadata;

  if (markDirty) setDirty(true);

  return {
    ok: true,
    graph,
    editorModel
  };
}

async function applyDsl({ markDirty = true, logOutput = true } = {}) {
  const result = await applyDslTextToGraph(getDslText(), {
    markDirty,
    preserveGraphOnError: false
  });

  if (result.ok) {
    if (logOutput) {
      appendOutput({ level: 'info', message: 'DSL applied successfully.' });
    }
    cancelPendingAutoApplyDsl();
    clearEditorHistory();
  } else {
    if (logOutput) {
      appendOutput({ level: 'error', message: 'DSL apply failed.' });
    }
  }

  return result;
}

function hasUserDslComments(text) {
  return String(text || '')
    .split('\n')
    .some((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith('#') && !trimmed.startsWith('# @loomlet.editor');
    });
}

function generateCanonicalDslFromState() {
  const state = store.getState();

  if (!state.editorModel) {
    return getDslText();
  }

  const graph = editorModelToGraph(state.editorModel, state.graph);
  return graphToCanonicalDSL(graph);
}

function syncGraphToDslEditor({ markDirty = true, force = false, operation = null, graph = null } = {}) {
  if (!force && !AUTO_SYNC_GRAPH_TO_DSL_ENABLED) return null;

  const state = store.getState();
  const nextGraph = graph || (state.editorModel ? editorModelToGraph(state.editorModel, state.graph) : state.graph);
  const syncResult = !force && operation && nextGraph
    ? patchOrCanonicalDslSource(getDslText(), operation, nextGraph)
    : { ok: true, source: generateCanonicalDslFromState(), strategy: 'canonical' };
  const dsl = syncResult.source;

  if (getDslText() !== dsl) {
    setDslText(dsl);
  }

  store.setState({
    sourceText: dsl,
    errors: []
  });

  renderErrors();

  hasUnsyncedDslText = false;
  latestSuccessfulDslText = dsl;

  if (markDirty) {
    setDirty(true);
  }

  renderAutoSyncGraphToDslStatus('ok');

  return dsl;
}

function generateDsl() {
  finishMoveHistoryGroup();
  finishParamHistoryGroup();
  cancelPendingAutoApplyDsl();

  const currentText = getDslText();
  if (hasUserDslComments(currentText)) {
    const confirmed = window.confirm(
      'Generating canonical DSL will overwrite the DSL editor and may remove comments and formatting. Continue?'
    );
    if (!confirmed) {
      appendOutput({
        level: 'info',
        message: 'Canceled canonical DSL generation.'
      });
      return;
    }
  }

  const dsl = syncGraphToDslEditor({ markDirty: true, force: true });
  if (!dsl) return;
  renderAutoApplyStatus('ok');
}

async function autoApplyDslFromEditor(requestId) {
  if (!AUTO_APPLY_DSL_ENABLED) return;
  if (requestId !== autoApplyRequestId) return;

  const sourceText = getDslText();

  if (sourceText === latestSuccessfulDslText) {
    renderAutoApplyStatus('ok');
    return;
  }

  const result = await applyDslTextToGraph(sourceText, {
    markDirty: true,
    preserveGraphOnError: true,
    shouldCommit: () => requestId === autoApplyRequestId
  });

  if (result.stale) return;
  if (requestId !== autoApplyRequestId) return;

  if (result.ok) {
    renderAutoApplyStatus('ok');
    clearEditorHistory();
  } else {
    appendOutput({ level: 'error', message: 'Auto Apply DSL error.' });
    renderAutoApplyStatus('error');
  }
}

function appendOutput(entry) {
  outputEntries.push({
    time: new Date().toISOString(),
    level: entry.level || 'info',
    message: String(entry.message ?? '')
  });

  if (outputEntries.length > MAX_OUTPUT_ENTRIES) {
    outputEntries = outputEntries.slice(-MAX_OUTPUT_ENTRIES);
  }

  renderOutput();
}

function clearOutput() {
  outputEntries = [];
  renderOutput();
}

function formatOutputTime(isoString) {
  return isoString.slice(11, 19);
}

function renderOutput() {
  if (!elements.outputLog) return;

  if (!outputEntries.length) {
    elements.outputLog.textContent = 'No output yet.';
    elements.outputLog.classList.add('is-empty');
    return;
  }

  elements.outputLog.classList.remove('is-empty');
  elements.outputLog.textContent = outputEntries
    .map((entry) => {
      const time = formatOutputTime(entry.time);
      return `${time} [${entry.level}] ${entry.message}`;
    })
    .join('\n');
}

function renderGraphJSON(graph) {
  const json = JSON.stringify(graph, null, 2);
  elements.graphJson.textContent = json;
}

function renderErrors() {
  const state = store.getState();
  const html = state.errors.map(err => {
    const lineNumber = err.line ?? err.span?.start?.line;
    const columnNumber = err.column ?? err.span?.start?.column;
    const line = lineNumber ? `:${lineNumber}` : '';
    const col = columnNumber ? `:${columnNumber}` : '';
    return `<div class="error-item"><strong>${err.code || 'ERROR'}${line}${col}</strong>: ${err.message}</div>`;
  }).join('');
  elements.errorsList.innerHTML = html || '<div class="empty-state">No errors</div>';

  if (dslEditor) {
    forceLinting(dslEditor);
  }
}

function getSelectedEditorNode() {
  const state = store.getState();
  if (!selectedNodeId || !state.editorModel) return null;
  return state.editorModel.nodesById[selectedNodeId] || null;
}

function getSelectedNodeConnections() {
  const state = store.getState();
  const node = getSelectedEditorNode();

  if (!node || !state.editorModel?.edgesById) {
    return {
      incoming: [],
      outgoing: []
    };
  }

  const edges = Object.values(state.editorModel.edgesById);

  return {
    incoming: edges.filter((edge) => edge.toNodeId === node.id),
    outgoing: edges.filter((edge) => edge.fromNodeId === node.id)
  };
}

function formatEdgeEndpoint(nodeId, port) {
  return `${nodeId}.${port}`;
}

function setSelectedNodeId(nodeId) {
  const state = store.getState();
  if (nodeId && !state.editorModel?.nodesById[nodeId]) {
    selectedNodeId = null;
  } else {
    selectedNodeId = nodeId || null;
  }
  renderInspector();
  renderNodeList();
}

function setEditorError(message) {
  store.setState({
    errors: [{ code: 'EDITOR_ERROR', message }]
  });
  renderErrors();
}

/* Scene Sync panel functions */

function loadSceneSyncSettings() {
  elements.sceneSyncEndpoint.value =
    localStorage.getItem(SCENE_SYNC_STORAGE_KEYS.endpoint) || 'https://afjk.jp/presence';

  elements.sceneSyncRoom.value =
    localStorage.getItem(SCENE_SYNC_STORAGE_KEYS.room) || '';

  elements.sceneSyncScope.value =
    localStorage.getItem(SCENE_SYNC_STORAGE_KEYS.scope) || 'object';

  elements.sceneSyncObjectId.value =
    localStorage.getItem(SCENE_SYNC_STORAGE_KEYS.objectId) || 'sample-cube';

  elements.sceneSyncNickname.value =
    localStorage.getItem(SCENE_SYNC_STORAGE_KEYS.nickname) || 'Loomlet Editor';

  updateSceneSyncScopeUi();
}

function saveSceneSyncSettings() {
  localStorage.setItem(
    SCENE_SYNC_STORAGE_KEYS.endpoint,
    elements.sceneSyncEndpoint.value.trim()
  );
  localStorage.setItem(
    SCENE_SYNC_STORAGE_KEYS.room,
    elements.sceneSyncRoom.value.trim()
  );
  localStorage.setItem(
    SCENE_SYNC_STORAGE_KEYS.scope,
    elements.sceneSyncScope.value
  );
  localStorage.setItem(
    SCENE_SYNC_STORAGE_KEYS.objectId,
    elements.sceneSyncObjectId.value.trim()
  );
  localStorage.setItem(
    SCENE_SYNC_STORAGE_KEYS.nickname,
    elements.sceneSyncNickname.value.trim()
  );
}

function updateSceneSyncScopeUi() {
  const isObjectScope = elements.sceneSyncScope.value === 'object';
  elements.sceneSyncObjectId.disabled = !isObjectScope;
}

function getCurrentSceneSyncSourceText() {
  const state = store.getState();

  if (!hasUnsyncedDslText && state.editorModel) {
    return generateCanonicalDslFromState();
  }

  return getDslText();
}

function getSceneSyncScopeFromUi() {
  const scope = elements.sceneSyncScope.value;

  if (scope === 'scene') {
    return 'scene';
  }

  const objectId = elements.sceneSyncObjectId.value.trim();

  if (!objectId) {
    throw new Error('Object ID is required for Object Behavior Graph.');
  }

  return { object: objectId };
}

function compileCurrentSceneSyncPayload() {
  const source = getCurrentSceneSyncSourceText();
  const scope = getSceneSyncScopeFromUi();

  const result = compileLoomToSceneSyncGraph(source, { scope });

  return createSceneGraphSetPayload(result.scope || scope, result.graph);
}

function createCurrentSceneSyncClearPayload() {
  const scope = getSceneSyncScopeFromUi();
  return createSceneGraphClearPayload(scope);
}

function normalizeSceneSyncEndpoint(endpoint) {
  return String(endpoint || '').trim().replace(/\/+$/, '');
}

function createSceneSyncBroadcastUrl({ endpoint, room, nickname }) {
  const base = normalizeSceneSyncEndpoint(endpoint);
  const encodedRoom = encodeURIComponent(room);
  const url = new URL(`${base}/api/room/${encodedRoom}/broadcast`);

  if (nickname) {
    url.searchParams.set('name', nickname);
  }

  return url.toString();
}

async function broadcastSceneSyncPayload(payload) {
  const endpoint = elements.sceneSyncEndpoint.value.trim();
  const room = elements.sceneSyncRoom.value.trim();
  const nickname = elements.sceneSyncNickname.value.trim() || 'Loomlet Editor';

  if (!endpoint) {
    throw new Error('Endpoint is required.');
  }

  if (!room) {
    throw new Error('Room is required.');
  }

  const url = createSceneSyncBroadcastUrl({ endpoint, room, nickname });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(
      `Scene Sync broadcast failed: ${response.status} ${response.statusText} ${
        body ? JSON.stringify(body) : ''
      }`
    );
  }

  return body;
}

function renderSceneSyncPayloadPreview(payload) {
  if (!elements.sceneSyncPayloadPreview) {
    return;
  }

  elements.sceneSyncPayloadPreview.textContent = payload
    ? JSON.stringify(payload, null, 2)
    : '';
}

async function handleCompileSceneSyncPayload() {
  try {
    saveSceneSyncSettings();

    const payload = compileCurrentSceneSyncPayload();

    renderSceneSyncPayloadPreview(payload);

    const state = store.getState();
    const source = (!hasUnsyncedDslText && state.editorModel)
      ? 'graph'
      : 'DSL editor';

    appendOutput({
      level: 'info',
      message: `Compiled Scene Sync payload from ${source}.`
    });
  } catch (error) {
    renderSceneSyncPayloadPreview(null);

    appendOutput({
      level: 'error',
      message: `Scene Sync compile failed: ${error.message}`
    });
  }
}

async function handleApplySceneSyncBehavior() {
  try {
    saveSceneSyncSettings();

    const payload = compileCurrentSceneSyncPayload();

    renderSceneSyncPayloadPreview(payload);

    const state = store.getState();
    const source = (!hasUnsyncedDslText && state.editorModel)
      ? 'graph'
      : 'DSL editor';

    const result = await broadcastSceneSyncPayload(payload);

    appendOutput({
      level: 'info',
      message: `Applied Scene Sync Behavior from ${source}.\n${JSON.stringify(result, null, 2)}`
    });
  } catch (error) {
    appendOutput({
      level: 'error',
      message: `Apply Scene Sync Behavior failed: ${error.message}`
    });
  }
}

async function handleClearSceneSyncBehavior() {
  try {
    saveSceneSyncSettings();

    const payload = createCurrentSceneSyncClearPayload();

    renderSceneSyncPayloadPreview(payload);

    const result = await broadcastSceneSyncPayload(payload);

    appendOutput({
      level: 'info',
      message: `Cleared Scene Sync Behavior.\n${JSON.stringify(result, null, 2)}`
    });
  } catch (error) {
    appendOutput({
      level: 'error',
      message: `Clear Scene Sync Behavior failed: ${error.message}`
    });
  }
}

function renderConnectionItem(edge) {
  const from = formatEdgeEndpoint(edge.fromNodeId, edge.fromPort);
  const to = formatEdgeEndpoint(edge.toNodeId, edge.toPort);

  return `
    <div class="connection-item">
      <div class="connection-label">
        <span class="connection-endpoint">${escapeHtml(from)}</span>
        <span class="connection-arrow">→</span>
        <span class="connection-endpoint">${escapeHtml(to)}</span>
      </div>
      <button
        class="btn connection-remove-btn"
        data-remove-edge-id="${escapeHtml(edge.id)}"
        title="Remove connection"
      >
        Remove
      </button>
    </div>
  `;
}

function renderConnectionGroup(title, edges) {
  if (!edges.length) {
    return `
      <div class="connection-group">
        <div class="connection-group-title">${escapeHtml(title)}</div>
        <div class="connection-empty">No ${escapeHtml(title.toLowerCase())} connections.</div>
      </div>
    `;
  }

  return `
    <div class="connection-group">
      <div class="connection-group-title">${escapeHtml(title)}</div>
      <div class="connection-list">
        ${edges.map(renderConnectionItem).join('')}
      </div>
    </div>
  `;
}

function renderConnectionsSection() {
  const { incoming, outgoing } = getSelectedNodeConnections();

  return `
    <div class="inspector-section">
      <div class="inspector-section-title">Connections</div>
      ${renderConnectionGroup('Incoming', incoming)}
      ${renderConnectionGroup('Outgoing', outgoing)}
    </div>
  `;
}

function renderInspector() {
  const panel = elements.inspectorPanel;
  const node = getSelectedEditorNode();

  if (!panel) return;

  if (!node) {
    panel.innerHTML = `
      <div class="empty-state">
        Select a node to edit its parameters.
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
        <div class="inspector-row">
          <label class="inspector-label" for="selected-node-label-input">Label:</label>
          <input
            id="selected-node-label-input"
            class="inspector-input"
            type="text"
            value="${escapeHtml(node.label || '')}"
            placeholder="Optional display label"
            spellcheck="false"
          />
        </div>
        <div class="inspector-row">
          <label class="inspector-label" for="selected-node-comment-input">Comment:</label>
          <textarea
            id="selected-node-comment-input"
            class="inspector-input"
            placeholder="Optional note"
            rows="3"
            spellcheck="true"
          >${escapeHtml(node.comment || '')}</textarea>
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

      ${renderConnectionsSection()}

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

function commitSelectedNodeLabel(input) {
  const node = getSelectedEditorNode();
  if (!node) return;

  const nextLabel = input.value;
  const currentLabel = node.label || '';

  if (nextLabel === currentLabel) return;

  applyNodeMetadataEdit('label', nextLabel || null);
}

function commitSelectedNodeComment(textarea) {
  const node = getSelectedEditorNode();
  if (!node) return;

  const nextComment = textarea.value;
  const currentComment = node.comment || '';

  if (nextComment === currentComment) return;

  applyNodeMetadataEdit('comment', nextComment || null);
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

  const labelInput = elements.inspectorPanel.querySelector('#selected-node-label-input');
  if (labelInput) {
    labelInput.addEventListener('change', () => {
      commitSelectedNodeLabel(labelInput);
    });

    labelInput.addEventListener('blur', () => {
      commitSelectedNodeLabel(labelInput);
    });

    labelInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      event.preventDefault();
      commitSelectedNodeLabel(labelInput);
      labelInput.blur();
    });
  }

  const commentInput = elements.inspectorPanel.querySelector('#selected-node-comment-input');
  if (commentInput) {
    commentInput.addEventListener('change', () => {
      commitSelectedNodeComment(commentInput);
    });

    commentInput.addEventListener('blur', () => {
      commitSelectedNodeComment(commentInput);
    });
  }

  elements.inspectorPanel
    .querySelectorAll('[data-remove-edge-id]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const edgeId = button.getAttribute('data-remove-edge-id');
        removeConnection(edgeId);
      });
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

async function removeConnection(edgeId) {
  if (!edgeId) return;

  const state = store.getState();
  if (!state.editorModel?.edgesById?.[edgeId]) {
    setEditorError(`Connection '${edgeId}' does not exist`);
    return;
  }

  await handleOperation({
    type: 'removeEdge',
    edgeId
  });
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

function applyNodeMetadataEdit(field, value) {
  if (!selectedNodeId) return;

  handleOperation({
    type: 'updateNodeMetadata',
    id: selectedNodeId,
    patch: {
      [field]: value
    }
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
  lastNodeValuePreviewAtMs = 0;

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
    if (typeof engine.enableProbes === 'function') {
      engine.enableProbes({ values: true });
    }
    engine.start({ getEnv: ({ elapsed }) => ({ time: elapsed }) });

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
    const effects = engine.getEffects();
    for (const effect of effects) {
      if (effect.type === 'log' && effect.message) {
        appendOutput({ level: 'log', message: effect.message });
      }
    }

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

    postNodeValuePreviews(engine, graph);
  }

  animationFrameId = requestAnimationFrame(() => tick(engine, graph));
}

function postNodeValuePreviews(engineInstance, graph) {
  if (!nodeEditor || !engineInstance || !graph) return;
  const now = performance.now();
  if (now - lastNodeValuePreviewAtMs < NODE_VALUE_PREVIEW_INTERVAL_MS) return;
  lastNodeValuePreviewAtMs = now;

  nodeEditor.setNodeValuePreviews(getLatestNodeValues(engineInstance, graph, NODE_TYPES));
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
  clearEditorHistory();
}

function loadSceneSyncPreset(name, source) {
  const currentText = getDslText();

  if (currentText.trim()) {
    const ok = window.confirm(
      `Loading "${name}" will replace the DSL editor content. Continue?`
    );

    if (!ok) {
      appendOutput({
        level: 'info',
        message: `Canceled loading Scene Sync preset: ${name}.`
      });
      return;
    }
  }

  setDslText(source);
  hasUnsyncedDslText = true;
  setDirty(true);
  scheduleAutoApplyDsl();

  appendOutput({
    level: 'info',
    message: `Loaded Scene Sync preset: ${name}.`
  });
}

function renderNodeListItem(node) {
  const isSelected = selectedNodeId === node.id;
  const selectedClass = isSelected ? ' selected' : '';
  const commentIndicator = node.comment ? ' ●' : '';

  const mainLabel = node.label || node.id;
  const subtitle = node.label ? node.id : `${node.type} • ${node.category}`;

  return `
    <div class="node-list-item${selectedClass}" data-node-id="${escapeHtml(node.id)}">
      <div class="node-list-item-content">
        <div class="node-list-item-label">${escapeHtml(mainLabel)}</div>
        <div class="node-list-item-subtitle">${escapeHtml(subtitle)}${commentIndicator}</div>
      </div>
      <button class="btn-focus-node" data-focus-node-id="${escapeHtml(node.id)}" title="Focus on node">Focus</button>
    </div>
  `;
}

function findNodeListItemById(nodeId) {
  if (!elements.nodeList || !nodeId) return null;

  return Array.from(elements.nodeList.querySelectorAll('[data-node-id]'))
    .find((item) => item.getAttribute('data-node-id') === nodeId) || null;
}

function scrollSelectedNodeListItemIntoView() {
  if (!selectedNodeId) return;

  const item = findNodeListItemById(selectedNodeId);
  item?.scrollIntoView({
    block: 'nearest',
    inline: 'nearest'
  });
}

function renderNodeList() {
  const list = elements.nodeList;
  if (!list) return;

  const state = store.getState();
  if (!state.editorModel) {
    list.innerHTML = '<div class="empty-state">No nodes in this graph.</div>';
    return;
  }

  const query = (elements.nodeListSearch?.value || '').trim().toLowerCase();
  const selectedCategory = elements.nodeListCategory?.value || '';

  const nodes = state.editorModel.order.map((nodeId) => state.editorModel.nodesById[nodeId]).filter(Boolean);

  const filtered = nodes.filter((node) => {
    if (selectedCategory && node.category !== selectedCategory) return false;
    if (!query) return true;

    return (
      node.id.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query) ||
      node.category.toLowerCase().includes(query) ||
      (node.label && node.label.toLowerCase().includes(query)) ||
      (node.comment && node.comment.toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No matching nodes.</div>';
    return;
  }

  list.innerHTML = filtered.map(renderNodeListItem).join('');

  list.querySelectorAll('[data-node-id]').forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-focus-node')) return;
      const nodeId = item.getAttribute('data-node-id');
      setSelectedNodeId(nodeId);
    });
  });

  list.querySelectorAll('[data-focus-node-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const nodeId = btn.getAttribute('data-focus-node-id');
      setSelectedNodeId(nodeId);
      if (nodeEditor?.focusNode) {
        try {
          await nodeEditor.focusNode(nodeId);
          const item = findNodeListItemById(nodeId);
          if (item) {
            item.classList.add('is-focused-pulse');
            setTimeout(() => {
              item.classList.remove('is-focused-pulse');
            }, 800);
          }
        } catch (err) {
          console.error('Focus node error:', err);
        }
      }
    });
  });

  scrollSelectedNodeListItemIntoView();
}

function updateNodeListCategories() {
  const select = elements.nodeListCategory;
  if (!select) return;

  const currentValue = select.value || '';

  const state = store.getState();
  if (!state.editorModel) {
    select.innerHTML = '<option value="">All categories</option>';
    return;
  }

  const categories = Array.from(
    new Set(
      state.editorModel.order
        .map((nodeId) => state.editorModel.nodesById[nodeId])
        .filter(Boolean)
        .map((node) => node.category)
    )
  ).sort();

  select.innerHTML = [
    '<option value="">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
  ].join('');

  const availableValues = new Set(categories);
  if (currentValue && availableValues.has(currentValue)) {
    select.value = currentValue;
  } else {
    select.value = '';
  }

  renderNodeList();
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
    position: createPositionForNewNode(category, nodes, findNonOverlappingPosition, NODE_LAYOUT_STEP_Y)
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
  // Handle node search focus with Cmd/Ctrl+Shift+F or /
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
    if (!isTextEditingTarget(event.target)) {
      event.preventDefault();
      selectBottomTab('nodes');
      elements.nodeListSearch?.focus();
      return;
    }
  }

  if (event.key === '/' && !isTextEditingTarget(event.target)) {
    const activeTab = getActiveBottomTab();
    if (activeTab === 'nodes') {
      event.preventDefault();
      elements.nodeListSearch?.focus();
      return;
    }
  }

  // Handle node deletion with Delete/Backspace
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  if (!selectedNodeId) return;
  if (isTextEditingTarget(event.target)) return;

  event.preventDefault();
  deleteSelectedNode();
}

function cloneJson(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clearMoveHistoryCoalesceTimer() {
  if (moveHistoryCoalesceTimer) {
    clearTimeout(moveHistoryCoalesceTimer);
    moveHistoryCoalesceTimer = null;
  }
}

function finishMoveHistoryGroup() {
  clearMoveHistoryCoalesceTimer();
  activeMoveHistoryNodeId = null;
}

function scheduleMoveHistoryGroupFinish() {
  clearMoveHistoryCoalesceTimer();

  moveHistoryCoalesceTimer = window.setTimeout(() => {
    finishMoveHistoryGroup();
  }, MOVE_HISTORY_COALESCE_MS);
}

function clearParamHistoryCoalesceTimer() {
  if (paramHistoryCoalesceTimer) {
    clearTimeout(paramHistoryCoalesceTimer);
    paramHistoryCoalesceTimer = null;
  }
}

function finishParamHistoryGroup() {
  clearParamHistoryCoalesceTimer();
  activeParamHistoryKey = null;
}

function scheduleParamHistoryGroupFinish() {
  clearParamHistoryCoalesceTimer();

  paramHistoryCoalesceTimer = window.setTimeout(() => {
    finishParamHistoryGroup();
  }, PARAM_HISTORY_COALESCE_MS);
}

function createParamHistoryKey(operation) {
  if (operation?.type !== 'updateParam') return null;
  return `${operation.id}\0${operation.key}`;
}

function isNoopMoveOperation(operation) {
  if (operation?.type !== 'moveNode') return false;

  const state = store.getState();
  const node = state.editorModel?.nodesById?.[operation.id];
  if (!node) return false;

  return (
    node.position?.x === operation.position?.x &&
    node.position?.y === operation.position?.y
  );
}

function isNoopParamOperation(operation) {
  if (operation?.type !== 'updateParam') return false;

  const state = store.getState();
  const node = state.editorModel?.nodesById?.[operation.id];
  if (!node) return false;

  return Object.is(node.params?.[operation.key], operation.value);
}

function shouldPushHistoryForOperation(operation) {
  if (isApplyingHistory) return false;

  if (operation?.type === 'updateParam') {
    finishMoveHistoryGroup();

    const key = createParamHistoryKey(operation);
    if (!key) {
      finishParamHistoryGroup();
      return true;
    }

    if (isNoopParamOperation(operation)) {
      return false;
    }

    if (activeParamHistoryKey === key) {
      scheduleParamHistoryGroupFinish();
      return false;
    }

    finishParamHistoryGroup();
    activeParamHistoryKey = key;
    scheduleParamHistoryGroupFinish();
    return true;
  }

  if (operation?.type !== 'moveNode') {
    finishMoveHistoryGroup();
    finishParamHistoryGroup();
    return true;
  }

  finishParamHistoryGroup();

  const nodeId = operation.id;

  if (!nodeId) {
    finishMoveHistoryGroup();
    return true;
  }

  if (isNoopMoveOperation(operation)) {
    return false;
  }

  if (activeMoveHistoryNodeId === nodeId) {
    scheduleMoveHistoryGroupFinish();
    return false;
  }

  finishMoveHistoryGroup();
  activeMoveHistoryNodeId = nodeId;
  scheduleMoveHistoryGroupFinish();
  return true;
}

function createEditorHistorySnapshot() {
  const state = store.getState();

  return {
    graph: cloneJson(state.graph),
    editorModel: cloneJson(state.editorModel),
    sourceText: state.sourceText,
    sourceAst: cloneJson(state.sourceAst),
    errors: cloneJson(state.errors || []),
    selectedNodeId,
    dslText: getDslText(),
    hasUnsyncedDslText,
    latestSuccessfulDslText
  };
}

function pushUndoSnapshot(snapshot) {
  if (!snapshot?.editorModel || !snapshot?.graph) return;

  undoStack.push(snapshot);

  if (undoStack.length > MAX_HISTORY_ENTRIES) {
    undoStack.shift();
  }

  redoStack = [];
  renderUndoRedoState();
}

function renderUndoRedoState() {
  if (elements.undoBtn) {
    elements.undoBtn.disabled = undoStack.length === 0;
  }

  if (elements.redoBtn) {
    elements.redoBtn.disabled = redoStack.length === 0;
  }
}

async function restoreEditorHistorySnapshot(snapshot, { pushRedo = false, pushUndo = false } = {}) {
  if (!snapshot) return;

  finishMoveHistoryGroup();
  finishParamHistoryGroup();

  const currentSnapshot = createEditorHistorySnapshot();

  if (pushRedo) {
    redoStack.push(currentSnapshot);
  }

  if (pushUndo) {
    undoStack.push(currentSnapshot);
  }

  store.setState({
    graph: cloneJson(snapshot.graph),
    editorModel: cloneJson(snapshot.editorModel),
    sourceText: snapshot.sourceText,
    sourceAst: cloneJson(snapshot.sourceAst),
    errors: cloneJson(snapshot.errors || [])
  });

  selectedNodeId = snapshot.selectedNodeId;
  hasUnsyncedDslText = snapshot.hasUnsyncedDslText;
  latestSuccessfulDslText = snapshot.latestSuccessfulDslText;

  setDslText(snapshot.dslText || snapshot.sourceText || '');

  await nodeEditor?.renderModel(snapshot.editorModel, { force: true });

  renderGraphJSON(snapshot.graph);
  renderErrors();
  renderInspector();
  updateNodeListCategories();
  renderNodeList();
  runPreview(snapshot.graph);

  setDirty(true);
  renderUndoRedoState();
  renderAutoApplyStatus('ok');
}

async function undoGraphEdit() {
  if (!undoStack.length) return;

  finishMoveHistoryGroup();
  finishParamHistoryGroup();
  cancelPendingAutoApplyDsl();

  isApplyingHistory = true;
  try {
    const snapshot = undoStack.pop();
    await restoreEditorHistorySnapshot(snapshot, { pushRedo: true });
  } finally {
    isApplyingHistory = false;
    renderUndoRedoState();
  }
}

async function redoGraphEdit() {
  if (!redoStack.length) return;

  finishMoveHistoryGroup();
  finishParamHistoryGroup();
  cancelPendingAutoApplyDsl();

  isApplyingHistory = true;
  try {
    const snapshot = redoStack.pop();
    await restoreEditorHistorySnapshot(snapshot, { pushUndo: true });
  } finally {
    isApplyingHistory = false;
    renderUndoRedoState();
  }
}

function handleUndoRedoKeyDown(event) {
  const isUndoRedoKey = event.key.toLowerCase() === 'z';
  if (!isUndoRedoKey) return;
  if (!(event.metaKey || event.ctrlKey)) return;

  if (isTextEditingTarget(event.target)) {
    return;
  }

  event.preventDefault();

  if (event.shiftKey) {
    redoGraphEdit();
  } else {
    undoGraphEdit();
  }
}

function clearEditorHistory() {
  finishMoveHistoryGroup();
  finishParamHistoryGroup();
  undoStack = [];
  redoStack = [];
  renderUndoRedoState();
}

function setupEventListeners() {
  elements.applyDslBtn.addEventListener('click', applyDsl);
  elements.generateDslBtn.addEventListener('click', generateDsl);
  elements.runPreviewBtn.addEventListener('click', () => {
    const state = store.getState();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    clearOutput();
    runPreview(state.graph);
  });
  elements.resetSampleBtn.addEventListener('click', resetSample);
  elements.clearOutputBtn?.addEventListener('click', clearOutput);
  elements.togglePanelsBtn.addEventListener('click', () => {
    setPanelsVisible(!panelsVisible);
  });
  elements.openFileBtn.addEventListener('click', openLoomFile);
  elements.saveFileBtn.addEventListener('click', saveDslFile);
  elements.saveAsFileBtn.addEventListener('click', saveDslAsFile);

  elements.editorPanels?.querySelectorAll('[data-action="maximize-dsl"]').forEach(btn => {
    btn.addEventListener('click', () => setEditorMaximizeMode('dsl'));
  });

  elements.editorPanels?.querySelectorAll('[data-action="maximize-node"]').forEach(btn => {
    btn.addEventListener('click', () => setEditorMaximizeMode('node'));
  });

  elements.editorPanels?.querySelectorAll('[data-action="restore-split"]').forEach(btn => {
    btn.addEventListener('click', () => setEditorMaximizeMode('split'));
  });

  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      selectBottomTab(tabName);
    });
  });

  elements.clearOutputBtn?.addEventListener('click', clearOutput);

  // Scene Sync event listeners
  elements.sceneSyncEndpoint?.addEventListener('input', saveSceneSyncSettings);
  elements.sceneSyncRoom?.addEventListener('input', saveSceneSyncSettings);
  elements.sceneSyncObjectId?.addEventListener('input', saveSceneSyncSettings);
  elements.sceneSyncNickname?.addEventListener('input', saveSceneSyncSettings);

  elements.sceneSyncScope?.addEventListener('change', () => {
    updateSceneSyncScopeUi();
    saveSceneSyncSettings();
  });

  elements.compileSceneSyncPayloadBtn?.addEventListener('click', handleCompileSceneSyncPayload);
  elements.applySceneSyncBehaviorBtn?.addEventListener('click', handleApplySceneSyncBehavior);
  elements.clearSceneSyncBehaviorBtn?.addEventListener('click', handleClearSceneSyncBehavior);

  elements.loadSceneSyncJumpPresetBtn?.addEventListener('click', () => {
    loadSceneSyncPreset('Jump Preview', SCENE_SYNC_JUMP_PRESET);
  });

  elements.loadSceneSyncCirclePresetBtn?.addEventListener('click', () => {
    loadSceneSyncPreset('Circle Preview', SCENE_SYNC_CIRCLE_PRESET);
  });

  elements.nodePaletteSearch?.addEventListener('input', renderNodePalette);
  elements.nodePaletteCategory?.addEventListener('change', renderNodePalette);

  elements.nodeListSearch?.addEventListener('input', renderNodeList);
  elements.nodeListCategory?.addEventListener('change', renderNodeList);

  elements.bottomPanelResizeHandle?.addEventListener('pointerdown', startBottomPanelResize);
  window.addEventListener('pointermove', resizeBottomPanel);
  window.addEventListener('pointerup', stopBottomPanelResize);
  window.addEventListener('resize', handleWindowResizeForBottomPanel);
  elements.bottomPanelCollapseBtn?.addEventListener('click', toggleBottomPanelCollapsed);

  elements.editorSplitResizeHandle?.addEventListener('pointerdown', startEditorSplitResize);
  window.addEventListener('pointermove', resizeEditorSplit);
  window.addEventListener('pointerup', stopEditorSplitResize);

  window.addEventListener('resize', resizePreviewCanvas);
  window.addEventListener('keydown', handleGlobalKeyDown);

  elements.undoBtn?.addEventListener('click', undoGraphEdit);
  elements.redoBtn?.addEventListener('click', redoGraphEdit);
  window.addEventListener('keydown', handleUndoRedoKeyDown);
}

async function handleOperation(operation) {
  const initialState = store.getState();
  if (!initialState.editorModel) return null;

  const pendingDsl = await syncPendingDslBeforeNodeOperation({
    hasUnsyncedDslText,
    getDslText,
    applyDslTextToGraph,
    interruptAutoApply: interruptPendingAutoApplyDsl,
    onSyncOk: () => {
      clearEditorHistory();
      renderAutoApplyStatus('ok');
    },
    onSyncError: () => {
      appendOutput({
        level: 'error',
        message: 'Resolve DSL errors before editing the node graph.'
      });
      renderAutoApplyStatus('error');
    }
  });

  if (!pendingDsl.ok) {
    await nodeEditor?.renderModel(initialState.editorModel, { force: true });
    renderGraphJSON(initialState.graph);
    renderErrors();
    renderInspector();
    updateNodeListCategories();
    renderNodeList();

    return {
      state: store.getState(),
      change: {
        operation,
        graphChanged: false,
        shouldRerenderView: false,
        affectsDsl: false
      },
      error: new Error('DSL_SYNC_REQUIRED')
    };
  }

  const state = store.getState();
  const beforeSnapshot = createEditorHistorySnapshot();
  const shouldPushHistory = shouldPushHistoryForOperation(operation);

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
    const isNodeEditorControlParamEdit =
      operation?.type === 'updateParam' &&
      operation?.source === 'nodeEditorControl';

    if (result.change.shouldRerenderView && !isNodeEditorControlParamEdit) {
      await nodeEditor?.renderModel(result.state.editorModel);
    }

    if (result.change.operation.type === 'renameNode' && selectedNodeId === result.change.operation.id) {
      const renamedId = result.change.operation.newId.trim();
      selectedNodeId = result.state.editorModel.nodesById[renamedId] ? renamedId : null;
    } else if (selectedNodeId && !result.state.editorModel.nodesById[selectedNodeId]) {
      selectedNodeId = null;
    }

    const affectsDsl = result.change.affectsDsl !== false;
    const isMetadataOnlyOperation = result.change.operation.type === 'updateNodeMetadata';

    if (affectsDsl) {
      renderGraphJSON(result.state.graph);
      runPreview(result.state.graph);
      hasUnsyncedDslText = false;
      cancelPendingAutoApplyDsl();
      syncGraphToDslEditor({
        markDirty: true,
        operation: result.change.operation,
        graph: result.state.graph
      });
    } else {
      renderGraphJSON(result.state.graph);
    }

    renderErrors();

    if (!isMetadataOnlyOperation && !isNodeEditorControlParamEdit) {
      renderInspector();
    }

    updateNodeListCategories();
    renderNodeList();
    setDirty(true);

    if (shouldPushHistory) {
      pushUndoSnapshot(beforeSnapshot);
    }

    return result;
  }

  if (result.error) {
    if (operation?.type === 'moveNode') {
      finishMoveHistoryGroup();
    }

    const currentModel = state.editorModel;
    if (currentModel && result.change.shouldRerenderView) {
      await nodeEditor?.renderModel(currentModel);
    }

    renderErrors();
    return result;
  }

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
  loadBottomPanelLayout();
  loadEditorSplitLayout();
  loadActiveBottomTab();
  loadEditorMaximizeMode();
  loadSceneSyncSettings();
  renderFileStatus();
  renderDirtyStatus();
  renderAutoApplyStatus();
  renderAutoSyncGraphToDslStatus();
  renderUndoRedoState();
  renderNodePaletteCategories();
  renderNodePalette();
  updateNodeListCategories();
  renderNodeList();
  renderOutput();

  applyEditorMaximizeMode();

  await applyDsl({ markDirty: false, logOutput: false });
  setDirty(false);
}

init();
