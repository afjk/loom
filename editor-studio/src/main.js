import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';

import { Loom } from '../../src/loom.js';
import { parseDSLToAST, compileToGraph } from '../../src/loom-dsl.js';
import { graphToEditorModel, editorModelToGraph, applyEditorOperation } from '../../src/loom-editor-model.js';
import { graphToCanonicalDSL } from './canonical-dsl.js';
import { createStore } from './studio-store.js';
import { NodeEditorView } from './rete-view.js';

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

const elements = {
  dslEditorHost: document.getElementById('dsl-editor-host'),
  nodeEditorHost: document.getElementById('node-editor'),
  previewCanvas: document.getElementById('preview-canvas'),
  graphJson: document.getElementById('graph-json'),
  errorsList: document.getElementById('errors-list'),
  applyDslBtn: document.getElementById('applyDslBtn'),
  generateDslBtn: document.getElementById('generateDslBtn'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  resetSampleBtn: document.getElementById('resetSampleBtn'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane')
};

function initDslEditor() {
  const initialState = EditorState.create({
    doc: SAMPLE_DSL,
    extensions: [
      keymap.of(defaultKeymap),
      EditorView.lineNumbers(),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' }
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
  if (dslEditor) {
    const changes = dslEditor.state.doc.length > 0
      ? { from: 0, to: dslEditor.state.doc.length, insert: text }
      : { from: 0, insert: text };
    dslEditor.dispatch({ changes });
  }
}

function applyDsl() {
  const sourceText = getDslText();
  const { ast, errors: parseErrors } = parseDSLToAST(sourceText);

  if (parseErrors.length) {
    store.setState({ errors: parseErrors });
    renderErrors();
    return;
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);
  if (compileErrors.length) {
    store.setState({ errors: compileErrors });
    renderErrors();
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

  nodeEditor?.render(editorModel);
  renderGraphJSON(graph);
  renderErrors();
  runPreview(graph);
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
  runPreview(graph);
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

function runPreview(graph) {
  const state = store.getState();
  if (!graph) graph = state.graph;
  if (!graph) return;

  try {
    engine = new Loom(graph);
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
    }

    if (currentRender?.type === 'point') {
      const x = resolveValue(engine, currentRender.x);
      const y = resolveValue(engine, currentRender.y);
      const color = currentRender.color || '#00ff00';
      ctx.fillStyle = color;
      ctx.beginPath();
      if (x !== null && y !== null) {
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
      if (width !== null && y !== null) {
        ctx.fillStyle = color;
        ctx.fillRect(0, y, width, height);
      }
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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

function resetSample() {
  setDslText(SAMPLE_DSL);
  applyDsl();
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

  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      elements.tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${tabName}-tab`)?.classList.add('active');
    });
  });
}

function init() {
  initDslEditor();
  nodeEditor = new NodeEditorView(elements.nodeEditorHost, (operation) => {
    const state = store.getState();
    if (!state.editorModel) return;

    const newModel = applyEditorOperation(state.editorModel, operation);
    store.setState({ editorModel: newModel });
    nodeEditor?.render(newModel);

    const graph = editorModelToGraph(newModel, state.graph);
    store.setState({ graph });
    renderGraphJSON(graph);
    runPreview(graph);
  });

  setupEventListeners();
  applyDsl();
}

init();
