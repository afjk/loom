// Static capability metadata and host compatibility checking (v0).
//
// This is the "what does this graph require" contract, derived from node
// definitions without executing the graph. It is intentionally separate from
// the runtime effect log produced by `engine._recordEffect`.
//
// See docs/design/graph-capability-metadata-v0.md.

export const CAPABILITY_VERSION = 'v0';

export const DETERMINISM_LEVELS = ['pure', 'deterministic-with-env', 'nondeterministic'];

const DETERMINISM_RANK = new Map(DETERMINISM_LEVELS.map((level, index) => [level, index]));

export const KNOWN_CAPABILITIES = [
  'pure.compute@1',
  'env.time.seconds@1',
  'env.input@1',
  'env.events@1',
  'event.emit@1',
  'scene.object.transform.write@1',
  'scene.object.visibility.write@1',
  'scene.object.material.write@1',
  'scene.object.audio.control@1'
];

// Host capability profiles. Editable data, not a frozen contract.
export const HOST_CAPABILITIES = {
  'web-scenesync': [
    'pure.compute@1',
    'env.time.seconds@1',
    'env.input@1',
    'env.events@1',
    'event.emit@1',
    'scene.object.transform.write@1',
    'scene.object.visibility.write@1',
    'scene.object.material.write@1',
    'scene.object.audio.control@1'
  ],
  'unity-runtime': [
    // No audio: the runtime-only Unity package has no AudioSource control yet.
    'pure.compute@1',
    'env.time.seconds@1',
    'scene.object.transform.write@1'
  ],
  'export-viewer': [
    'pure.compute@1',
    'env.time.seconds@1',
    'scene.object.transform.write@1',
    'scene.object.visibility.write@1',
    'scene.object.material.write@1',
    'scene.object.audio.control@1'
  ],
  cli: [
    'pure.compute@1',
    'env.time.seconds@1',
    'env.input@1',
    'env.events@1',
    'event.emit@1'
  ]
};

export function listHostProfiles() {
  return Object.keys(HOST_CAPABILITIES).sort();
}

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === 'string' && item.length > 0);
}

// Conservative built-in default for unannotated pure library nodes.
// A built-in transform/source node with no explicit capability metadata and no
// scene/io effect is treated as pure compute. Unknown custom nodes are NOT
// covered here and remain unclassified.
const PURE_BUILTIN_PREFIXES = ['math.', 'logic.', 'text.', 'list.', 'json.'];
// Only genuinely pure event/value transforms. Effectful or stateful nodes
// (e.g. `log` writes a runtime effect, `lowpass`/`integrate` carry state) are
// deliberately excluded so they stay unclassified rather than reported pure.
const PURE_BUILTIN_TYPES = new Set([
  'constant',
  'getComponent',
  'swizzle',
  'merge',
  'sample',
  'filter'
]);

function builtinPureDefault(type, definition) {
  if (!definition) {
    return null;
  }
  const category = definition.category;
  if (category !== 'transform' && category !== 'source') {
    return null;
  }
  const isPureType =
    PURE_BUILTIN_TYPES.has(type) ||
    PURE_BUILTIN_PREFIXES.some((prefix) => type.startsWith(prefix));
  if (!isPureType) {
    return null;
  }
  return {
    effects: [],
    requires: ['pure.compute@1'],
    reads: [],
    writes: [],
    determinism: 'pure',
    classified: true
  };
}

// Resolve the effective capability metadata for a single node type.
// Returns `{ classified: boolean, effects, requires, reads, writes, determinism }`.
export function resolveNodeCapabilities(type, definition) {
  const hasExplicit =
    definition &&
    (Array.isArray(definition.effects) ||
      Array.isArray(definition.requires) ||
      Array.isArray(definition.reads) ||
      Array.isArray(definition.writes) ||
      typeof definition.determinism === 'string');

  if (hasExplicit) {
    const effects = normalizeStringArray(definition.effects);
    const requires = normalizeStringArray(definition.requires);
    let determinism;
    if (typeof definition.determinism === 'string') {
      determinism = definition.determinism;
    } else if (effects.length === 0 && requires.every((cap) => cap === 'pure.compute@1')) {
      // No declared effects and only pure-compute requirements: treat as pure
      // rather than weakening the graph to deterministic-with-env.
      determinism = 'pure';
    } else {
      determinism = 'deterministic-with-env';
    }
    return {
      classified: true,
      effects,
      requires,
      reads: normalizeStringArray(definition.reads),
      writes: normalizeStringArray(definition.writes),
      determinism
    };
  }

  const pureDefault = builtinPureDefault(type, definition);
  if (pureDefault) {
    return pureDefault;
  }

  return {
    classified: false,
    effects: [],
    requires: [],
    reads: [],
    writes: [],
    determinism: 'nondeterministic'
  };
}

