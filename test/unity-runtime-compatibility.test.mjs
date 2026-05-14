import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_COMPATIBILITY } from '../src/toolchain/runtime-targets.js';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';

// Define the baseline compatibility map from docs/UNITY_RUNTIME_COMPATIBILITY.md
const UNITY_COMPATIBILITY_BASELINE = {
  // Portable: pure/deterministic behavior
  math: 'portable',
  logic: 'portable',
  list: 'portable',
  text: 'portable',
  json: 'portable',
  time: 'portable',
  state: 'portable',
  debug: 'portable',

  // Host-adapter: host-dependent behavior, same contract
  console: 'host-adapter',
  output: 'host-adapter',
  scene: 'host-adapter',
  scenesync: 'host-adapter',

  // Future: reserved but not yet implemented
  unity: 'future',

  // JS-only: not portable
  random: 'js-only',
  fs: 'js-only',
  dom: 'js-only',
  canvas: 'js-only',
  three: 'js-only'
};

test('Unity compatibility baseline: every documented library exists in LIBRARY_COMPATIBILITY', () => {
  for (const [libraryName, compatLevel] of Object.entries(UNITY_COMPATIBILITY_BASELINE)) {
    assert(
      LIBRARY_COMPATIBILITY[libraryName],
      `baseline library "${libraryName}" (${compatLevel}) should exist in LIBRARY_COMPATIBILITY`
    );
  }
});

test('Unity compatibility baseline: portable/host-adapter/future libraries include unity target', () => {
  for (const [libraryName, compatLevel] of Object.entries(UNITY_COMPATIBILITY_BASELINE)) {
    if (compatLevel === 'js-only') {
      // js-only libraries should NOT include unity
      const targets = LIBRARY_COMPATIBILITY[libraryName].targets;
      assert(
        !targets.includes('unity'),
        `${libraryName} is marked js-only but includes 'unity' in targets: ${JSON.stringify(targets)}`
      );
      continue;
    }

    // portable, host-adapter, and future should include unity or be explicitly partial
    const targets = LIBRARY_COMPATIBILITY[libraryName].targets;

    if (libraryName === 'scenesync') {
      // scenesync is documented as partial/host-adapter but still includes unity
      assert(
        targets.includes('unity'),
        `scenesync should include 'unity' in targets (partial case): ${JSON.stringify(targets)}`
      );
    } else {
      assert(
        targets.includes('unity'),
        `${libraryName} (${compatLevel}) should include 'unity' in targets: ${JSON.stringify(targets)}`
      );
    }
  }
});

test('Unity compatibility baseline: js-only libraries do not include unity target', () => {
  const jsOnlyLibraries = Object.entries(UNITY_COMPATIBILITY_BASELINE)
    .filter(([, level]) => level === 'js-only')
    .map(([name]) => name);

  for (const libraryName of jsOnlyLibraries) {
    const targets = LIBRARY_COMPATIBILITY[libraryName].targets;
    assert(
      !targets.includes('unity'),
      `${libraryName} is js-only but includes 'unity' in targets: ${JSON.stringify(targets)}`
    );
  }
});

test('Metadata/runtime consistency: metadata targets do not contradict runtime targets', () => {
  for (const [libraryName, metadata] of Object.entries(LIBRARY_METADATA)) {
    const runtimeCompat = LIBRARY_COMPATIBILITY[libraryName];
    assert(
      runtimeCompat,
      `metadata library "${libraryName}" should exist in runtime targets`
    );

    const runtimeTargets = new Set(runtimeCompat.targets);
    const metadataTargets = new Set(metadata.targets);

    for (const target of metadataTargets) {
      assert(
        runtimeTargets.has(target),
        `${libraryName}: metadata target "${target}" not in runtime targets ${JSON.stringify(runtimeCompat.targets)}`
      );
    }
  }
});

test('Metadata/runtime consistency: function targets are within library targets', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    const libraryTargets = new Set(library.targets);
    const functions = library.functions || {};

    for (const [fnName, fn] of Object.entries(functions)) {
      const fnTargets = new Set(fn.targets);

      for (const target of fnTargets) {
        assert(
          libraryTargets.has(target),
          `${libraryName}.${fnName}: target "${target}" not in library targets ${JSON.stringify(Array.from(libraryTargets))}`
        );
      }
    }
  }
});

test('Unity compatibility: portable libraries should not be empty if in metadata', () => {
  const portableLibraries = ['math', 'logic', 'list', 'text', 'json', 'time', 'state', 'debug'];

  for (const libraryName of portableLibraries) {
    const metadata = LIBRARY_METADATA[libraryName];

    if (metadata) {
      const functions = metadata.functions || {};
      const functionCount = Object.keys(functions).length;

      assert(
        functionCount > 0,
        `portable library "${libraryName}" exists in metadata but has no functions`
      );
    }
  }
});

test('Unity compatibility: Unity target in metadata implies Unity target in runtime', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    if (library.targets && library.targets.includes('unity')) {
      const runtimeCompat = LIBRARY_COMPATIBILITY[libraryName];
      assert(
        runtimeCompat && runtimeCompat.targets.includes('unity'),
        `${libraryName} has 'unity' in metadata targets but not in runtime targets`
      );
    }

    const functions = library.functions || {};
    for (const [fnName, fn] of Object.entries(functions)) {
      if (fn.targets && fn.targets.includes('unity')) {
        const runtimeCompat = LIBRARY_COMPATIBILITY[libraryName];
        assert(
          runtimeCompat && runtimeCompat.targets.includes('unity'),
          `${libraryName}.${fnName} has 'unity' in function targets but library is not unity-compatible`
        );
      }
    }
  }
});
