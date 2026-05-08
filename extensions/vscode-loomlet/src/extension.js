const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vscode = require('vscode');
const { getCompletionContext } = require('./completion-context');
const { buildCompletions: buildRawCompletions, getIncludePlanned } = require('./completion-engine');
const { isLoomletDocument, normalizeLoomletErrorLocation, collectLoomletDiagnosticItems, ensureModulesLoaded } = require('./diagnostics.js');
const { clampCoordinates } = require('./range-utils.js');
const { ensurePreviewModulesLoaded, buildPreviewModelFromDsl } = require('./preview-model.js');

let nodePreviewPanel = null;
let currentPreviewDocument = null;
let previousEditorModel = null;
let previewDebounceTimer = null;
let loomletOutput = null;
let runtimeOutputShown = false;
const PREVIEW_DEBOUNCE_MS = 300;

const pendingValidationTimers = new Map();

async function activate(context) {
  loomletOutput = vscode.window.createOutputChannel('Loomlet');
  context.subscriptions.push(loomletOutput);

  try {
    await ensureModulesLoaded();
  } catch (err) {
    vscode.window.showErrorMessage('Failed to load Loomlet diagnostics module. Diagnostics will be unavailable.');
    console.error('Failed to load Loomlet modules:', err);
  }

  try {
    await ensurePreviewModulesLoaded();
  } catch (err) {
    console.error('Failed to load Loomlet preview modules:', err);
    // Non-fatal: preview will show an error message if used
  }

  const diagnosticCollection = vscode.languages.createDiagnosticCollection('loomlet');
  context.subscriptions.push(diagnosticCollection);

  const provider = {
    provideCompletionItems(document, position) {
      const text = document.getText();
      const offset = document.offsetAt(position);
      const completionContext = getCompletionContext(text, offset);
      return buildCompletions(completionContext);
    }
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ language: 'loomlet', scheme: 'file' }, provider, '.', '(', ':')
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('loomlet.runCurrentFile', () => runCurrentFile('run')),
    vscode.commands.registerCommand('loomlet.sceneSyncDevCurrentFile', () => runCurrentFile('scenesync dev')),
    vscode.commands.registerCommand('loomlet.openNodePreviewToSide', () => openNodePreviewToSide(context)),
    vscode.workspace.onDidChangeTextDocument((event) => {
      scheduleValidation(event.document, diagnosticCollection);
      if (nodePreviewPanel && currentPreviewDocument && event.document.uri.toString() === currentPreviewDocument.uri.toString()) {
        schedulePreviewUpdate(event.document);
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (nodePreviewPanel && editor?.document.languageId === 'loomlet') {
        currentPreviewDocument = editor.document;
        schedulePreviewUpdate(editor.document);
      }
    }),
    vscode.workspace.onDidOpenTextDocument((document) => {
      validateLoomletDocument(document, diagnosticCollection);
    }),
    vscode.workspace.onDidSaveTextDocument((document) => {
      validateLoomletDocument(document, diagnosticCollection);
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      if (isLoomletDocument(document)) {
        diagnosticCollection.delete(document.uri);
      }
    })
  );

  context.subscriptions.push({
    dispose() {
      for (const timer of pendingValidationTimers.values()) {
        clearTimeout(timer);
      }
      pendingValidationTimers.clear();
      if (previewDebounceTimer) {
        clearTimeout(previewDebounceTimer);
        previewDebounceTimer = null;
      }
    }
  });

  // Validate already-open documents on activation
  for (const document of vscode.workspace.textDocuments) {
    validateLoomletDocument(document, diagnosticCollection);
  }
}

function deactivate() {
  if (nodePreviewPanel) {
    nodePreviewPanel.dispose();
  }
}

