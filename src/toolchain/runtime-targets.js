export const RUNTIME_TARGETS = ['cli', 'web', 'scenesync', 'unity', 'any'];

export const LIBRARY_COMPATIBILITY = {
  time: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'source',
    description: 'Time-based source nodes'
  },
  logic: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'pure',
    description: 'Boolean logic, comparison, and selection nodes'
  },
  list: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'pure',
    description: 'List construction and transformation nodes'
  },
  math: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'pure',
    description: 'Pure math and numeric transform nodes'
  },
  state: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'state',
    description: 'Explicit time-based state nodes'
  },
  text: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'pure',
    description: 'String processing utilities'
  },
  json: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'pure',
    description: 'JSON parse/stringify utilities'
  },
  random: {
    targets: ['cli', 'web'],
    kind: 'source',
    description: 'Non-deterministic random value generation nodes'
  },
  debug: {
    targets: ['cli', 'web', 'unity'],
    kind: 'effect',
    description: 'Debug inspection, tracing, and assertion nodes'
  },
  fs: {
    targets: ['cli'],
    kind: 'effect',
    description: 'File system access'
  },
  console: {
    targets: ['cli', 'web', 'scenesync', 'unity'],
    kind: 'effect',
    description: 'Logging to the host environment'
  },
  output: {
    targets: ['web', 'scenesync', 'unity'],
    kind: 'effect',
    description: 'Editor Output panel logging'
  },
  dom: {
    targets: ['web'],
    kind: 'effect',
    description: 'DOM input and DOM sink nodes'
  },
  canvas: {
    targets: ['web'],
    kind: 'renderer',
    description: 'Canvas preview renderer'
  },
  scene: {
    targets: ['cli', 'scenesync', 'unity', 'web'],
    kind: 'effect',
    description: 'Scene object control through a host adapter'
  },
  three: {
    targets: ['web'],
    kind: 'adapter',
    description: 'Three.js Object3D adapter'
  },
  unity: {
    targets: ['unity'],
    kind: 'adapter',
    description: 'Unity-specific runtime adapter'
  },
  scenesync: {
    targets: ['web', 'scenesync', 'unity'],
    kind: 'protocol',
    description: 'SceneSync graph/message integration'
  }
};

export function isKnownRuntimeTarget(target) {
  return RUNTIME_TARGETS.includes(target);
}

export function isKnownLibrary(name) {
  return Object.hasOwn(LIBRARY_COMPATIBILITY, name);
}

export function isLibraryAvailableInTarget(name, target) {
  if (!isKnownLibrary(name) || !isKnownRuntimeTarget(target)) {
    return false;
  }
  if (target === 'any') {
    return true;
  }
  return LIBRARY_COMPATIBILITY[name].targets.includes(target);
}

export function getLibraryCompatibility(name) {
  return isKnownLibrary(name) ? LIBRARY_COMPATIBILITY[name] : null;
}

export function listLibrariesForTarget(target) {
  if (!isKnownRuntimeTarget(target)) {
    return [];
  }
  if (target === 'any') {
    return Object.entries(LIBRARY_COMPATIBILITY).map(([name, info]) => ({ name, ...info }));
  }
  return Object.entries(LIBRARY_COMPATIBILITY)
    .filter(([, info]) => info.targets.includes(target))
    .map(([name, info]) => ({ name, ...info }));
}