// Look up a node definition from either a registry (has getNodeType) or a
// plain node-types map such as NODE_TYPES.
function lookupDefinition(nodeTypes, type) {
  if (nodeTypes && typeof nodeTypes.getNodeType === 'function') {
    return nodeTypes.getNodeType(type);
  }
  return nodeTypes ? nodeTypes[type] : undefined;
}

function weakestDeterminism(levels) {
  let rank = 0;
  for (const level of levels) {
    const candidate = DETERMINISM_RANK.get(level);
    if (candidate !== undefined && candidate > rank) {
      rank = candidate;
    }
  }
  return DETERMINISM_LEVELS[rank];
}

// Build a static capability summary for a graph.
export function summarizeGraphCapabilities(graph, nodeTypes) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];

  const perNode = [];
  const unclassified = [];
  const allEffects = [];
  const allRequires = [];
  const allReads = [];
  const allWrites = [];
  const determinisms = [];

  for (const node of nodes) {
    if (!node || typeof node.type !== 'string') {
      continue;
    }
    const definition = lookupDefinition(nodeTypes, node.type);
    const caps = resolveNodeCapabilities(node.type, definition);

    perNode.push({
      nodeId: node.id,
      type: node.type,
      classified: caps.classified,
      effects: caps.effects,
      requires: caps.requires,
      reads: caps.reads,
      writes: caps.writes,
      determinism: caps.determinism
    });

    if (!caps.classified) {
      unclassified.push({ nodeId: node.id, type: node.type });
    }

    allEffects.push(...caps.effects);
    allRequires.push(...caps.requires);
    allReads.push(...caps.reads);
    allWrites.push(...caps.writes);
    determinisms.push(caps.determinism);
  }

  return {
    effects: uniqueSorted(allEffects),
    requires: uniqueSorted(allRequires),
    reads: uniqueSorted(allReads),
    writes: uniqueSorted(allWrites),
    determinism: weakestDeterminism(determinisms),
    nodes: perNode,
    unclassified
  };
}

function resolveHostCapabilitySet(host) {
  if (Array.isArray(host)) {
    return { label: 'custom-host', capabilities: new Set(normalizeStringArray(host)) };
  }
  if (host && typeof host === 'object') {
    const label = typeof host.host === 'string' ? host.host : 'custom-host';
    return { label, capabilities: new Set(normalizeStringArray(host.capabilities)) };
  }
  if (typeof host === 'string') {
    const capabilities = HOST_CAPABILITIES[host];
    if (!capabilities) {
      throw new Error(
        `Unknown host profile: ${host}. Known profiles: ${listHostProfiles().join(', ')}`
      );
    }
    return { label: host, capabilities: new Set(capabilities) };
  }
  throw new TypeError('host must be a known profile name, a capability array, or { host, capabilities }');
}

// Check whether a graph can run on a host, returning a structured report.
export function checkHostCompatibility(graph, nodeTypes, host) {
  const { label, capabilities } = resolveHostCapabilitySet(host);
  const summary = summarizeGraphCapabilities(graph, nodeTypes);

  // Map each required capability back to the nodes that need it.
  const requirementNodes = new Map();
  for (const node of summary.nodes) {
    for (const capability of node.requires) {
      if (!requirementNodes.has(capability)) {
        requirementNodes.set(capability, []);
      }
      requirementNodes.get(capability).push(node.nodeId);
    }
  }

  const supported = [];
  const unsupported = [];
  for (const capability of summary.requires) {
    if (capabilities.has(capability)) {
      supported.push(capability);
    } else {
      unsupported.push({
        capability,
        nodes: uniqueSorted(requirementNodes.get(capability) ?? []),
        message: `${label} does not provide ${capability}.`
      });
    }
  }

  const unclassified = summary.unclassified.map(({ nodeId, type }) => ({
    nodeId,
    type,
    message: `No capability metadata; cannot verify support on ${label}.`
  }));

  let status;
  if (summary.requires.length > 0 && supported.length === 0) {
    status = 'unsupported';
  } else if (unsupported.length > 0 || unclassified.length > 0) {
    status = 'partial';
  } else {
    status = 'full';
  }

  return {
    targetHost: label,
    status,
    supported: uniqueSorted(supported),
    unsupported,
    unclassified
  };
}
