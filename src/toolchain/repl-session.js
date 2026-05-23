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

function normalizeScope(scope) {
  if (!scope || typeof scope !== 'object' || Array.isArray(scope)) {
    return null;
  }

  if (scope.type === 'scene') {
    const id = typeof scope.id === 'string' && scope.id.trim().length > 0 ? scope.id.trim() : undefined;
    return id ? { type: 'scene', id } : { type: 'scene' };
  }

  if (scope.type === 'object' && typeof scope.id === 'string' && scope.id.trim().length > 0) {
    return { type: 'object', id: scope.id.trim() };
  }

  return null;
}

export class LoomReplSession {
  constructor(options = {}) {
    this.target = options.target || 'cli';
    this.time = Number.isFinite(options.time) ? options.time : null;
    this.dt = Number.isFinite(options.dt) ? options.dt : null;
    this.nodeRegistry = options.nodeRegistry || null;
    this.metadataRegistry = options.metadataRegistry || null;
    this.scope = normalizeScope(options.scope);
    this.sourceLines = [];
    this.source = '';
    this.graph = null;
    this.lastResult = null;
    this.seenEffectNodeIds = new Set();
    this.history = [];
    this.pendingEvents = [];
    this.lastInjectedEvents = [];
  }

  createEvaluationEnv(events) {
    const env = {};
    if (this.scope) {
      env.scope = this.scope;
    }
    if (events !== undefined) {
      env.events = events;
    }
    return env;
  }

  evaluateSource(source, options = {}) {
    const result = runLoomSource(source, {
      target: this.target,
      time: this.time,
      dt: this.dt,
      env: this.createEvaluationEnv(options.events),
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
    const shouldDedupeEffects = options.dedupeEffects !== false;
    const effects = shouldDedupeEffects
      ? allEffects.filter((effect) => {
        if (!effect?.nodeId) {
          return true;
        }
        return !this.seenEffectNodeIds.has(effect.nodeId);
      })
      : allEffects;

    if (options.commitSource === true) {
      this.source = source;
      this.sourceLines = this.source.split(/\r?\n/);
      this.seenEffectNodeIds = new Set(
        allEffects
          .map((effect) => effect?.nodeId)
          .filter((nodeId) => typeof nodeId === 'string' && nodeId.length > 0)
      );
    }
    if (options.updateLastResult !== false) {
      this.lastResult = {
        ...result,
        effects
      };
      this.graph = result.graph;
    }

    return {
      ok: true,
      empty: false,
      source: this.source,
      graph: result.graph,
      values: result.values,
      effects,
      errors: []
    };
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
    return this.evaluateSource(nextSource, {
      commitSource: true,
      dedupeEffects: true
    });
  }

  evaluateCurrent(options = {}) {
    if (!this.source) {
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

    return this.evaluateSource(this.source, {
      commitSource: false,
      dedupeEffects: options.dedupeEffects === true,
      events: options.events
    });
  }

  injectEvents(events) {
    this.pendingEvents = Array.isArray(events) ? [...events] : [];
    try {
      const result = this.evaluateCurrent({
        dedupeEffects: false,
        events: this.pendingEvents
      });
      if (result.ok) {
        this.lastInjectedEvents = [...this.pendingEvents];
      }
      return {
        ...result,
        inputEvents: [...this.pendingEvents]
      };
    } finally {
      this.pendingEvents = [];
    }
  }

  getSource() {
    return this.source;
  }

  getTime() {
    return this.time;
  }

  setTime(time) {
    this.time = time;
  }

  getDeltaTime() {
    return this.dt;
  }

  tick(deltaTime) {
    const currentTime = Number.isFinite(this.time) ? this.time : 0;
    this.time = currentTime + deltaTime;
    this.dt = deltaTime;
    return this.time;
  }

  getScope() {
    return this.scope;
  }

  setSceneScope(id) {
    const nextId = typeof id === 'string' ? id.trim() : '';
    this.scope = nextId ? { type: 'scene', id: nextId } : { type: 'scene' };
    return this.scope;
  }

  setObjectScope(id) {
    const nextId = typeof id === 'string' ? id.trim() : '';
    if (!nextId) {
      throw new Error('Object scope requires an id');
    }
    this.scope = { type: 'object', id: nextId };
    return this.scope;
  }

  getEventPlaygroundState() {
    return {
      time: this.time,
      dt: this.dt,
      scope: this.scope,
      pendingEvents: [...this.pendingEvents],
      lastInjectedEvents: [...this.lastInjectedEvents]
    };
  }

  reset() {
    this.sourceLines = [];
    this.source = '';
    this.graph = null;
    this.lastResult = null;
    this.seenEffectNodeIds = new Set();
    this.history = [];
    this.pendingEvents = [];
    this.lastInjectedEvents = [];
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
    return this.evaluateSource(String(source ?? ''), {
      commitSource: false,
      dedupeEffects: false,
      updateLastResult: false
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

  listLibraries(options = {}) {
    return formatLibrariesText({
      metadataRegistry: this.metadataRegistry,
      ...options
    });
  }

  getLibraryHelp(name, options = {}) {
    return formatLibraryHelpText(name, {
      metadataRegistry: this.metadataRegistry,
      ...options
    });
  }

  getFunctionHelp(qualifiedName, options = {}) {
    return formatFunctionHelpText(qualifiedName, {
      metadataRegistry: this.metadataRegistry,
      ...options
    });
  }
}
