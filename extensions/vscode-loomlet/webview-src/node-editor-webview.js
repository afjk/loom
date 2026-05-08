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

// Console effect forwarding state
let lastEffectsPostMs = 0;
const EFFECTS_POST_INTERVAL_MS = 100;

// Host input state used by VS Code Preview-only input aliases.
const hostInput = {
  mouseX: 320,
  mouseY: 240,
  mouseDown: false,
  keys: new Set()
};

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
  ctx.fillText('add render bar(), render point(), or render keys() to see output', w / 2, h / 2 + Math.round(13 * dpr));
}

function initHostInputs() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;

  canvas.tabIndex = 0;
  canvas.style.outline = 'none';

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    hostInput.mouseX = event.clientX - rect.left;
    hostInput.mouseY = event.clientY - rect.top;
  });

  canvas.addEventListener('pointerdown', (event) => {
    canvas.focus();
    const rect = canvas.getBoundingClientRect();
    hostInput.mouseX = event.clientX - rect.left;
    hostInput.mouseY = event.clientY - rect.top;
    hostInput.mouseDown = true;
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
  });

  canvas.addEventListener('pointerup', (event) => {
    hostInput.mouseDown = false;
    try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
  });

  canvas.addEventListener('pointercancel', () => {
    hostInput.mouseDown = false;
  });

  canvas.addEventListener('mouseleave', () => {
    hostInput.mouseDown = false;
  });

  window.addEventListener('keydown', (event) => {
    hostInput.keys.add(event.code || event.key);
    hostInput.keys.add(event.key);
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    hostInput.keys.delete(event.code || event.key);
    hostInput.keys.delete(event.key);
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener('blur', () => {
    hostInput.mouseDown = false;
    hostInput.keys.clear();
  });
}

// ── Loom runtime: resolve & draw ─────────────────────────────────────────────

/**
 * Resolve a render config value: either a literal number/string/bool, a host
 * input token, or a node-output ref string like "wave.out" that is looked up
 * in the Loom engine.
 */
function resolveValue(engine, ref) {
  if (typeof ref === 'number' || typeof ref === 'boolean') return ref;
  if (ref === null || ref === undefined) return null;
  if (typeof ref === 'string' && ref.startsWith('__loomlet_host:')) return resolveHostInput(ref);
  const numVal = parseFloat(ref);
  if (!isNaN(numVal) && String(ref).trim() === String(numVal)) return numVal;
  return engine.getValue(ref);
}

function resolveHostInput(token) {
  if (token === '__loomlet_host:mouseX') return hostInput.mouseX;
  if (token === '__loomlet_host:mouseY') return hostInput.mouseY;
  if (token === '__loomlet_host:mouseDown') return hostInput.mouseDown;
  const keyPrefix = '__loomlet_host:key:';
  if (token.startsWith(keyPrefix)) {
    const key = token.slice(keyPrefix.length);
    return hostInput.keys.has(key);
  }
  return null;
}

function isEnabled(engine, renderConfig) {
  const enabled = renderConfig?.enabled;
  if (enabled === undefined || enabled === null) return true;
  return Boolean(resolveValue(engine, enabled));
}

function drawFrame(timestamp) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas || !loomEngine || !currentGraph) return;

  // If paused, don't update; just keep the current frame
  if (isRuntimePaused) {
    loomRafId = null;
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
    postRuntimeEffects(timestamp);

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

function postRuntimeEffects(timestamp) {
  if (!loomEngine || typeof loomEngine.getEffects !== 'function') return;
  if (timestamp - lastEffectsPostMs < EFFECTS_POST_INTERVAL_MS) return;

  const effects = loomEngine.getEffects() || [];
  const consoleEffects = effects.filter(isConsoleEffect);
  if (consoleEffects.length === 0) return;

  lastEffectsPostMs = timestamp;
  vscode.postMessage({
    type: 'runtimeEffects',
    effects: consoleEffects
  });
}

function isConsoleEffect(effect) {
  if (!effect || typeof effect !== 'object') return false;
  const type = String(effect.type || effect.kind || effect.name || '');
  const target = String(effect.target || '');
  return type === 'console'
    || type === 'console.log'
    || type === 'console.warn'
    || type === 'console.error'
    || target === 'console';
}

function drawRuntimeCanvas(timestamp) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas || !loomEngine || !currentGraph) return;

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const renderConfig = currentGraph.render;
  const enabled = isEnabled(loomEngine, renderConfig);

  // Trail (partial clear) vs hard clear. When trail is 0, point renders behave
  // like paint: do not clear the canvas every frame, and only add strokes when
  // enabled is true.
  const trail = renderConfig?.trail !== undefined ? renderConfig.trail : 0.1;
  if (trail > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${trail})`;
    ctx.fillRect(0, 0, w, h);
  } else if (renderConfig?.type !== 'point') {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
  }

  if (!enabled) {
    if (renderConfig?.type === 'keys') drawKeyVisualizer(ctx, renderConfig, dpr, w, h);
    return;
  }

  if (renderConfig?.type === 'point') {
    drawPoint(ctx, renderConfig, dpr, w, h);
  } else if (renderConfig?.type === 'bar') {
    drawBar(ctx, renderConfig, dpr, w, h);
  } else if (renderConfig?.type === 'keys') {
    drawKeyVisualizer(ctx, renderConfig, dpr, w, h);
  }
}

function drawPoint(ctx, renderConfig, dpr, w, h) {
  const x = resolveValue(loomEngine, renderConfig.x);
  const y = resolveValue(loomEngine, renderConfig.y);
  const radius = resolveValue(loomEngine, renderConfig.radius) ?? 4;
  const color = renderConfig.color || '#00ff00';
  ctx.fillStyle = color;
  ctx.beginPath();
  if (x !== null && typeof x === 'number' && y !== null && typeof y === 'number') {
    // Scale from CSS-px space to device-px space
    ctx.arc(x * dpr, y * dpr, radius * dpr, 0, Math.PI * 2);
  } else {
    ctx.arc(w / 2, h / 2, radius * dpr, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawBar(ctx, renderConfig, dpr, w, h) {
  const width = resolveValue(loomEngine, renderConfig.width);
  const color = renderConfig.color || '#00ccff';
  const cssHeight = renderConfig.height !== undefined ? resolveValue(loomEngine, renderConfig.height) : 40;
  const heightPx = cssHeight * dpr;
  const cssX = renderConfig.x !== undefined
    ? resolveValue(loomEngine, renderConfig.x)
    : 0;
  const cssY = renderConfig.y !== undefined
    ? resolveValue(loomEngine, renderConfig.y)
    : null;
  const xPx = typeof cssX === 'number' ? cssX * dpr : 0;
  const yPx = cssY !== null && typeof cssY === 'number'
    ? cssY * dpr
    : (h - heightPx) / 2;

  if (width !== null && typeof width === 'number') {
    ctx.fillStyle = color;
    ctx.fillRect(xPx, yPx, width * dpr, heightPx);
  }
}

function drawKeyVisualizer(ctx, renderConfig, dpr, w, h) {
  const states = [
    ['Space', resolveValue(loomEngine, renderConfig.space)],
    ['←', resolveValue(loomEngine, renderConfig.left)],
    ['→', resolveValue(loomEngine, renderConfig.right)],
    ['↑', resolveValue(loomEngine, renderConfig.up)],
    ['↓', resolveValue(loomEngine, renderConfig.down)]
  ];

  const cx = w / 2;
  const cy = h / 2;
  const keyW = 78 * dpr;
  const keyH = 52 * dpr;
  const gap = 10 * dpr;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(16 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillText('Click preview, then press Space / Arrow keys', cx, cy - 110 * dpr);

  drawKey(ctx, '↑', states[3][1], cx, cy - keyH - gap, keyW, keyH, dpr);
  drawKey(ctx, '←', states[1][1], cx - keyW - gap, cy, keyW, keyH, dpr);
  drawKey(ctx, 'Space', states[0][1], cx, cy, keyW, keyH, dpr);
  drawKey(ctx, '→', states[2][1], cx + keyW + gap, cy, keyW, keyH, dpr);
  drawKey(ctx, '↓', states[4][1], cx, cy + keyH + gap, keyW, keyH, dpr);
  ctx.restore();
}

function drawKey(ctx, label, active, cx, cy, w, h, dpr) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.fillStyle = active ? 'rgba(112,214,255,0.9)' : 'rgba(255,255,255,0.08)';
  ctx.strokeStyle = active ? 'rgba(112,214,255,1)' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 10 * dpr);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = active ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.62)';
  ctx.fillText(label, cx, cy);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
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
  lastEffectsPostMs = 0;
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
    lastEffectsPostMs = 0;
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
    .map(e => `<div class=\"lp-error-item\">${escapeHtml(e.message || String(e))}</div>`)
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
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
    if (loomRafId === null) {
      loomRafId = requestAnimationFrame(drawFrame);
    }
  } else {
    // Pause: record the current time and cancel any scheduled frame
    pausedAtTimestampMs = performance.now();
    isRuntimePaused = true;
    if (loomRafId !== null) {
      cancelAnimationFrame(loomRafId);
      loomRafId = null;
    }
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
  lastEffectsPostMs = 0;

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
    loomRafId = null;
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
initHostInputs();
initControlButtons();

// Notify the extension that the webview is ready
vscode.postMessage({ type: 'ready' });
