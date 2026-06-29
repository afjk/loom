import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { forceLinting } from '@codemirror/lint';

import { Loom, NODE_TYPES } from '../../src/loom.js';
import { describeGraphHostCompatibility } from '../../src/runtime/capabilities.js';
import { getLatestNodeValues, formatValuePreview } from '../../src/value-preview.js';
import { loomletDslExtensions } from './loomlet-codemirror.js';
import { valueInlayExtensions, dispatchValueInlays } from './dsl-value-inlay.js';
import { parseDSLToAST, compileToGraph, defaultOutputPort } from '../../src/loom-dsl.js';
import { compileLoomToSceneSyncGraph } from '../../src/scenesync/graph-adapter.js';
import { reduceSceneEffectsToObjects, graphHasSceneNodes } from '../../src/scenesync/preview-transform.js';
// Object-scoped Scene Sync behavior samples (omit objectId; the host applies
// them to the attached/selected object). Imported as raw text from the tour.
import behaviorClickColor from '../../examples/tour/scenesync/behaviors/01-click-color.loom?raw';
import behaviorFloatY from '../../examples/tour/scenesync/behaviors/02-float-y.loom?raw';
import behaviorOrbitOffset from '../../examples/tour/scenesync/behaviors/03-orbit-offset.loom?raw';
import behaviorBreathingScale from '../../examples/tour/scenesync/behaviors/04-breathing-scale.loom?raw';
import { Scene3DPreview } from './scene3d-preview.js';
import {
  graphToEditorModel,
  subgraphBodyToEditorModel,
  editorModelToGraph,
  applyNodeEditorOperationState,
  preserveEditorModelLayout,
  findNonOverlappingPosition,
  NODE_LAYOUT_STEP_Y
} from '../../src/node-editor-core.js';
import { graphToCanonicalDSL, subgraphsToFnDefinitions } from '../../src/canonical-dsl.js';
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
const SCENE_SYNC_JUMP_PRESET = `import math
import scene

t = clock()
dy = math.sine(t, freq: 0.8, amplitude: 0.5)

scene.offsetPosition(objectId: "sample-cube", y: dy)

previewY = math.add(200, math.multiply(dy, -120))
render point(x: 300, y: previewY, radius: 8, color: "#ff70a6", trail: 0.08)
`;

const SCENE_SYNC_CIRCLE_PRESET = `import math
import scene

t = clock()
dx = math.cosine(t, freq: 0.2, amplitude: 1.5)
dz = math.sine(t, freq: 0.2, amplitude: 1.5)

scene.offsetPosition(objectId: "sample-cube", x: dx, z: dz)

previewX = math.add(300, math.multiply(dx, 80))
previewY = math.add(200, math.multiply(dz, 80))

render point(x: previewX, y: previewY, radius: 8, color: "#80ed99", trail: 0.08)
`;

const BOTTOM_PANEL_HEIGHT_KEY = 'loomlet.editorStudio.bottomPanelHeight';
const BOTTOM_PANEL_COLLAPSED_KEY = 'loomlet.editorStudio.bottomPanelCollapsed';
const EDITOR_SPLIT_WIDTH_KEY = 'loomlet.editorStudio.editorSplitWidth';
const PREVIEW_PANE_WIDTH_KEY = 'loomlet.editorStudio.previewPaneWidth';
const ACTIVE_BOTTOM_TAB_KEY = 'loomlet.editorStudio.activeBottomTab';
const EDITOR_MAXIMIZE_MODE_KEY = 'loomlet.editorStudio.editorMaximizeMode';
const PREVIEW_LAYOUT_MODE_KEY = 'loomlet.editorStudio.previewLayoutMode';
const DOCKED_EDITOR_TAB_KEY = 'loomlet.editorStudio.dockedEditorTab';

const SCENE_SYNC_PRESETS = {
  jump: { label: 'Jump (vertical bounce)', source: SCENE_SYNC_JUMP_PRESET },
  circle: { label: 'Circle (orbit)', source: SCENE_SYNC_CIRCLE_PRESET },
  'click-color': { label: 'Click color flash', source: behaviorClickColor },
  'float-y': { label: 'Float Y', source: behaviorFloatY },
  'orbit-offset': { label: 'Orbit offset', source: behaviorOrbitOffset },
  'breathing-scale': { label: 'Breathing scale', source: behaviorBreathingScale }
};

const MAX_HISTORY_ENTRIES = 100;
const MOVE_HISTORY_COALESCE_MS = 250;
const PARAM_HISTORY_COALESCE_MS = 750;
const NODE_VALUE_PREVIEW_INTERVAL_MS = 100;
const VALUE_INLAY_STORAGE_KEY = 'loomlet.dslValueInlay';

let outputEntries = [];
const MAX_OUTPUT_ENTRIES = 500;

const DEFAULT_BOTTOM_PANEL_HEIGHT = 260;
const MIN_BOTTOM_PANEL_HEIGHT = 120;
const MAX_BOTTOM_PANEL_RATIO = 0.6;

const DEFAULT_DSL_PANE_WIDTH = 520;
const MIN_DSL_PANE_WIDTH = 280;
const MIN_NODE_PANE_WIDTH = 320;
const DEFAULT_PREVIEW_PANE_WIDTH = 520;
const MIN_PREVIEW_PANE_WIDTH = 320;
const MIN_DOCKED_EDITOR_WIDTH = 360;
const DOCKED_PREVIEW_ASPECT_RATIO = 16 / 9;
const EDITOR_SPLIT_HANDLE_WIDTH = 8;
const EDITOR_SPLIT_GRID_GAP = 12;
const EDITOR_SPLIT_GRID_GAP_COUNT = 2;

const store = createStore();
let dslEditor = null;
let nodeEditor = null;
let engine = null;
let animationFrameId = null;
let scene3dPreview = null;
let is3DPreviewActive = false;
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
let previewPaneWidth = DEFAULT_PREVIEW_PANE_WIDTH;
let isResizingEditorSplit = false;

let undoStack = [];
let redoStack = [];
let isApplyingHistory = false;
let activeMoveHistoryNodeId = null;
let moveHistoryCoalesceTimer = null;
let activeParamHistoryKey = null;
let paramHistoryCoalesceTimer = null;
let editorMaximizeMode = 'split';
let previewLayoutMode = 'background';
let dockedEditorTab = 'node';
let lastNodeValuePreviewAtMs = 0;
const VALUE_INLAY_MODES = ['off', 'compact', 'verbose'];
let valueInlayMode = readValueInlayMode();
let previewEventQueue = [];
let previewEventScopeId = '';
let previewEventSequence = 0;

