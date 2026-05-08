// WebView bundle entry point for the Loomlet Node Preview panel.
// Bundled by esbuild; runs inside a VS Code WebView (browser context).
import { NodeEditorView } from '../../../editor-studio/src/node-editor-view.js';

const vscode = acquireVsCodeApi();
let editorView = null;

// --- DOM helpers ---

function setStatus(text, isError) {
  const el = document.getElementById('lp-status');
  if (!el) return;
  el.textContent = text;
  if (isError) {
    el.style.borderLeftColor = '#f44747';
    el.style.background = 'rgba(244,71,71,0.12)';
    el.style.color = '#f88';
  } else {
    el.style.borderLeftColor = '#4a90e2';
    el.style.background = 'rgba(74,144,226,0.12)';
    el.style.color = '#9cdcfe';
  }
}

function setErrors(errors) {
  const el = document.getElementById('lp-errors');
  if (!el) return;
  if (!errors || errors.length === 0) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = errors
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

// --- Editor lifecycle ---

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

// --- Message handler ---

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

// Notify the extension that the webview is ready (optional handshake)
vscode.postMessage({ type: 'ready' });
