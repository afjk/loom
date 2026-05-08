// WebView bundle entry point for the Loomlet Node Preview panel.
// Bundled by esbuild; runs inside a VS Code WebView (browser context).
import { NodeEditorView } from '../../../editor-studio/src/node-editor-view.js';

const vscode = acquireVsCodeApi();
let editorView = null;

// ── State ────────────────────────────────────────────────────────────────────

let editorVisible = true;
let lastErrors = [];

// ── Canvas: Runtime Preview placeholder ──────────────────────────────────────

function resizePreviewCanvas() {
  const canvas = document.getElementById('lp-preview-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  drawPreviewPlaceholder(canvas, dpr);
}

function drawPreviewPlaceholder(canvas, dpr) {
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

  // Centered label
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = `${Math.round(15 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('Runtime Preview', w / 2, h / 2 - Math.round(13 * dpr));

  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.font = `${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText('render output will appear here', w / 2, h / 2 + Math.round(13 * dpr));
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

  const { editorModel, errors } = message;

  if (errors && errors.length > 0) {
    setStatus('DSL has errors · Read-only Node Preview', true);
    setErrors(errors);
    // Leave the previous node editor state visible (do not touch editorView)
    return;
  }

  setErrors([]);

  if (!editorModel) {
    setStatus('Empty · Read-only Node Preview', false);
    return;
  }

  initEditorView();

  try {
    await editorView.renderModel(editorModel);
    setStatus('Synced · Read-only Node Preview', false);
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
