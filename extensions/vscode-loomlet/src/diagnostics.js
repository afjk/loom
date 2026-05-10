let parseDSLToAST, compileToGraph, stripEditorMetadataFromDsl;
let modulesLoaded = false;
let loadPromise = null;

// Prefer the published package for extension/runtime use, but fall back to
// repository-local sources for root tests and development checkouts before
// @afjk/loomlet has been published/installed.
async function importLoomletIndex() {
  try {
    return await import('@afjk/loomlet');
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') {
      throw error;
    }
    return import('../../../src/index.js');
  }
}

async function importLoomletMetadata() {
  try {
    return await import('@afjk/loomlet/metadata');
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND') {
      throw error;
    }
    return import('../../../src/editor-metadata.js');
  }
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

function preprocessPreviewOnlyRender(sourceText) {
  return String(sourceText || '').replace(
    /(^|\n)(\s*)render\s+keys\s*\([^)]*\)/m,
    '$1$2render point(x: 0, y: 0, enabled: false)'
  );
}

function isLoomletDocument(document) {
  if (!document) return false;
  return document.languageId === 'loomlet' || document.fileName.endsWith('.loom');
}

function normalizeLoomletErrorLocation(error) {
  const startLine = error.span?.start?.line ?? error.line ?? 1;
  const startColumn = error.span?.start?.column ?? error.column ?? 1;
  const endLine = error.span?.end?.line ?? startLine;
  const endColumn = error.span?.end?.column ?? (startColumn + 1);

  return {
    startLine: toZeroBased(startLine),
    startColumn: toZeroBased(startColumn),
    endLine: toZeroBased(endLine),
    endColumn: toZeroBased(endColumn),
    message: error.message || 'Loomlet error',
    code: error.code || 'UNKNOWN_ERROR',
    type: error.type || 'Error'
  };
}

async function ensureModulesLoaded() {
  if (modulesLoaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const indexModule = await importLoomletIndex();
      parseDSLToAST = indexModule.parseDSLToAST;
      compileToGraph = indexModule.compileToGraph;

      const metadataModule = await importLoomletMetadata();
      stripEditorMetadataFromDsl = metadataModule.stripEditorMetadataFromDsl;

      modulesLoaded = true;
    } catch (err) {
      console.error('Failed to load ESM modules for diagnostics:', err);
      throw err;
    }
  })();

  return loadPromise;
}

function collectLoomletDiagnosticItems(sourceText) {
  if (!modulesLoaded || !stripEditorMetadataFromDsl || !parseDSLToAST || !compileToGraph) {
    // This should not happen in normal operation as ensureModulesLoaded is awaited in extension.js
    return [];
  }

  const cleanText = preprocessPreviewOnlyRender(preprocessPreviewHostInputs(stripEditorMetadataFromDsl(sourceText || '')));

  if (cleanText.trim() === '') {
    return [];
  }

  const { ast, errors: parseErrors } = parseDSLToAST(cleanText);
  if (parseErrors.length > 0) {
    return parseErrors;
  }

  const { errors: compileErrors } = compileToGraph(ast);
  return compileErrors;
}

function toZeroBased(value, fallback = 0) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, value - 1);
}

module.exports = {
  isLoomletDocument,
  normalizeLoomletErrorLocation,
  collectLoomletDiagnosticItems,
  ensureModulesLoaded,
  preprocessPreviewHostInputs,
  preprocessPreviewOnlyRender
};
