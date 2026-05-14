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

function resolveLibraryMetadataOption(options = {}) {
  if (options.metadataRegistry && typeof options.metadataRegistry.toObject === 'function') {
    return options.metadataRegistry.toObject();
  }

  if (options.libraryMetadata && typeof options.libraryMetadata === 'object') {
    return options.libraryMetadata;
  }

  return {};
}

function resolveNodeTypesOption(options = {}) {
  if (options.nodeRegistry && typeof options.nodeRegistry.toObject === 'function') {
    return options.nodeRegistry.toObject();
  }

  if (options.nodeTypes && typeof options.nodeTypes === 'object') {
    return options.nodeTypes;
  }

  return null;
}

function hasRuntimeLibrary(nodeTypes, libraryName) {
  if (!nodeTypes) {
    return false;
  }

  const prefix = `${libraryName}.`;
  return Object.keys(nodeTypes).some((nodeType) => nodeType.startsWith(prefix));
}

function resolveImportLibraryInfo(libraryName, options = {}) {
  if (isKnownLibrary(libraryName)) {
    const compatibility = getLibraryCompatibility(libraryName);
    return {
      known: true,
      source: 'builtin',
      targets: compatibility?.targets ?? [],
      hasTargetInfo: true
    };
  }

  const metadata = resolveLibraryMetadataOption(options);
  const metadataLibrary = metadata[libraryName];

  if (metadataLibrary) {
    return {
      known: true,
      source: 'metadata',
      targets: metadataLibrary.targets ?? [],
      hasTargetInfo: Array.isArray(metadataLibrary.targets) && metadataLibrary.targets.length > 0
    };
  }

  const nodeTypes = resolveNodeTypesOption(options);

  if (hasRuntimeLibrary(nodeTypes, libraryName)) {
    return {
      known: true,
      source: 'nodeRegistry',
      targets: [],
      hasTargetInfo: false
    };
  }

  return {
    known: false,
    source: null,
    targets: [],
    hasTargetInfo: false
  };
}

export function getImportedLibraries(ast) {
  return (ast?.imports || []).map(normalizeImportName);
}

export function getCompatibleTargetsForImports(importNames, options = {}) {
  if (!importNames || importNames.length === 0) {
    return [...DEFAULT_COMPATIBLE_TARGETS];
  }

  let compatibleTargets = [...DEFAULT_COMPATIBLE_TARGETS];

  for (const name of importNames) {
    const info = resolveImportLibraryInfo(name, options);

    if (!info.known) {
      return [];
    }

    if (!info.hasTargetInfo) {
      continue;
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

function validateImports(ast, target, options = {}) {
  const errors = [];
  for (const entry of ast?.imports || []) {
    const info = resolveImportLibraryInfo(entry.name, options);

    if (!info.known) {
      errors.push({
        code: 'UNKNOWN_IMPORT',
        message: `Unknown import: ${entry.name}`,
        line: entry.line ?? entry.span?.start?.line ?? null,
        column: entry.column ?? entry.span?.start?.column ?? null,
        source: 'compile'
      });
      continue;
    }

    if (
      target &&
      target !== 'any' &&
      info.hasTargetInfo &&
      !info.targets.includes(target)
    ) {
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

    const importErrors = validateImports(ast, options.target ?? 'any', options);
    if (importErrors.length > 0) {
      return {
        ok: false,
        ast,
        graph: null,
        errors: importErrors
      };
    }

    const compiled = compileToGraph(ast, options);
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
