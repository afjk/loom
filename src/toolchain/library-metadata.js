export const LIBRARY_METADATA = {
  text: {
    name: 'text',
    description: 'Text transform functions.',
    targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
        examples: [
          'message = text.replace("hello world", search: "world", replacement: "loom")',
          'console.log(message)'
        ]
      }
    }
  },
  json: {
    name: 'json',
    description: 'JSON parsing and stringification.',
    targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
        examples: [
          'data = {name: "loom", version: 1}',
          'message = json.stringify(data, pretty: true)',
          'console.log(message)'
        ]
      }
    }
  },
  console: {
    name: 'console',
    description: 'CLI console output.',
    targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
        examples: [
          'console.error("this is an error")'
        ]
      }
    }
  },
  scene: {
    name: 'scene',
    description: 'Scene effect sinks.',
    targets: ['any'],
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
        targets: ['any'],
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
        targets: ['any'],
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
        targets: ['any'],
        examples: [
          'scene.setScale("sample-cube", x: 2, y: 2, z: 2)'
        ]
      }
    }
  },
  time: {
    name: 'time',
    description: 'Time sources.',
    targets: ['cli', 'any'],
    functions: {
      serverClock: {
        name: 'serverClock',
        signature: 'time.serverClock()',
        description: 'Returns the current server time.',
        args: [],
        returns: 'number',
        targets: ['cli', 'any'],
        examples: [
          't = time.serverClock()',
          'console.log(t)'
        ]
      }
    }
  },
  math: {
    name: 'math',
    description: 'Math and signal transforms.',
    targets: ['cli', 'any'],
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
        targets: ['cli', 'any'],
        examples: [
          't = time.serverClock()',
          'y = math.sine(t, freq: 0.2, amplitude: 2, offset: 0)'
        ]
      },
      add: {
        name: 'add',
        signature: 'add(a: 0, b: 0) or math.add(a: 0, b: 0)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = add(a: 5, b: 3)',
          'console.log(result)'
        ]
      },
      multiply: {
        name: 'multiply',
        signature: 'multiply(a: 1, b: 1) or math.multiply(a: 1, b: 1)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = multiply(a: 5, b: 3)',
          'console.log(result)'
        ]
      },
      subtract: {
        name: 'subtract',
        signature: 'subtract(a: 0, b: 0) or math.subtract(a: 0, b: 0)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = subtract(a: 5, b: 3)',
          'console.log(result)'
        ]
      },
      divide: {
        name: 'divide',
        signature: 'divide(a: 0, b: 1) or math.divide(a: 0, b: 1)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = divide(a: 6, b: 2)',
          'console.log(result)'
        ]
      },
      mod: {
        name: 'mod',
        signature: 'mod(a: 0, b: 1) or math.mod(a: 0, b: 1)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = mod(a: 7, b: 3)',
          'console.log(result)'
        ]
      },
      clamp: {
        name: 'clamp',
        signature: 'clamp(value: 0, min: 0, max: 1) or math.clamp(value: 0, min: 0, max: 1)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = clamp(value: 5, min: 0, max: 10)',
          'console.log(result)'
        ]
      },
      map: {
        name: 'map',
        signature: 'map(value: 0, inMin: 0, inMax: 1, outMin: 0, outMax: 1, clamp: false) or math.map(...)',
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
        targets: ['cli', 'any'],
        examples: [
          'result = map(value: 0.5, inMin: 0, inMax: 1, outMin: 0, outMax: 10)',
          'console.log(result)'
        ]
      }
    }
  }
};
