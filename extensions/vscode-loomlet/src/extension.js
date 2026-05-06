const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const { getCompletionContext } = require('./completion-context');
const { libraries, libraryMembers, topLevelSnippets } = require('./completion-data');

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
  if (ctx.kind === 'import') {
    return libraries.map((lib) => {
      const item = new vscode.CompletionItem(lib.name, vscode.CompletionItemKind.Module);
      item.insertText = lib.name;
      item.detail = `${lib.name} library`;
      item.documentation = lib.description;
      return item;
    });
  }

  if (ctx.kind === 'member' && ctx.library && libraryMembers[ctx.library]) {
    return libraryMembers[ctx.library].map((member) => {
      const item = new vscode.CompletionItem(member.label, vscode.CompletionItemKind.Function);
      item.insertText = new vscode.SnippetString(member.insertText);
      item.detail = member.detail;
      item.documentation = member.documentation;
      return item;
    });
  }

  if (ctx.kind === 'callArgs' && ctx.library && ctx.functionName) {
    const member = (libraryMembers[ctx.library] || []).find((entry) => entry.label.startsWith(ctx.functionName));
    if (!member) return [];
    const used = new Set(ctx.alreadyUsedArgNames || []);
    return (member.namedArgs || [])
      .filter((arg) => !used.has(arg))
      .map((arg) => {
        const item = new vscode.CompletionItem(`${arg}:`, vscode.CompletionItemKind.Property);
        item.insertText = new vscode.SnippetString(`${arg}: $0`);
        item.detail = `${ctx.library}.${ctx.functionName} named argument`;
        item.documentation = `Named argument for ${ctx.library}.${ctx.functionName}.`;
        return item;
      });
  }

  if (ctx.kind === 'topLevel') {
    const items = [];
    for (const lib of ['time', 'math', 'scene', 'console']) {
      const imp = new vscode.CompletionItem(`import ${lib}`, vscode.CompletionItemKind.Keyword);
      imp.insertText = new vscode.SnippetString(`import ${lib}`);
      imp.detail = 'Import library';
      items.push(imp);
    }

    for (const lib of ['time', 'math', 'scene', 'console']) {
      for (const member of libraryMembers[lib] || []) {
        const fn = new vscode.CompletionItem(member.topLevelInsertText.replace(/\$\{\d+:?/g, '').replace(/\}/g, ''), vscode.CompletionItemKind.Function);
        fn.label = member.detail;
        fn.insertText = new vscode.SnippetString(member.topLevelInsertText);
        fn.detail = member.detail;
        fn.documentation = member.documentation;
        items.push(fn);
      }
    }

    for (const snippet of topLevelSnippets) {
      const item = new vscode.CompletionItem(snippet.label, vscode.CompletionItemKind.Snippet);
      item.insertText = new vscode.SnippetString(snippet.insertText);
      item.detail = snippet.detail;
      item.documentation = snippet.documentation;
      items.push(item);
    }

    return items;
  }

  return [];
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
  findLoomletCli
};
