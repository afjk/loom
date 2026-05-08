// WebView bundle entry point for the Loomlet Node Preview panel.
// Bundled by esbuild; runs inside a VS Code WebView (browser context).
import { NodeEditorView } from '../../../editor-studio/src/node-editor-view.js';
import { Loom } from '../../../src/loom.js';

const vscode = acquireVsCodeApi();
let editorView = null;

// ── State ────────────────────────────────────────────────────────────────────

let editorVisible = true;
let lastErrors = [];

// Loom runtime state
let loomEngine = null;
let loomRafId = null;
let currentGraph = null;  // keeps the full graph including .render config
let runtimeStartTimestampMs = null;  // timestamp when runtime started

// Pause/Resume state
let isRuntimePaused = false;
let pausedAtTimestampMs = null;
let accumulatedPausedMs = 0;

// ── Canvas: Loom Runtime Preview ─────────────────────────────────────────────

function resizePreviewCanvas() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;
  // Use device pixel ratio for sharp rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  // Redraw placeholder if no runtime is running
  if (!loomEngine) {
    drawPlaceholder(canvas, dpr);
  }
}

function drawPlaceholder(canvas, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  // Dot grid
  const step = 28 * dpr;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = `${Math.round(15 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('Runtime Preview', w / 2, h / 2 - Math.round(13 * dpr));

  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.font = `${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('add render bar() or render point() to see output', w / 2, h / 2 + Math.round(13 * dpr));
}

// ── Loom runtime: resolve & draw ─────────────────────────────────────────────

/**
 * Resolve a render config value: either a literal number or a node-output ref
 * string like "wave.out" that is looked up in the Loom engine.
 */
function resolveValue(engine, ref) {
  if (typeof ref === 'number') return ref;
  if (ref === null || ref === undefined) return null;
  const numVal = parseFloat(ref);
  if (!isNaN(numVal) && String(ref).trim() === String(numVal)) return numVal;
  return engine.getValue(ref);
}

function drawFrame(timestamp) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas || !loomEngine || !currentGraph) return;

  // If paused, don't update; just keep the current frame
  if (isRuntimePaused) {
    return;
  }

  try {
    // Calculate elapsed time from runtime start, excluding accumulated paused time
    if (runtimeStartTimestampMs === null) {
      runtimeStartTimestampMs = timestamp;
    }
    const elapsedSeconds = (timestamp - runtimeStartTimestampMs - accumulatedPausedMs) / 1000;

    // Evaluate the Loom graph at this time
    loomEngine.evaluateAt(elapsedSeconds, timestamp);

    // Draw the canvas
    drawRuntimeCanvas(timestamp);
  } catch (error) {
    console.error('[loomlet-preview] Runtime error in drawFrame:', error);
    handleRuntimeError(error);
    return;
  }

  // Schedule next frame
  loomRafId = requestAnimationFrame(drawFrame);
}

