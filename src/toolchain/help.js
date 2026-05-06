import { LIBRARY_METADATA } from './library-metadata.js';

class HelpError extends Error {
  constructor(code, message) {
    super(message);
    this.name = code;
    this.code = code;
  }
}

export function listLibraries() {
  return Object.keys(LIBRARY_METADATA).sort();
}

export function getLibraryHelp(name) {
  const lib = LIBRARY_METADATA[name];
  if (!lib) {
    throw new HelpError('UNKNOWN_LIBRARY', `No Loom library named "${name}"`);
  }
  return lib;
}

export function getFunctionHelp(qualifiedName) {
  const [libName, funcName] = qualifiedName.split('.');

  if (!libName || !funcName) {
    throw new HelpError('INVALID_FUNCTION_NAME', `Function name must be in format "library.function", got "${qualifiedName}"`);
  }

  const lib = LIBRARY_METADATA[libName];
  if (!lib) {
    throw new HelpError('UNKNOWN_LIBRARY', `No Loom library named "${libName}"`);
  }

  const func = lib.functions[funcName];
  if (!func) {
    throw new HelpError('UNKNOWN_FUNCTION', `No Loom function named "${qualifiedName}"`);
  }

  return func;
}

export function formatLibrariesText() {
  const libs = listLibraries();
  const lines = ['Loom libraries:', ''];

  for (const libName of libs) {
    const lib = LIBRARY_METADATA[libName];
    lines.push(`- ${libName.padEnd(12)} ${lib.description}`);
  }

  lines.push('');
  lines.push('Use:');
  lines.push('  loom docs <library>');
  lines.push('  loom docs <library.function>');

  return lines.join('\n');
}

export function formatLibraryHelpText(name) {
  const lib = getLibraryHelp(name);
  const lines = [lib.name, '', lib.description, ''];

  const funcNames = Object.keys(lib.functions).sort();
  lines.push('Functions:');
  for (const funcName of funcNames) {
    const func = lib.functions[funcName];
    lines.push(`- ${func.signature}`);
  }

  return lines.join('\n');
}

export function formatFunctionHelpText(qualifiedName) {
  const func = getFunctionHelp(qualifiedName);
  const lines = [func.signature, '', func.description, ''];

  if (func.args && func.args.length > 0) {
    lines.push('Arguments:');
    for (const arg of func.args) {
      lines.push(`- ${arg.name}: ${arg.type}`);
      if (arg.description) {
        lines.push(`  ${arg.description}`);
      }
    }
    lines.push('');
  }

  if (func.returns) {
    lines.push(`Returns:`);
    lines.push(`- ${func.returns}`);
    lines.push('');
  }

  if (func.targets && func.targets.length > 0) {
    lines.push('Targets:');
    for (const target of func.targets) {
      lines.push(`- ${target}`);
    }
    lines.push('');
  }

  if (func.examples && func.examples.length > 0) {
    lines.push('Example:');
    for (const example of func.examples) {
      lines.push(`  ${example}`);
    }
  }

  return lines.join('\n');
}

export function formatHelpJson(query) {
  if (!query) {
    const libs = listLibraries();
    return {
      type: 'libraries',
      libraries: libs.map(name => ({
        name: LIBRARY_METADATA[name].name,
        description: LIBRARY_METADATA[name].description,
        targets: LIBRARY_METADATA[name].targets
      }))
    };
  }

  const parts = query.split('.');

  if (parts.length === 1) {
    const lib = getLibraryHelp(parts[0]);
    return {
      type: 'library',
      library: {
        name: lib.name,
        description: lib.description,
        targets: lib.targets,
        functions: Object.entries(lib.functions).map(([, func]) => ({
          name: func.name,
          signature: func.signature,
          description: func.description,
          args: func.args,
          returns: func.returns,
          targets: func.targets
        }))
      }
    };
  }

  if (parts.length === 2) {
    const func = getFunctionHelp(query);
    return {
      type: 'function',
      function: {
        name: func.name,
        signature: func.signature,
        description: func.description,
        args: func.args,
        returns: func.returns,
        targets: func.targets,
        examples: func.examples
      }
    };
  }

  throw new HelpError('INVALID_QUERY', `Invalid help query: "${query}"`);
}
