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

function extractPreviewRenderKeys(sourceText) {
  const match = String(sourceText || '').match(/(^|\n)\s*render\s+keys\s*\(([^)]*)\)/m);
  if (!match) return null;

  const args = match[2];
  const out = { type: 'keys' };
  for (const key of ['space', 'left', 'right', 'up', 'down']) {
    const valueMatch = args.match(new RegExp(`(?:^|,)\\s*${key}\\s*:\\s*([^,]+)`));
    if (valueMatch) {
      out[key] = valueMatch[1].trim();
    }
  }
  const trailMatch = args.match(/(?:^|,)\s*trail\s*:\s*([0-9.]+)/);
  if (trailMatch) {
    out.trail = Number(trailMatch[1]);
  }
  return out;
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

function resolvePreviewKeyRenderRefs(renderConfig, graph) {
  if (!renderConfig || renderConfig.type !== 'keys') return renderConfig;
  const resolved = { ...renderConfig };
  for (const key of ['space', 'left', 'right', 'up', 'down']) {
    const raw = resolved[key];
    if (typeof raw !== 'string') continue;
    const node = (graph.nodes || []).find((candidate) => candidate.id === raw);
    if (node) {
      resolved[key] = `${node.id}.out`;
      continue;
    }
    if (raw.startsWith('__loomlet_host:')) {
      resolved[key] = raw;
    }
  }
  return resolved;
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
  const previewKeysRender = extractPreviewRenderKeys(preprocessPreviewHostInputs(originalText));
  const cleanText = preprocessPreviewOnlyRender(preprocessPreviewHostInputs(originalText));

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
  if (previewKeysRender) {
    graph.render = resolvePreviewKeyRenderRefs(previewKeysRender, graph);
  }

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
  extractPreviewRenderKeys
};
