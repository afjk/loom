export const presets = {
  lissajous: {
    label: "Lissajous 曲線",
    graph: {
      nodes: [
        { id: "timer", type: "clock" },
        { id: "sineX", type: "sine", params: { freq: 0.3, amplitude: 1 } },
        { id: "cosineY", type: "cosine", params: { freq: 0.5, amplitude: 1 } },
        { id: "mapX", type: "map", params: { inMin: -1, inMax: 1, outMin: 100, outMax: 700 } },
        { id: "mapY", type: "map", params: { inMin: -1, inMax: 1, outMin: 50, outMax: 450 } }
      ],
      edges: [
        { from: "timer.t", to: "sineX.t" },
        { from: "timer.t", to: "cosineY.t" },
        { from: "sineX.out", to: "mapX.value" },
        { from: "cosineY.out", to: "mapY.value" }
      ],
      render: {
        type: "point",
        x: "mapX.out",
        y: "mapY.out",
        color: "#00ff00",
        trail: 0.05
      }
    },
    dsl: `timer = clock()
sineX = sine(timer, freq: 0.3)
cosineY = cosine(timer, freq: 0.5)
mapX = map(sineX, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(cosineY, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#00ff00", trail: 0.05)
`
  },

  circular: {
    label: "円運動",
    graph: {
      nodes: [
        { id: "timer", type: "clock" },
        { id: "sineX", type: "sine", params: { freq: 0.5, amplitude: 1 } },
        { id: "cosineY", type: "cosine", params: { freq: 0.5, amplitude: 1 } },
        { id: "mapX", type: "map", params: { inMin: -1, inMax: 1, outMin: 100, outMax: 700 } },
        { id: "mapY", type: "map", params: { inMin: -1, inMax: 1, outMin: 50, outMax: 450 } }
      ],
      edges: [
        { from: "timer.t", to: "sineX.t" },
        { from: "timer.t", to: "cosineY.t" },
        { from: "sineX.out", to: "mapX.value" },
        { from: "cosineY.out", to: "mapY.value" }
      ],
      render: {
        type: "point",
        x: "mapX.out",
        y: "mapY.out",
        color: "#ff00ff",
        trail: 0.05
      }
    },
    dsl: `timer = clock()
sineX = sine(timer, freq: 0.5)
cosineY = cosine(timer, freq: 0.5)
mapX = map(sineX, inMin: -1, inMax: 1, outMin: 100, outMax: 700)
mapY = map(cosineY, inMin: -1, inMax: 1, outMin: 50, outMax: 450)

render point(x: mapX, y: mapY, color: "#ff00ff", trail: 0.05)
`
  },

  "clamp-map": {
    label: "範囲リマップ（バー可視化）",
    graph: {
      nodes: [
        { id: "timer", type: "clock" },
        { id: "freqMap", type: "map", params: { inMin: 0, inMax: 30, outMin: 0.1, outMax: 5, clamp: true } },
        { id: "wave", type: "sine", params: { amplitude: 1 } },
        { id: "widthMap", type: "map", params: { inMin: -1, inMax: 1, outMin: 50, outMax: 750, clamp: false } }
      ],
      edges: [
        { from: "timer.t", to: "freqMap.value" },
        { from: "freqMap.out", to: "wave.freq" },
        { from: "timer.t", to: "wave.t" },
        { from: "wave.out", to: "widthMap.value" }
      ],
      render: {
        type: "bar",
        width: "widthMap.out",
        color: "#00ccff",
        height: 40
      }
    },
    dsl: `timer = clock()
freqMap = map(timer, inMin: 0, inMax: 30, outMin: 0.1, outMax: 5, clamp: true)
wave = sine(timer, freq: freqMap)
widthMap = map(wave, inMin: -1, inMax: 1, outMin: 50, outMax: 750)

render bar(width: widthMap, color: "#00ccff", height: 40)
`
  },

  "smoothstep-fade": {
    label: "smoothstep フェード",
    graph: {
      nodes: [
        { id: "timer", type: "clock" },
        { id: "mod", type: "mod", params: { a: 0, b: 4 } },
        { id: "smooth", type: "smoothstep", params: { x: 0, edge0: 1, edge1: 3 } },
        { id: "widthMap", type: "map", params: { inMin: 0, inMax: 1, outMin: 50, outMax: 600, clamp: false } }
      ],
      edges: [
        { from: "timer.t", to: "mod.a" },
        { from: "mod.out", to: "smooth.x" },
        { from: "smooth.out", to: "widthMap.value" }
      ],
      render: {
        type: "bar",
        width: "widthMap.out",
        color: "#ffaa00",
        height: 60
      }
    },
    dsl: `timer = clock()
mod = mod(timer, b: 4)
smooth = smoothstep(mod, edge0: 1, edge1: 3)
widthMap = map(smooth, inMin: 0, inMax: 1, outMin: 50, outMax: 600)

render bar(width: widthMap, color: "#ffaa00", height: 60)
`
  },

  "lerp-ping-pong": {
    label: "lerp 行き来",
    graph: {
      nodes: [
        { id: "timer", type: "clock" },
        { id: "sine", type: "sine", params: { freq: 0.3, amplitude: 0.5, offset: 0.5 } },
        { id: "lerp", type: "lerp", params: { a: 100, b: 700, t: 0.5 } }
      ],
      edges: [
        { from: "timer.t", to: "sine.t" },
        { from: "sine.out", to: "lerp.t" }
      ],
      render: {
        type: "point",
        x: "lerp.out",
        y: 250,
        color: "#ff6688",
        trail: 0.1
      }
    },
    dsl: `timer = clock()
sine = sine(timer, freq: 0.3, amplitude: 0.5, offset: 0.5)
lerp = lerp(a: 100, b: 700, t: sine)

render point(x: lerp, y: 250, color: "#ff6688", trail: 0.1)
`
  },

  "dom-transform-sink": {
    label: "DOM Transform Sink",
    previewMode: "dom-card",
    graph: {
      nodes: [
        { id: "t", type: "clock" },
        { id: "sx", type: "sine", params: { freq: 0.15, amplitude: 1 } },
        { id: "cy", type: "cosine", params: { freq: 0.12, amplitude: 1 } },
        { id: "scaleWave", type: "sine", params: { freq: 0.08, amplitude: 1 } },
        { id: "rotWave", type: "sine", params: { freq: 0.05, amplitude: 1 } },
        { id: "hueWave", type: "sine", params: { freq: 0.06, amplitude: 1 } },
        { id: "mapX", type: "map", params: { inMin: -1, inMax: 1, outMin: -120, outMax: 120 } },
        { id: "mapY", type: "map", params: { inMin: -1, inMax: 1, outMin: -80, outMax: 80 } },
        { id: "mapScale", type: "map", params: { inMin: -1, inMax: 1, outMin: 0.9, outMax: 1.15 } },
        { id: "mapRotate", type: "map", params: { inMin: -1, inMax: 1, outMin: -18, outMax: 18 } },
        { id: "mapGlow", type: "map", params: { inMin: -1, inMax: 1, outMin: 0.2, outMax: 0.75 } },
        { id: "mapHue", type: "map", params: { inMin: -1, inMax: 1, outMin: 180, outMax: 320 } },
        { id: "transform", type: "setTransform2D", params: { target: "#demo-card", unit: "px", rotateUnit: "deg" } },
        { id: "glow", type: "setCssVar", params: { target: "#demo-card", name: "glow" } },
        { id: "hue", type: "setCssVar", params: { target: "#demo-card", name: "--hue" } },
        { id: "text", type: "setText", params: { target: "#demo-readout" } }
      ],
      edges: [
        { from: "t.t", to: "sx.t" },
        { from: "t.t", to: "cy.t" },
        { from: "t.t", to: "scaleWave.t" },
        { from: "t.t", to: "rotWave.t" },
        { from: "t.t", to: "hueWave.t" },
        { from: "sx.out", to: "mapX.value" },
        { from: "cy.out", to: "mapY.value" },
        { from: "scaleWave.out", to: "mapScale.value" },
        { from: "rotWave.out", to: "mapRotate.value" },
        { from: "scaleWave.out", to: "mapGlow.value" },
        { from: "hueWave.out", to: "mapHue.value" },
        { from: "mapX.out", to: "transform.x" },
        { from: "mapY.out", to: "transform.y" },
        { from: "mapScale.out", to: "transform.scale" },
        { from: "mapRotate.out", to: "transform.rotate" },
        { from: "mapGlow.out", to: "glow.value" },
        { from: "mapHue.out", to: "hue.value" },
        { from: "mapHue.out", to: "text.value" }
      ]
    },
    dsl: `t = clock()
sx = sine(t, freq: 0.15)
cy = cosine(t, freq: 0.12)
scaleWave = sine(t, freq: 0.08)
rotWave = sine(t, freq: 0.05)
hueWave = sine(t, freq: 0.06)

mapX = map(sx, inMin: -1, inMax: 1, outMin: -120, outMax: 120)
mapY = map(cy, inMin: -1, inMax: 1, outMin: -80, outMax: 80)
mapScale = map(scaleWave, inMin: -1, inMax: 1, outMin: 0.9, outMax: 1.15)
mapRotate = map(rotWave, inMin: -1, inMax: 1, outMin: -18, outMax: 18)
mapGlow = map(scaleWave, inMin: -1, inMax: 1, outMin: 0.2, outMax: 0.75)
mapHue = map(hueWave, inMin: -1, inMax: 1, outMin: 180, outMax: 320)

transform = setTransform2D(x: mapX, y: mapY, scale: mapScale, rotate: mapRotate, target: "#demo-card")
glow = setCssVar(mapGlow, target: "#demo-card", name: "glow")
hue = setCssVar(mapHue, target: "#demo-card", name: "--hue")
text = setText(mapHue, target: "#demo-readout")
`
  },

  "threshold-class-sink": {
    label: "Threshold Class Sink",
    previewMode: "dom-meter",
    graph: {
      nodes: [
        { id: "t", type: "clock" },
        { id: "wave", type: "sine", params: { freq: 0.35, amplitude: 1 } },
        { id: "norm", type: "map", params: { inMin: -1, inMax: 1, outMin: 0, outMax: 1, clamp: true } },
        { id: "percent", type: "map", params: { inMin: 0, inMax: 1, outMin: 0, outMax: 100, clamp: true } },
        { id: "isHot", type: "greaterThan", params: { threshold: 0.7 } },
        { id: "fillWidth", type: "setStyle", params: { target: "#demo-fill", property: "width", unit: "%" } },
        { id: "hotClass", type: "setClass", params: { target: "#demo-lamp", className: "is-hot" } },
        { id: "label", type: "setText", params: { target: "#demo-lamp" } }
      ],
      edges: [
        { from: "t.t", to: "wave.t" },
        { from: "wave.out", to: "norm.value" },
        { from: "norm.out", to: "percent.value" },
        { from: "percent.out", to: "fillWidth.value" },
        { from: "norm.out", to: "isHot.value" },
        { from: "isHot.out", to: "hotClass.enabled" },
        { from: "percent.out", to: "label.value" }
      ]
    },
    dsl: `t = clock()
wave = sine(t, freq: 0.35)
norm = map(wave, inMin: -1, inMax: 1, outMin: 0, outMax: 1, clamp: true)
percent = map(norm, inMin: 0, inMax: 1, outMin: 0, outMax: 100, clamp: true)
isHot = greaterThan(norm, threshold: 0.7)

fillWidth = setStyle(percent, target: "#demo-fill", property: "width", unit: "%")
hotClass = setClass(enabled: isHot, target: "#demo-lamp", className: "is-hot")
label = setText(percent, target: "#demo-lamp")
`
  }
};
