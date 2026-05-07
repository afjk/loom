const EDITOR_METADATA_PREFIX = '# @loomlet.editor ';

export function extractEditorMetadataFromDsl(sourceText) {
  if (typeof sourceText !== 'string') {
    return { textWithoutMetadata: sourceText, metadata: null };
  }

  const lines = sourceText.split('\n');
  let metadataLine = null;
  let metadataLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(EDITOR_METADATA_PREFIX)) {
      metadataLine = lines[i];
      metadataLineIndex = i;
      break;
    }
    if (trimmed && !trimmed.startsWith('#')) {
      break;
    }
  }

  if (!metadataLine) {
    return { textWithoutMetadata: sourceText, metadata: null };
  }

  const jsonStr = metadataLine.substring(metadataLine.indexOf(EDITOR_METADATA_PREFIX) + EDITOR_METADATA_PREFIX.length);
  let metadata = null;

  try {
    metadata = JSON.parse(jsonStr);
  } catch (err) {
    return { textWithoutMetadata: sourceText, metadata: null };
  }

  const textLines = lines.slice(0, metadataLineIndex);
  const textWithoutMetadata = textLines.join('\n').trimEnd() + (textLines.length > 0 ? '\n' : '');

  return { textWithoutMetadata, metadata };
}

export function appendEditorMetadataToDsl(sourceText, metadata) {
  if (!metadata || typeof sourceText !== 'string') {
    return sourceText;
  }

  const { textWithoutMetadata } = extractEditorMetadataFromDsl(sourceText);
  const metadataJson = JSON.stringify(metadata);
  const metadataLine = EDITOR_METADATA_PREFIX + metadataJson;

  const text = textWithoutMetadata.trimEnd();
  return text.length > 0 ? `${text}\n\n${metadataLine}\n` : `${metadataLine}\n`;
}

export function createEditorLayoutMetadata(editorModel) {
  if (!editorModel || !editorModel.nodesById) {
    return { version: 1, layout: { nodes: {} } };
  }

  const nodes = {};

  for (const [id, node] of Object.entries(editorModel.nodesById)) {
    if (
      Number.isFinite(node.position?.x) &&
      Number.isFinite(node.position?.y)
    ) {
      nodes[id] = {
        x: node.position.x,
        y: node.position.y
      };

      if (node.label) {
        nodes[id].label = node.label;
      }

      if (node.comment) {
        nodes[id].comment = node.comment;
      }
    }
  }

  return {
    version: 1,
    layout: { nodes }
  };
}

export function applyLayoutMetadataToEditorModel(editorModel, metadata) {
  if (!editorModel || !metadata) {
    return editorModel;
  }

  const layoutNodes = metadata?.layout?.nodes || {};
  const nodesById = {};

  for (const [id, node] of Object.entries(editorModel.nodesById || {})) {
    const position = layoutNodes[id];
    const updates = { ...node };

    if (
      Number.isFinite(position?.x) &&
      Number.isFinite(position?.y)
    ) {
      updates.position = { x: position.x, y: position.y };
    }

    if (position?.label) {
      updates.label = position.label;
    }

    if (position?.comment) {
      updates.comment = position.comment;
    }

    nodesById[id] = updates;
  }

  return {
    ...editorModel,
    nodesById
  };
}

export function stripEditorMetadataFromDsl(sourceText) {
  const { textWithoutMetadata } = extractEditorMetadataFromDsl(sourceText);
  return textWithoutMetadata;
}
