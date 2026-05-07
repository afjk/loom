import {
  graphToEditorModel,
  editorModelToGraph,
  applyEditorOperation
} from './loom-editor-model.js';

export function createNodeEditorState(graph) {
  const editorModel = graphToEditorModel(graph);
  return {
    graph,
    editorModel,
    errors: []
  };
}

export function applyNodeEditorOperationState(state, operation) {
  try {
    const editorModel = applyEditorOperation(state.editorModel, operation);
    const graph = editorModelToGraph(editorModel, state.graph);

    return {
      state: {
        ...state,
        editorModel,
        graph,
        errors: []
      },
      change: {
        operation,
        graphChanged: true,
        shouldRerenderView: operation.type !== 'moveNode'
      },
      error: null
    };
  } catch (error) {
    return {
      state: {
        ...state,
        errors: [
          {
            code: 'EDITOR_ERROR',
            message: `Operation error: ${error.message}`
          }
        ]
      },
      change: {
        operation,
        graphChanged: false,
        shouldRerenderView: operation.type !== 'moveNode'
      },
      error
    };
  }
}
