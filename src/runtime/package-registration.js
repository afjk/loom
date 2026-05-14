export function registerTrustedPackage(registry, packageModule, context = {}) {
  if (!registry || typeof registry.registerNodeType !== 'function') {
    throw new TypeError('registerTrustedPackage requires a node registry');
  }

  if (!packageModule || typeof packageModule.registerLoomletPackage !== 'function') {
    throw new TypeError('Trusted package must export registerLoomletPackage(registry, context)');
  }

  packageModule.registerLoomletPackage(registry, context);
  return registry;
}
