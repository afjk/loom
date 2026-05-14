import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLibraryMetadataRegistry,
  validateLibraryMetadata,
  validateFunctionMetadata
} from '../src/toolchain/metadata-registry.js';

test('metadata registry registers and reads library metadata', () => {
  const registry = createLibraryMetadataRegistry();

  const library = {
    name: 'demo',
    description: 'Demo metadata.',
    targets: ['cli'],
    functions: {
      double: {
        name: 'double',
        signature: 'demo.double(value: 0)',
        description: 'Doubles a value.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Input value.'
          }
        ],
        returns: 'number',
        targets: ['cli'],
        examples: ['result = demo.double(value: 5)']
      }
    }
  };

  registry.registerLibraryMetadata('demo', library);

  assert.equal(registry.hasLibraryMetadata('demo'), true);
  assert.equal(registry.getLibraryMetadata('demo'), library);
  assert.deepEqual(registry.listLibraries(), ['demo']);
});

test('metadata registry initializes from existing metadata object', () => {
  const initialMetadata = {
    math: {
      name: 'math',
      description: 'Math functions.',
      targets: ['cli'],
      functions: {
        add: {
          name: 'add',
          signature: 'math.add(a, b)',
          description: 'Adds two numbers.',
          args: [
            { name: 'a', type: 'number', positional: true, description: 'First number.' },
            { name: 'b', type: 'number', positional: true, description: 'Second number.' }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: ['result = math.add(2, 3)']
        }
      }
    },
    text: {
      name: 'text',
      description: 'Text functions.',
      targets: ['cli'],
      functions: {
        upper: {
          name: 'upper',
          signature: 'text.upper(str)',
          description: 'Converts to uppercase.',
          args: [
            { name: 'str', type: 'string', positional: true, description: 'Input string.' }
          ],
          returns: 'string',
          targets: ['cli'],
          examples: ['result = text.upper("hello")']
        }
      }
    }
  };

  const registry = createLibraryMetadataRegistry(initialMetadata);

  assert.deepEqual(registry.listLibraries(), ['math', 'text']);
  assert.equal(registry.hasLibraryMetadata('math'), true);
  assert.equal(registry.hasLibraryMetadata('text'), true);
});

test('metadata registry rejects duplicates', () => {
  const registry = createLibraryMetadataRegistry();

  const library = {
    name: 'demo',
    description: 'Demo.',
    targets: ['cli'],
    functions: {}
  };

  registry.registerLibraryMetadata('demo', library);

  assert.throws(
    () => registry.registerLibraryMetadata('demo', library),
    /Duplicate library metadata/
  );
});

test('metadata registry validates invalid library names', () => {
  const registry = createLibraryMetadataRegistry();
  const library = {
    name: 'demo',
    description: 'Demo.',
    targets: ['cli'],
    functions: {}
  };

  assert.throws(
    () => registry.registerLibraryMetadata('', library),
    /Library name must not be empty/
  );

  assert.throws(
    () => registry.registerLibraryMetadata('   ', library),
    /whitespace-only/
  );

  assert.throws(
    () => registry.registerLibraryMetadata('demo package', library),
    /must not contain whitespace/
  );

  assert.throws(
    () => registry.registerLibraryMetadata('.demo', library),
    /must not start with a dot/
  );

  assert.throws(
    () => registry.registerLibraryMetadata('demo.', library),
    /must not end with a dot/
  );
});

test('metadata registry validates library shape - missing object', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', null),
    /must be an object/
  );
});

test('metadata registry validates library shape - missing name', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      description: 'Demo.',
      targets: ['cli'],
      functions: {}
    }),
    /name must be a non-empty string/
  );
});

test('metadata registry validates library shape - name mismatch', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'other',
      description: 'Demo.',
      targets: ['cli'],
      functions: {}
    }),
    /name mismatch/
  );
});

test('metadata registry validates library shape - missing description', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      targets: ['cli'],
      functions: {}
    }),
    /description must be a non-empty string/
  );
});

test('metadata registry validates library shape - missing targets', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      functions: {}
    }),
    /targets must be a non-empty array/
  );
});

test('metadata registry validates library shape - missing functions', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli']
    }),
    /functions must be an object/
  );
});

test('metadata registry validates function shape - missing name', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /name must be a non-empty string/
  );
});

test('metadata registry validates function shape - name mismatch', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'triple',
          signature: 'demo.triple(value: 0)',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /name mismatch/
  );
});

test('metadata registry validates function shape - missing signature', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /signature must be a non-empty string/
  );
});

test('metadata registry validates function shape - missing description', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          args: [],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /description must be a non-empty string/
  );
});

test('metadata registry validates function shape - missing args', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /args must be an array/
  );
});

test('metadata registry validates function shape - missing returns', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [],
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /returns must be a non-empty string/
  );
});

test('metadata registry validates function shape - missing targets', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          examples: []
        }
      }
    }),
    /targets must be a non-empty array/
  );
});

test('metadata registry validates function shape - missing examples', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          targets: ['cli']
        }
      }
    }),
    /examples must be an array/
  );
});

test('metadata registry validates function arg shape', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [
            { name: 'value', type: 'number', positional: false }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /arg description must be a non-empty string/
  );
});

test('metadata registry validates duplicate arg names', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [
            { name: 'value', type: 'number', positional: false, description: 'Value 1.' },
            { name: 'value', type: 'number', positional: false, description: 'Value 2.' }
          ],
          returns: 'number',
          targets: ['cli'],
          examples: []
        }
      }
    }),
    /duplicate arg name/
  );
});

test('metadata registry validates function targets subset of library targets', () => {
  const registry = createLibraryMetadataRegistry();

  assert.throws(
    () => registry.registerLibraryMetadata('demo', {
      name: 'demo',
      description: 'Demo.',
      targets: ['cli'],
      functions: {
        double: {
          name: 'double',
          signature: 'demo.double(value: 0)',
          description: 'Doubles.',
          args: [],
          returns: 'number',
          targets: ['web'],
          examples: []
        }
      }
    }),
    /target "web" not in library targets/
  );
});

test('metadata registry toObject returns shallow copy', () => {
  const library = {
    name: 'demo',
    description: 'Demo.',
    targets: ['cli'],
    functions: {}
  };

  const registry = createLibraryMetadataRegistry();
  registry.registerLibraryMetadata('demo', library);

  const obj = registry.toObject();

  assert.equal(obj.demo, library);
  assert.deepEqual(Object.keys(obj), ['demo']);

  obj.other = { name: 'other', description: 'Other.', targets: ['cli'], functions: {} };
  assert.equal(registry.hasLibraryMetadata('other'), false);
});

test('metadata registry size property', () => {
  const registry = createLibraryMetadataRegistry();

  assert.equal(registry.size, 0);

  registry.registerLibraryMetadata('demo', {
    name: 'demo',
    description: 'Demo.',
    targets: ['cli'],
    functions: {}
  });

  assert.equal(registry.size, 1);
});
