import { LIBRARY_COMPATIBILITY } from './runtime-targets.js';

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
        description: 'Returns the current server time.',
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
      negate: {
        name: 'negate',
        signature: 'negate(a: 0)',
        description: 'Negates a number.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'Number to negate.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = negate(a: 5)'
        ]
      },
      abs: {
        name: 'abs',
        signature: 'abs(a: 0)',
        description: 'Computes the absolute value of a number.',
        args: [
          {
            name: 'a',
            type: 'number',
            positional: false,
            description: 'Number.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = abs(a: -5)'
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
      greaterThan: {
        name: 'greaterThan',
        signature: 'greaterThan(a: 0, b: 0)',
        description: 'Compares if a > b.',
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
        returns: 'boolean',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = greaterThan(a: 5, b: 3)'
        ]
      },
      lessThan: {
        name: 'lessThan',
        signature: 'lessThan(a: 0, b: 0)',
        description: 'Compares if a < b.',
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
        returns: 'boolean',
        targets: LIBRARY_COMPATIBILITY.math.targets,
        examples: [
          'result = lessThan(a: 3, b: 5)'
        ]
      }
    }
  },
  state: {
    name: 'state',
    description: LIBRARY_COMPATIBILITY.state.description,
    targets: LIBRARY_COMPATIBILITY.state.targets,
    functions: {
      lowpass: {
        name: 'lowpass',
        signature: 'lowpass(value: 0, tau: 0.2, initial: 0)',
        description: 'Low-pass filter with exponential smoothing.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: true,
            description: 'Input value.'
          },
          {
            name: 'tau',
            type: 'number',
            positional: false,
            description: 'Time constant (larger = more smoothing).'
          },
          {
            name: 'initial',
            type: 'number',
            positional: false,
            description: 'Initial state value.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.state.targets,
        examples: [
          'smoothed = lowpass(input, tau: 0.5)'
        ]
      },
      delay1: {
        name: 'delay1',
        signature: 'delay1(value: 0, initial: 0)',
        description: 'Delays a value by one sample.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: true,
            description: 'Input value.'
          },
          {
            name: 'initial',
            type: 'number',
            positional: false,
            description: 'Initial state value.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.state.targets,
        examples: [
          'delayed = delay1(input)'
        ]
      },
      integrate: {
        name: 'integrate',
        signature: 'integrate(value: 0, initial: 0, min: null, max: null)',
        description: 'Integrates a value over time.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: true,
            description: 'Input value to integrate.'
          },
          {
            name: 'initial',
            type: 'number',
            positional: false,
            description: 'Initial state value.'
          },
          {
            name: 'min',
            type: 'number|null',
            positional: false,
            description: 'Minimum bound (optional).'
          },
          {
            name: 'max',
            type: 'number|null',
            positional: false,
            description: 'Maximum bound (optional).'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.state.targets,
        examples: [
          'integrated = integrate(velocity, initial: 0)'
        ]
      },
      smoothLerp: {
        name: 'smoothLerp',
        signature: 'smoothLerp(value: 0, rate: 5, initial: 0)',
        description: 'Exponentially smooths a value with a rate parameter.',
        args: [
          {
            name: 'value',
            type: 'number',
            positional: true,
            description: 'Input value.'
          },
          {
            name: 'rate',
            type: 'number',
            positional: false,
            description: 'Smoothing rate (higher = faster response).'
          },
          {
            name: 'initial',
            type: 'number',
            positional: false,
            description: 'Initial state value.'
          }
        ],
        returns: 'number',
        targets: LIBRARY_COMPATIBILITY.state.targets,
        examples: [
          'smoothed = smoothLerp(input, rate: 5)'
        ]
      }
    }
  },
  fs: {
    name: 'fs',
    description: LIBRARY_COMPATIBILITY.fs.description,
    status: 'planned',
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
