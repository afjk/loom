// Reduce a frame's worth of runtime scene.* effects into a per-object transform
// state, suitable for driving a 3D preview (one cube per objectId). This is the
// pure, testable core of the editor's 3D Scene Preview: the three.js layer only
// consumes the plain objects produced here.
//
// Scene effects are produced by src/nodes/scene.js, e.g.
//   { type: 'scene.setPosition', target: 'scenesync', objectId, position: [x,y,z] }
// Within a single frame, later effects on the same object override earlier ones.

const SCENE_EFFECT_TYPES = new Set([
  'scene.offsetPosition',
  'scene.setPosition',
  'scene.setRotation',
  'scene.setScale',
  'scene.setColor',
  'scene.setVisible'
]);

export function isScenePreviewEffect(effect) {
  return (
    !!effect &&
    typeof effect === 'object' &&
    effect.target === 'scenesync' &&
    SCENE_EFFECT_TYPES.has(effect.type)
  );
}

export function createDefaultObjectState() {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
    color: null,
    visible: true
  };
}

function toNumbers(value, length, fallback) {
  if (!Array.isArray(value)) return fallback.slice();
  const out = [];
  for (let i = 0; i < length; i++) {
    const n = Number(value[i]);
    out.push(Number.isFinite(n) ? n : fallback[i]);
  }
  return out;
}

function applyEffect(state, effect) {
  switch (effect.type) {
    // The editor preview has no notion of an object's existing world position,
    // so an offset from base is previewed relative to the origin.
    case 'scene.offsetPosition':
      state.position = toNumbers(effect.offset, 3, [0, 0, 0]);
      break;
    case 'scene.setPosition':
      state.position = toNumbers(effect.position, 3, [0, 0, 0]);
      break;
    case 'scene.setRotation':
      state.rotation = toNumbers(effect.rotation, 4, [0, 0, 0, 1]);
      break;
    case 'scene.setScale':
      state.scale = toNumbers(effect.scale, 3, [1, 1, 1]);
      break;
    case 'scene.setColor':
      state.color = toNumbers(effect.color, 3, [1, 1, 1]);
      break;
    case 'scene.setVisible':
      state.visible = effect.visible !== false;
      break;
    default:
      break;
  }
}

export function reduceSceneEffectsToObjects(effects) {
  const objects = {};
  if (!Array.isArray(effects)) return objects;

  for (const effect of effects) {
    if (!isScenePreviewEffect(effect)) continue;

    const objectId =
      typeof effect.objectId === 'string' && effect.objectId.length > 0
        ? effect.objectId
        : '(unnamed)';

    if (!objects[objectId]) {
      objects[objectId] = createDefaultObjectState();
    }
    applyEffect(objects[objectId], effect);
  }

  return objects;
}

// True when a graph contains any scene.* sink node, i.e. the 3D Scene Preview
// is the right surface for it (vs the 2D render point/bar canvas).
export function graphHasSceneNodes(graph) {
  if (!graph || !Array.isArray(graph.nodes)) return false;
  return graph.nodes.some((node) => SCENE_EFFECT_TYPES.has(node?.type));
}
