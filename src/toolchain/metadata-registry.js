export function createLibraryMetadataRegistry(initialMetadata = {}) {
  const libraries = new Map();

  if (initialMetadata && typeof initialMetadata === 'object') {
    for (const [libraryName, library] of Object.entries(initialMetadata)) {
      validateLibraryName(libraryName);
      validateLibraryMetadata(libraryName, library);
      libraries.set(libraryName, library);
    }
  }

  return {
    registerLibraryMetadata(libraryName, library) {
      validateLibraryName(libraryName);
      validateLibraryMetadata(libraryName, library);

      if (libraries.has(libraryName)) {
        throw new Error(`Duplicate library metadata: ${libraryName}`);
      }

      libraries.set(libraryName, library);
      return library;
    },

    getLibraryMetadata(libraryName) {
      return libraries.get(libraryName);
    },

    hasLibraryMetadata(libraryName) {
      return libraries.has(libraryName);
    },

    listLibraries() {
      return Array.from(libraries.keys()).sort();
    },

    toObject() {
      const result = {};
      for (const [libraryName, library] of libraries) {
        result[libraryName] = library;
      }
      return result;
    },

    get size() {
      return libraries.size;
    }
  };
}

function validateLibraryName(libraryName) {
  if (typeof libraryName !== 'string') {
    throw new TypeError(`Library name must be a string, got ${typeof libraryName}`);
  }

  if (libraryName.length === 0) {
    throw new TypeError('Library name must not be empty');
  }

  if (/^\s+$/.test(libraryName)) {
    throw new TypeError('Library name must not be whitespace-only');
  }

  if (/\s/.test(libraryName)) {
    throw new TypeError(`Library name must not contain whitespace: ${libraryName}`);
  }

  if (libraryName.startsWith('.')) {
    throw new TypeError(`Library name must not start with a dot: ${libraryName}`);
  }

  if (libraryName.endsWith('.')) {
    throw new TypeError(`Library name must not end with a dot: ${libraryName}`);
  }
}

export function validateLibraryMetadata(libraryName, library) {
  if (!library || typeof library !== 'object') {
    throw new TypeError(`Invalid library metadata ${libraryName}: must be an object`);
  }

  if (typeof library.name !== 'string' || library.name.length === 0) {
    throw new TypeError(`Invalid library metadata ${libraryName}: name must be a non-empty string`);
  }

  if (library.name !== libraryName) {
    throw new Error(`Invalid library metadata ${libraryName}: name mismatch (got "${library.name}")`);
  }

  if (typeof library.description !== 'string' || library.description.length === 0) {
    throw new TypeError(
      `Invalid library metadata ${libraryName}: description must be a non-empty string`
    );
  }

  if (!Array.isArray(library.targets) || library.targets.length === 0) {
    throw new TypeError(`Invalid library metadata ${libraryName}: targets must be a non-empty array`);
  }

  for (const target of library.targets) {
    if (typeof target !== 'string' || target.length === 0) {
      throw new TypeError(
        `Invalid library metadata ${libraryName}: targets must contain non-empty strings`
      );
    }
  }

  if (!library.functions || typeof library.functions !== 'object') {
    throw new TypeError(`Invalid library metadata ${libraryName}: functions must be an object`);
  }

  for (const [functionName, fn] of Object.entries(library.functions)) {
    validateFunctionMetadata(libraryName, functionName, fn, library.targets);
  }
}

export function validateFunctionMetadata(libraryName, functionName, fn, libraryTargets = []) {
  if (!fn || typeof fn !== 'object') {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: must be an object`
    );
  }

  if (typeof fn.name !== 'string' || fn.name.length === 0) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: name must be a non-empty string`
    );
  }

  if (fn.name !== functionName) {
    throw new Error(
      `Invalid metadata for ${libraryName}.${functionName}: name mismatch (got "${fn.name}")`
    );
  }

  if (typeof fn.signature !== 'string' || fn.signature.length === 0) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: signature must be a non-empty string`
    );
  }

  if (typeof fn.description !== 'string' || fn.description.length === 0) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: description must be a non-empty string`
    );
  }

  if (!Array.isArray(fn.args)) {
    throw new TypeError(`Invalid metadata for ${libraryName}.${functionName}: args must be an array`);
  }

  const argNames = new Set();
  for (const arg of fn.args) {
    if (!arg || typeof arg !== 'object') {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: arg must be an object`
      );
    }

    if (typeof arg.name !== 'string' || arg.name.length === 0) {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: arg name must be a non-empty string`
      );
    }

    if (argNames.has(arg.name)) {
      throw new Error(
        `Invalid metadata for ${libraryName}.${functionName}: duplicate arg name "${arg.name}"`
      );
    }
    argNames.add(arg.name);

    if (typeof arg.type !== 'string' || arg.type.length === 0) {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: arg type must be a non-empty string`
      );
    }

    if (typeof arg.positional !== 'boolean') {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: arg positional must be a boolean`
      );
    }

    if (typeof arg.description !== 'string' || arg.description.length === 0) {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: arg description must be a non-empty string`
      );
    }
  }

  if (typeof fn.returns !== 'string' || fn.returns.length === 0) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: returns must be a non-empty string`
    );
  }

  if (!Array.isArray(fn.targets) || fn.targets.length === 0) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: targets must be a non-empty array`
    );
  }

  for (const target of fn.targets) {
    if (typeof target !== 'string' || target.length === 0) {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: targets must contain non-empty strings`
      );
    }
  }

  if (libraryTargets && libraryTargets.length > 0) {
    const libraryTargetSet = new Set(libraryTargets);
    for (const target of fn.targets) {
      if (!libraryTargetSet.has(target)) {
        throw new Error(
          `Invalid metadata for ${libraryName}.${functionName}: target "${target}" not in library targets`
        );
      }
    }
  }

  if (!Array.isArray(fn.examples)) {
    throw new TypeError(
      `Invalid metadata for ${libraryName}.${functionName}: examples must be an array`
    );
  }

  for (const example of fn.examples) {
    if (typeof example !== 'string' || example.length === 0) {
      throw new TypeError(
        `Invalid metadata for ${libraryName}.${functionName}: examples must contain non-empty strings`
      );
    }
  }
}