function openNodePreviewToSide(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor.');
    return;
  }

  const document = editor.document;
  const isLoomlet = document.languageId === 'loomlet' || document.languageId === 'loom' || document.fileName.endsWith('.loom');
  if (!isLoomlet) {
    vscode.window.showErrorMessage('Active file must be a .loom file.');
    return;
  }

  if (nodePreviewPanel) {
    nodePreviewPanel.reveal(vscode.ViewColumn.Beside);
    currentPreviewDocument = document;
    schedulePreviewUpdate(document);
    return;
  }

  const mediaDir = vscode.Uri.joinPath(context.extensionUri, 'media');

  nodePreviewPanel = vscode.window.createWebviewPanel(
    'loomletNodePreview',
    'Loomlet Node Preview',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [mediaDir]
    }
  );

  const scriptUri = nodePreviewPanel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'node-editor-webview.js')
  );

  const nonce = crypto.randomBytes(16).toString('hex');
  nodePreviewPanel.webview.html = getWebviewContent(scriptUri, nonce, nodePreviewPanel.webview.cspSource);

  nodePreviewPanel.onDidDispose(() => {
    nodePreviewPanel = null;
    currentPreviewDocument = null;
    previousEditorModel = null;
  });

  // When the WebView JS finishes loading it sends { type: 'ready' }.
  // Send the initial model at that point to avoid a race where the message
  // arrives before the WebView's message listener is registered.
  const readySub = nodePreviewPanel.webview.onDidReceiveMessage((message) => {
    if (message.type === 'ready' && currentPreviewDocument) {
      sendDocumentToPreview(currentPreviewDocument);
      return;
    }

    if (message.type === 'runtimeEffects') {
      appendRuntimeEffects(message.effects);
    }
  });
  context.subscriptions.push(readySub);

  currentPreviewDocument = document;
  // Also send immediately as a fallback (retainContextWhenHidden panels may
  // restore without firing 'ready' again).
  sendDocumentToPreview(document);
}

function schedulePreviewUpdate(document) {
  if (previewDebounceTimer) {
    clearTimeout(previewDebounceTimer);
  }
  previewDebounceTimer = setTimeout(() => {
    previewDebounceTimer = null;
    sendDocumentToPreview(document);
  }, PREVIEW_DEBOUNCE_MS);
}

function sendDocumentToPreview(document) {
  if (!nodePreviewPanel) return;

  const text = document.getText();
  const { editorModel, graph, errors } = buildPreviewModelFromDsl(text, previousEditorModel);

  if (errors.length === 0 && editorModel) {
    previousEditorModel = editorModel;
  }

  // On error, send graph: null so the WebView stops the runtime preview
  nodePreviewPanel.webview.postMessage({
    type: 'setModel',
    editorModel: errors.length === 0 ? editorModel : null,
    graph: errors.length === 0 ? graph : null,
    errors
  });
}

function appendRuntimeEffects(effects) {
  if (!loomletOutput || !Array.isArray(effects) || effects.length === 0) return;

  const consoleEffects = effects.filter(isConsoleEffect);
  if (consoleEffects.length === 0) return;

  if (!runtimeOutputShown) {
    runtimeOutputShown = true;
    loomletOutput.show(true);
  }

  for (const effect of consoleEffects) {
    const now = new Date().toLocaleTimeString();
    const level = getConsoleEffectLevel(effect);
    loomletOutput.appendLine(`[${now}] ${level}: ${formatConsoleEffectValue(effect)}`);
  }
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

function getConsoleEffectLevel(effect) {
  const type = String(effect.type || effect.kind || effect.name || '');
  const method = String(effect.method || effect.level || '');
  if (type.endsWith('.warn') || method === 'warn') return 'warn';
  if (type.endsWith('.error') || method === 'error') return 'error';
  return 'log';
}

function formatConsoleEffectValue(effect) {
  const value = effect.args ?? effect.values ?? effect.value ?? effect.message ?? effect.payload ?? effect;
  if (Array.isArray(value)) {
    return value.map(formatValue).join(' ');
  }
  return formatValue(value);
}

function formatValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || value == null) return String(value);
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value);
  }
}

