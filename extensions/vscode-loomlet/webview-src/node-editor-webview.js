// WebView bundle entry point for the Loomlet Node Preview panel.
// Bundled by esbuild; runs inside a VS Code WebView (browser context).
import { NodeEditorView } from '../../../editor-studio/src/node-editor-view.js';
import { Loom } from '../../../src/loom.js';

const vscode = acquireVsCodeApi();
let editorView = null;

let editorVisible = true;
let lastErrors = [];
let loomEngine = null;
let loomRafId = null;
let currentGraph = null;
let runtimeStartTimestampMs = null;
let isRuntimePaused = false;
let pausedAtTimestampMs = null;
let accumulatedPausedMs = 0;
let lastEffectsPostMs = 0;

const EFFECTS_POST_INTERVAL_MS = 100;

const hostInput = {
  mouseX: 320,
  mouseY: 240,
  mouseDown: false,
  keys: new Set()
};

function resizePreviewCanvas() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  if (!loomEngine) drawPlaceholder(canvas, dpr);
}

function drawPlaceholder(canvas, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

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

function updatePointerFromEvent(event) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  hostInput.mouseX = event.clientX - rect.left;
  hostInput.mouseY = event.clientY - rect.top;
}

function syncMouseDownFromButtons(event) {
  if (typeof event.buttons === 'number') {
    hostInput.mouseDown = (event.buttons & 1) === 1;
  }
}

function initHostInputs() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;

  canvas.tabIndex = 0;
  canvas.style.outline = 'none';

  // Capture phase is important because the Node Editor overlay can receive the
  // pointer event before the canvas. `event.buttons` also fixes missed pointerup
  // cases so mouseDown does not get stuck true.
  window.addEventListener('pointermove', (event) => {
    updatePointerFromEvent(event);
    syncMouseDownFromButtons(event);
  }, true);

  window.addEventListener('pointerdown', (event) => {
    canvas.focus();
    updatePointerFromEvent(event);
    syncMouseDownFromButtons(event);
  }, true);

  window.addEventListener('pointerup', (event) => {
    updatePointerFromEvent(event);
    syncMouseDownFromButtons(event);
  }, true);

  window.addEventListener('pointercancel', () => {
    hostInput.mouseDown = false;
  }, true);

  window.addEventListener('mouseup', () => {
    hostInput.mouseDown = false;
  }, true);

  window.addEventListener('keydown', (event) => {
    hostInput.keys.add(event.code || event.key);
    hostInput.keys.add(event.key);
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      event.preventDefault();
    }
  }, true);

  window.addEventListener('keyup', (event) => {
    hostInput.keys.delete(event.code || event.key);
    hostInput.keys.delete(event.key);
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
      event.preventDefault();
    }
  }, true);

  window.addEventListener('blur', () => {
    hostInput.mouseDown = false;
    hostInput.keys.clear();
  });
}

function resolveValue(engine, ref) {
  if (typeof ref === 'number' || typeof ref === 'boolean') return ref;
  if (ref === null || ref === undefined) return null;
  if (typeof ref === 'string' && ref.startsWith('__loomlet_host:')) return resolveHostInput(ref);

  const numVal = parseFloat(ref);
  if (!Number.isNaN(numVal) && String(ref).trim() === String(numVal)) return numVal;

  const value = engine?.getValue(ref);
  if (typeof value === 'string' && value.startsWith('__loomlet_host:')) {
    return resolveHostInput(value);
  }
  return value;
}

function resolveEffectValue(value) {
  if (typeof value === 'string' && value.startsWith('__loomlet_host:')) return resolveHostInput(value);
  if (Array.isArray(value)) return value.map(resolveEffectValue);
  if (value && typeof value === 'object') {
    const copy = {};
    for (const [key, nested] of Object.entries(value)) {
      copy[key] = resolveEffectValue(nested);
    }
    return copy;
  }
  return value;
}

function resolveConsoleEffect(effect) {
  const copy = { ...effect };
  for (const key of ['args', 'values', 'value', 'message', 'payload']) {
    if (Object.prototype.hasOwnProperty.call(copy, key)) {
      copy[key] = resolveEffectValue(copy[key]);
    }
  }
  return copy;
}