function drawRuntimeCanvas(timestamp) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas || !loomEngine || !currentGraph) return;

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const renderConfig = currentGraph.render;

  // Trail (partial clear) vs hard clear
  const trail = renderConfig?.trail !== undefined ? renderConfig.trail : 0.1;
  if (trail > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${trail})`;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
  }

  if (renderConfig?.type === 'point') {
    const x = resolveValue(loomEngine, renderConfig.x);
    const y = resolveValue(loomEngine, renderConfig.y);
    const color = renderConfig.color || '#00ff00';
    ctx.fillStyle = color;
    ctx.beginPath();
    if (x !== null && typeof x === 'number' && y !== null && typeof y === 'number') {
      // Scale from CSS-px space to device-px space
      ctx.arc(x * dpr, y * dpr, 4 * dpr, 0, Math.PI * 2);
    } else {
      ctx.arc(w / 2, h / 2, 4 * dpr, 0, Math.PI * 2);
    }
    ctx.fill();

  } else if (renderConfig?.type === 'bar') {
    const width = resolveValue(loomEngine, renderConfig.width);
    const color = renderConfig.color || '#00ccff';
    const cssHeight = renderConfig.height !== undefined ? renderConfig.height : 40;
    const heightPx = cssHeight * dpr;
    const cssY = renderConfig.y !== undefined
      ? resolveValue(loomEngine, renderConfig.y)
      : null;
    const yPx = cssY !== null && typeof cssY === 'number'
      ? cssY * dpr
      : (h - heightPx) / 2;

    if (width !== null && typeof width === 'number') {
      ctx.fillStyle = color;
      ctx.fillRect(0, yPx, width * dpr, heightPx);
    }
  }
}

// ── Runtime error handling ───────────────────────────────────────────────────

function handleRuntimeError(error) {
  setStatus('Runtime error · Read-only Node Preview', true);
  stopLoom();
  updateControlStates();
  const canvas = document.getElementById('lp-preview-canvas');
  if (canvas) drawPlaceholder(canvas, window.devicePixelRatio || 1);
}

// ── Loom engine lifecycle ─────────────────────────────────────────────────────

function stopLoom() {
  if (loomRafId !== null) {
    cancelAnimationFrame(loomRafId);
    loomRafId = null;
  }
  if (loomEngine) {
    try { loomEngine.stop(); } catch (_) {}
    loomEngine = null;
  }
  // Reset time tracking state
  runtimeStartTimestampMs = null;
  isRuntimePaused = false;
  pausedAtTimestampMs = null;
  accumulatedPausedMs = 0;
}

function startLoom(graph) {
  stopLoom();
  currentGraph = graph || null;

  if (!graph || !graph.render) {
    const canvas = document.getElementById('lp-preview-canvas');
    if (canvas) drawPlaceholder(canvas, window.devicePixelRatio || 1);
    updateControlStates();
    return;
  }

  try {
    const graphForLoom = { nodes: graph.nodes || [], edges: graph.edges || [] };
    loomEngine = new Loom(graphForLoom);
    // Reset time tracking for this runtime
    runtimeStartTimestampMs = null;
    isRuntimePaused = false;
    pausedAtTimestampMs = null;
    accumulatedPausedMs = 0;
    // Start the RAF loop - do NOT call loomEngine.start()
    loomRafId = requestAnimationFrame(drawFrame);
    updateControlStates();
  } catch (e) {
    console.error('[loomlet-preview] Loom engine initialization failed:', e);
    handleRuntimeError(e);
  }
}

// ── Status & error helpers ────────────────────────────────────────────────────

function setStatus(text, isError) {
  const el = document.getElementById('lp-status');
  if (!el) return;
  el.textContent = text;
  if (isError) {
    el.style.borderLeftColor = '#f44747';
    el.style.color = '#f88';
  } else {
    el.style.borderLeftColor = '#4a90e2';
    el.style.color = '#9cdcfe';
  }
}

function setErrors(errors) {
  lastErrors = errors || [];
  _renderErrors();
}

function _renderErrors() {
  const el = document.getElementById('lp-errors');
  if (!el) return;
  if (!editorVisible || lastErrors.length === 0) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = lastErrors
    .map(e => `<div class="lp-error-item">${escapeHtml(e.message || String(e))}</div>`)
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Runtime controls ──────────────────────────────────────────────────────────

function togglePauseResume() {
  if (!loomEngine || !currentGraph || !currentGraph.render) return;

  if (isRuntimePaused) {
    // Resume: add paused time to accumulated paused time
    const now = performance.now();
    if (pausedAtTimestampMs !== null) {
      accumulatedPausedMs += (now - pausedAtTimestampMs);
      pausedAtTimestampMs = null;
    }
    isRuntimePaused = false;
    updateControlStates();
    updateStatus();
    // Resume the RAF loop
    loomRafId = requestAnimationFrame(drawFrame);
  } else {
    // Pause: record the current time
    pausedAtTimestampMs = performance.now();
    isRuntimePaused = true;
    updateControlStates();
    updateStatus();
  }
}

function resetRuntime() {
  if (!loomEngine || !currentGraph || !currentGraph.render) return;

  // Reset time tracking
  runtimeStartTimestampMs = null;
  accumulatedPausedMs = 0;
  isRuntimePaused = false;
  pausedAtTimestampMs = null;

  try {
    // Reset the engine to t=0
    loomEngine.evaluateAt(0, performance.now());
    drawRuntimeCanvas(performance.now());
  } catch (e) {
    console.error('[loomlet-preview] Error during reset:', e);
  }

  updateControlStates();
  updateStatus();

  // Schedule next frame to continue
  if (loomRafId !== null) {
    cancelAnimationFrame(loomRafId);
  }
  loomRafId = requestAnimationFrame(drawFrame);
}

function updateControlStates() {
  const canControl = loomEngine && currentGraph && currentGraph.render;
  const toggleBtn = document.getElementById('lp-toggle-runtime');
  const resetBtn = document.getElementById('lp-reset-runtime');

  if (toggleBtn) {
    toggleBtn.disabled = !canControl;
    toggleBtn.textContent = isRuntimePaused ? 'Resume' : 'Pause';
  }
  if (resetBtn) {
    resetBtn.disabled = !canControl;
  }
}

function updateStatus() {
  if (isRuntimePaused) {
    setStatus('Paused · Runtime Preview · Read-only Node Preview', false);
  } else if (loomEngine && currentGraph && currentGraph.render) {
    setStatus('Running · Runtime Preview · Read-only Node Preview', false);
  }
}

// ── Hide / Show toggle ────────────────────────────────────────────────────────

function toggleEditor() {
  editorVisible = !editorVisible;

  const panel = document.getElementById('lp-panel');
  const container = document.getElementById('lp-editor-container');
  const btn = document.getElementById('lp-toggle-editor');

  if (editorVisible) {
    if (container) container.style.display = '';
    if (panel) panel.style.flex = '1';
    if (btn) btn.textContent = 'Hide Editor';
    _renderErrors();
  } else {
    if (container) container.style.display = 'none';
    if (panel) panel.style.flex = '0 0 auto';
    if (btn) btn.textContent = 'Show Editor';
    _renderErrors();
  }
}

function initControlButtons() {
  const toggleEditorBtn = document.getElementById('lp-toggle-editor');
  if (toggleEditorBtn) toggleEditorBtn.addEventListener('click', toggleEditor);

  const toggleRuntimeBtn = document.getElementById('lp-toggle-runtime');
  if (toggleRuntimeBtn) toggleRuntimeBtn.addEventListener('click', togglePauseResume);

  const resetRuntimeBtn = document.getElementById('lp-reset-runtime');
  if (resetRuntimeBtn) resetRuntimeBtn.addEventListener('click', resetRuntime);
}

// ── Node Editor lifecycle ─────────────────────────────────────────────────────

function initEditorView() {
  if (editorView) return;
  const container = document.getElementById('lp-editor-container');
  if (!container) return;
  editorView = new NodeEditorView(container, {
    onOperation: () => {},       // read-only: ignore all edit operations
    onError: (e) => console.error('[NodeEditorView]', e),
    onSelectNode: () => {}
  });
}

// ── Message handler ───────────────────────────────────────────────────────────

window.addEventListener('message', async (event) => {
  const message = event.data;
  if (!message || message.type !== 'setModel') return;

  const { editorModel, graph, errors } = message;

  if (errors && errors.length > 0) {
    setStatus('DSL has errors · Read-only Node Preview', true);
    setErrors(errors);
    // Keep the previous node editor and Loom runtime running as-is
    return;
  }

  setErrors([]);

  // Start/restart the Loom runtime with the new graph
  startLoom(graph || null);

  if (!editorModel) {
    setStatus('Empty · Read-only Node Preview', false);
    updateControlStates();
    return;
  }

  initEditorView();

  try {
    await editorView.renderModel(editorModel);
    updateStatus();
    updateControlStates();
  } catch (e) {
    console.error('[loomlet-preview] renderModel failed:', e);
    setStatus('Render error · Read-only Node Preview', true);
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

resizePreviewCanvas();
window.addEventListener('resize', resizePreviewCanvas);
initControlButtons();

// Notify the extension that the webview is ready
vscode.postMessage({ type: 'ready' });
