const libraries = [
  {
    name: 'time',
    description: 'Time and clock sources.',
    targets: ['cli', 'scenesync']
  },
  {
    name: 'math',
    description: 'Math and signal functions.',
    targets: ['cli', 'scenesync']
  },
  {
    name: 'scene',
    description: 'Scene behavior sinks and Scene Sync graph functions.',
    targets: ['scenesync']
  },
  {
    name: 'console',
    description: 'Console output functions.',
    targets: ['cli']
  }
];

const libraryMembers = {
  time: [
    {
      label: 'serverClock()',
      insertText: 'serverClock()',
      topLevelInsertText: 'time.serverClock()',
      detail: 'time.serverClock()',
      documentation: 'Returns the host-provided graph-local time (env.time).',
      namedArgs: []
    }
  ],
  math: [
    {
      label: 'sine(...)',
      insertText: 'sine(${1:t}, freq: ${2:1}, amplitude: ${3:1}, phase: ${4:0}, offset: ${5:0})',
      topLevelInsertText: 'math.sine(${1:t}, freq: ${2:1}, amplitude: ${3:1}, phase: ${4:0}, offset: ${5:0})',
      detail: 'math.sine(t, freq:, amplitude:, phase:, offset:)',
      documentation: 'Generate a sine wave value from an input signal.',
      namedArgs: ['freq', 'amplitude', 'phase', 'offset']
    }
  ],
  scene: [
    {
      label: 'setPosition(...)',
      insertText: 'setPosition("${1:sample-cube}", x: ${2:0}, y: ${3:0.5}, z: ${4:0})',
      topLevelInsertText: 'scene.setPosition("${1:sample-cube}", x: ${2:0}, y: ${3:0.5}, z: ${4:0})',
      detail: 'scene.setPosition("objectId", x:, y:, z:)',
      documentation: 'Set a Scene Sync object position.',
      namedArgs: ['x', 'y', 'z']
    }
  ],
  console: [
    {
      label: 'log(...)',
      insertText: 'log(${1:value})',
      topLevelInsertText: 'console.log(${1:value})',
      detail: 'console.log(value)',
      documentation: 'Log a value to the host console.',
      namedArgs: []
    }
  ]
};

const topLevelSnippets = [
  {
    label: 'lissajous scene graph',
    detail: 'Starter snippet for Scene Sync motion',
    documentation: 'Creates a basic lissajous-style Scene Sync graph script.',
    insertText: [
      'import time',
      'import math',
      'import scene',
      '',
      't = time.serverClock()',
      '',
      'x = math.sine(t, freq: 0.3, amplitude: 1, offset: 0)',
      'y = math.sine(t, freq: 0.5, amplitude: 1, offset: 0.5)',
      '',
      'scene.setPosition("sample-cube", x: x, y: y, z: 0)'
    ].join('\n')
  }
];

module.exports = {
  libraries,
  libraryMembers,
  topLevelSnippets
};
