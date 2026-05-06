import { parseDSLToAST, compileToGraph } from '../loom-dsl.js';
import { normalizeLoomError } from './errors.js';
import {
  RUNTIME_TARGETS,
  isKnownLibrary,
  isKnownRuntimeTarget,
  isLibraryAvailableInTarget,
  getLibraryCompatibility
} from './runtime-targets.js';

const DEFAULT_COMPATIBLE_TARGETS = RUNTIME_TARGETS.filter((target) => target !== 'any');

function normalizeImportName(entry) {
  return typeof entry === 'string' ? entry : entry.name;
}

export function getImportedLibraries(ast) {
  return (ast?.imports || []).map(normalizeImportName);
}

export function getCompatibleTargetsForImports(importNames) {
  if (!importNames || importNames.length === 0) {
    return [...DEFAULT_COMPATIBLE_TARGETS];
  }

  let compatibleTargets = [...DEFAULT_COMPATIBLE_TARGETS];
  for (const name of importNames) {
    const info = getLibraryCompatibility(name);
    if (!info) {
      return [];
    }
    compatibleTargets = compatibleTargets.filter((target) => info.targets.includes(target));
  }
  return compatibleTargets;
}

function validateTarget(target) {
  if (target === undefined || target === null) {
    return [];
  }
  if (!isKnownRuntimeTarget(target)) {
    return [{
      code: 'UNKNOWN_RUNTIME_TARGET',
      message: `Unknown runtime target: ${target}`,
      line: null,
      column: null,
      source: 'compile'
    }];
  }
  return [];
}

function validateImports(ast, target) {
  const errors = [];
  for (const entry of ast?.imports || []) {
    if (!isKnownLibrary(entry.name)) {
      errors.push({
        code: 'UNKNOWN_IMPORT',
        message: `Unknown import: ${entry.name}`,
        line: entry.line ?? entry.span?.start?.line ?? null,
        column: entry.column ?? entry.span?.start?.column ?? null,
        source: 'compile'
      });
      continue;
    }
    if (target && target !== 'any' && !isLibraryAvailableInTarget(entry.name, target)) {
      errors.push({
        code: 'UNSUPPORTED_IMPORT',
        message: `Import '${entry.name}' is not available in target '${target}'`,
        line: entry.line ?? entry.span?.start?.line ?? null,
        column: entry.column ?? entry.span?.start?.column ?? null,
        source: 'compile'
      });
    }
  }
  return errors;
}

export function compileLoomSource(source, options = {}) {
  let ast = null;

  try {
    const targetErrors = validateTarget(options.target);
    if (targetErrors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: targetErrors
      };
    }

    const parsed = parseDSLToAST(source);
    ast = parsed.ast;

    if (parsed.errors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: parsed.errors.map(normalizeLoomError)
      };
    }

    const importErrors = validateImports(ast, options.target ?? 'any');
    if (importErrors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: importErrors
      };
    }

    const compiled = compileToGraph(ast);
    if (compiled.errors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: compiled.errors.map(normalizeLoomError)
      };
    }

    return {
      ok: true,
      ast,
      graph: compiled.graph,
      errors: []
    };
  } catch (error) {
    return {
      ok: false,
      ast,
      graph: null,
      errors: [normalizeLoomError(error)]
    };
  }
}