function resolveHostInput(token) {
  if (token === '__loomlet_host:mouseX') return hostInput.mouseX;
  if (token === '__loomlet_host:mouseY') return hostInput.mouseY;
  if (token === '__loomlet_host:mouseDown') return hostInput.mouseDown;
  const keyPrefix = '__loomlet_host:key:';
  if (token.startsWith(keyPrefix)) {
    return hostInput.keys.has(token.slice(keyPrefix.length));
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
  if (isRuntimePaused) {
    loomRafId = null;
    return;
  }

  try {
    if (runtimeStartTimestampMs === null) runtimeStartTimestampMs = timestamp;
    const elapsedSeconds = (timestamp - runtimeStartTimestampMs - accumulatedPausedMs) / 1000;
    loomEngine.evaluateAt(elapsedSeconds, timestamp);
    postRuntimeEffects(timestamp);
    drawRuntimeCanvas();
  } catch (error) {
    console.error('[loomlet-preview] Runtime error in drawFrame:', error);
    handleRuntimeError(error);
    return;
  }

  loomRafId = requestAnimationFrame(drawFrame);
}

function postRuntimeEffects(timestamp) {
  if (!loomEngine || typeof loomEngine.getEffects !== 'function') return;
  if (timestamp - lastEffectsPostMs < EFFECTS_POST_INTERVAL_MS) return;

  const effects = loomEngine.getEffects() || [];
  const consoleEffects = effects.filter(isConsoleEffect).map(resolveConsoleEffect);
  if (consoleEffects.length === 0) return;

  lastEffectsPostMs = timestamp;
  vscode.postMessage({ type: 'runtimeEffects', effects: consoleEffects });
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

function drawRuntimeCanvas() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas || !loomEngine || !currentGraph) return;

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const renderConfig = currentGraph.render;
  const enabled = isEnabled(loomEngine, renderConfig);

  const trail = renderConfig?.trail !== undefined ? resolveValue(loomEngine, renderConfig.trail) : 0.1;
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

  if (renderConfig?.type === 'point') drawPoint(ctx, renderConfig, dpr, w, h);
  else if (renderConfig?.type === 'bar') drawBar(ctx, renderConfig, dpr, w, h);
  else if (renderConfig?.type === 'keys') drawKeyVisualizer(ctx, renderConfig, dpr, w, h);
}

function drawPoint(ctx, renderConfig, dpr, w, h) {
  const x = resolveValue(loomEngine, renderConfig.x);
  const y = resolveValue(loomEngine, renderConfig.y);
  const radius = resolveValue(loomEngine, renderConfig.radius) ?? 4;
  const color = renderConfig.color || '#00ff00';
  ctx.fillStyle = color;
  ctx.beginPath();
  if (typeof x === 'number' && typeof y === 'number') {
    ctx.arc(x * dpr, y * dpr, radius * dpr, 0, Math.PI * 2);
  } else {
    ctx.arc(w / 2, h / 2, radius * dpr, 0, Math.PI * 2);
  }
  ctx.fill();
}

function drawBar(ctx, renderConfig, dpr, w, h) {
  const width = resolveValue(loomEngine, renderConfig.width);
  if (typeof width !== 'number') return;
  const color = renderConfig.color || '#00ccff';
  const cssHeight = renderConfig.height !== undefined ? resolveValue(loomEngine, renderConfig.height) : 40;
  const cssX = renderConfig.x !== undefined ? resolveValue(loomEngine, renderConfig.x) : 0;
  const cssY = renderConfig.y !== undefined ? resolveValue(loomEngine, renderConfig.y) : null;
  const heightPx = cssHeight * dpr;
  const xPx = typeof cssX === 'number' ? cssX * dpr : 0;
  const yPx = typeof cssY === 'number' ? cssY * dpr : (h - heightPx) / 2;
  ctx.fillStyle = color;
  ctx.fillRect(xPx, yPx, width * dpr, heightPx);
}

function drawKeyVisualizer(ctx, renderConfig, dpr, w, h) {
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

  drawKey(ctx, '↑', resolveValue(loomEngine, renderConfig.up), cx, cy - keyH - gap, keyW, keyH, dpr);
  drawKey(ctx, '←', resolveValue(loomEngine, renderConfig.left), cx - keyW - gap, cy, keyW, keyH, dpr);
  drawKey(ctx, 'Space', resolveValue(loomEngine, renderConfig.space), cx, cy, keyW, keyH, dpr);
  drawKey(ctx, '→', resolveValue(loomEngine, renderConfig.right), cx + keyW + gap, cy, keyW, keyH, dpr);
  drawKey(ctx, '↓', resolveValue(loomEngine, renderConfig.down), cx, cy + keyH + gap, keyW, keyH, dpr);
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

function handleRuntimeError(error) {
  setStatus('Runtime error · Read-only Node Preview', true);
  stopLoom();
  updateControlStates();
  const canvas = document.getElementById('lp-preview-canvas');
  if (canvas) drawPlaceholder(canvas, window.devicePixelRatio || 1);
}

function stopLoom() {
  if (loomRafId !== null) cancelAnimationFrame(loomRafId);
  loomRafId = null;
  if (loomEngine) {
    try { loomEngine.stop(); } catch (_) {}
  }
  loomEngine = null;
  runtimeStartTimestampMs = null;
  isRuntimePaused = false;
  pausedAtTimestampMs = null;
  accumulatedPausedMs = 0;
  lastEffectsPostMs = 0;
  hostInput.mouseDown = false;
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
    loomEngine = new Loom({ nodes: graph.nodes || [], edges: graph.edges || [] });
    loomRafId = requestAnimationFrame(drawFrame);
    updateControlStates();
  } catch (error) {
    console.error('[loomlet-preview] Loom engine initialization failed:', error);
    handleRuntimeError(error);
  }
}

