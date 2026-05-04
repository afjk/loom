import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { completionKeymap } from '@codemirror/autocomplete';
import { lintGutter } from '@codemirror/lint';
import { search, searchKeymap } from '@codemirror/search';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

import { Loom } from '../../src/loom.js';
import { parseDSL } from '../../src/loom-dsl.js';
import { dslLanguage } from './dsl-language.js';
import { dslCompletion } from './completion.js';
import { dslLint, jsonLint } from './lint.js';
import { presets } from './presets.js';
import { initLayout } from './layout.js';

// ─── State ───────────────────────────────────────────────────────────────────

let engine = null;
let currentRender = null;
let currentMode = localStorage.getItem('loom-pro-mode') || 'dsl';
let editorView = null;
let debounceTimer = null;

const STORAGE_KEY_DSL = 'loom-pro-dsl';
const STORAGE_KEY_JSON = 'loom-pro-json';
const DEBOUNCE_MS = 100;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const editorHost = document.getElementById('editor-host');
const presetSelect = document.getElementById('presetSelect');
const statusEl = document.getElementById('status');
const valuesContent = document.getElementById('values-content');
const valuesPane = document.getElementById('values-pane');
const valuesToggle = document.getElementById('values-toggle');
const overlay = document.getElementById('editor-overlay');
const titlebar = document.getElementById('editor-titlebar');
const closeBtn = document.getElementById('closeBtn');
const reopenBtn = document.getElementById('reopenBtn');
const tabs = document.querySelectorAll('.tab');
const domPreviewLayer = document.getElementById('dom-preview-layer');
const demoCard = document.getElementById('demo-card');
const demoMeter = document.getElementById('demo-meter');
const demoLamp = document.getElementById('demo-lamp');
const demoFill = document.getElementById('demo-fill');

// ─── Canvas sizing ───────────────────────────────────────────────────────────

canvas.width = 800;
canvas.height = 500;

// ─── Transparent theme override ───────────────────────────────────────────────

const transparentTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', height: '100%' },
  '&.cm-editor': { backgroundColor: 'transparent' },
  '.cm-scroller': { backgroundColor: 'transparent', overflow: 'auto' },
  '.cm-gutters': { backgroundColor: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.05)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.04)' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.04)' },
  '.cm-cursor': { borderLeftColor: '#fff' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(100,150,255,0.25)' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(100,150,255,0.3)' }
});

const baseExtensions = [
  lineNumbers(),
  history(),
  bracketMatching(),
  highlightActiveLine(),
  syntaxHighlighting(defaultHighlightStyle),
  search({ top: true }),
  lintGutter(),
  oneDark,
  transparentTheme,
  keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap, ...searchKeymap]),
  EditorView.updateListener.of(update => {
    if (update.docChanged) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadFromEditor, DEBOUNCE_MS);
    }
  })
];

// ─── Editor construction ──────────────────────────────────────────────────────

function buildExtensions(mode) {
  if (mode === 'dsl') {
    return [...baseExtensions, dslLanguage(), dslCompletion, dslLint];
  } else {
    return [...baseExtensions, json(), jsonLint];
  }
}

function createEditor(mode, initialContent) {
  if (editorView) {
    editorView.destroy();
  }
  const state = EditorState.create({
    doc: initialContent,
    extensions: buildExtensions(mode)
  });
  editorView = new EditorView({
    state,
    parent: editorHost
  });
}

function getEditorContent() {
  return editorView ? editorView.state.doc.toString() : '';
}

function setEditorContent(text) {
  if (!editorView) return;
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: text }
  });
}

// ─── Mode switching ───────────────────────────────────────────────────────────

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem('loom-pro-mode', mode);

  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  const savedDsl = localStorage.getItem(STORAGE_KEY_DSL) || defaultDsl();
  const savedJson = localStorage.getItem(STORAGE_KEY_JSON) || defaultJson();
  const content = mode === 'dsl' ? savedDsl : savedJson;

  createEditor(mode, content);
  loadFromEditor();
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

// ─── Presets ──────────────────────────────────────────────────────────────────

function initPresets() {
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = '— preset —';
  presetSelect.appendChild(blank);

  Object.entries(presets).forEach(([key, preset]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = preset.label;
    presetSelect.appendChild(option);
  });
}

presetSelect.addEventListener('change', e => {
  const key = e.target.value;
  if (!key) return;
  const preset = presets[key];
  if (!preset) return;

  setPreviewMode(preset.previewMode || 'canvas');

  if (currentMode === 'dsl') {
    const text = preset.dsl || '';
    localStorage.setItem(STORAGE_KEY_DSL, text);
    setEditorContent(text);
  } else {
    const text = JSON.stringify(preset.graph, null, 2);
    localStorage.setItem(STORAGE_KEY_JSON, text);
    setEditorContent(text);
  }

  setTimeout(() => { presetSelect.value = ''; }, 500);
});


function resetDomPreview() {
  if (demoCard) {
    demoCard.style.transform = '';
    demoCard.style.removeProperty('--glow');
    demoCard.style.removeProperty('--hue');
    demoCard.style.display = 'none';
  }

  const demoReadout = document.getElementById('demo-readout');
  if (demoReadout) {
    demoReadout.textContent = 'starting...';
  }

  if (demoMeter) {
    demoMeter.classList.remove('active');
  }

  if (demoLamp) {
    demoLamp.classList.remove('is-hot');
    demoLamp.textContent = 'normal';
  }

  if (demoFill) {
    demoFill.style.width = '0%';
  }
}

function setPreviewMode(mode = 'canvas') {
  resetDomPreview();

  const isDomPreview = mode !== 'canvas';
  domPreviewLayer?.classList.toggle('active', isDomPreview);

  if (mode === 'dom-card' && demoCard) {
    demoCard.style.display = 'block';
  }

  if (mode === 'dom-meter' && demoMeter) {
    demoMeter.classList.add('active');
  }
}

