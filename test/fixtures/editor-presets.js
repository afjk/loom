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
  }
};
