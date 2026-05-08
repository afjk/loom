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

  const cleanText = preprocessPreviewHostInputs(stripEditorMetadataFromDsl(sourceText || ''));

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

  let editorModel = graphToEditorModel(graph);
  if (previousEditorModel) {
    editorModel = preserveEditorModelLayout(editorModel, previousEditorModel);
  }

  return { editorModel, graph, errors: [] };
}

module.exports = { ensurePreviewModulesLoaded, buildPreviewModelFromDsl, preprocessPreviewHostInputs };
