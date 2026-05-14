import test from 'node:test';
import assert from 'node:assert/strict';
import { NODE_TYPES } from '../src/loom.js';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';

// Allowlists for known drift (entries that will be self-audited)
const KNOWN_METADATA_ONLY_NODE_TYPES = new Set([
  'math.negate',
  'math.greaterThan',
  'math.lessThan',
  'output.log',
  'random.noise',
  'random.seeded',
  'state.delay1',
  'state.integrate',
  'state.lowpass',
  'state.smoothLerp'
]);

const KNOWN_ARG_NAME_MISMATCHES = new Set([]);

const KNOWN_RUNTIME_ONLY_NODE_TYPES = new Set([
  'function.literal',
  'function.call'
]);

function metadataNodeType(libraryName, functionName) {
  return `${libraryName}.${functionName}`;
}

function getMetadataFunction(nodeType) {
  const [libraryName, functionName] = nodeType.split('.');
  return LIBRARY_METADATA[libraryName]?.functions?.[functionName] ?? null;
}

function parseArgMismatchKey(key) {
  const [nodeType, argName] = key.split(':');
  return { nodeType, argName };
}

function runtimeSlotNames(def) {
  return new Set([
    ...(def.inputs ?? []).map((input) => input.name),
    ...(def.params ?? []).map((param) => param.name)
  ]);
}

test('metadata drift: advertised metadata functions have runtime nodes', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    for (const functionName of Object.keys(library.functions ?? {})) {
      const nodeType = metadataNodeType(libraryName, functionName);

      if (!KNOWN_METADATA_ONLY_NODE_TYPES.has(nodeType)) {
        assert.ok(
          NODE_TYPES[nodeType],
          `Metadata advertises ${nodeType}, but NODE_TYPES does not define it`
        );
      }
    }
  }
});

test('metadata drift: metadata-only allowlist entries are still active', () => {
  for (const nodeType of KNOWN_METADATA_ONLY_NODE_TYPES) {
    assert.ok(
      getMetadataFunction(nodeType),
      `Allowlist entry ${nodeType} is stale: metadata no longer advertises it`
    );

    assert.equal(
      Boolean(NODE_TYPES[nodeType]),
      false,
      `Allowlist entry ${nodeType} is stale: runtime now defines it`
    );
  }
});

test('metadata drift: metadata args exist in runtime inputs or params', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    for (const [functionName, fn] of Object.entries(library.functions ?? {})) {
      const nodeType = metadataNodeType(libraryName, functionName);
      const runtime = NODE_TYPES[nodeType];

      if (!runtime) {
        // Skip if node doesn't exist in runtime yet (covered by previous test)
        continue;
      }

      const slots = runtimeSlotNames(runtime);

      for (const arg of fn.args ?? []) {
        const key = `${nodeType}:${arg.name}`;
        if (KNOWN_ARG_NAME_MISMATCHES.has(key)) {
          continue; // Skip known mismatches
        }

        assert.ok(
          slots.has(arg.name),
          `${nodeType} metadata arg '${arg.name}' is not present in runtime inputs/params`
        );
      }
    }
  }
});

test('metadata drift: arg mismatch allowlist entries are still active', () => {
  for (const key of KNOWN_ARG_NAME_MISMATCHES) {
    const { nodeType, argName } = parseArgMismatchKey(key);
    const meta = getMetadataFunction(nodeType);
    const runtime = NODE_TYPES[nodeType];

    assert.ok(meta, `Allowlist entry ${key} is stale: metadata function is missing`);
    assert.ok(runtime, `Allowlist entry ${key} is stale: runtime node is missing`);

    assert.ok(
      (meta.args ?? []).some((arg) => arg.name === argName),
      `Allowlist entry ${key} is stale: metadata arg is missing`
    );

    assert.equal(
      runtimeSlotNames(runtime).has(argName),
      false,
      `Allowlist entry ${key} is stale: runtime now has arg ${argName}`
    );
  }
});

test('metadata drift: non-void metadata functions expose runtime outputs', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    for (const [functionName, fn] of Object.entries(library.functions ?? {})) {
      const nodeType = metadataNodeType(libraryName, functionName);
      const runtime = NODE_TYPES[nodeType];

      if (!runtime) {
        // Skip if node doesn't exist in runtime yet
        continue;
      }

      const outputs = runtime.outputs ?? [];

      if (fn.returns !== 'void') {
        assert.ok(
          outputs.length > 0,
          `${nodeType} returns non-void but has no output ports`
        );
      }
    }
  }
});

test('metadata drift: namespaced runtime public nodes have metadata', () => {
  for (const nodeType of Object.keys(NODE_TYPES)) {
    // Skip unqualified names (legacy phase 0/1 nodes)
    if (!nodeType.includes('.')) {
      continue;
    }

    // Skip known runtime-only nodes
    if (KNOWN_RUNTIME_ONLY_NODE_TYPES.has(nodeType)) {
      continue;
    }

    const [libraryName, functionName] = nodeType.split('.');

    assert.ok(
      LIBRARY_METADATA[libraryName],
      `Runtime node ${nodeType} references library "${libraryName}" but it's not in LIBRARY_METADATA`
    );

    const library = LIBRARY_METADATA[libraryName];
    assert.ok(
      library.functions && library.functions[functionName],
      `Runtime node ${nodeType} is not documented in LIBRARY_METADATA.${libraryName}.functions.${functionName}`
    );
  }
});

test('metadata drift: runtime-only allowlist entries are still active', () => {
  for (const nodeType of KNOWN_RUNTIME_ONLY_NODE_TYPES) {
    assert.ok(
      NODE_TYPES[nodeType],
      `Allowlist entry ${nodeType} is stale: runtime no longer defines it`
    );

    assert.equal(
      Boolean(getMetadataFunction(nodeType)),
      false,
      `Allowlist entry ${nodeType} is stale: metadata now documents it`
    );
  }
});

test('metadata drift: math.add args match runtime slots', () => {
  const meta = LIBRARY_METADATA.math.functions.add;
  const runtime = NODE_TYPES['math.add'];

  assert.deepEqual(meta.args.map((arg) => arg.name), ['a', 'b']);
  assert.deepEqual(runtime.inputs.map((input) => input.name), ['a', 'b']);
  assert.deepEqual(runtime.params.map((param) => param.name), ['a', 'b']);
});

test('metadata drift: scene.setPosition args match runtime slots', () => {
  const meta = LIBRARY_METADATA.scene.functions.setPosition;
  const runtime = NODE_TYPES['scene.setPosition'];

  assert.deepEqual(meta.args.map((arg) => arg.name), ['objectId', 'x', 'y', 'z']);
  assert.deepEqual(runtime.inputs.map((input) => input.name), ['objectId', 'x', 'y', 'z']);
  assert.deepEqual(runtime.params.map((param) => param.name), ['objectId', 'x', 'y', 'z']);
});

test('metadata drift: math.abs args match runtime slots', () => {
  const meta = LIBRARY_METADATA.math.functions.abs;
  const runtime = NODE_TYPES['math.abs'];

  assert.deepEqual(meta.args.map((arg) => arg.name), ['value']);
  assert.deepEqual(runtime.inputs.map((input) => input.name), ['value']);
  assert.deepEqual(runtime.params.map((param) => param.name), ['value']);
});
