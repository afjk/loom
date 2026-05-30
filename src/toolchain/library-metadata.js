import { LIBRARY_COMPATIBILITY } from './runtime-targets.js';
import { createLibraryMetadataRegistry as createLibraryMetadataRegistryInternal } from './metadata-registry.js';

export const createLibraryMetadataRegistry = createLibraryMetadataRegistryInternal;

export const LIBRARY_METADATA = {
  text: {
    name: 'text',
    description: LIBRARY_COMPATIBILITY.text.description,
    targets: LIBRARY_COMPATIBILITY.text.targets,
    functions: {
      upper: {
        name: 'upper',
        signature: 'text.upper(value)',
        description: 'Converts text to uppercase.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Input text.'
          }
        ],
        returns: 'string',
        targets: LIBRARY_COMPATIBILITY.text.targets,
        examples: [
          'message = text.upper("hello loom")',
          'console.log(message)'
        ]
      },
      lower: {
        name: 'lower',
        signature: 'text.lower(value)',
        description: 'Converts text to lowercase.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Input text.'
          }
        ],
        returns: 'string',
        targets: LIBRARY_COMPATIBILITY.text.targets,
        examples: [
          'message = text.lower("HELLO LOOM")',
          'console.log(message)'
        ]
      },
      trim: {
        name: 'trim',
        signature: 'text.trim(value)',
        description: 'Removes whitespace from both ends of text.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Input text.'
          }
        ],
        returns: 'string',
        targets: LIBRARY_COMPATIBILITY.text.targets,
        examples: [
          'message = text.trim("  hello loom  ")',
          'console.log(message)'
        ]
      },
      replace: {
        name: 'replace',
        signature: 'text.replace(value, search: "...", replacement: "...")',
        description: 'Replaces all occurrences of a substring.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Input text.'
          },
          {
            name: 'search',
            type: 'any',
            positional: false,
            description: 'Text to find and replace.'
          },
          {
            name: 'replacement',
            type: 'any',
            positional: false,
            description: 'Replacement text.'
          }
        ],
        returns: 'string',
        targets: LIBRARY_COMPATIBILITY.text.targets,
        examples: [
          'message = text.replace("hello world", search: "world", replacement: "loom")',
          'console.log(message)'
        ]
      }
    }
  },
  json: {
    name: 'json',
    description: LIBRARY_COMPATIBILITY.json.description,
    targets: LIBRARY_COMPATIBILITY.json.targets,
    functions: {
      parse: {
        name: 'parse',
        signature: 'json.parse(value)',
        description: 'Parses a JSON string into an object.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'JSON string to parse.'
          }
        ],
        returns: 'any',
        targets: LIBRARY_COMPATIBILITY.json.targets,
        examples: [
          'data = json.parse(\'{"name":"loom","version":1}\')',
          'console.log(data)'
        ]
      },
      stringify: {
        name: 'stringify',
        signature: 'json.stringify(value, pretty: false)',
        description: 'Converts a value to a JSON string.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Value to stringify.'
          },
          {
            name: 'pretty',
            type: 'boolean',
            positional: false,
            description: 'Format with indentation.'
          }
        ],
        returns: 'string',
        targets: LIBRARY_COMPATIBILITY.json.targets,
        examples: [
          'data = json.parse(\'{"name":"loom","version":1}\')',
          'message = json.stringify(data, pretty: true)',
          'console.log(message)'
        ]
      }
    }
  },
  console: {
    name: 'console',
    description: LIBRARY_COMPATIBILITY.console.description,
    targets: LIBRARY_COMPATIBILITY.console.targets,
    functions: {
      log: {
        name: 'log',
        signature: 'console.log(value)',
        description: 'Outputs a value to the console.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Value to output.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.console.targets,
        examples: [
          'message = "hello loom"',
          'console.log(message)'
        ]
      },
      warn: {
        name: 'warn',
        signature: 'console.warn(value)',
        description: 'Outputs a warning to the console.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Warning message.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.console.targets,
        examples: [
          'console.warn("this is a warning")'
        ]
      },
      error: {
        name: 'error',
        signature: 'console.error(value)',
        description: 'Outputs an error to the console.',
        args: [
          {
            name: 'value',
            type: 'any',
            positional: true,
            description: 'Error message.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.console.targets,
        examples: [
          'console.error("this is an error")'
        ]
      }
    }
  },
  scene: {
    name: 'scene',
    description: LIBRARY_COMPATIBILITY.scene.description,
    targets: LIBRARY_COMPATIBILITY.scene.targets,
    functions: {
      setPosition: {
        name: 'setPosition',
        signature: 'scene.setPosition(objectId: "...", x: 0, y: 0, z: 0)',
        description: 'Sets the position of a scene object.',
        args: [
          {
            name: 'objectId',
            type: 'string',
            positional: true,
            description: 'ID of the object.'
          },
          {
            name: 'x',
            type: 'number',
            positional: false,
            description: 'X coordinate.'
          },
          {
            name: 'y',
            type: 'number',
            positional: false,
            description: 'Y coordinate.'
          },
          {
            name: 'z',
            type: 'number',
            positional: false,
            description: 'Z coordinate.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.scene.targets,
        examples: [
          'scene.setPosition("sample-cube", x: 1, y: 0.5, z: 0)'
        ]
      },
      setRotation: {
        name: 'setRotation',
        signature: 'scene.setRotation(objectId: "...", x: 0, y: 0, z: 0, w: 1)',
        description: 'Sets the rotation of a scene object (quaternion).',
        args: [
          {
            name: 'objectId',
            type: 'string',
            positional: true,
            description: 'ID of the object.'
          },
          {
            name: 'x',
            type: 'number',
            positional: false,
            description: 'X component of quaternion.'
          },
          {
            name: 'y',
            type: 'number',
            positional: false,
            description: 'Y component of quaternion.'
          },
          {
            name: 'z',
            type: 'number',
            positional: false,
            description: 'Z component of quaternion.'
          },
          {
            name: 'w',
            type: 'number',
            positional: false,
            description: 'W component of quaternion.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.scene.targets,
        examples: [
          'scene.setRotation("sample-cube", x: 0, y: 0, z: 0, w: 1)'
        ]
      },
      setScale: {
        name: 'setScale',
        signature: 'scene.setScale(objectId: "...", x: 1, y: 1, z: 1)',
        description: 'Sets the scale of a scene object.',
        args: [
          {
            name: 'objectId',
            type: 'string',
            positional: true,
            description: 'ID of the object.'
          },
          {
            name: 'x',
            type: 'number',
            positional: false,
            description: 'X scale.'
          },
          {
            name: 'y',
            type: 'number',
            positional: false,
            description: 'Y scale.'
          },
          {
            name: 'z',
            type: 'number',
            positional: false,
            description: 'Z scale.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.scene.targets,
        examples: [
          'scene.setScale("sample-cube", x: 2, y: 2, z: 2)'
        ]
      },
      offsetPosition: {
        name: 'offsetPosition',
        signature: 'scene.offsetPosition(objectId: "...", x: 0, y: 0, z: 0)',
        description: 'Offsets the position of a scene object relative to its starting position.',
        args: [
          {
            name: 'objectId',
            type: 'string',
            positional: true,
            description: 'ID of the object.'
          },
          {
            name: 'x',
            type: 'number',
            positional: false,
            description: 'X offset.'
          },
          {
            name: 'y',
            type: 'number',
            positional: false,
            description: 'Y offset.'
          },
          {
            name: 'z',
            type: 'number',
            positional: false,
            description: 'Z offset.'
          }
        ],
        returns: 'void',
        targets: LIBRARY_COMPATIBILITY.scene.targets,
        examples: [
          'scene.offsetPosition("sample-cube", x: 1, y: 0.5, z: 0)'
        ]
      }
    }
  },
  time: {
    name: 'time',
    description: LIBRARY_COMPATIBILITY.time.description,
    targets: LIBRARY_COMPATIBILITY.time.targets,
    functions: {
      serverClock: {
        name: 'serverClock',
        signature: 'time.serverClock()',
        description: 'Returns the host-provided graph-local time (env.time).',
        args: [],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.time.targets,
        examples: [
          't = time.serverClock()',
          'console.log(t)'
        ]
      }
    }
  },
  math: {
    name: 'math',
    description: LIBRARY_COMPATIBILITY.math.description,
    targets: LIBRARY_COMPATIBILITY.math.targets,
    functions: {
      sine: {
        name: 'sine',
        signature: 'math.sine(t, freq: 1, amplitude: 1, offset: 0)',
        description: 'Computes a sine wave.',
        args: [
          {
            name: 't',
            type: 'number',
            positional: true,
            description: 'Time input.'
          },
          {
            name: 'freq',
            type: 'number',
            positional: false,
            description: 'Frequency.'
          },
          {
            name: 'amplitude',
            type: 'number',
            positional: false,
            description: 'Amplitude.'
          },
          {
            name: 'offset',
            type: 'number',
            positional: false,
            description: 'Vertical offset.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          't = time.serverClock()',
          'y = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)'
        ]
      },
      cosine: {
        name: 'cosine',
        signature: 'cosine(t, freq: 1, amplitude: 1, phase: 0, offset: 0)',
        description: 'Computes a cosine wave.',
        args: [
          {
            name: 't',
            type: 'number',
            positional: true,
            description: 'Time input.'
          },
          {
            name: 'freq',
            type: 'number',
            positional: false,
            description: 'Frequency.'
          },
          {
            name: 'amplitude',
            type: 'number',
            positional: false,
            description: 'Amplitude.'
          },
          {
            name: 'phase',
            type: 'number',
            positional: false,
            description: 'Phase offset in radians.'
          },
          {
            name: 'offset',
            type: 'number',
            positional: false,
            description: 'Vertical offset.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'y = cosine(t, freq: 1, amplitude: 1)'
        ]
      },
      add: {
        name: 'add',
        signature: 'add(a: 0, b: 0)',
        description: 'Adds two numbers.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'First number.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'Second number.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = add(a: 5, b: 3)'
        ]
      },
      multiply: {
        name: 'multiply',
        signature: 'multiply(a: 1, b: 1)',
        description: 'Multiplies two numbers.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'First number.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'Second number.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = multiply(a: 5, b: 3)'
        ]
      },
      subtract: {
        name: 'subtract',
        signature: 'subtract(a: 0, b: 0)',
        description: 'Subtracts two numbers.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'First number.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'Second number.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = subtract(a: 5, b: 3)'
        ]
      },
      divide: {
        name: 'divide',
        signature: 'divide(a: 0, b: 1)',
        description: 'Divides two numbers.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'Dividend.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'Divisor.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = divide(a: 6, b: 2)'
        ]
      },
      mod: {
        name: 'mod',
        signature: 'mod(a: 0, b: 1)',
        description: 'Computes the modulo (remainder) of two numbers.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'Dividend.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'Divisor.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = mod(a: 7, b: 3)'
        ]
      },
      clamp: {
        name: 'clamp',
        signature: 'clamp(value: 0, min: 0, max: 1)',
        description: 'Clamps a value between min and max.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Value to clamp.'
          },
          {
            name: 'min',
            type: 'number',
            positional: false,
            description: 'Minimum value.'
          },
          {
            name: 'max',
            type: 'number',
            positional: false,
            description: 'Maximum value.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = clamp(value: 5, min: 0, max: 10)'
        ]
      },
      map: {
        name: 'map',
        signature: 'map(value: 0, inMin: 0, inMax: 1, outMin: 0, outMax: 1, clamp: false)',
        description: 'Maps a value from one range to another.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Value to map.'
          },
          {
            name: 'inMin',
            type: 'number',
            positional: false,
            description: 'Input range minimum.'
          },
          {
            name: 'inMax',
            type: 'number',
            positional: false,
            description: 'Input range maximum.'
          },
          {
            name: 'outMin',
            type: 'number',
            positional: false,
            description: 'Output range minimum.'
          },
          {
            name: 'outMax',
            type: 'number',
            positional: false,
            description: 'Output range maximum.'
          },
          {
            name: 'clamp',
            type: 'boolean',
            positional: false,
            description: 'Clamp output to range.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = map(value: 0.5, inMin: 0, inMax: 1, outMin: 0, outMax: 10)'
        ]
      },
      abs: {
        name: 'abs',
        signature: 'math.abs(value: 0)',
        description: 'Computes the absolute value of a number.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: false,
            description: 'Number.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = math.abs(value: -5)'
        ]
      },
      lerp: {
        name: 'lerp',
        signature: 'lerp(a: 0, b: 1, t: 0)',
        description: 'Linear interpolation between two values.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'Start value.'
          },
          {
            name: 'b',
            type: 'number',
            positional: false,
            description: 'End value.'
          },
          {
            name: 't',
            type: 'number',
            positional: false,
            description: 'Interpolation factor (0 to 1).'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = lerp(a: 0, b: 10, t: 0.5)'
        ]
      },
      smoothstep: {
        name: 'smoothstep',
        signature: 'smoothstep(x: 0, edge0: 0, edge1: 1)',
        description: 'Smooth Hermite interpolation between 0 and 1.',
        args: [
          {
            name: 'x',
            type: 'number',
            positional: false,
            description: 'Input value.'
          },
          {
            name: 'edge0',
            type: 'number',
            positional: false,
            description: 'Lower edge.'
          },
          {
            name: 'edge1',
            type: 'number',
            positional: false,
            description: 'Upper edge.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = smoothstep(x: 0.5, edge0: 0, edge1: 1)'
        ]
      },
    }
  },
  fs: {
    name: 'fs',
    description: 'CLI-only file system access',
    status: 'implemented',
    targets: LIBRARY_COMPATIBILITY.fs.targets,
    functions: {}
  },
  dom: {
    name: 'dom',
    description: LIBRARY_COMPATIBILITY.dom.description,
    status: 'planned',
    targets: LIBRARY_COMPATIBILITY.dom.targets,
    functions: {}
  },
  canvas: {
    name: 'canvas',
    description: LIBRARY_COMPATIBILITY.canvas.description,
    status: 'planned',
    targets: LIBRARY_COMPATIBILITY.canvas.targets,
    functions: {}
  },
  three: {
    name: 'three',
    description: LIBRARY_COMPATIBILITY.three.description,
    status: 'planned',
    targets: LIBRARY_COMPATIBILITY.three.targets,
    functions: {}
  },
  unity: {
    name: 'unity',
    description: LIBRARY_COMPATIBILITY.unity.description,
    status: 'planned',
    targets: LIBRARY_COMPATIBILITY.unity.targets,
    functions: {}
  },
  scenesync: {
    name: 'scenesync',
    description: LIBRARY_COMPATIBILITY.scenesync.description,
    status: 'planned',
    targets: LIBRARY_COMPATIBILITY.scenesync.targets,
    functions: {}
  }
};

export function getAllLibraries() {
  return Object.keys(LIBRARY_METADATA).sort();
}

function makeFunctionMetadata(libraryName, functionName, signature, description, returns = 'any', status = 'implemented') {
  return {
    name: functionName,
    signature,
    description,
    args: [],
    returns,
    status,
    targets: LIBRARY_COMPATIBILITY[libraryName].targets,
    examples: [`${libraryName}.${functionName}()`]
  };
}

Object.assign(LIBRARY_METADATA.text.functions, {
  concat: makeFunctionMetadata('text', 'concat', 'text.concat(...values)', 'Converts values to strings and concatenates them.', 'string'),
  split: makeFunctionMetadata('text', 'split', 'text.split(value, separator: ",")', 'Splits text into a list.', 'array'),
  join: makeFunctionMetadata('text', 'join', 'text.join(list, separator: ",")', 'Joins a list into text.', 'string'),
  includes: makeFunctionMetadata('text', 'includes', 'text.includes(value, search: "...")', 'Returns true when text contains the search text.', 'boolean'),
  startsWith: makeFunctionMetadata('text', 'startsWith', 'text.startsWith(value, search: "...")', 'Returns true when text starts with the search text.', 'boolean'),
  endsWith: makeFunctionMetadata('text', 'endsWith', 'text.endsWith(value, search: "...")', 'Returns true when text ends with the search text.', 'boolean'),
  length: makeFunctionMetadata('text', 'length', 'text.length(value)', 'Returns string length after user-facing conversion.', 'number'),
  isEmpty: makeFunctionMetadata('text', 'isEmpty', 'text.isEmpty(value)', 'Returns true when converted text has zero length.', 'boolean'),
  stringify: makeFunctionMetadata('text', 'stringify', 'text.stringify(value)', 'Converts values to readable text; null and undefined become empty text.', 'string')
});

Object.assign(LIBRARY_METADATA.console.functions, {
  table: makeFunctionMetadata('console', 'table', 'console.table(value)', 'Outputs a table-shaped value to the host console when available.', 'void')
});

Object.assign(LIBRARY_METADATA.math.functions, {
  floor: makeFunctionMetadata('math', 'floor', 'math.floor(value)', 'Rounds down using Math.floor.', 'number'),
  ceil: makeFunctionMetadata('math', 'ceil', 'math.ceil(value)', 'Rounds up using Math.ceil.', 'number'),
  round: makeFunctionMetadata('math', 'round', 'math.round(value)', 'Rounds to nearest integer using Math.round.', 'number'),
  min: makeFunctionMetadata('math', 'min', 'math.min(a, b)', 'Returns the smaller of two numbers.', 'number'),
  max: makeFunctionMetadata('math', 'max', 'math.max(a, b)', 'Returns the larger of two numbers.', 'number'),
  tan: makeFunctionMetadata('math', 'tan', 'math.tan(value)', 'Returns tangent using Math.tan.', 'number'),
  sqrt: makeFunctionMetadata('math', 'sqrt', 'math.sqrt(value)', 'Returns square root using Math.sqrt.', 'number'),
  pow: makeFunctionMetadata('math', 'pow', 'math.pow(value, exponent: 2)', 'Raises value to exponent using Math.pow.', 'number')
});

LIBRARY_METADATA.logic = {
  name: 'logic',
  description: LIBRARY_COMPATIBILITY.logic.description,
  targets: LIBRARY_COMPATIBILITY.logic.targets,
  functions: Object.fromEntries([
    ['not', ['logic.not(value)', 'Boolean negation using JavaScript-style truthiness.', 'boolean']],
    ['and', ['logic.and(a, b)', 'Boolean AND using JavaScript-style truthiness, returned as a boolean.', 'boolean']],
    ['or', ['logic.or(a, b)', 'Boolean OR using JavaScript-style truthiness, returned as a boolean.', 'boolean']],
    ['equals', ['logic.equals(value, other: value)', 'Strict equality using Object.is.', 'boolean']],
    ['notEquals', ['logic.notEquals(value, other: value)', 'Inverse of logic.equals.', 'boolean']],
    ['greaterThan', ['logic.greaterThan(value, other: 0)', 'Numeric greater-than comparison.', 'boolean']],
    ['lessThan', ['logic.lessThan(value, other: 0)', 'Numeric less-than comparison.', 'boolean']],
    ['greaterOrEqual', ['logic.greaterOrEqual(value, other: 0)', 'Numeric greater-or-equal comparison.', 'boolean']],
    ['lessOrEqual', ['logic.lessOrEqual(value, other: 0)', 'Numeric less-or-equal comparison.', 'boolean']],
    ['select', ['logic.select(condition, whenTrue: value, whenFalse: value)', 'Returns whenTrue when condition is truthy using JavaScript-style truthiness, otherwise whenFalse.', 'any']],
    ['when', ['logic.when(condition, value: value)', 'Returns value when condition is truthy using JavaScript-style truthiness, otherwise null.', 'any']]
  ].map(([name, [signature, description, returns]]) => [name, makeFunctionMetadata('logic', name, signature, description, returns)]))
};

LIBRARY_METADATA.list = {
  name: 'list',
  description: LIBRARY_COMPATIBILITY.list.description,
  targets: LIBRARY_COMPATIBILITY.list.targets,
  functions: Object.fromEntries([
    ['of', ['list.of(...values)', 'Builds a list from up to eight positional values.', 'array', 'implemented']],
    ['range', ['list.range(start, end: 5)', 'Builds an inclusive ascending or descending numeric range.', 'array', 'implemented']],
    ['length', ['list.length(list)', 'Returns list length.', 'number', 'implemented']],
    ['at', ['list.at(list, index: 0)', 'Returns an item by index; negative indexes count from the end.', 'any', 'implemented']],
    ['first', ['list.first(list)', 'Returns first item or null.', 'any', 'implemented']],
    ['last', ['list.last(list)', 'Returns last item or null.', 'any', 'implemented']],
    ['map', ['list.map(list, fn: fn(value) => value)', 'Returns a new list by calling fn(item) for each item.', 'array', 'implemented']],
    ['filter', ['list.filter(list, fn: fn(value) => condition)', 'Returns items where fn(item) is truthy.', 'array', 'implemented']],
    ['reduce', ['list.reduce(list, fn: fn(acc, value) => next, initial: value)', 'Reduces items by calling fn(accumulator, item), starting with initial.', 'any', 'implemented']],
    ['join', ['list.join(list, separator: ",")', 'Joins list values into text.', 'string', 'implemented']],
    ['reverse', ['list.reverse(list)', 'Returns a new reversed list.', 'array', 'implemented']],
    ['sort', ['list.sort(list)', 'Returns a new sorted list; numbers sort numerically, otherwise by string.', 'array', 'implemented']],
    ['take', ['list.take(list, count: 2)', 'Returns the first count items.', 'array', 'implemented']],
    ['drop', ['list.drop(list, count: 2)', 'Drops the first count items.', 'array', 'implemented']],
    ['concat', ['list.concat(...lists)', 'Concatenates up to four lists.', 'array', 'implemented']]
  ].map(([name, [signature, description, returns, status]]) => [name, makeFunctionMetadata('list', name, signature, description, returns, status)]))
};

LIBRARY_METADATA.random = {
  name: 'random',
  description: LIBRARY_COMPATIBILITY.random.description,
  targets: LIBRARY_COMPATIBILITY.random.targets,
  functions: Object.fromEntries([
    ['value', ['random.value()', 'Returns Math.random() in [0, 1).', 'number', 'implemented']],
    ['range', ['random.range(min: 0, max: 1)', 'Returns a random float in [min, max).', 'number', 'implemented']],
    ['int', ['random.int(min: 1, max: 6)', 'Returns a random integer in inclusive [min, max].', 'number', 'implemented']],
    ['choice', ['random.choice(list)', 'Returns a random item or null for an empty list.', 'any', 'implemented']]
  ].map(([name, [signature, description, returns, status]]) => [name, makeFunctionMetadata('random', name, signature, description, returns, status)]))
};

LIBRARY_METADATA.debug = {
  name: 'debug',
  description: LIBRARY_COMPATIBILITY.debug.description,
  targets: LIBRARY_COMPATIBILITY.debug.targets,
  functions: Object.fromEntries([
    ['inspect', ['debug.inspect(value)', 'Returns a readable string representation.', 'string']],
    ['trace', ['debug.trace(value, label: "trace")', 'Records a trace effect and returns the original value.', 'any']],
    ['assert', ['debug.assert(condition, message: "Assertion failed")', 'Throws ASSERTION_FAILED when condition is false.', 'boolean']]
  ].map(([name, [signature, description, returns]]) => [name, makeFunctionMetadata('debug', name, signature, description, returns)]))
};


LIBRARY_METADATA.fs.functions = Object.fromEntries([
  ['readText', ['fs.readText(path: "file.txt")', 'CLI-only: reads UTF-8 text from the local filesystem.', 'string']],
  ['writeText', ['fs.writeText(path: "file.txt", value: "text")', 'CLI-only: writes UTF-8 text to the local filesystem.', 'void']],
  ['exists', ['fs.exists(path: "file.txt")', 'CLI-only: returns whether a local path exists.', 'boolean']],
  ['list', ['fs.list(path: ".")', 'CLI-only: returns filenames in a local directory.', 'array']]
].map(([name, [signature, description, returns]]) => [name, makeFunctionMetadata('fs', name, signature, description, returns)]));

export function createDefaultLibraryMetadataRegistry() {
  return createLibraryMetadataRegistry(LIBRARY_METADATA);
}

export const DEFAULT_LIBRARY_METADATA_REGISTRY = createDefaultLibraryMetadataRegistry();
