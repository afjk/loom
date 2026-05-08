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
    names: ['render bar', 'bar'],
    label: 'render bar',
    signature: 'render bar(width, height?: number, y?: number, color?: string, trail?: number)',
    description: 'Draws a horizontal bar in the VS Code Runtime Preview canvas.',
    example: 'render bar(width: width, height: 48, color: "#80ed99")'
  },
  {
    names: ['render point', 'point'],
    label: 'render point',
    signature: 'render point(x, y, color?: string, trail?: number)',
    description: 'Draws a point in the VS Code Runtime Preview canvas. Add trail to leave motion traces.',
    example: 'render point(x: x, y: y, color: "#70d6ff", trail: 0.04)'
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