const elements = {
  dslEditorHost: document.getElementById('dsl-editor-host'),
  dslValueInlayBtn: document.getElementById('dslValueInlayBtn'),
  nodeEditorHost: document.getElementById('node-editor'),
  previewCanvas: document.getElementById('preview-canvas'),
  previewStage: document.getElementById('preview-stage'),
  scene3dHost: document.getElementById('scene3d-host'),
  previewEventStatus: document.getElementById('previewEventStatus'),
  graphJson: document.getElementById('graph-json'),
  errorsList: document.getElementById('errors-list'),
  compatPanel: document.getElementById('compat-panel'),
  functionsPanel: document.getElementById('functions-panel'),
  fnSubviewOverlay: document.getElementById('fn-subview-overlay'),
  fnSubviewTitle: document.getElementById('fn-subview-title'),
  fnSubviewClose: document.getElementById('fn-subview-close'),
  fnSubviewCanvas: document.getElementById('fn-subview-canvas'),
  confirmOverlay: document.getElementById('confirm-overlay'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmCancel: document.getElementById('confirm-cancel'),
  confirmOk: document.getElementById('confirm-ok'),
  inspectorPanel: document.getElementById('inspector-panel'),
  applyDslBtn: document.getElementById('applyDslBtn'),
  generateDslBtn: document.getElementById('generateDslBtn'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  resetSampleBtn: document.getElementById('resetSampleBtn'),
  togglePanelsBtn: document.getElementById('toggle-panels'),
  previewLayoutBtns: document.querySelectorAll('[data-preview-layout]'),
  dockedEditorTabBtns: document.querySelectorAll('[data-docked-editor-tab]'),
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
  syncStatus: document.getElementById('sync-status'),
  bottomPanel: document.getElementById('bottom-panel'),
  bottomPanelResizeHandle: document.getElementById('bottom-panel-resize-handle'),
  bottomPanelCollapseBtn: document.getElementById('bottom-panel-collapse-btn'),
  editorPanels: document.querySelector('.editor-panels'),
  editorSplitResizeHandle: document.getElementById('editor-split-resize-handle'),
  undoBtn: document.getElementById('undo-btn'),
  redoBtn: document.getElementById('redo-btn'),
  outputLog: document.getElementById('output-log'),
  clearOutputBtn: document.getElementById('clear-output-btn'),
  copySceneSyncGraphBtn: document.getElementById('copySceneSyncGraphBtn'),
  sceneSyncGraphPreview: document.getElementById('sceneSyncGraphPreview'),
  sceneSyncPresetSelect: document.getElementById('sceneSyncPresetSelect'),
  loadSceneSyncPresetBtn: document.getElementById('loadSceneSyncPresetBtn'),
  nodeZoomInBtn: document.getElementById('node-zoom-in-btn'),
  nodeZoomOutBtn: document.getElementById('node-zoom-out-btn'),
  nodeZoomFitBtn: document.getElementById('node-zoom-fit-btn'),
  nodeAutoLayoutBtn: document.getElementById('node-auto-layout-btn'),
  nodeAddBtn: document.getElementById('node-add-btn')
};

function setPanelsVisible(visible) {
  panelsVisible = visible;
  document.body.classList.toggle('panels-hidden', !visible);

  const button = elements.togglePanelsBtn;
  if (button) {
    button.textContent = visible ? 'Hide Editors' : 'Show Editors';
  }

  mountPreviewSurface();
  resizePreviewCanvas();
  notifyNodeEditorLayoutChanged();
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
  resizePreviewCanvas();
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
  previewPaneWidth = clampPreviewPaneWidth(previewPaneWidth);
  applyEditorSplitLayout();

  saveBottomPanelLayout();
  saveEditorSplitLayout();
}

function toggleBottomPanelCollapsed() {
  isBottomPanelCollapsed = !isBottomPanelCollapsed;
  applyBottomPanelLayout();
  resizePreviewCanvas();
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

function getMaxPreviewPaneWidth() {
  const panels = elements.editorPanels;
  if (!panels) return DEFAULT_PREVIEW_PANE_WIDTH;

  const rect = panels.getBoundingClientRect();
  const maxWidth =
    rect.width
    - MIN_DOCKED_EDITOR_WIDTH
    - EDITOR_SPLIT_HANDLE_WIDTH
    - EDITOR_SPLIT_GRID_GAP * EDITOR_SPLIT_GRID_GAP_COUNT;

  return Math.max(MIN_PREVIEW_PANE_WIDTH, Math.floor(maxWidth));
}

function clampDslPaneWidth(width) {
  return Math.min(
    Math.max(width, MIN_DSL_PANE_WIDTH),
    getMaxDslPaneWidth()
  );
}

function clampPreviewPaneWidth(width) {
  return Math.min(
    Math.max(width, MIN_PREVIEW_PANE_WIDTH),
    getMaxPreviewPaneWidth()
  );
}

function applyEditorSplitLayout() {
  const panels = elements.editorPanels;
  if (!panels) return;

  dslPaneWidth = clampDslPaneWidth(dslPaneWidth);
  previewPaneWidth = clampPreviewPaneWidth(previewPaneWidth);
  panels.style.setProperty('--dsl-pane-width-px', `${dslPaneWidth}px`);
  panels.style.setProperty('--preview-pane-width-px', `${previewPaneWidth}px`);
}

function loadEditorSplitLayout() {
  const savedWidth = Number(localStorage.getItem(EDITOR_SPLIT_WIDTH_KEY));
  if (Number.isFinite(savedWidth)) {
    dslPaneWidth = savedWidth;
  }

  const savedPreviewWidth = Number(localStorage.getItem(PREVIEW_PANE_WIDTH_KEY));
  if (Number.isFinite(savedPreviewWidth)) {
    previewPaneWidth = savedPreviewWidth;
  }

  applyEditorSplitLayout();
}

function saveEditorSplitLayout() {
  localStorage.setItem(EDITOR_SPLIT_WIDTH_KEY, String(dslPaneWidth));
  localStorage.setItem(PREVIEW_PANE_WIDTH_KEY, String(previewPaneWidth));
}

function isPreviewDockedInPanels() {
  return previewLayoutMode === 'docked' && panelsVisible && Boolean(elements.previewStage);
}

function getPreviewSurfaceParent() {
  return isPreviewDockedInPanels() ? elements.previewStage : document.body;
}

function getDockedPreviewRenderRect() {
  const stage = elements.previewStage;
  if (!stage) return null;

  if (!isPreviewDockedInPanels()) {
    return null;
  }

  const availableWidth = Math.max(1, stage.clientWidth);
  const availableHeight = Math.max(1, stage.clientHeight);
  const availableAspect = availableWidth / availableHeight;

  let width = availableWidth;
  let height = availableHeight;
  if (availableAspect > DOCKED_PREVIEW_ASPECT_RATIO) {
    width = availableWidth;
    height = width / DOCKED_PREVIEW_ASPECT_RATIO;
  } else {
    height = availableHeight;
    width = height * DOCKED_PREVIEW_ASPECT_RATIO;
  }

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
    left: Math.floor((availableWidth - width) / 2),
    top: Math.floor((availableHeight - height) / 2)
  };
}

function applyPreviewSurfaceLayout() {
  if (isPreviewDockedInPanels()) {
    const rect = getDockedPreviewRenderRect();
    if (!rect) return { width: 1, height: 1 };

    for (const element of [elements.previewCanvas, elements.scene3dHost]) {
      if (!element) continue;
      element.style.left = `${rect.left}px`;
      element.style.top = `${rect.top}px`;
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    }

    return { width: rect.width, height: rect.height };
  }

  if (elements.previewCanvas) {
    elements.previewCanvas.style.left = '';
    elements.previewCanvas.style.top = '';
    elements.previewCanvas.style.width = `${window.innerWidth}px`;
    elements.previewCanvas.style.height = `${window.innerHeight}px`;
  }

  if (elements.scene3dHost) {
    elements.scene3dHost.style.left = '';
    elements.scene3dHost.style.top = '';
    elements.scene3dHost.style.width = '';
    elements.scene3dHost.style.height = '';
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function mountPreviewSurface() {
  const parent = getPreviewSurfaceParent();
  if (!parent) return;

  for (const element of [elements.previewCanvas, elements.scene3dHost]) {
    if (!element || element.parentElement === parent) continue;
    parent.appendChild(element);
  }
}

function getPreviewSurfaceSize() {
  return applyPreviewSurfaceLayout();
}

function applyDockedEditorTab() {
  const normalized = dockedEditorTab === 'dsl' ? 'dsl' : 'node';
  dockedEditorTab = normalized;

  document.body.classList.toggle('docked-editor-dsl', normalized === 'dsl');
  document.body.classList.toggle('docked-editor-node', normalized === 'node');

  elements.dockedEditorTabBtns?.forEach((button) => {
    const active = button.getAttribute('data-docked-editor-tab') === normalized;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function setDockedEditorTab(tab, { save = true } = {}) {
  if (!['node', 'dsl'].includes(tab)) return;
  dockedEditorTab = tab;
  applyDockedEditorTab();
  notifyNodeEditorLayoutChanged();
  if (save) {
    localStorage.setItem(DOCKED_EDITOR_TAB_KEY, dockedEditorTab);
  }
}

function updatePreviewLayoutButtons() {
  elements.previewLayoutBtns?.forEach((button) => {
    const active = button.getAttribute('data-preview-layout') === previewLayoutMode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function applyPreviewLayoutMode() {
  document.body.classList.toggle('preview-layout-docked', previewLayoutMode === 'docked');
  document.body.classList.toggle('preview-layout-background', previewLayoutMode !== 'docked');

  applyDockedEditorTab();
  updatePreviewLayoutButtons();
  mountPreviewSurface();
  applyEditorSplitLayout();
  resizePreviewCanvas();
  notifyNodeEditorLayoutChanged();
}

function setPreviewLayoutMode(mode, { save = true } = {}) {
  if (!['background', 'docked'].includes(mode)) return;
  previewLayoutMode = mode;
  applyPreviewLayoutMode();
  if (save) {
    localStorage.setItem(PREVIEW_LAYOUT_MODE_KEY, previewLayoutMode);
  }
}

function loadPreviewLayoutMode() {
  const savedLayout = localStorage.getItem(PREVIEW_LAYOUT_MODE_KEY);
  if (savedLayout === 'background' || savedLayout === 'docked') {
    previewLayoutMode = savedLayout;
  }

  const savedDockedTab = localStorage.getItem(DOCKED_EDITOR_TAB_KEY);
  if (savedDockedTab === 'node' || savedDockedTab === 'dsl') {
    dockedEditorTab = savedDockedTab;
  }

  applyPreviewLayoutMode();
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

  const showMaximizeControls = previewLayoutMode === 'background';

  panels.querySelectorAll('[data-action="maximize-dsl"]').forEach((btn) => {
    btn.style.display = showMaximizeControls && editorMaximizeMode === 'split' ? 'block' : 'none';
  });

  panels.querySelectorAll('[data-action="maximize-node"]').forEach((btn) => {
    btn.style.display = showMaximizeControls && editorMaximizeMode === 'split' ? 'block' : 'none';
  });

  panels.querySelectorAll('[data-action="restore-split"]').forEach((btn) => {
    btn.style.display = showMaximizeControls && editorMaximizeMode !== 'split' ? 'block' : 'none';
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

  if (previewLayoutMode === 'docked') {
    previewPaneWidth = clampPreviewPaneWidth(nextWidth);
  } else {
    dslPaneWidth = clampDslPaneWidth(nextWidth);
  }
  applyEditorSplitLayout();
  resizePreviewCanvas();
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

  const { width, height } = getPreviewSurfaceSize();
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  if (scene3dPreview) {
    scene3dPreview.resize();
  }
}

// Show/hide the 3D Scene Preview. Graphs that drive scene.* objects render in
// the three.js viewport; everything else uses the 2D point/bar canvas.
function setScene3DActive(active) {
  is3DPreviewActive = active;

  if (elements.scene3dHost) {
    elements.scene3dHost.hidden = !active;
  }

  if (active && !scene3dPreview && elements.scene3dHost) {
    scene3dPreview = new Scene3DPreview(elements.scene3dHost, {
      onObjectPointerEvent: handleScenePreviewObjectPointerEvent
    });
  }

  if (active && scene3dPreview) {
    scene3dPreview.onObjectPointerEvent = handleScenePreviewObjectPointerEvent;
    scene3dPreview.resize();
  }
}

function setPreviewEventScope(target = '') {
  const nextTarget = String(target || '').trim();
  previewEventScopeId = nextTarget;
}

function renderPreviewEventStatus(text) {
  if (!elements.previewEventStatus) return;
  elements.previewEventStatus.hidden = !text;
  elements.previewEventStatus.textContent = text || '';
}

function formatPreviewEventDescriptor(event) {
  const target = event.target ? ` -> ${event.target}` : '';
  return `${event.channel}${target}`;
}

function queuePreviewEvent(event) {
  if (!event?.channel) return;

  const target = typeof event.target === 'string' ? event.target.trim() : '';
  const queued = {
    id: ++previewEventSequence,
    channel: event.channel,
    ...(target ? { target } : {}),
    ...(event.payload !== undefined ? { payload: event.payload } : {}),
    ...(event.pointer ? { pointer: event.pointer } : {})
  };

  previewEventQueue.push(queued);
  setPreviewEventScope(target);
  renderPreviewEventStatus(formatPreviewEventDescriptor(queued));
  appendOutput({
    level: 'event',
    message: `Queued preview event: ${formatPreviewEventDescriptor(queued)}`
  });
}

function consumePreviewEvents(elapsed) {
  if (!previewEventQueue.length) return [];

  const queued = previewEventQueue;
  previewEventQueue = [];

  return queued.map((event) => ({
    channel: event.channel,
    timestamp: Number.isFinite(elapsed) ? elapsed : performance.now() / 1000,
    source: 'editor.preview',
    ...(event.target ? { target: event.target } : {}),
    ...(event.payload !== undefined ? { payload: event.payload } : {}),
    ...(event.pointer ? { pointer: event.pointer } : {})
  }));
}

function createPreviewEnvironment(elapsed) {
  const env = {
    time: elapsed,
    events: consumePreviewEvents(elapsed)
  };

  const scopeId = previewEventScopeId.trim();
  if (scopeId) {
    env.scope = { type: 'object', id: scopeId };
  }

  return env;
}

function handleScenePreviewObjectPointerEvent(event) {
  const objectId = event?.objectId || '';
  if (!objectId) return;

  queuePreviewEvent({
    channel: event.channel || 'pointer.click',
    target: objectId,
    payload: {
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      button: event.button ?? 0,
      ...(event.payload && typeof event.payload === 'object' ? event.payload : {})
    },
    pointer: {
      x: event.clientX,
      y: event.clientY,
      button: event.button ?? 0
    }
  });
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
      ...valueInlayExtensions(),
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
  if (!elements.fileStatus) return;
  const label = currentFileName || 'No file';
  elements.fileStatus.textContent = label;
  elements.fileStatus.classList.toggle('is-dirty', isDirty);
  elements.fileStatus.title = isDirty ? `${label} — unsaved changes` : label;
}

// DSL<->Node stays in sync automatically, so a constant "synced" badge is just
// noise. The indicator is therefore quiet by default and only appears when the
// DSL has errors and changes can't be applied to the graph — the one state the
// user needs to act on.
let syncApplyState = 'live';
let syncGraphState = 'live';

function renderSyncStatus() {
  const el = elements.syncStatus;
  if (!el) return;

  if (syncApplyState === 'error') {
    el.style.display = '';
    el.textContent = '⚠ DSL error';
    el.title = 'The DSL has errors, so changes are not applied to the node graph.\nFix the DSL to resume automatic sync.';
  } else {
    el.style.display = 'none';
  }
}

function renderAutoApplyStatus(status = null) {
  syncApplyState = status || 'live';
  renderSyncStatus();
}

function renderAutoSyncGraphToDslStatus(status = null) {
  syncGraphState = status || 'live';
  renderSyncStatus();
}

function renderDirtyStatus() {
  // Dirty state is shown inline on the file status badge (see renderFileStatus).
  renderFileStatus();
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

// Format a console.* effect's value the way a console would: strings print
// bare, structured values as JSON, primitives via String().
function formatConsoleEffectValue(value) {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function appendOutput(entry) {
  const level = entry.level || 'info';
  const message = String(entry.message ?? '');

  // Sink nodes (log / console.*) emit an effect every frame, so an unchanging
  // value would otherwise flood the panel. Collapse consecutive identical
  // lines into a single entry with a repeat counter, like browser devtools.
  const last = outputEntries[outputEntries.length - 1];
  if (last && last.level === level && last.message === message) {
    last.count += 1;
    last.time = new Date().toISOString();
    renderOutput();
    return;
  }

  outputEntries.push({
    time: new Date().toISOString(),
    level,
    message,
    count: 1
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
      const repeat = entry.count > 1 ? ` (x${entry.count})` : '';
      return `${time} [${entry.level}] ${entry.message}${repeat}`;
    })
    .join('\n');
}

function renderGraphJSON(graph) {
  const json = JSON.stringify(graph, null, 2);
  elements.graphJson.textContent = json;
  renderCompatibility(graph);
  renderFunctions();
}

// Read-only "Functions" panel: list the `fn` definitions the current source
// declares as reusable units. Derived from a subgraph-mode compile of the
// stored AST, so the node canvas (compiled inline) is untouched.
function renderFunctions() {
  if (!elements.functionsPanel) {
    return;
  }
  const emptyState = '<div class="empty-state">No functions defined</div>';
  const ast = store.getState().sourceAst;
  if (!ast) {
    elements.functionsPanel.innerHTML = emptyState;
    return;
  }

  let defs;
  try {
    const { graph, errors } = compileToGraph(ast, { functionLowering: 'subgraph' });
    if (errors && errors.length) {
      subgraphGraphCache = null;
      elements.functionsPanel.innerHTML = emptyState;
      return;
    }
    subgraphGraphCache = graph;
    defs = subgraphsToFnDefinitions(graph);
  } catch (error) {
    subgraphGraphCache = null;
    elements.functionsPanel.innerHTML =
      `<div class="empty-state">Functions unavailable: ${escapeHtml(error.message)}</div>`;
    return;
  }

  if (!defs.length) {
    elements.functionsPanel.innerHTML = emptyState;
    return;
  }

  const rows = defs.map((fn) => `
    <div class="fn-item" data-fn-name="${escapeHtml(fn.name)}" role="button" tabindex="0" title="Open function body">
      <div class="fn-sig"><span class="fn-keyword">fn</span> ${escapeHtml(fn.name)}(${fn.params.map(escapeHtml).join(', ')})</div>
      <div class="fn-body">=&gt; ${escapeHtml(fn.body)}</div>
    </div>`).join('');
  elements.functionsPanel.innerHTML = `<div class="fn-list">${rows}</div>`;
}

// --- Function body drill-in subview (read-only) ---
let subgraphGraphCache = null;
let fnSubviewEditor = null;

async function openFunctionSubview(name) {
  if (!elements.fnSubviewOverlay || !subgraphGraphCache) {
    return;
  }
  const model = subgraphBodyToEditorModel(subgraphGraphCache, name);
  if (!model) {
    return;
  }
  const def = subgraphGraphCache.subgraphs?.[name];
  const params = def ? def.params.join(', ') : '';
  if (elements.fnSubviewTitle) {
    elements.fnSubviewTitle.textContent = `ƒ ${name}(${params})`;
  }
  elements.fnSubviewOverlay.hidden = false;

  try {
    if (!fnSubviewEditor) {
      // Read-only: no operation/context-menu callbacks are wired.
      fnSubviewEditor = new NodeEditorView(elements.fnSubviewCanvas, {});
    }
    await fnSubviewEditor.renderModel(model, { force: true });
    fnSubviewEditor.zoomToFit?.();
  } catch (error) {
    console.error('Failed to render function subview:', error);
  }
}

function closeFunctionSubview() {
  if (elements.fnSubviewOverlay) {
    elements.fnSubviewOverlay.hidden = true;
  }
}

function renderCompatibility(graph) {
  if (!elements.compatPanel) {
    return;
  }
  if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    elements.compatPanel.innerHTML = '<div class="empty-state">No graph to check</div>';
    return;
  }

  let view;
  try {
    view = describeGraphHostCompatibility(graph, NODE_TYPES);
  } catch (error) {
    elements.compatPanel.innerHTML =
      `<div class="empty-state">Compatibility unavailable: ${escapeHtml(error.message)}</div>`;
    return;
  }

  const requiresText = view.requires.length > 0
    ? view.requires.map(escapeHtml).join(', ')
    : '(none)';

  const hostRows = view.hosts.map((report) => {
    const detail = [];
    for (const entry of report.unsupported) {
      const nodes = entry.nodes.length > 0 ? ` (${entry.nodes.map(escapeHtml).join(', ')})` : '';
      detail.push(`<li class="compat-unsupported">missing ${escapeHtml(entry.capability)}${nodes}</li>`);
    }
    for (const entry of report.unclassified) {
      detail.push(`<li class="compat-unclassified">unclassified: ${escapeHtml(entry.nodeId)} (${escapeHtml(entry.type)})</li>`);
    }
    const detailHtml = detail.length > 0 ? `<ul class="compat-detail">${detail.join('')}</ul>` : '';
    return `
      <div class="compat-host">
        <div class="compat-host-head">
          <span class="compat-badge compat-${report.status}">${report.status}</span>
          <span class="compat-host-name">${escapeHtml(report.targetHost)}</span>
        </div>
        ${detailHtml}
      </div>`;
  }).join('');

  elements.compatPanel.innerHTML = `
    <div class="compat-requires"><strong>Requires:</strong> ${requiresText}</div>
    <div class="compat-hosts">${hostRows}</div>`;
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
  syncCanvasSelection();
  renderInspector();
  renderNodeList();
}

// Keep the Rete canvas selection consistent with the inspector selection so
// that Delete always targets what the UI shows as selected. When the picked
// node is already part of a canvas multi-selection (Ctrl+click flow), the
// existing selection is preserved.
function syncCanvasSelection() {
  if (!nodeEditor?.setSelection) return;

  if (!selectedNodeId) {
    nodeEditor.setSelection([]);
    return;
  }

  const canvasSelectedIds = nodeEditor.getSelectedNodeIds();
  if (!canvasSelectedIds.includes(selectedNodeId)) {
    nodeEditor.setSelection([selectedNodeId]);
  }
}

function setEditorError(message) {
  store.setState({
    errors: [{ code: 'EDITOR_ERROR', message }]
  });
  renderErrors();
}

/* Scene Sync panel functions */

function getCurrentSceneSyncSourceText() {
  const state = store.getState();

  if (!hasUnsyncedDslText && state.editorModel) {
    return generateCanonicalDslFromState();
  }

  return getDslText();
}

// Compile the current DSL into a Scene Sync behavior graph ({ nodes, edges }).
// Scene Sync's paste flow applies the graph to the currently selected object
// and ignores any envelope/scope, so the editor only needs to emit the graph.
function compileCurrentSceneSyncGraph() {
  const source = getCurrentSceneSyncSourceText();
  const result = compileLoomToSceneSyncGraph(source);
  return result.graph;
}

function renderSceneSyncGraphPreview(graph) {
  if (!elements.sceneSyncGraphPreview) {
    return;
  }

  elements.sceneSyncGraphPreview.classList.remove('is-error');
  elements.sceneSyncGraphPreview.textContent = graph
    ? JSON.stringify(graph, null, 2)
    : '';
}

function renderSceneSyncGraphPreviewError(message) {
  if (!elements.sceneSyncGraphPreview) {
    return;
  }
  elements.sceneSyncGraphPreview.classList.add('is-error');
  elements.sceneSyncGraphPreview.textContent = `⚠ ${message}`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for non-secure contexts where the async clipboard API is absent.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    if (!ok) {
      throw new Error('Clipboard copy was rejected by the browser.');
    }
  } finally {
    textarea.remove();
  }
}

async function handleCopySceneSyncGraphJson() {
  try {
    const graph = compileCurrentSceneSyncGraph();
    renderSceneSyncGraphPreview(graph);

    await copyTextToClipboard(JSON.stringify(graph, null, 2));

    appendOutput({
      level: 'info',
      message: 'Copied Scene Sync behavior graph (nodes/edges). Select an object in Scene Sync and paste to apply.'
    });
  } catch (error) {
    // Surface the failure in the preview so a stale graph isn't mistaken for a
    // successful copy (the clipboard is intentionally left untouched on error).
    renderSceneSyncGraphPreviewError(error.message);
    appendOutput({
      level: 'error',
      message: `Copy Scene Sync graph failed: ${error.message}`
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
  await deleteNodes([node.id]);
}

// In-app confirmation modal (replaces native window.confirm for a better UX).
// Resolves to true on confirm, false on cancel / Escape / backdrop.
let confirmResolver = null;

function showConfirmDialog({ message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
  if (!elements.confirmOverlay) {
    // Fallback if the overlay markup is unavailable.
    return Promise.resolve(window.confirm(message));
  }
  // Resolve any dialog still open as cancelled before showing a new one.
  resolveConfirmDialog(false);

  if (elements.confirmMessage) elements.confirmMessage.textContent = message;
  if (elements.confirmOk) {
    elements.confirmOk.textContent = confirmLabel;
    elements.confirmOk.classList.toggle('btn-danger', Boolean(danger));
    elements.confirmOk.classList.toggle('btn-primary', !danger);
  }
  if (elements.confirmCancel) elements.confirmCancel.textContent = cancelLabel;

  elements.confirmOverlay.hidden = false;
  // Focus the confirm action so Enter/Space act on it.
  elements.confirmOk?.focus();

  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirmDialog(value) {
  if (elements.confirmOverlay) elements.confirmOverlay.hidden = true;
  if (confirmResolver) {
    const resolve = confirmResolver;
    confirmResolver = null;
    resolve(value);
  }
}

async function deleteNodes(nodeIds) {
  const state = store.getState();
  const existing = (nodeIds || []).filter((id) => state.editorModel?.nodesById?.[id]);
  if (existing.length === 0) return;

  const message = existing.length === 1
    ? `Delete node '${existing[0]}'? Connected edges will also be removed.`
    : `Delete ${existing.length} nodes (${existing.join(', ')})? Connected edges will also be removed.`;
  if (!(await showConfirmDialog({ message, confirmLabel: 'Delete', danger: true }))) return;

  const removesSelected = selectedNodeId && existing.includes(selectedNodeId);

  const result = await handleOperation(
    existing.length === 1
      ? { type: 'removeNode', id: existing[0] }
      : { type: 'removeNodes', ids: existing }
  );

  if (result && !result.error && removesSelected) {
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
  previewEventQueue = [];
  setPreviewEventScope('');
  renderPreviewEventStatus(null);

  const state = store.getState();
  if (!graph) graph = state.graph;

  setScene3DActive(graphHasSceneNodes(graph));
  resizePreviewCanvas();

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
    engine.start({ getEnv: ({ elapsed }) => createPreviewEnvironment(elapsed) });

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
      } else if (typeof effect.type === 'string' && effect.type.startsWith('console.')) {
        appendOutput({
          level: effect.level || 'log',
          message: formatConsoleEffectValue(effect.value)
        });
      } else if (effect.kind === 'event.send') {
        const target = effect.target ? ` -> ${effect.target}` : '';
        const payload = effect.payload !== undefined
          ? ` ${JSON.stringify(effect.payload)}`
          : '';
        appendOutput({
          level: 'event',
          message: `sendEvent: ${effect.channel}${target}${payload}`
        });
      }
    }

    if (is3DPreviewActive && scene3dPreview) {
      const objects = reduceSceneEffectsToObjects(effects);
      scene3dPreview.applyObjects(objects);
      scene3dPreview.retainObjects(Object.keys(objects));
      scene3dPreview.render();
      postNodeValuePreviews(engine, graph);
      animationFrameId = requestAnimationFrame(() => tick(engine, graph));
      return;
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
  if (!engineInstance || !graph) return;
  const now = performance.now();
  if (now - lastNodeValuePreviewAtMs < NODE_VALUE_PREVIEW_INTERVAL_MS) return;
  lastNodeValuePreviewAtMs = now;

  const values = getLatestNodeValues(engineInstance, graph, NODE_TYPES);
  nodeEditor?.setNodeValuePreviews(values);
  updateDslValueInlays(values, graph);
}

function readValueInlayMode() {
  try {
    const raw = localStorage.getItem(VALUE_INLAY_STORAGE_KEY);
    if (raw === '0') return 'off';        // legacy boolean storage
    if (raw === '1') return 'compact';    // legacy boolean storage
    if (VALUE_INLAY_MODES.includes(raw)) return raw;
  } catch {
    // Ignore storage failures; fall through to the default.
  }
  return 'compact';
}

function effectCallName(expr) {
  if (!expr) return 'effect';
  if (expr.type === 'CallExpression') return expr.callee?.name || 'effect';
  if (expr.type === 'PipeExpression') return effectCallName(expr.right);
  if (expr.type === 'MemberExpression') return expr.property?.name || 'effect';
  return 'effect';
}

// Walk top-level statements and map each to the graph entity it produces:
//  - assignments compile to a node whose id equals the target name
//  - effect/sink expressions compile to sequential `_effectN` nodes
//  - render statements populate graph.render (not a node)
function collectInlayTargets(ast) {
  const targets = [];
  if (!ast || !Array.isArray(ast.body)) return targets;

  let effectCounter = 0;
  for (const statement of ast.body) {
    const line = statement?.span?.start?.line;
    if (typeof line !== 'number') continue;

    if (statement.type === 'AssignmentStatement' && statement.target?.name) {
      targets.push({ kind: 'assignment', line, nodeId: statement.target.name, name: statement.target.name });
    } else if (statement.type === 'ExpressionStatement') {
      effectCounter += 1;
      targets.push({ kind: 'effect', line, nodeId: `_effect${effectCounter}`, name: effectCallName(statement.expression) });
    } else if (statement.type === 'RenderStatement') {
      targets.push({ kind: 'render', line });
    }
  }

  return targets;
}

function formatScalarValue(value, nodeType) {
  // Event sources emit an array of events; the contents are noise, so we
  // summarize as a count instead.
  if (nodeType === 'onEvent' && Array.isArray(value)) {
    return value.length === 1 ? '1 event' : `${value.length} events`;
  }
  return formatValuePreview(value);
}

// Resolve a graph ref (e.g. "x.out") or literal to its latest value.
function resolveRefValue(values, ref) {
  if (typeof ref === 'number') return ref;
  if (typeof ref !== 'string') return undefined;
  const dot = ref.indexOf('.');
  const nodeId = dot >= 0 ? ref.slice(0, dot) : ref;
  const port = dot >= 0 ? ref.slice(dot + 1) : null;
  const value = values.get(nodeId);
  if (port && value && typeof value === 'object' && !Array.isArray(value) && port in value) {
    return value[port];
  }
  return value;
}

function formatInlayTarget(target, values, nodeTypeById, graph) {
  const verbose = valueInlayMode === 'verbose';

  if (target.kind === 'assignment') {
    if (!values.has(target.nodeId)) return null;
    const value = values.get(target.nodeId);
    if (value === undefined) return null;
    const nodeType = nodeTypeById.get(target.nodeId);
    const text = formatScalarValue(value, nodeType);
    if (verbose) {
      return `${target.name}.${defaultOutputPort(nodeType, NODE_TYPES)} = ${text}`;
    }
    return text;
  }

  if (target.kind === 'effect') {
    // Most sinks (scene.setColor, ...) have no output, so we just label the
    // line with the effect name. Sinks that do expose a value (e.g. log) show
    // it inline.
    const value = values.get(target.nodeId);
    const hasValue = value !== undefined;
    if (verbose) {
      return hasValue ? `effect: ${target.name} = ${formatValuePreview(value)}` : `effect: ${target.name}`;
    }
    return hasValue ? `${target.name}: ${formatValuePreview(value)}` : target.name;
  }

  if (target.kind === 'render') {
    const render = graph?.render;
    if (!render) return null;
    const fmt = (v) => (v === undefined ? '—' : formatValuePreview(v));
    let body;
    if (render.type === 'point') {
      body = `point(${fmt(resolveRefValue(values, render.x))}, ${fmt(resolveRefValue(values, render.y))})`;
    } else if (render.type === 'bar') {
      body = `bar(${fmt(resolveRefValue(values, render.width))})`;
    } else {
      body = String(render.type || 'render');
    }
    return verbose ? `render: ${body}` : body;
  }

  return null;
}

function updateDslValueInlays(values, graph) {
  if (!dslEditor) return;
  if (valueInlayMode === 'off') return;

  // While the editor text is ahead of the applied graph, the stored AST line
  // numbers no longer match what is on screen. Leave the existing badges in
  // place (the decoration field tracks them through edits) until the next
  // apply re-syncs the source map.
  if (hasUnsyncedDslText) return;

  const ast = store.getState().sourceAst;
  const targets = collectInlayTargets(ast);
  if (targets.length === 0) {
    dispatchValueInlays(dslEditor, []);
    return;
  }

  const nodeTypeById = new Map();
  for (const node of graph?.nodes || []) {
    nodeTypeById.set(node.id, node.type);
  }

  const inlays = [];
  for (const target of targets) {
    const text = formatInlayTarget(target, values, nodeTypeById, graph);
    if (text != null && text !== '') {
      inlays.push({ line: target.line, text });
    }
  }

  dispatchValueInlays(dslEditor, inlays);
}

function cycleValueInlayMode() {
  const idx = VALUE_INLAY_MODES.indexOf(valueInlayMode);
  setValueInlayMode(VALUE_INLAY_MODES[(idx + 1) % VALUE_INLAY_MODES.length]);
}

function setValueInlayMode(mode) {
  valueInlayMode = VALUE_INLAY_MODES.includes(mode) ? mode : 'compact';
  try {
    localStorage.setItem(VALUE_INLAY_STORAGE_KEY, valueInlayMode);
  } catch {
    // Ignore storage failures (e.g. private mode); preference stays in-memory.
  }
  renderValueInlayToggle();
  if (valueInlayMode === 'off' && dslEditor) {
    dispatchValueInlays(dslEditor, []);
  }
}

function renderValueInlayToggle() {
  const btn = elements.dslValueInlayBtn;
  if (!btn) return;
  const on = valueInlayMode !== 'off';
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.textContent = valueInlayMode === 'verbose' ? '⟦⟧+' : '⟦⟧';
  btn.title = `Inline values: ${valueInlayMode} (click to change)`;
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
  setDslText(source);
  hasUnsyncedDslText = true;
  setDirty(true);
  scheduleAutoApplyDsl();

  appendOutput({
    level: 'info',
    message: `Loaded Scene Sync preset: ${name}.`
  });
}

function handleLoadSceneSyncPreset() {
  const key = elements.sceneSyncPresetSelect?.value;
  const preset = key && SCENE_SYNC_PRESETS[key];
  if (!preset) {
    appendOutput({ level: 'info', message: 'Select a Scene Sync sample to load.' });
    return;
  }
  loadSceneSyncPreset(preset.label, preset.source);
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
    <div class="node-palette-item" draggable="true" data-drag-node-type="${escapeHtml(entry.typeName)}" title="Drag onto the canvas to place this node">
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

  list.querySelectorAll('[data-drag-node-type]').forEach((item) => {
    item.addEventListener('dragstart', (event) => {
      const typeName = item.getAttribute('data-drag-node-type');
      event.dataTransfer.setData(NODE_DRAG_MIME, typeName);
      event.dataTransfer.effectAllowed = 'copy';
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

async function addNodeFromPalette(typeName, position = null) {
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
    position: position
      ? { x: Math.round(position.x), y: Math.round(position.y) }
      : createPositionForNewNode(category, nodes, findNonOverlappingPosition, NODE_LAYOUT_STEP_Y)
  };

  await handleOperation({
    type: 'addNode',
    node
  });

  setSelectedNodeId(id);
}

/* Canvas context menu (right-click to add/manage nodes) */

const NODE_DRAG_MIME = 'application/x-loomlet-node-type';
let canvasContextMenuEl = null;

function closeCanvasContextMenu() {
  if (canvasContextMenuEl) {
    canvasContextMenuEl.remove();
    canvasContextMenuEl = null;
  }
}

function clampMenuToViewport(menu, clientX, clientY) {
  const rect = menu.getBoundingClientRect();
  const left = Math.min(clientX, window.innerWidth - rect.width - 8);
  const top = Math.min(clientY, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
}

function openCanvasContextMenu({ clientX, clientY, graphPosition, nodeId }) {
  closeCanvasContextMenu();

  const menu = document.createElement('div');
  menu.className = 'canvas-context-menu';
  menu.style.left = `${clientX}px`;
  menu.style.top = `${clientY}px`;

  if (nodeId) {
    renderNodeActionsMenu(menu, nodeId);
  } else {
    renderAddNodeMenu(menu, graphPosition);
  }

  document.body.appendChild(menu);
  clampMenuToViewport(menu, clientX, clientY);
  canvasContextMenuEl = menu;

  if (!nodeId) {
    menu.querySelector('.canvas-context-menu-search')?.focus();
  }
}

function renderNodeActionsMenu(menu, nodeId) {
  const state = store.getState();
  const node = state.editorModel?.nodesById?.[nodeId];
  if (!node) return;

  const header = document.createElement('div');
  header.className = 'canvas-context-menu-header';
  header.textContent = node.label || node.id;
  menu.appendChild(header);

  const inspectItem = document.createElement('button');
  inspectItem.className = 'canvas-context-menu-item';
  inspectItem.textContent = 'Inspect';
  inspectItem.addEventListener('click', () => {
    closeCanvasContextMenu();
    setSelectedNodeId(nodeId);
    selectBottomTab('inspector');
  });
  menu.appendChild(inspectItem);

  const deleteItem = document.createElement('button');
  deleteItem.className = 'canvas-context-menu-item is-danger';
  deleteItem.textContent = 'Delete node';
  deleteItem.addEventListener('click', () => {
    closeCanvasContextMenu();
    setSelectedNodeId(nodeId);
    deleteSelectedNode();
  });
  menu.appendChild(deleteItem);
}

function renderAddNodeMenu(menu, graphPosition) {
  const header = document.createElement('div');
  header.className = 'canvas-context-menu-header';
  header.textContent = 'Add node';
  menu.appendChild(header);

  const search = document.createElement('input');
  search.type = 'text';
  search.className = 'canvas-context-menu-search';
  search.placeholder = 'Search node types...';
  menu.appendChild(search);

  const list = document.createElement('div');
  list.className = 'canvas-context-menu-list';
  menu.appendChild(list);

  const entries = getNodeTypeEntries(NODE_TYPES);

  const renderEntries = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = entries.filter((entry) => {
      if (!query) return true;
      return (
        entry.typeName.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query)
      );
    });

    list.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'canvas-context-menu-empty';
      empty.textContent = 'No matching node types';
      list.appendChild(empty);
      return;
    }

    let lastCategory = null;
    for (const entry of filtered) {
      if (entry.category !== lastCategory) {
        const label = document.createElement('div');
        label.className = 'canvas-context-menu-category';
        label.textContent = entry.category;
        list.appendChild(label);
        lastCategory = entry.category;
      }

      const item = document.createElement('button');
      item.className = 'canvas-context-menu-item';
      item.textContent = entry.typeName;
      item.addEventListener('click', async () => {
        closeCanvasContextMenu();
        await addNodeFromPalette(entry.typeName, graphPosition);
      });
      list.appendChild(item);
    }
  };

  search.addEventListener('input', renderEntries);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCanvasContextMenu();
    } else if (event.key === 'Enter') {
      list.querySelector('.canvas-context-menu-item')?.click();
    }
  });

  renderEntries();
}

function getCanvasCenterGraphPosition() {
  const host = elements.nodeEditorHost;
  if (!host || !nodeEditor) return null;
  const rect = host.getBoundingClientRect();
  return nodeEditor.clientPointToGraph(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function setupNodeCanvasDragAndDrop() {
  const host = elements.nodeEditorHost;
  if (!host) return;

  host.addEventListener('dragover', (event) => {
    if (event.dataTransfer?.types?.includes(NODE_DRAG_MIME)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  });

  host.addEventListener('drop', async (event) => {
    const typeName = event.dataTransfer?.getData(NODE_DRAG_MIME);
    if (!typeName) return;
    event.preventDefault();
    const position = nodeEditor?.clientPointToGraph(event.clientX, event.clientY);
    await addNodeFromPalette(typeName, position);
  });
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

  if (event.key === 'Escape') {
    closeCanvasContextMenu();
    return;
  }

  // Handle node deletion with Delete/Backspace
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  if (isTextEditingTarget(event.target)) return;

  const canvasSelectedIds = nodeEditor?.getSelectedNodeIds?.() || [];
  const targetIds = canvasSelectedIds.length > 0
    ? canvasSelectedIds
    : (selectedNodeId ? [selectedNodeId] : []);
  if (targetIds.length === 0) return;

  event.preventDefault();
  deleteNodes(targetIds);
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

// Wire up the toolbar dropdown menus (File ▾, DSL ▾): the trigger toggles its
// menu, selecting an item or clicking elsewhere closes it. The menu items keep
// their original IDs, so their actions are wired separately like before.
function setupToolbarMenus() {
  const menus = Array.from(document.querySelectorAll('.toolbar-menu'));
  if (menus.length === 0) return;

  const toolbar = menus[0].closest('.studio-toolbar');
  // The mobile toolbar is an overflow-clipped horizontal scroll strip, which
  // would clip an open dropdown. Flag the toolbar while any menu is open so CSS
  // can lift the clipping (see the .has-open-menu rule).
  const syncOpenState = () => {
    toolbar?.classList.toggle('has-open-menu', menus.some((m) => m.classList.contains('open')));
  };

  const closeAll = (except = null) => {
    for (const menu of menus) {
      if (menu === except) continue;
      menu.classList.remove('open');
      menu.querySelector('.toolbar-menu-trigger')?.setAttribute('aria-expanded', 'false');
    }
    syncOpenState();
  };

  for (const menu of menus) {
    const trigger = menu.querySelector('.toolbar-menu-trigger');
    trigger?.addEventListener('click', () => {
      const willOpen = !menu.classList.contains('open');
      closeAll(menu);
      menu.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      syncOpenState();
    });
    menu.querySelector('.toolbar-menu-list')?.addEventListener('click', (event) => {
      if (event.target.closest('.toolbar-menu-item')) closeAll();
    });
  }

  // Capture-phase so a pointerdown on the node editor canvas (which stops
  // propagation) still closes open menus. Pointerdowns inside a menu are left
  // to the per-menu handlers above.
  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest?.('.toolbar-menu')) return;
    closeAll();
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
}

function setupEventListeners() {
  setupToolbarMenus();
  elements.nodeZoomInBtn?.addEventListener('click', () => nodeEditor?.zoomBy(1.25));
  elements.nodeZoomOutBtn?.addEventListener('click', () => nodeEditor?.zoomBy(0.8));
  elements.nodeZoomFitBtn?.addEventListener('click', () => nodeEditor?.zoomToFit());
  elements.nodeAutoLayoutBtn?.addEventListener('click', () => nodeEditor?.autoLayout());
  elements.nodeAddBtn?.addEventListener('click', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    openCanvasContextMenu({
      clientX: rect.left,
      clientY: rect.bottom + 4,
      graphPosition: getCanvasCenterGraphPosition() || { x: 0, y: 0 },
      nodeId: null
    });
    event.stopPropagation();
  });

  document.addEventListener('pointerdown', (event) => {
    if (canvasContextMenuEl && !canvasContextMenuEl.contains(event.target)) {
      closeCanvasContextMenu();
    }
  });

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
  elements.previewLayoutBtns?.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-preview-layout');
      setPreviewLayoutMode(mode);
    });
  });
  elements.dockedEditorTabBtns?.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-docked-editor-tab');
      setDockedEditorTab(tab);
    });
  });
  elements.openFileBtn.addEventListener('click', openLoomFile);
  elements.saveFileBtn.addEventListener('click', saveDslFile);
  elements.saveAsFileBtn.addEventListener('click', saveDslAsFile);

  elements.dslValueInlayBtn?.addEventListener('click', () => {
    cycleValueInlayMode();
  });

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

  // Function drill-in subview
  elements.functionsPanel?.addEventListener('click', (event) => {
    const item = event.target.closest('.fn-item[data-fn-name]');
    if (item) {
      openFunctionSubview(item.getAttribute('data-fn-name'));
    }
  });
  elements.functionsPanel?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const item = event.target.closest('.fn-item[data-fn-name]');
    if (item) {
      event.preventDefault();
      openFunctionSubview(item.getAttribute('data-fn-name'));
    }
  });
  elements.fnSubviewClose?.addEventListener('click', closeFunctionSubview);
  elements.fnSubviewOverlay?.addEventListener('click', (event) => {
    if (event.target === elements.fnSubviewOverlay) {
      closeFunctionSubview();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.fnSubviewOverlay && !elements.fnSubviewOverlay.hidden) {
      closeFunctionSubview();
    }
  });

  // Confirmation modal
  elements.confirmOk?.addEventListener('click', () => resolveConfirmDialog(true));
  elements.confirmCancel?.addEventListener('click', () => resolveConfirmDialog(false));
  elements.confirmOverlay?.addEventListener('click', (event) => {
    if (event.target === elements.confirmOverlay) {
      resolveConfirmDialog(false);
    }
  });
  // Capture phase so Escape/Enter act on the open dialog before other handlers.
  document.addEventListener('keydown', (event) => {
    if (!elements.confirmOverlay || elements.confirmOverlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      resolveConfirmDialog(false);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopImmediatePropagation();
      // Enter confirms by default (OK is focused on open), but respects Cancel focus.
      resolveConfirmDialog(document.activeElement !== elements.confirmCancel);
    }
  }, true);

  // Scene Sync event listeners
  elements.copySceneSyncGraphBtn?.addEventListener('click', handleCopySceneSyncGraphJson);
  elements.loadSceneSyncPresetBtn?.addEventListener('click', handleLoadSceneSyncPreset);

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
    onSelectNode: setSelectedNodeId,
    onContextMenu: openCanvasContextMenu
  });

  setupEventListeners();
  setupNodeCanvasDragAndDrop();
  loadBottomPanelLayout();
  loadEditorSplitLayout();
  loadActiveBottomTab();
  loadEditorMaximizeMode();
  loadPreviewLayoutMode();
  renderFileStatus();
  renderDirtyStatus();
  renderAutoApplyStatus();
  renderAutoSyncGraphToDslStatus();
  renderUndoRedoState();
  renderValueInlayToggle();
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
