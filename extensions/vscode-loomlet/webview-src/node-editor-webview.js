// WebView bundle entry point for the Loomlet Node Preview panel.
// Bundled by esbuild; runs inside a VS Code WebView (browser context).
import { NodeEditorView } from '../../../editor-studio/src/node-editor-view.js';

const vscode = acquireVsCodeApi();
let editorView = null;

// ── State ────────────────────────────────────────────────────────────────────

let editorVisible = true;
let lastErrors = [];
let currentRenderPreview = { items: [], unsupported: [] };

// ── Canvas: Render preview ───────────────────────────────────────────────────

function resizePreviewCanvas() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  drawPreviewCanvas(dpr);
}

function drawPreviewCanvas(dpr) {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;

  drawPreviewBackground(canvas, dpr);

  if (currentRenderPreview.items && currentRenderPreview.items.length > 0) {
    drawRenderItems(canvas, currentRenderPreview.items, dpr);
  } else {
    drawPlaceholderText(canvas, dpr);
  }

  if (currentRenderPreview.unsupported && currentRenderPreview.unsupported.length > 0) {
    drawUnsupportedHint(canvas, currentRenderPreview.unsupported, dpr);
  }
}

function drawPreviewBackground(canvas, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  // Dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  // Subtle dot grid
  const step = 28 * dpr;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPlaceholderText(canvas, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = `${Math.round(15 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('Runtime Preview', w / 2, h / 2 - Math.round(13 * dpr));

  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.font = `${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('render output will appear here', w / 2, h / 2 + Math.round(13 * dpr));
}

function drawRenderItems(canvas, items, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  for (const item of items) {
    try {
      if (item.kind === 'circle') {
        drawCircle(ctx, item, dpr);
      } else if (item.kind === 'rect') {
        drawRect(ctx, item, dpr);
      } else if (item.kind === 'bar') {
        drawBar(ctx, item, dpr);
      } else if (item.kind === 'text') {
        drawText(ctx, item, dpr);
      }
    } catch (e) {
      console.warn('Failed to draw render item:', item, e);
    }
  }
}

function drawCircle(ctx, item, dpr) {
  const x = (item.x || 100) * dpr;
  const y = (item.y || 100) * dpr;
  const r = (item.r || 24) * dpr;
  const color = item.color || '#80ed99';

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawRect(ctx, item, dpr) {
  const x = (item.x || 80) * dpr;
  const y = (item.y || 80) * dpr;
  const width = (item.width || 120) * dpr;
  const height = (item.height || 80) * dpr;
  const color = item.color || '#70d6ff';

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBar(ctx, item, dpr) {
  const x = (item.x || 40) * dpr;
  const y = (item.y || 120) * dpr;
  const width = (item.width || 240) * dpr;
  const height = (item.height || 24) * dpr;
  const value = Math.max(0, Math.min(1, item.value || 0.5)); // clamp 0-1
  const color = item.color || '#ffd166';
  const bgColor = item.backgroundColor || 'rgba(255,255,255,0.12)';

  // Background bar
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  // Foreground bar (value)
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * value, height);
}

function drawText(ctx, item, dpr) {
  const x = (item.x || 40) * dpr;
  const y = (item.y || 60) * dpr;
  const text = item.text || 'text';
  const color = item.color || '#ffffff';
  const size = item.size || 18;

  ctx.fillStyle = color;
  ctx.font = `${Math.round(size * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

function drawUnsupportedHint(canvas, unsupported, dpr) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = unsupported.length;
  const hintText = `${count} unsupported render item${count > 1 ? 's' : ''}`;

  ctx.fillStyle = 'rgba(255,150,100,0.4)';
  ctx.font = `${Math.round(10 * dpr)}px monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(hintText, Math.round(12 * dpr), Math.round(canvas.height - 24 * dpr));
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

function buildStatusText(editorModel, errors, renderPreview) {
  let status = '';

  if (editorModel && renderPreview) {
    status = 'Synced';

    // Add render item count
    if (renderPreview.items && renderPreview.items.length > 0) {
      status += ` · ${renderPreview.items.length} render item${renderPreview.items.length > 1 ? 's' : ''}`;
    }

    // Add unsupported count
    if (renderPreview.unsupported && renderPreview.unsupported.length > 0) {
      status += ` · ${renderPreview.unsupported.length} unsupported`;
    }
  } else {
    status = 'Empty';
  }

  status += ' · Read-only Node Preview';
  return status;
}

function setErrors(errors) {
  lastErrors = errors || [];
  _renderErrors();
}

function _renderErrors() {
  const el = document.getElementById('lp-errors');
  if (!el) return;
  // Hide errors when editor panel is collapsed or there are none
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

// ── Hide / Show toggle ────────────────────────────────────────────────────────

function toggleEditor() {
  editorVisible = !editorVisible;

  const panel = document.getElementById('lp-panel');
  const container = document.getElementById('lp-editor-container');
  const btn = document.getElementById('lp-toggle-editor');

  if (editorVisible) {
    if (container) container.style.display = '';
    // Restore full-height flex to the panel
    if (panel) panel.style.flex = '1';
    if (btn) btn.textContent = 'Hide Editor';
    _renderErrors();
  } else {
    if (container) container.style.display = 'none';
    // Collapse panel to toolbar height only
    if (panel) panel.style.flex = '0 0 auto';
    if (btn) btn.textContent = 'Show Editor';
    _renderErrors(); // hides errors too
  }
}

function initToggleButton() {
  const btn = document.getElementById('lp-toggle-editor');
  if (btn) btn.addEventListener('click', toggleEditor);
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

  const { editorModel, errors, renderPreview } = message;

  if (errors && errors.length > 0) {
    setStatus('DSL has errors · Read-only Node Preview', true);
    setErrors(errors);
    // Leave the previous node editor state visible (do not touch editorView)
    return;
  }

  setErrors([]);

  // Update render preview
  if (renderPreview) {
    currentRenderPreview = renderPreview;
    resizePreviewCanvas(); // Redraw with new render preview
  }

  if (!editorModel) {
    setStatus(buildStatusText(null, [], renderPreview), false);
    return;
  }

  initEditorView();

  try {
    await editorView.renderModel(editorModel);
    setStatus(buildStatusText(editorModel, [], renderPreview), false);
  } catch (e) {
    console.error('[loomlet-preview] renderModel failed:', e);
    setStatus('Render error · Read-only Node Preview', true);
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────

resizePreviewCanvas();
window.addEventListener('resize', resizePreviewCanvas);
initToggleButton();

// Notify the extension that the webview is ready
vscode.postMessage({ type: 'ready' });
