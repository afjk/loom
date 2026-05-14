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

const KNOWN_METADATA_ONLY_NODE_TYPES = new Set([
  'math.negate',      // TODO: implement math.negate runtime node
  'math.greaterThan', // TODO: implement math.greaterThan runtime node
  'math.lessThan',    // TODO: implement math.lessThan runtime node
  'state.lowpass',    // TODO: implement state.lowpass runtime node
  'state.delay1',     // TODO: implement state.delay1 runtime node
  'state.integrate',  // TODO: implement state.integrate runtime node
  'state.smoothLerp', // TODO: implement state.smoothLerp runtime node
  'random.seeded',    // TODO: implement random.seeded runtime node
  'random.noise',     // TODO: implement random.noise runtime node
  'output.log'        // TODO: implement output.log runtime node
]);

const KNOWN_RUNTIME_ONLY_NODE_TYPES = new Set([
  'function.literal', // TODO: add metadata for function.literal
  'function.call',    // TODO: add metadata for function.call
  'logic.select'      // TODO: add metadata for logic.select
]);

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

const KNOWN_ARG_NAME_MISMATCHES = new Set([
  // nodeType: set of arg names known to mismatch runtime slots
  // 'math.abs': { 'a': 'value' } - TODO: align runtime math.abs to use 'a' like metadata
]);

test('metadata drift: metadata args exist in runtime inputs or params', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    for (const functionName of Object.keys(library.functions ?? {})) {
      const nodeType = metadataNodeType(libraryName, functionName);
      if (KNOWN_METADATA_ONLY_NODE_TYPES.has(nodeType)) {
        continue;
      }

      const fn = library.functions[functionName];
      const runtime = NODE_TYPES[nodeType];
      const slots = runtimeSlotNames(runtime);

      for (const arg of fn.args ?? []) {
        const mismatched = (
          nodeType === 'math.abs' && arg.name === 'a'
          // TODO: remove math.abs from this exception once runtime is updated
        );

        if (!mismatched) {
          assert.ok(
            slots.has(arg.name),
            `${nodeType} metadata arg '${arg.name}' is not present in runtime inputs/params`
          );
        }
      }
    }
  }
});

test('metadata drift: non-void metadata functions expose runtime outputs', () => {
  for (const [libraryName, library] of Object.entries(LIBRARY_METADATA)) {
    for (const functionName of Object.keys(library.functions ?? {})) {
      const nodeType = metadataNodeType(libraryName, functionName);
      if (KNOWN_METADATA_ONLY_NODE_TYPES.has(nodeType)) {
        continue;
      }

      const fn = library.functions[functionName];
      const runtime = NODE_TYPES[nodeType];
      const outputs = runtime.outputs ?? [];

      if (fn.returns !== 'void') {
        assert.ok(
          outputs.length > 0,
          `${nodeType} metadata declares non-void return but runtime has no outputs`
        );
      }
    }
  }
});

test('metadata drift: namespaced runtime public nodes have metadata', () => {
  for (const nodeType of Object.keys(NODE_TYPES)) {
    if (!nodeType.includes('.')) {
      // Skip unqualified nodes like 'add', 'constant', 'clock'
      continue;
    }

    if (KNOWN_RUNTIME_ONLY_NODE_TYPES.has(nodeType)) {
      continue;
    }

    const [library, functionName] = nodeType.split('.');

    assert.ok(
      LIBRARY_METADATA[library],
      `Runtime node ${nodeType} has a library prefix but LIBRARY_METADATA.${library} is not defined`
    );

    assert.ok(
      LIBRARY_METADATA[library].functions[functionName],
      `Runtime node ${nodeType} is not advertised in LIBRARY_METADATA.${library}.functions`
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
