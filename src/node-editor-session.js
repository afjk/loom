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

function rewriteReferenceValue(value, oldId, newId) {
  if (typeof value === 'string') {
    if (value === oldId) return newId;
    if (value.startsWith(`${oldId}.`)) {
      return `${newId}${value.slice(oldId.length)}`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteReferenceValue(item, oldId, newId));
  }

  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = rewriteReferenceValue(child, oldId, newId);
    }
    return next;
  }

  return value;
}

function rewriteGraphReferencesForRename(graph, oldId, newId) {
  return {
    ...graph,
    render: rewriteReferenceValue(graph.render, oldId, newId)
  };
}

export function applyNodeEditorOperationState(state, operation) {
  try {
    const editorModel = applyEditorOperation(state.editorModel, operation);

    // For metadata-only operations, don't regenerate the graph
    if (operation.type === 'updateNodeMetadata') {
      return {
        state: {
          ...state,
          editorModel,
          errors: []
        },
        change: {
          operation,
          graphChanged: false,
          shouldRerenderView: true,
          affectsDsl: false
        },
        error: null
      };
    }

    let graph = editorModelToGraph(editorModel, state.graph);

    if (operation.type === 'renameNode') {
      graph = rewriteGraphReferencesForRename(graph, operation.id, operation.newId);
    }

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
        shouldRerenderView: operation.type !== 'moveNode',
        affectsDsl: operation.type !== 'moveNode'
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
