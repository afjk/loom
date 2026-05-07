const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const { getCompletionContext } = require('./completion-context');
const { buildCompletions: buildRawCompletions, getIncludePlanned } = require('./completion-engine');

let nodePreviewPanel = null;
let currentPreviewDocument = null;

function activate(context) {
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
    vscode.commands.registerCommand('loomlet.openNodePreviewToSide', () => openNodePreviewToSide(context))
  );

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (nodePreviewPanel && currentPreviewDocument && event.document === currentPreviewDocument) {
      sendDocumentToPreview(event.document);
    }
  });

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (nodePreviewPanel && editor?.document.languageId === 'loomlet') {
        currentPreviewDocument = editor.document;
        sendDocumentToPreview(editor.document);
      }
    })
  );
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
    sendDocumentToPreview(document);
    return;
  }

  nodePreviewPanel = vscode.window.createWebviewPanel(
    'loomletNodePreview',
    'Loomlet Node Preview',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  nodePreviewPanel.webview.html = getWebviewContent();

  nodePreviewPanel.onDidDispose(() => {
    nodePreviewPanel = null;
    currentPreviewDocument = null;
  });

  currentPreviewDocument = document;
  sendDocumentToPreview(document);
}

function sendDocumentToPreview(document) {
  if (!nodePreviewPanel) return;

  const text = document.getText();
  nodePreviewPanel.webview.postMessage({
    type: 'update',
    text
  });
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loomlet Node Preview</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #1a1a1a;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
    }
    .header {
      margin-bottom: 16px;
    }
    .status {
      padding: 8px 12px;
      background: rgba(74, 144, 226, 0.15);
      border-left: 3px solid #4a90e2;
      border-radius: 4px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0 0 8px 0;">Loomlet Node Preview</h2>
    <div class="status">Waiting for graph...</div>
  </div>
  <div id="preview"></div>
  <script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'update') {
        const preview = document.getElementById('preview');
        preview.innerHTML = '<pre style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; overflow: auto;">' +
          escapeHtml(message.text.slice(0, 200)) + '...</pre>';
      }
    });
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, char => map[char]);
    }
  </script>
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

module.exports = {
  activate,
  deactivate,
  findLoomletCli,
  buildCompletions
};
