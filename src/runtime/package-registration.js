export function registerTrustedPackage(registry, packageModule, context = {}) {
  if (!registry || typeof registry.registerNodeType !== 'function') {
    throw new TypeError('registerTrustedPackage requires a node registry');
  }

  if (!packageModule || typeof packageModule.registerLoomletPackage !== 'function') {
    throw new TypeError('Trusted package must export registerLoomletPackage(registry, context)');
  }

  packageModule.registerLoomletPackage(registry, context);

  if (context.metadataRegistry) {
    if (typeof context.metadataRegistry.registerLibraryMetadata !== 'function') {
      throw new TypeError('registerTrustedPackage metadataRegistry must support registerLibraryMetadata()');
    }

    if (typeof packageModule.registerLoomletMetadata === 'function') {
      packageModule.registerLoomletMetadata(context.metadataRegistry, context);
    } else if (packageModule.loomletMetadata) {
      for (const [libraryName, library] of Object.entries(packageModule.loomletMetadata)) {
        context.metadataRegistry.registerLibraryMetadata(libraryName, library);
      }
    }
  }

  return registry;
}
