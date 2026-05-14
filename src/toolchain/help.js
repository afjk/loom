import { LIBRARY_METADATA, getAllLibraries } from './library-metadata.js';

export class HelpError extends Error {
  constructor(code, message) {
    super(message);
    this.name = code;
    this.code = code;
  }
}

function getMetadataObject(options = {}) {
  if (options.metadataRegistry) {
    return options.metadataRegistry.toObject();
  }
  if (options.metadata) {
    return options.metadata;
  }
  return LIBRARY_METADATA;
}

function getLibraryList(metadataObj) {
  const libNames = Object.keys(metadataObj);
  return libNames.sort();
}

export function listLibraries(options = {}) {
  const metadataObj = getMetadataObject(options);
  return getLibraryList(metadataObj);
}

export function getLibraryHelp(name, options = {}) {
  const metadataObj = getMetadataObject(options);
  const lib = metadataObj[name];
  if (!lib) {
    throw new HelpError('UNKNOWN_LIBRARY', `No Loomlet library named "${name}"`);
  }
  return lib;
}

export function getFunctionHelp(qualifiedName, options = {}) {
  const parts = qualifiedName.split('.');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new HelpError('INVALID_FUNCTION_NAME', `Function name must be in format "library.function", got "${qualifiedName}"`);
  }

  const [libName, funcName] = parts;

  const metadataObj = getMetadataObject(options);
  const lib = metadataObj[libName];
  if (!lib) {
    throw new HelpError('UNKNOWN_LIBRARY', `No Loomlet library named "${libName}"`);
  }

  const func = lib.functions[funcName];
  if (!func) {
    throw new HelpError('UNKNOWN_FUNCTION', `No Loomlet function named "${qualifiedName}"`);
  }

  return func;
}

export function formatLibrariesText(options = {}) {
  const metadataObj = getMetadataObject(options);
  const libs = getLibraryList(metadataObj);
  const lines = ['Loomlet libraries:', ''];

  for (const libName of libs) {
    const lib = metadataObj[libName];
    const status = lib.status ? ` (${lib.status})` : '';
    const funcCount = Object.keys(lib.functions).length;
    const funcInfo = funcCount > 0 ? ` - ${funcCount} function${funcCount !== 1 ? 's' : ''}` : '';
    lines.push(`- ${libName.padEnd(12)} ${lib.description}${funcInfo}${status}`);
  }

  lines.push('');
  lines.push('Use:');
  lines.push('  loomlet docs <library>');
  lines.push('  loomlet docs <library.function>');

  return lines.join('\n');
}

export function formatLibraryHelpText(name, options = {}) {
  const lib = getLibraryHelp(name, options);
  const lines = [lib.name, '', lib.description, ''];

  if (lib.status) {
    lines.push(`Status: ${lib.status}`, '');
  }

  const funcNames = Object.keys(lib.functions).sort();
  if (funcNames.length > 0) {
    lines.push('Functions:');
    for (const funcName of funcNames) {
      const func = lib.functions[funcName];
      lines.push(`- ${func.signature}`);
    }
  } else {
    lines.push('(No functions documented yet.)');
  }

  return lines.join('\n');
}

export function formatFunctionHelpText(qualifiedName, options = {}) {
  const func = getFunctionHelp(qualifiedName, options);
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

export function formatHelpJson(query, options = {}) {
  const metadataObj = getMetadataObject(options);

  if (!query) {
    const libs = getLibraryList(metadataObj);
    return {
      type: 'libraries',
      libraries: libs.map(name => {
        const lib = metadataObj[name];
        return {
          name: lib.name,
          description: lib.description,
          targets: lib.targets,
          status: lib.status || 'implemented',
          functionCount: Object.keys(lib.functions).length
        };
      })
    };
  }

  const parts = query.split('.');

  if (parts.length === 1) {
    const lib = getLibraryHelp(parts[0], { metadata: metadataObj });
    return {
      type: 'library',
      library: {
        name: lib.name,
        description: lib.description,
        targets: lib.targets,
        status: lib.status || 'implemented',
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
    const func = getFunctionHelp(query, { metadata: metadataObj });
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
