import { inspectLoomSource } from './inspect.js';
import { runLoomSource } from './run.js';
import { RUNTIME_TARGETS } from './runtime-targets.js';
import {
  formatLibrariesText,
  formatLibraryHelpText,
  formatFunctionHelpText
} from './help.js';

function createEmptySummary() {
  return {
    nodeCount: 0,
    edgeCount: 0,
    renderType: null,
    imports: [],
    requiredCapabilities: [],
    compatibleTargets: RUNTIME_TARGETS.filter((target) => target !== 'any'),
    nodes: []
  };
}

function isImportSnippet(snippet) {
  return /^\s*import\s+[A-Za-z_][A-Za-z0-9_]*\s*$/.test(snippet);
}

function appendSnippetToSource(currentSource, snippet) {
  if (!currentSource) {
    return snippet;
  }

  if (!isImportSnippet(snippet)) {
    return `${currentSource}\n${snippet}`;
  }

  const importLine = snippet.trim();
  const lines = currentSource.split(/\r?\n/);

  if (lines.some((line) => line.trim() === importLine)) {
    return currentSource;
  }

  let insertIndex = 0;

  while (
    insertIndex < lines.length &&
    lines[insertIndex].trim().startsWith('import ')
  ) {
    insertIndex += 1;
  }

  const before = lines.slice(0, insertIndex);
  const after = lines.slice(insertIndex);
  const nextLines = [...before, importLine];

  if (after.length > 0) {
    const afterWithoutLeadingBlank = after[0].trim() === '' ? after.slice(1) : after;
    nextLines.push('', ...afterWithoutLeadingBlank);
  }

  return nextLines.join('\n');
}

export class LoomReplSession {
  constructor(options = {}) {
    this.target = options.target || 'cli';
    this.time = Number.isFinite(options.time) ? options.time : 0;
    this.dt = Number.isFinite(options.dt) ? options.dt : 0;
    this.nodeRegistry = options.nodeRegistry || null;
    this.metadataRegistry = options.metadataRegistry || null;
    this.sourceLines = [];
    this.source = '';
    this.graph = null;
    this.lastResult = null;
    this.seenEffectNodeIds = new Set();
    this.history = [];
  }

  evaluateSnippet(source) {
    const snippet = String(source ?? '');
    const trimmed = snippet.trim();
    this.history.push(snippet);

    if (!trimmed) {
      return {
        ok: true,
        empty: true,
        source: this.source,
        graph: this.graph,
        values: this.lastResult?.values || {},
        effects: [],
        errors: []
      };
    }

    const nextSource = appendSnippetToSource(this.source, snippet);
    const result = runLoomSource(nextSource, {
      target: this.target,
      time: this.time,
      dt: this.dt,
      nodeRegistry: this.nodeRegistry,
      metadataRegistry: this.metadataRegistry
    });

    if (!result.ok) {
      return {
        ok: false,
        source: this.source,
        graph: this.graph,
        values: {},
        effects: [],
        errors: result.errors
      };
    }

    const allEffects = result.effects || [];
    const newEffects = allEffects.filter((effect) => {
      if (!effect?.nodeId) {
        return true;
      }
      return !this.seenEffectNodeIds.has(effect.nodeId);
    });

    this.source = nextSource;
    this.sourceLines = this.source.split(/\r?\n/);
    this.graph = result.graph;
    this.lastResult = {
      ...result,
      effects: newEffects
    };
    this.seenEffectNodeIds = new Set(
      allEffects
        .map((effect) => effect?.nodeId)
        .filter((nodeId) => typeof nodeId === 'string' && nodeId.length > 0)
    );

    return {
      ok: true,
      empty: false,
      source: this.source,
      graph: result.graph,
      values: result.values,
      effects: newEffects,
      errors: []
    };
  }

  getSource() {
    return this.source;
  }

  reset() {
    this.sourceLines = [];
    this.source = '';
    this.graph = null;
    this.lastResult = null;
    this.seenEffectNodeIds = new Set();
    this.history = [];
  }

  inspect() {
    if (!this.source) {
      return {
        ok: true,
        summary: createEmptySummary(),
        errors: []
      };
    }
    return inspectLoomSource(this.source, {
      target: this.target,
      nodeRegistry: this.nodeRegistry,
      metadataRegistry: this.metadataRegistry
    });
  }

  getGraph() {
    return this.graph;
  }

  getHistory() {
    return [...this.history];
  }

  loadSource(source) {
    return this.evaluateSnippet(source);
  }

  runSource(source) {
    return runLoomSource(String(source ?? ''), {
      target: this.target,
      time: this.time,
      dt: this.dt,
      nodeRegistry: this.nodeRegistry,
      metadataRegistry: this.metadataRegistry
    });
  }

  getVariables() {
    const values = this.lastResult?.values || {};
    const variables = [];
    for (const [key, value] of Object.entries(values)) {
      if (key.endsWith('.out')) {
        variables.push({ name: key.slice(0, -4), value });
      }
    }
    variables.sort((a, b) => a.name.localeCompare(b.name));
    return variables;
  }

  listLibraries() {
    return formatLibrariesText({ metadataRegistry: this.metadataRegistry });
  }

  getLibraryHelp(name) {
    return formatLibraryHelpText(name, { metadataRegistry: this.metadataRegistry });
  }

  getFunctionHelp(qualifiedName) {
    return formatFunctionHelpText(qualifiedName, { metadataRegistry: this.metadataRegistry });
  }
}
