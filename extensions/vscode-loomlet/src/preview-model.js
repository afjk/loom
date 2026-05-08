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

/**
 * Build a preview model from DSL source text.
 * Returns { editorModel, errors } where errors is an array of error objects.
 * On parse/compile failure, editorModel is null and errors is non-empty.
 * previousEditorModel is used to preserve node positions across updates.
 *
 * @param {string} sourceText
 * @param {object|null} previousEditorModel
 * @returns {{ editorModel: object|null, errors: object[] }}
 */
function buildPreviewModelFromDsl(sourceText, previousEditorModel = null) {
  if (!modulesLoaded) {
    return { editorModel: null, errors: [{ message: 'Preview modules not yet loaded' }] };
  }

  const cleanText = stripEditorMetadataFromDsl(sourceText || '');

  if (cleanText.trim() === '') {
    return { editorModel: null, errors: [] };
  }

  const { ast, errors: parseErrors } = parseDSLToAST(cleanText);
  if (parseErrors && parseErrors.length > 0) {
    return { editorModel: null, errors: parseErrors };
  }

  const { graph, errors: compileErrors } = compileToGraph(ast);
  if (compileErrors && compileErrors.length > 0) {
    return { editorModel: null, errors: compileErrors };
  }

  let editorModel = graphToEditorModel(graph);
  if (previousEditorModel) {
    editorModel = preserveEditorModelLayout(editorModel, previousEditorModel);
  }

  return { editorModel, errors: [] };
}

module.exports = { ensurePreviewModulesLoaded, buildPreviewModelFromDsl };
