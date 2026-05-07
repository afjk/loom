const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const { getCompletionContext } = require('./completion-context');
const { buildCompletions: buildRawCompletions, getIncludePlanned } = require('./completion-engine');

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
    vscode.commands.registerCommand('loomlet.sceneSyncDevCurrentFile', () => runCurrentFile('scenesync dev'))
  );
}

function deactivate() {}

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
