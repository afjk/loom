let parseDSLToAST, compileToGraph, graphToEditorModel, preserveEditorModelLayout, stripEditorMetadataFromDsl;
let modulesLoaded = false;
let loadPromise = null;

async function ensurePreviewModulesLoaded() {
  if (modulesLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const indexModule = await import('../../../src/index.js');
      parseDSLToAST = indexModule.parseDSLToAST;
      compileToGraph = indexModule.compileToGraph;
      graphToEditorModel = indexModule.graphToEditorModel;
      preserveEditorModelLayout = indexModule.preserveEditorModelLayout;
      stripEditorMetadataFromDsl = indexModule.stripEditorMetadataFromDsl;
      modulesLoaded = true;
    } catch (err) {
      loadPromise = null;
      console.error('Failed to load ESM modules for preview:', err);
      throw err;
    }
  })();

  return loadPromise;
}

const HOST_INPUT_ALIASES = [
  { pattern: /\binput\.mouseX\s*\(\s*\)/g, token: '__loomlet_host:mouseX' },
  { pattern: /\binput\.mouseY\s*\(\s*\)/g, token: '__loomlet_host:mouseY' },
  { pattern: /\binput\.mouseDown\s*\(\s*\)/g, token: '__loomlet_host:mouseDown' }
];

function preprocessPreviewHostInputs(sourceText) {
  let text = sourceText || '';
  for (const alias of HOST_INPUT_ALIASES) {
    text = text.replace(alias.pattern, JSON.stringify(alias.token));
  }

  text = text.replace(
    /\binput\.key\s*\(\s*(['"])(.*?)\1\s*\)/g,
    (_match, _quote, key) => JSON.stringify(`__loomlet_host:key:${key}`)
  );

  return text;
}

function splitNamedArgs(argsText) {
  const out = [];
  let current = '';
  let quote = null;
  let depth = 0;

  for (let i = 0; i < argsText.length; i += 1) {
    const ch = argsText[i];
    if (quote) {
      current += ch;
      if (ch === quote && argsText[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  if (current.trim()) out.push(current.trim());
  return out;
}

function parseNamedArgs(argsText) {
  const out = {};
  for (const part of splitNamedArgs(argsText)) {
    const match = part.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/);
    if (!match) continue;
    out[match[1]] = parseRenderArgValue(match[2].trim());
  }
  return out;
}

function parseRenderArgValue(rawValue) {
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(rawValue)) return Number(rawValue);
  const quoted = rawValue.match(/^(['"])(.*)\1$/);
  if (quoted) return quoted[2];
  return rawValue;
}

function extractPreviewRender(sourceText) {
  const match = String(sourceText || '').match(/(^|\n)\s*render\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/m);
  if (!match) return null;
  return {
    type: match[2],
    ...parseNamedArgs(match[3])
  };
}

function preprocessPreviewOnlyRender(sourceText) {
  return String(sourceText || '').replace(
    /(^|\n)(\s*)render\s+keys\s*\([^)]*\)/m,
    '$1$2render point(x: 0, y: 0, enabled: false)'
  );
}

function normalizePreviewRenderGraph(graph) {
  if (!graph?.render) return graph;
  const render = graph.render;

  for (const node of graph.nodes || []) {
    if (node?.type !== 'constant') continue;
    const value = node.params?.value;
    if (typeof value === 'string' && value.startsWith('__loomlet_host:')) {
      for (const key of Object.keys(render)) {
        if (render[key] === `${node.id}.out`) {
          render[key] = value;
        }
      }
    }
  }

  return graph;
}

function resolvePreviewRenderRefs(renderConfig, graph) {
  if (!renderConfig) return renderConfig;
  const resolved = { ...renderConfig };
  const nodes = graph.nodes || [];

  for (const [key, raw] of Object.entries(resolved)) {
    if (key === 'type' || typeof raw !== 'string') continue;
    if (raw.startsWith('__loomlet_host:')) continue;
    if (raw.includes('.')) continue;

    const node = nodes.find((candidate) => candidate.id === raw);
    if (node) {
      resolved[key] = `${node.id}.out`;
    }
  }

  return resolved;
}

function mergePreviewRender(graph, previewRender) {
  if (!previewRender) return graph;
  if (!graph.render) graph.render = {};
  const resolvedPreviewRender = resolvePreviewRenderRefs(previewRender, graph);

  // Keep compiler-produced refs when present, but restore preview-only params
  // such as enabled/radius and preview-only render functions such as keys.
  graph.render = {
    ...graph.render,
    ...resolvedPreviewRender
  };

  normalizePreviewRenderGraph(graph);
  return graph;
}

/**
 * Build a preview model from DSL source text.
 * Returns { editorModel, graph, errors }.
 * - editorModel: null on failure, used for Node Editor overlay
 * - graph: null on failure, sent to WebView for Loom runtime rendering
 * - errors: array of parse/compile error objects
 *
 * previousEditorModel is used to preserve node positions across updates.
 *
 * @param {string} sourceText
 * @param {object|null} previousEditorModel
 * @returns {{ editorModel: object|null, graph: object|null, errors: object[] }}
 */
function buildPreviewModelFromDsl(sourceText, previousEditorModel = null) {
  if (!modulesLoaded) {
    return {
      editorModel: null,
      graph: null,
      errors: [{ message: 'Preview modules not yet loaded' }]
    };
  }

  const originalText = stripEditorMetadataFromDsl(sourceText || '');
  const preprocessedOriginalText = preprocessPreviewHostInputs(originalText);
  const previewRender = extractPreviewRender(preprocessedOriginalText);
  const cleanText = preprocessPreviewOnlyRender(preprocessedOriginalText);

  if (cleanText.trim() === '') {
    return { editorModel: null, graph: null, errors: [] };
  }

  const { ast, errors: parseErrors } = parseDSLToAST(cleanText);
  if (parseErrors && parseErrors.length > 0) {
    return { editorModel: null, graph: null, errors: parseErrors };
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);
  if (compileErrors && compileErrors.length > 0) {
    return { editorModel: null, graph: null, errors: compileErrors };
  }

  normalizePreviewRenderGraph(graph);
  mergePreviewRender(graph, previewRender);

  let editorModel = graphToEditorModel(graph);
  if (previousEditorModel) {
    editorModel = preserveEditorModelLayout(editorModel, previousEditorModel);
  }

  return { editorModel, graph, errors: [] };
}

module.exports = {
  ensurePreviewModulesLoaded,
  buildPreviewModelFromDsl,
  preprocessPreviewHostInputs,
  preprocessPreviewOnlyRender,
  normalizePreviewRenderGraph,
  extractPreviewRender,
  mergePreviewRender
};
