import test from 'node:test';
import assert from 'node:assert/strict';
import { NODE_TYPES } from '../src/loom.js';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';

function metadataNodeType(libraryName, functionName) {
  return `${libraryName}.${functionName}`;
}

function runtimeSlotNames(def) {
  return new Set([
    ...(def.inputs ?? []).map((input) => input.name),
    ...(def.params ?? []).map((param) => param.name)
  ]);
}

test('metadata drift: advertised metadata functions have runtime nodes', () => {
  const KNOWN_METADATA_ONLY_NODE_TYPES = new Set([
    // TODO: math library is not yet fully namespaced in runtime
    'math.negate',
    'math.abs',
    'math.clamp',
    'math.lerp',
    'math.smoothstep',
    'math.sqrt',
    'math.ceiling',
    'math.floor',
    'math.round',
    'math.min',
    'math.max',
    // TODO: comparison functions are in logic library, not math
    'math.greaterThan',
    'math.lessThan',
    // TODO: output, random, and state functions not yet in NODE_TYPES
    'output.log',
    'random.noise',
    'random.seeded',
    'state.delay1',
    'state.integrate',
    'state.lowpass',
    'state.smoothLerp'
  ]);

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

test('metadata drift: metadata args exist in runtime inputs or params', () => {
  const KNOWN_ARG_NAME_MISMATCHES = new Set([
    // TODO: math.abs runtime uses 'value' but metadata documents 'a'
    'math.abs:a'
  ]);

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
  const KNOWN_RUNTIME_ONLY_NODE_TYPES = new Set([
    // TODO: function library nodes are internal compiler/evaluator support, not yet public
    'function.literal',
    'function.call'
  ]);

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
