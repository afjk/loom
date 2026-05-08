const PREVIEW_HOST_NOTE = 'Currently supported by the VS Code Runtime Preview host. Other hosts may ignore or reject this until the capability is promoted into the shared runtime contract.';

const LIBRARY_REFERENCE = [
  {
    names: ['clock'],
    label: 'clock',
    signature: 'clock() -> number',
    description: 'A time source. In the VS Code Runtime Preview, it advances with the preview animation time.',
    example: 't = clock()'
  },
  {
    names: ['sine', 'math.sine'],
    label: 'sine',
    signature: 'sine(value, freq: number = 1, amplitude: number = 1) -> number',
    description: 'Returns a sine wave for the input value. Use freq to control the speed and amplitude to control the range.',
    example: 't = clock()\nwave = sine(t, freq: 0.8)'
  },
  {
    names: ['cosine', 'math.cosine'],
    label: 'cosine',
    signature: 'cosine(value, freq: number = 1, amplitude: number = 1) -> number',
    description: 'Returns a cosine wave for the input value. It is useful for circular and orbital motion when paired with sine.',
    example: 't = clock()\nx = sine(t, freq: 0.4)\ny = cosine(t, freq: 0.4)'
  },
  {
    names: ['map', 'math.map'],
    label: 'map',
    signature: 'map(value, inMin, inMax, outMin, outMax) -> number',
    description: 'Remaps a value from one numeric range to another. Commonly used to convert -1..1 waves into screen coordinates or sizes.',
    example: 'width = map(wave, inMin: -1, inMax: 1, outMin: 40, outMax: 320)'
  },
  {
    names: ['console.log'],
    label: 'console.log',
    signature: 'console.log(value)',
    description: 'Writes a value to the host output. In VS Code, values appear in View > Output > Loomlet.',
    example: 'console.log(width)'
  },
  {
    names: ['input.mouseX', 'mouseX'],
    label: 'input.mouseX',
    signature: 'input.mouseX() -> number',
    description: `Returns the current mouse X coordinate in the VS Code Runtime Preview canvas. ${PREVIEW_HOST_NOTE}`,
    example: 'import input\nx = input.mouseX()\nrender point(x: x, y: 120, radius: 7)'
  },
  {
    names: ['input.mouseY', 'mouseY'],
    label: 'input.mouseY',
    signature: 'input.mouseY() -> number',
    description: `Returns the current mouse Y coordinate in the VS Code Runtime Preview canvas. ${PREVIEW_HOST_NOTE}`,
    example: 'import input\ny = input.mouseY()\nrender point(x: 120, y: y, radius: 7)'
  },
  {
    names: ['input.mouseDown', 'mouseDown'],
    label: 'input.mouseDown',
    signature: 'input.mouseDown() -> boolean',
    description: `Returns true while the primary mouse button is pressed in the VS Code Runtime Preview. Use it with render point enabled to make simple drawing tools. ${PREVIEW_HOST_NOTE}`,
    example: 'import input\nx = input.mouseX()\ny = input.mouseY()\ndown = input.mouseDown()\nrender point(x: x, y: y, enabled: down, trail: 0)'
  },
  {
    names: ['input.key', 'key'],
    label: 'input.key',
    signature: 'input.key(code: string) -> boolean',
    description: `Returns true while a key is pressed in the VS Code Runtime Preview. Use KeyboardEvent.code values such as "Space", "ArrowLeft", "ArrowRight", "ArrowUp", and "ArrowDown". ${PREVIEW_HOST_NOTE}`,
    example: 'import input\nspace = input.key("Space")\nconsole.log(space)'
  },
  {
    names: ['render bar', 'bar'],
    label: 'render bar',
    signature: 'render bar(width, height?: number, y?: number, color?: string, trail?: number)',
    description: 'Draws a horizontal bar in the VS Code Runtime Preview canvas.',
    example: 'render bar(width: width, height: 48, color: "#80ed99")'
  },
  {
    names: ['render point', 'point'],
    label: 'render point',
    signature: 'render point(x, y, radius?: number, color?: string, trail?: number, enabled?: boolean)',
    description: 'Draws a point in the VS Code Runtime Preview canvas. Add trail to leave motion traces. Set enabled to false to skip drawing for the current frame.',
    example: 'render point(x: x, y: y, radius: 7, color: "#70d6ff", trail: 0.04)'
  },
  {
    names: ['render keys', 'keys'],
    label: 'render keys',
    signature: 'render keys(space?: boolean, left?: boolean, right?: boolean, up?: boolean, down?: boolean, trail?: number)',
    description: `Draws a simple Space/Arrow key state visualizer in the VS Code Runtime Preview canvas. ${PREVIEW_HOST_NOTE}`,
    example: 'import input\nspace = input.key("Space")\nleft = input.key("ArrowLeft")\nright = input.key("ArrowRight")\nup = input.key("ArrowUp")\ndown = input.key("ArrowDown")\nrender keys(space: space, left: left, right: right, up: up, down: down)'
  }
];

const ALIAS_TO_REFERENCE = new Map();
for (const entry of LIBRARY_REFERENCE) {
  for (const name of entry.names) {
    ALIAS_TO_REFERENCE.set(name, entry);
  }
}

function getLibraryReference(name) {
  return ALIAS_TO_REFERENCE.get(name) || null;
}

module.exports = {
  LIBRARY_REFERENCE,
  getLibraryReference
};