function setStatus(text, isError) {
  const el = document.getElementById('lp-status');
  if (!el) return;
  el.textContent = text;
  el.style.borderLeftColor = isError ? '#f44747' : '#4a90e2';
  el.style.color = isError ? '#f88' : '#9cdcfe';
}

function setErrors(errors) {
  lastErrors = errors || [];
  renderErrors();
}

function renderErrors() {
  const el = document.getElementById('lp-errors');
  if (!el) return;
  if (!editorVisible || lastErrors.length === 0) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = lastErrors.map((e) => `<div class="lp-error-item">${escapeHtml(e.message || String(e))}</div>`).join('');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function togglePauseResume() {
  if (!loomEngine || !currentGraph?.render) return;
  if (isRuntimePaused) {
    const now = performance.now();
    if (pausedAtTimestampMs !== null) accumulatedPausedMs += now - pausedAtTimestampMs;
    pausedAtTimestampMs = null;
    isRuntimePaused = false;
    if (loomRafId === null) loomRafId = requestAnimationFrame(drawFrame);
  } else {
    pausedAtTimestampMs = performance.now();
    isRuntimePaused = true;
    if (loomRafId !== null) cancelAnimationFrame(loomRafId);
    loomRafId = null;
  }
  updateControlStates();
  updateStatus();
}

function resetRuntime() {
  if (!loomEngine || !currentGraph?.render) return;
  runtimeStartTimestampMs = null;
  accumulatedPausedMs = 0;
  isRuntimePaused = false;
  pausedAtTimestampMs = null;
  lastEffectsPostMs = 0;
  hostInput.mouseDown = false;

  const canvas = document.getElementById('lp-preview-canvas');
  const ctx = canvas?.getContext('2d');
  if (canvas && ctx) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (loomRafId !== null) cancelAnimationFrame(loomRafId);
  loomRafId = requestAnimationFrame(drawFrame);
  updateControlStates();
  updateStatus();
}

function updateControlStates() {
  const canControl = Boolean(loomEngine && currentGraph?.render);
  const toggleBtn = document.getElementById('lp-toggle-runtime');
  const resetBtn = document.getElementById('lp-reset-runtime');
  if (toggleBtn) {
    toggleBtn.disabled = !canControl;
    toggleBtn.textContent = isRuntimePaused ? 'Resume' : 'Pause';
  }
  if (resetBtn) resetBtn.disabled = !canControl;
}

function updateStatus() {
  if (isRuntimePaused) setStatus('Paused · Runtime Preview · Read-only Node Preview', false);
  else if (loomEngine && currentGraph?.render) setStatus('Running · Runtime Preview · Read-only Node Preview', false);
}

function toggleEditor() {
  editorVisible = !editorVisible;
  const panel = document.getElementById('lp-panel');
  const container = document.getElementById('lp-editor-container');
  const btn = document.getElementById('lp-toggle-editor');
  if (editorVisible) {
    if (container) container.style.display = '';
    if (panel) panel.style.flex = '1';
    if (btn) btn.textContent = 'Hide Editor';
  } else {
    if (container) container.style.display = 'none';
    if (panel) panel.style.flex = '0 0 auto';
    if (btn) btn.textContent = 'Show Editor';
  }
  renderErrors();
}

function initControlButtons() {
  document.getElementById('lp-toggle-editor')?.addEventListener('click', toggleEditor);
  document.getElementById('lp-toggle-runtime')?.addEventListener('click', togglePauseResume);
  document.getElementById('lp-reset-runtime')?.addEventListener('click', resetRuntime);
}

function initEditorView() {
  if (editorView) return;
  const container = document.getElementById('lp-editor-container');
  if (!container) return;
  editorView = new NodeEditorView(container, {
    onOperation: () => {},
    onError: (error) => console.error('[NodeEditorView]', error),
    onSelectNode: () => {}
  });
}

window.addEventListener('message', async (event) => {
  const message = event.data;
  if (!message || message.type !== 'setModel') return;

  const { editorModel, graph, errors } = message;

  if (errors && errors.length > 0) {
    setStatus('DSL has errors · Read-only Node Preview', true);
    setErrors(errors);
    return;
  }

  setErrors([]);
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
  } catch (error) {
    console.error('[loomlet-preview] renderModel failed:', error);
    setStatus('Render error · Read-only Node Preview', true);
  }
});

resizePreviewCanvas();
window.addEventListener('resize', resizePreviewCanvas);
initHostInputs();
initControlButtons();
vscode.postMessage({ type: 'ready' });
