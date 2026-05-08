const VSCODE_EXAMPLES = [
  {
    id: 'mouse-follower',
    label: 'Mouse Follower',
    description: 'input.mouseX/Y + render point',
    detail: 'Move the mouse over the preview canvas; the point follows it.',
    source: `# Mouse Follower
# Move the mouse over the Node Preview canvas.

import input

x = input.mouseX()
y = input.mouseY()

render point(x: x, y: y, radius: 7, color: "#70d6ff", trail: 0.2)
`
  },
  {
    id: 'mouse-paint',
    label: 'Mouse Paint',
    description: 'input.mouseDown + render point enabled',
    detail: 'Hold the mouse button down and draw on the preview canvas.',
    source: `# Mouse Paint
# Hold the mouse button down and draw on the preview canvas.

import input

x = input.mouseX()
y = input.mouseY()

render point(x: x, y: y, radius: 5, color: "#ff70a6", trail: 0, enabled: input.mouseDown())
`
  },
  {
    id: 'key-visualizer',
    label: 'Key Visualizer',
    description: 'input.key + Output Channel + canvas',
    detail: 'Click the preview, then press Space or Arrow keys to see key state.',
    source: `# Key Visualizer
# Click the preview canvas, then press Space or Arrow keys.
# Key states are shown on the canvas and written to View > Output > Loomlet.

import input
import console

space = input.key("Space")
left = input.key("ArrowLeft")
right = input.key("ArrowRight")
up = input.key("ArrowUp")
down = input.key("ArrowDown")

console.log(space)
render keys(space: space, left: left, right: right, up: up, down: down, trail: 0.18)
`
  },
  {
    id: 'bouncing-bar',
    label: 'Bouncing Bar',
    description: 'render bar',
    detail: 'A simple bar whose width moves with a sine wave.',
    source: `# Bouncing Bar
# The background canvas shows a moving bar.

t = clock()
wave = sine(t, freq: 0.8)
width = map(wave, inMin: -1, inMax: 1, outMin: 40, outMax: 320)

render bar(width: width, height: 48, color: "#80ed99")
`
  },
  {
    id: 'orbit-point',
    label: 'Orbit Point',
    description: 'render point',
    detail: 'A point moving around a circular path.',
    source: `# Orbit Point
# The background canvas shows a point moving in a circle.

t = clock()
xWave = sine(t, freq: 0.4)
yWave = cosine(t, freq: 0.4)

x = map(xWave, inMin: -1, inMax: 1, outMin: 80, outMax: 320)
y = map(yWave, inMin: -1, inMax: 1, outMin: 80, outMax: 240)

render point(x: x, y: y, color: "#ff70a6", trail: 0.08)
`
  },
  {
    id: 'lissajous-point',
    label: 'Lissajous Point',
    description: 'render point',
    detail: 'A looping point trail made from two different signal frequencies.',
    source: `# Lissajous Point
# The background canvas shows a looping path.

t = clock()
xWave = sine(t, freq: 0.7)
yWave = cosine(t, freq: 1.1)

x = map(xWave, inMin: -1, inMax: 1, outMin: 60, outMax: 360)
y = map(yWave, inMin: -1, inMax: 1, outMin: 60, outMax: 260)

render point(x: x, y: y, color: "#70d6ff", trail: 0.04)
`
  },
  {
    id: 'pulse-bar',
    label: 'Pulse Bar',
    description: 'render bar',
    detail: 'A bar that changes width and vertical position over time.',
    source: `# Pulse Bar
# The background canvas shows a bar changing width and position.

t = clock()
wave = sine(t, freq: 1.2)
width = map(wave, inMin: -1, inMax: 1, outMin: 20, outMax: 360)
y = map(wave, inMin: -1, inMax: 1, outMin: 100, outMax: 180)

render bar(width: width, y: y, height: 32, color: "#ffd166")
`
  },
  {
    id: 'console-log',
    label: 'Console Log',
    description: 'Output Channel + render bar',
    detail: 'Renders a moving bar and writes values to Output > Loomlet.',
    source: `# Console Log
# The moving bar renders in the WebView background.
# Values are written to View > Output > Loomlet.

import console
import math

t = clock()
wave = math.sine(t, freq: 0.5)
width = math.map(wave, inMin: -1, inMax: 1, outMin: 80, outMax: 520)

console.log(width)
render bar(width: width, height: 36, y: 180, color: "#4ec9b0", trail: 0.12)
`
  }
];

module.exports = { VSCODE_EXAMPLES };