function getWebviewContent(scriptUri, nonce, cspSource) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src ${cspSource} data:;">
  <title>Loomlet Node Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      background: #1a1a1a;
      color: #d4d4d4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      overflow: hidden;
    }
    /* ── Background: Runtime Preview canvas ── */
    #lp-preview-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      display: block;
    }
    /* ── Foreground: Node Editor overlay ── */
    #lp-overlay {
      position: fixed;
      inset: 12px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      /* Pass pointer-events through to canvas where there is no panel */
      pointer-events: none;
    }
    /* Panel wraps toolbar + errors + editor; collapses when editor is hidden */
    #lp-panel {
      display: flex;
      flex-direction: column;
      min-height: 0;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 6px;
      overflow: hidden;
      pointer-events: auto;
      flex: 1;
    }
    /* ── Toolbar ── */
    #lp-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      background: rgba(24, 24, 24, 0.96);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #lp-status {
      flex: 1;
      font-size: 12px;
      color: #9cdcfe;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 3px solid #4a90e2;
      padding-left: 8px;
      line-height: 1.6;
    }
    .lp-control-btn {
      flex-shrink: 0;
      padding: 2px 10px;
      font-size: 11px;
      font-family: inherit;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 3px;
      color: #bbb;
      cursor: pointer;
      line-height: 1.6;
    }
    .lp-control-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.11);
      color: #eee;
    }
    .lp-control-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
    /* ── Errors ── */
    #lp-errors {
      padding: 6px 12px;
      background: rgba(244, 71, 71, 0.10);
      border-bottom: 1px solid rgba(244, 71, 71, 0.25);
      overflow-y: auto;
      max-height: 120px;
      flex-shrink: 0;
      display: none;
    }
    .lp-error-item {
      padding: 2px 0;
      font-family: 'Cascadia Code', 'Consolas', monospace;
      font-size: 11px;
      color: #f88;
    }
    /* ── Node Editor container ── */
    #lp-editor-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: rgba(30, 30, 30, 0.80);
      min-height: 0;
    }
  </style>
</head>
<body>
  <!-- Background: Runtime Preview canvas (placeholder until runtime is wired) -->
  <canvas id="lp-preview-canvas"></canvas>

  <!-- Foreground: Node Editor overlay -->
  <div id="lp-overlay">
    <div id="lp-panel">
      <div id="lp-toolbar">
        <div id="lp-status">Waiting for graph...</div>
        <button id="lp-toggle-runtime" class="lp-control-btn" disabled>Pause</button>
        <button id="lp-reset-runtime" class="lp-control-btn" disabled>Reset</button>
        <button id="lp-toggle-editor" class="lp-control-btn">Hide Editor</button>
      </div>
      <div id="lp-errors"></div>
      <div id="lp-editor-container"></div>
    </div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function buildCompletions(ctx) {
  const includePlanned = getIncludePlanned((key) => vscode.workspace.getConfiguration().get(key));
  const rawItems = buildRawCompletions(ctx, includePlanned);
  return rawItems.map((entry) => {
    let kind = vscode.CompletionItemKind.Text;
    if (entry.type === "module") kind = vscode.CompletionItemKind.Module;
    else if (entry.type === "function") kind = vscode.CompletionItemKind.Function;
    else if (entry.type === "property") kind = vscode.CompletionItemKind.Property;
    const item = new vscode.CompletionItem(entry.label, kind);
    item.insertText = entry.type === "function" || entry.type === "property"
      ? new vscode.SnippetString(entry.insertText)
      : entry.insertText;
    item.detail = entry.detail;
    item.documentation = entry.documentation;
    return item;
  });
}


