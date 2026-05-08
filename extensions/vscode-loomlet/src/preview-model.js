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
 * Extract render statements from AST into a static preview payload.
 * Supports render circle/rect/bar/text with literal arguments only.
 */
function extractRenderPreview(ast) {
  const items = [];
  const unsupported = [];

  if (!ast || !ast.body) {
    return { items, unsupported };
  }

  for (const stmt of ast.body) {
    if (stmt.type === 'RenderStatement' && stmt.call && stmt.call.callee) {
      const kind = stmt.call.callee.name;

      // Only handle supported render kinds
      if (!['circle', 'rect', 'bar', 'text'].includes(kind)) {
        continue;
      }

      const item = extractRenderItem(kind, stmt.call.args || []);

      if (item.supported) {
        delete item.supported;
        items.push(item);
      } else {
        unsupported.push({ kind, reason: item.reason });
      }
    }
  }

  return { items, unsupported };
}

/**
 * Extract a single render item from a render call.
 * Returns { kind, ...args, supported: true } or { reason, supported: false }
 */
function extractRenderItem(kind, args) {
  const params = {};
  let hasUnsupported = false;
  let unsupportedReason = null;

  // Extract named arguments
  for (const arg of args) {
    if (arg.type !== 'NamedArg') continue;

    const paramName = arg.name?.name;
    if (!paramName) continue;

    const value = extractLiteralValue(arg.value);
    if (value === undefined) {
      // Non-literal argument
      hasUnsupported = true;
      if (!unsupportedReason) {
        unsupportedReason = `${paramName} is not a literal`;
      }
    } else {
      params[paramName] = value;
    }
  }

  if (hasUnsupported) {
    return { reason: unsupportedReason, supported: false };
  }

  const defaults = getRenderDefaults(kind);
  const merged = { ...defaults, ...params, kind };

  // Validate required fields
  const required = getRenderRequired(kind);
  for (const field of required) {
    if (!(field in merged)) {
      return { reason: `missing required field '${field}'`, supported: false };
    }
  }

  // Clamp value for bar
  if (kind === 'bar' && typeof merged.value === 'number') {
    merged.value = Math.max(0, Math.min(1, merged.value));
  }

  return { ...merged, supported: true };
}

/**
 * Extract a literal value from an AST node.
 * Returns the JS value or undefined if not a literal.
 */
function extractLiteralValue(node) {
  if (!node) return undefined;

  if (node.type === 'NumberLiteral') {
    return Number(node.value);
  }

  if (node.type === 'StringLiteral') {
    return node.value;
  }

  if (node.type === 'BooleanLiteral') {
    return Boolean(node.value);
  }

  // Any other type (Identifier, CallExpression, etc.) is unsupported
  return undefined;
}

/**
 * Get default values for a render kind.
 */
function getRenderDefaults(kind) {
  const defaults = {
    circle: { x: 100, y: 100, r: 24, color: '#80ed99' },
    rect: { x: 80, y: 80, width: 120, height: 80, color: '#70d6ff' },
    bar: { x: 40, y: 120, width: 240, height: 24, value: 0.5, color: '#ffd166', backgroundColor: 'rgba(255,255,255,0.12)' },
    text: { x: 40, y: 60, text: 'text', color: '#ffffff', size: 18 }
  };
  return defaults[kind] || {};
}

/**
 * Get required fields for a render kind.
 */
function getRenderRequired(kind) {
  // For now, no fields are strictly required; all have defaults
  return [];
}

/**
 * Build a preview model from DSL source text.
 * Returns { editorModel, errors, renderPreview } where renderPreview has { items, unsupported }.
 * On parse/compile failure, editorModel is null and errors is non-empty.
 * renderPreview is always extracted from AST, regardless of compile success.
 * previousEditorModel is used to preserve node positions across updates.
 *
 * @param {string} sourceText
 * @param {object|null} previousEditorModel
 * @returns {{ editorModel: object|null, errors: object[], renderPreview: object }}
 */
function buildPreviewModelFromDsl(sourceText, previousEditorModel = null) {
  if (!modulesLoaded) {
    return {
      editorModel: null,
      errors: [{ message: 'Preview modules not yet loaded' }],
      renderPreview: { items: [], unsupported: [] }
    };
  }

  const cleanText = stripEditorMetadataFromDsl(sourceText || '');

  if (cleanText.trim() === '') {
    return {
      editorModel: null,
      errors: [],
      renderPreview: { items: [], unsupported: [] }
    };
  }

  const { ast, errors: parseErrors } = parseDSLToAST(cleanText);
  if (parseErrors && parseErrors.length > 0) {
    return {
      editorModel: null,
      errors: parseErrors,
      renderPreview: { items: [], unsupported: [] }
    };
  }

  // Extract render preview from AST (before compile, so we show renders even if compile fails)
  const renderPreview = extractRenderPreview(ast);

  const { graph, errors: compileErrors } = compileToGraph(ast);
  // Filter out "Unknown render function" errors - those are expected for unsupported render types
  // We can still display those renders statically, so don't treat them as errors
  const filteredErrors = (compileErrors || []).filter(err => !err.message?.includes('Unknown render function'));

  if (filteredErrors && filteredErrors.length > 0) {
    return {
      editorModel: null,
      errors: filteredErrors,
      renderPreview
    };
  }

  let editorModel = graphToEditorModel(graph);
  if (previousEditorModel) {
    editorModel = preserveEditorModelLayout(editorModel, previousEditorModel);
  }

  return { editorModel, errors: [], renderPreview };
}

module.exports = { ensurePreviewModulesLoaded, buildPreviewModelFromDsl };

