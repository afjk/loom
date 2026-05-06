import { inspectLoomSource } from './inspect.js';
import { runLoomSource } from './run.js';
import { RUNTIME_TARGETS } from './runtime-targets.js';

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

export class LoomReplSession {
  constructor(options = {}) {
    this.target = options.target || 'cli';
    this.time = Number.isFinite(options.time) ? options.time : 0;
    this.dt = Number.isFinite(options.dt) ? options.dt : 0;
    this.sourceLines = [];
    this.source = '';
    this.graph = null;
    this.lastResult = null;
  }

  evaluateSnippet(source) {
    const snippet = String(source ?? '');
    const trimmed = snippet.trim();

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

    const nextSource = this.source ? `${this.source}\n${snippet}` : snippet;
    const result = runLoomSource(nextSource, {
      target: this.target,
      time: this.time,
      dt: this.dt
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

    this.source = nextSource;
    this.sourceLines = this.source.split(/\r?\n/);
    this.graph = result.graph;
    this.lastResult = result;

    return {
      ok: true,
      empty: false,
      source: this.source,
      graph: result.graph,
      values: result.values,
      effects: result.effects || [],
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
  }

  inspect() {
    if (!this.source) {
      return {
        ok: true,
        summary: createEmptySummary(),
        errors: []
      };
    }
    return inspectLoomSource(this.source, { target: this.target });
  }

  getGraph() {
    return this.graph;
  }
}
