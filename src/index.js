export { Loom, NODE_TYPES } from './loom.js';
export { parseDSLToAST, compileToGraph } from './loom-dsl.js';
export { expandSubgraphs } from './runtime/subgraph-expand.js';
export {
  graphToEditorModel,
  subgraphBodyToEditorModel,
  editorModelToGraph,
  applyEditorOperation,
  preserveEditorModelLayout,
  findNonOverlappingPosition,
  layoutFallback,
  doRectsOverlap,
  makeNodeLayoutRect,
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  NODE_LAYOUT_GAP,
  NODE_LAYOUT_STEP_X,
  NODE_LAYOUT_STEP_Y,
  NODE_LAYOUT_MAX_ROWS,
  NODE_LAYOUT_MAX_COLS
} from './node-editor-core.js';
export {
  graphToCanonicalDSL,
  subgraphsToFnDefinitions
} from './canonical-dsl.js';

export {
  isScenePreviewEffect,
  createDefaultObjectState,
  reduceSceneEffectsToObjects,
  graphHasSceneNodes
} from './scenesync/preview-transform.js';

export {
  patchDslSourceForEditorOperation,
  patchOrCanonicalDslSource
} from './source-dsl-patch.js';
export {
  extractEditorMetadataFromDsl,
  appendEditorMetadataToDsl,
  createEditorLayoutMetadata,
  applyLayoutMetadataToEditorModel,
  stripEditorMetadataFromDsl
} from './editor-metadata.js';
export {
  CAPABILITY_VERSION,
  KNOWN_CAPABILITIES,
  HOST_CAPABILITIES,
  DETERMINISM_LEVELS,
  listHostProfiles,
  resolveNodeCapabilities,
  summarizeGraphCapabilities,
  checkHostCompatibility,
  describeGraphHostCompatibility
} from './runtime/capabilities.js';