async function runCurrentFile(command) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor.');
    return;
  }

  const document = editor.document;
  const filePath = document.uri.fsPath;
  const isLoomlet = document.languageId === 'loomlet' || document.languageId === 'loom' || filePath.endsWith('.loom');
  if (!isLoomlet) {
    vscode.window.showErrorMessage('Active file must be a .loom file.');
    return;
  }

  await document.save();
  const cliPath = await findLoomletCli(document.uri);
  if (!cliPath) {
    vscode.window.showErrorMessage('Could not find loomlet CLI. Open the Loomlet repository workspace or run the command from a Loomlet project.');
    return;
  }

  const terminal = getOrCreateTerminal('Loomlet');
  const escapedCli = cliPath.replace(/"/g, '\\"');
  const escapedFile = filePath.replace(/"/g, '\\"');
  terminal.show(true);

  if (command === 'run') {
    terminal.sendText(`node "${escapedCli}" run "${escapedFile}"`);
  } else {
    terminal.sendText(`node "${escapedCli}" scenesync dev "${escapedFile}"`);
  }
}

function getOrCreateTerminal(name) {
  const existing = vscode.window.terminals.find((terminal) => terminal.name === name);
  if (existing) {
    return existing;
  }
  return vscode.window.createTerminal(name);
}

async function findLoomletCli(startUri) {
  const candidateRoots = [];
  if (startUri && startUri.fsPath) {
    candidateRoots.push(path.dirname(startUri.fsPath));
  }

  const workspaceFolder = startUri ? vscode.workspace.getWorkspaceFolder(startUri) : null;
  if (workspaceFolder?.uri?.fsPath) {
    candidateRoots.push(workspaceFolder.uri.fsPath);
  }

  for (const root of candidateRoots) {
    const found = searchUpForCli(root);
    if (found) return found;
  }

  return null;
}

function searchUpForCli(startDir) {
  let current = startDir;
  while (true) {
    const loomletCandidate = path.join(current, 'bin', 'loomlet.mjs');
    if (fs.existsSync(loomletCandidate)) {
      return loomletCandidate;
    }
    const loomCandidate = path.join(current, 'bin', 'loom.mjs');
    if (fs.existsSync(loomCandidate)) {
      return loomCandidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function scheduleValidation(document, diagnosticCollection) {
  if (!isLoomletDocument(document)) return;

  const key = document.uri.toString();
  const existing = pendingValidationTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  const timer = setTimeout(() => {
    pendingValidationTimers.delete(key);
    validateLoomletDocument(document, diagnosticCollection);
  }, 250);

  pendingValidationTimers.set(key, timer);
}

function validateLoomletDocument(document, diagnosticCollection) {
  if (!isLoomletDocument(document)) return;

  try {
    const sourceText = document.getText();
    const errorItems = collectLoomletDiagnosticItems(sourceText);

    if (errorItems.length === 0) {
      diagnosticCollection.set(document.uri, []);
      return;
    }

    const diagnostics = errorItems
      .map((error) => diagnosticFromLoomletError(error, document))
      .filter((d) => d !== null);

    diagnosticCollection.set(document.uri, diagnostics);
  } catch (err) {
    // Silently ignore any unexpected errors in validation
    // to prevent breaking the extension
    console.error('Error validating Loomlet document:', err);
  }
}

function diagnosticFromLoomletError(error, document) {
  const normalized = normalizeLoomletErrorLocation(error);
  const clamped = clampCoordinates(
    normalized.startLine,
    normalized.startColumn,
    normalized.endLine,
    normalized.endColumn,
    document
  );

  const range = new vscode.Range(
    clamped.startLine,
    clamped.startColumn,
    clamped.endLine,
    clamped.endColumn
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    normalized.message,
    vscode.DiagnosticSeverity.Error
  );

  diagnostic.source = 'loomlet';

  if (normalized.code) {
    diagnostic.code = normalized.code;
  }

  return diagnostic;
}

module.exports = {
  activate,
  deactivate,
  findLoomletCli,
  buildCompletions
};
