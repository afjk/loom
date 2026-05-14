import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { registerTrustedPackage } from '../runtime/package-registration.js';

class PackageLoadError extends Error {
  constructor(message, packagePath, details = {}) {
    super(message);
    this.name = 'PackageLoadError';
    this.packagePath = packagePath;
    this.details = details;
  }
}

export async function loadTrustedLocalPackage(packagePath, options = {}) {
  if (!packagePath || typeof packagePath !== 'string') {
    throw new TypeError('packagePath must be a non-empty string');
  }

  if (!options.nodeRegistry) {
    throw new TypeError('options.nodeRegistry is required');
  }

  const { nodeRegistry, metadataRegistry } = options;

  let resolvedPath;
  try {
    if (path.isAbsolute(packagePath)) {
      resolvedPath = packagePath;
    } else {
      resolvedPath = path.resolve(process.cwd(), packagePath);
    }

    const fileUrl = pathToFileURL(resolvedPath).href;
    const packageModule = await import(fileUrl);

    registerTrustedPackage(nodeRegistry, packageModule, {
      nodeRegistry,
      metadataRegistry
    });

    const nodeTypes = nodeRegistry.toObject();
    const libraries = [];
    const nodeTypesList = [];

    for (const nodeTypeName of Object.keys(nodeTypes)) {
      const [libraryName] = nodeTypeName.split('.');
      if (libraryName && !libraries.includes(libraryName)) {
        libraries.push(libraryName);
      }
      nodeTypesList.push(nodeTypeName);
    }

    return {
      path: packagePath,
      resolvedPath,
      libraries: libraries.sort(),
      nodeTypes: nodeTypesList.sort()
    };
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new PackageLoadError(
        `Package file not found: ${packagePath}`,
        packagePath,
        { originalError: error }
      );
    }

    if (error instanceof SyntaxError) {
      throw new PackageLoadError(
        `Package module has syntax error: ${packagePath}\n${error.message}`,
        packagePath,
        { originalError: error }
      );
    }

    if (error.name === 'TypeError' && error.message.includes('registerTrustedPackage')) {
      throw new PackageLoadError(
        `Package is not a valid Loomlet package: ${packagePath}\nMust export registerLoomletPackage function and optionally loomletMetadata object.\n${error.message}`,
        packagePath,
        { originalError: error }
      );
    }

    if (error instanceof PackageLoadError) {
      throw error;
    }

    throw new PackageLoadError(
      `Failed to load package: ${packagePath}\n${error.message}`,
      packagePath,
      { originalError: error }
    );
  }
}

export async function loadTrustedLocalPackages(packagePaths, options = {}) {
  if (!Array.isArray(packagePaths)) {
    throw new TypeError('packagePaths must be an array');
  }

  if (!options.nodeRegistry) {
    throw new TypeError('options.nodeRegistry is required');
  }

  const results = [];

  for (const packagePath of packagePaths) {
    const result = await loadTrustedLocalPackage(packagePath, options);
    results.push(result);
  }

  return results;
}
