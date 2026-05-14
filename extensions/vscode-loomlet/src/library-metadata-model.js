const metadata = require('../generated/library-metadata.json');

function buildLibraryModel(includePlanned = false) {
  const libraries = (metadata.libraries || [])
    .filter((lib) => includePlanned || lib.status === 'implemented');
  return libraries.map((lib) => ({
    ...lib,
    functions: (lib.functions || []).filter((fn) => includePlanned || fn.status === 'implemented')
  }));
}

function buildFunctionReferenceEntries(includePlanned = false) {
  const libs = buildLibraryModel(includePlanned);
  const entries = [];

  for (const lib of libs) {
    for (const fn of lib.functions) {
      entries.push({
        names: [fn.fullName],
        label: fn.fullName,
        signature: fn.signature,
        description: fn.description,
        example: undefined
      });
    }
  }

  return entries;
}

function getFunctionReferenceMap(includePlanned = false) {
  const entries = buildFunctionReferenceEntries(includePlanned);
  const map = new Map();
  for (const entry of entries) {
    for (const name of entry.names) {
      map.set(name, entry);
    }
  }
  return map;
}

module.exports = {
  buildLibraryModel,
  buildFunctionReferenceEntries,
  getFunctionReferenceMap
};