// ─── Loom loading ─────────────────────────────────────────────────────────────

function loadFromEditor() {
  const text = getEditorContent();

  // Persist to localStorage
  if (currentMode === 'dsl') {
    localStorage.setItem(STORAGE_KEY_DSL, text);
  } else {
    localStorage.setItem(STORAGE_KEY_JSON, text);
  }

  try {
    let graphForLoom, renderConfig;

    if (currentMode === 'dsl') {
      if (!text.trim()) { setStatus('error', 'DSL: Empty'); return; }
      const parsed = parseDSL(text);
      renderConfig = parsed.render;
      graphForLoom = { nodes: parsed.nodes, edges: parsed.edges };
    } else {
      if (!text.trim()) { setStatus('error', 'JSON: Empty graph'); return; }
      const parsed = JSON.parse(text);
      renderConfig = parsed.render;
      graphForLoom = { ...parsed };
      delete graphForLoom.render;
    }

    if (!engine) {
      engine = new Loom(graphForLoom);
      engine.start();
    } else {
      engine.load(graphForLoom);
    }

    currentRender = renderConfig || null;
    setStatus('running', 'running');
  } catch (e) {
    if (e.name === 'LoomDSLError') {
      setStatus('error', `DSL [${e.line}:${e.column}] ${e.message}`);
    } else if (e.name === 'SyntaxError') {
      setStatus('error', `JSON: ${e.message}`);
    } else if (e.code) {
      setStatus('error', `${e.code}: ${e.message}`);
    } else {
      setStatus('error', `Error: ${e.message}`);
    }
  }
}

function setStatus(type, message) {
  statusEl.className = type;
  statusEl.textContent = message;
}

// ─── Canvas render loop ───────────────────────────────────────────────────────

function resolveValue(ref) {
  if (typeof ref === 'number') return ref;
  if (ref === null || ref === undefined) return null;
  if (!engine) return null;
  const numVal = parseFloat(ref);
  if (!isNaN(numVal) && String(ref).trim() === String(numVal)) return numVal;
  return engine.getValue(ref);
}

function formatValue(val) {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') return val.toFixed(3);
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return '[' + val.map(v => typeof v === 'number' ? v.toFixed(3) : v).join(', ') + ']';
    }
    const entries = [];
    for (const key in val) {
      const v = val[key];
      entries.push(`${key}: ${typeof v === 'number' ? v.toFixed(3) : v}`);
    }
    return '{' + entries.join(', ') + '}';
  }
  return String(val);
}

function tick() {
  if (engine && canvas && ctx) {
    if (currentRender) {
      const trail = currentRender.trail !== undefined ? currentRender.trail : 0.1;
      if (trail > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${trail})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (currentRender.type === 'point') {
        const x = resolveValue(currentRender.x);
        const y = resolveValue(currentRender.y);
        const color = currentRender.color || '#00ff00';
        ctx.fillStyle = color;
        ctx.beginPath();
        if (x !== null && y !== null && typeof x === 'number' && typeof y === 'number') {
          ctx.arc(x, y, 4, 0, Math.PI * 2);
        } else {
          ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
        }
        ctx.fill();
      } else if (currentRender.type === 'bar') {
        const width = resolveValue(currentRender.width);
        const color = currentRender.color || '#00ccff';
        const height = currentRender.height !== undefined ? currentRender.height : 40;
        const y = currentRender.y !== undefined ? resolveValue(currentRender.y) : (canvas.height - height) / 2;
        if (width !== null && typeof width === 'number' && y !== null && typeof y === 'number') {
          ctx.fillStyle = color;
          ctx.fillRect(0, y, width, height);
        }
      }
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateValues();
  requestAnimationFrame(tick);
}

function updateValues() {
  if (!valuesPane.classList.contains('expanded')) return;
  if (!engine || !engine._currentGraph) return;

  const lines = [];
  for (const node of engine._currentGraph.nodes) {
    if (!engine._values) break;
    const keys = Array.from(engine._values.keys());
    for (const key of keys) {
      if (key.startsWith(node.id + '.')) {
        const value = engine.getValue(key);
        const formatted = formatValue(value);
        lines.push(
          `<span class="value-line">` +
          `<span class="value-name">${key}</span>` +
          `<span class="value-equals"> = </span>` +
          `<span class="value-result">${formatted}</span>` +
          `</span>`
        );
      }
    }
  }
  valuesContent.innerHTML = lines.join('');
}

// ─── Values pane toggle ───────────────────────────────────────────────────────

valuesToggle.addEventListener('click', () => {
  const expanded = valuesPane.classList.toggle('expanded');
  valuesToggle.textContent = (expanded ? '▲' : '▼') + ' Current Values';
});

// ─── Defaults ────────────────────────────────────────────────────────────────

function defaultDsl() {
  return presets.lissajous.dsl;
}

function defaultJson() {
  return JSON.stringify(presets.lissajous.graph, null, 2);
}

// ─── Init ────────────────────────────────────────────────────────────────────

function init() {
  initPresets();
  initLayout(overlay, titlebar, closeBtn, reopenBtn);
  setPreviewMode('canvas');

  // Restore or use default
  const savedDsl = localStorage.getItem(STORAGE_KEY_DSL) || defaultDsl();
  const savedJson = localStorage.getItem(STORAGE_KEY_JSON) || defaultJson();
  const initialContent = currentMode === 'dsl' ? savedDsl : savedJson;

  // Set active tab
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === currentMode);
  });

  createEditor(currentMode, initialContent);
  loadFromEditor();
  tick();
}

init();
