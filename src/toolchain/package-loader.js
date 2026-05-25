import { pathToFileURL } from 'node:url';
import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { registerTrustedPackage } from '../runtime/package-registration.js';

const MANIFEST_FILENAME = 'loomlet.package.json';

export class PackageLoadError extends Error {
  constructor(message, packagePath, details = {}) {
    super(message);
    this.name = 'PackageLoadError';
    this.packagePath = packagePath;
    this.details = details;
  }
}

function resolvePackagePath(packagePath) {
  return path.isAbsolute(packagePath)
    ? packagePath
    : path.resolve(process.cwd(), packagePath);
}

async function loadJsonFile(filePath, packagePath, label) {
  let text;
  try {
    text = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new PackageLoadError(
        `${label} not found: ${packagePath}`,
        packagePath,
        { originalError: error }
      );
    }
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new PackageLoadError(
      `${label} is not valid JSON: ${packagePath}\n${error.message}`,
      packagePath,
      { originalError: error }
    );
  }
}

function validatePackageManifest(manifest, packagePath) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nManifest must be a JSON object.`,
      packagePath
    );
  }

  if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nRequired field "name" must be a non-empty string.`,
      packagePath
    );
  }

  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nRequired field "version" must be a non-empty string.`,
      packagePath
    );
  }

  if (!manifest.loomlet || typeof manifest.loomlet !== 'object' || Array.isArray(manifest.loomlet)) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nRequired field "loomlet" must be an object.`,
      packagePath
    );
  }

  if (typeof manifest.loomlet.entry !== 'string' || manifest.loomlet.entry.length === 0) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nRequired field "loomlet.entry" must be a non-empty string.`,
      packagePath
    );
  }

  if (
    manifest.loomlet.metadata !== undefined &&
    (typeof manifest.loomlet.metadata !== 'string' || manifest.loomlet.metadata.length === 0)
  ) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nOptional field "loomlet.metadata" must be a non-empty string when provided.`,
      packagePath
    );
  }
}

function resolveManifestRelativePath(packageRoot, manifestPath, fieldName, packagePath) {
  if (path.isAbsolute(manifestPath)) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nField "${fieldName}" must be a relative path.`,
      packagePath
    );
  }

  const normalized = path.normalize(manifestPath);
  if (normalized === '..' || normalized.startsWith(`..${path.sep}`)) {
    throw new PackageLoadError(
      `Invalid package manifest: ${packagePath}\nField "${fieldName}" must stay inside the package directory.`,
      packagePath
    );
  }

  return path.resolve(packageRoot, normalized);
}

function normalizeMetadataModule(metadataModule) {
  if (metadataModule?.loomletMetadata) {
    return metadataModule.loomletMetadata;
  }
  if (metadataModule?.default) {
    return metadataModule.default;
  }
  return metadataModule;
}

async function loadManifestMetadata(metadataPath, packagePath) {
  if (metadataPath.endsWith('.json')) {
    return loadJsonFile(metadataPath, packagePath, 'Package metadata file');
  }

  const metadataModule = await import(pathToFileURL(metadataPath).href);
  return normalizeMetadataModule(metadataModule);
}

async function resolvePackageEntry(packagePath) {
  const resolvedPath = resolvePackagePath(packagePath);
  let packageStat;

  try {
    packageStat = await stat(resolvedPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new PackageLoadError(
        `Package file not found: ${packagePath}`,
        packagePath,
        { originalError: error }
      );
    }
    throw error;
  }

  if (!packageStat.isDirectory()) {
    await access(resolvedPath);
    return {
      kind: 'file',
      path: packagePath,
      resolvedPath,
      entryPath: resolvedPath,
      manifestPath: null,
      metadataPath: null,
      packageModule: await import(pathToFileURL(resolvedPath).href)
    };
  }

  const manifestPath = path.join(resolvedPath, MANIFEST_FILENAME);
  const manifest = await loadJsonFile(
    manifestPath,
    packagePath,
    `Package manifest ${MANIFEST_FILENAME}`
  );
  validatePackageManifest(manifest, packagePath);

  const entryPath = resolveManifestRelativePath(
    resolvedPath,
    manifest.loomlet.entry,
    'loomlet.entry',
    packagePath
  );
  const entryModule = await import(pathToFileURL(entryPath).href);

  let metadataPath = null;
  let packageModule = entryModule;
  if (manifest.loomlet.metadata) {
    metadataPath = resolveManifestRelativePath(
      resolvedPath,
      manifest.loomlet.metadata,
      'loomlet.metadata',
      packagePath
    );
    const loomletMetadata = await loadManifestMetadata(metadataPath, packagePath);
    packageModule = {
      registerLoomletPackage: entryModule.registerLoomletPackage,
      loomletMetadata
    };
  }

  return {
    kind: 'directory',
    path: packagePath,
    resolvedPath,
    entryPath,
    manifestPath,
    metadataPath,
    manifest,
    packageModule
  };
}

export async function loadTrustedLocalPackage(packagePath, options = {}) {
  if (!packagePath || typeof packagePath !== 'string') {
    throw new TypeError('packagePath must be a non-empty string');
  }

  if (!options.nodeRegistry) {
    throw new TypeError('options.nodeRegistry is required');
  }

  const { nodeRegistry, metadataRegistry } = options;

  try {
    const packageEntry = await resolvePackageEntry(packagePath);

    // Track state before loading package
    const beforeNodeTypes = new Set(Object.keys(nodeRegistry.toObject()));
    const beforeLibraries = metadataRegistry
      ? new Set(Object.keys(metadataRegistry.toObject()))
      : new Set();

    registerTrustedPackage(nodeRegistry, packageEntry.packageModule, {
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
      resolvedPath: packageEntry.resolvedPath,
      manifestPath: packageEntry.manifestPath,
      entryPath: packageEntry.entryPath,
      metadataPath: packageEntry.metadataPath,
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
