export function registerLoomletPackage(registry) {
  registry.registerNodeType('manifestpkg.value', {
    category: 'source',
    outputs: [
      { name: 'out', type: 'number', kind: 'behavior' }
    ],
    evaluate() {
      return { out: 7 };
    }
  });
}
