import { pathToFileURL } from 'node:url';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { registerTrustedPackage } from '../runtime/package-registration.js';

export class PackageLoadError extends Error {
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

    // Check that the resolved path exists before attempting import
    await access(resolvedPath);

    // Track state before loading package
    const beforeNodeTypes = new Set(Object.keys(nodeRegistry.toObject()));
    const beforeLibraries = metadataRegistry
      ? new Set(Object.keys(metadataRegistry.toObject()))
      : new Set();

    const fileUrl = pathToFileURL(resolvedPath).href;
    const packageModule = await import(fileUrl);

    registerTrustedPackage(nodeRegistry, packageModule, {
      nodeRegistry,
      metadataRegistry
    });

    // Capture state after loading package
    const afterNodeTypes = Object.keys(nodeRegistry.toObject());
    const afterLibraries = metadataRegistry
      ? Object.keys(metadataRegistry.toObject())
      : [];

    // Calculate only the newly added entries
    const addedNodeTypes = afterNodeTypes.filter((name) => !beforeNodeTypes.has(name));
    const addedLibraries = afterLibraries.filter((name) => !beforeLibraries.has(name));

    return {
      path: packagePath,
      resolvedPath,
      libraries: addedLibraries.sort(),
      nodeTypes: addedNodeTypes.sort()
    };
  } catch (error) {
    // If file doesn't exist, give a clear error
    if (error.code === 'ENOENT') {
      throw new PackageLoadError(
        `Package file not found: ${packagePath}`,
        packagePath,
        { originalError: error }
      );
    }

    // If it's a module not found error, distinguish between the package file
    // and nested imports within the package
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      // The error occurred during import - could be the package file or an internal import
      // Only report "package file not found" if we didn't already verify file existence above
      throw new PackageLoadError(
        `Failed to load package: ${packagePath}\n${error.message}`,
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
