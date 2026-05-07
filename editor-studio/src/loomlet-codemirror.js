import { StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { EditorView } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';

// Create a set of valid node/function names from metadata
function createNodeTypeNameSet(nodeTypes = {}) {
  return new Set(Object.keys(nodeTypes || {}));
}

// Extract parameter names for a specific node type
function getParamNamesForNode(nodeTypes = {}, nodeName) {
  const nodeType = nodeTypes[nodeName];
  if (!nodeType || !nodeType.params) {
    return [];
  }
  return nodeType.params.map(p => p.name);
}

// Simple stream language parser for Loomlet DSL
function createLoomletStreamLanguage(nodeTypes = {}) {
  const nodeNames = createNodeTypeNameSet(nodeTypes);
  const KEYWORDS = new Set(['render', 'true', 'false']);

  return StreamLanguage.define({
    token(stream, state) {
      // Skip whitespace
      if (stream.eatSpace()) return null;

      // Comments: # or //
      if (stream.match(/#/) || stream.match(/\/\//)) {
        stream.skipToEnd();
        return 'comment';
      }

      // Strings: "..." or '...'
      if (stream.match(/"(?:\\.|[^"\\])*"/) || stream.match(/'(?:\\.|[^'\\])*'/)) {
        return 'string';
      }

      // Numbers: decimals and integers
      if (stream.match(/-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)) {
        return 'number';
      }

      // Operators: pipe |>, assignment =
      if (stream.match(/\|>/) || stream.match(/=/)) {
        return 'operator';
      }

      // Named parameters: identifier followed by ':'
      if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*(?=:)/)) {
        return 'propertyName';
      }

      // Word tokens (identifiers, keywords, node names)
      if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
        const text = stream.current();

        if (KEYWORDS.has(text)) {
          return 'keyword';
        }

        if (nodeNames.has(text)) {
          return 'function';
        }

        // Check if this is a variable definition (word followed by =)
        const savedPos = stream.pos;
        stream.eatSpace();
        const nextChar = stream.peek();
        stream.pos = savedPos;

        if (nextChar === '=') {
          return 'definition';
        }

        return 'variable';
      }

      // Single character tokens like () [] {}
      stream.next();
      return null;
    }
  });
}

// Highlight style for Loomlet DSL
const loomletHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#ffcb6b' },
  { tag: tags.function(tags.variableName), color: '#82aaff' },
  { tag: tags.definition(tags.variableName), color: '#c3e88d' },
  { tag: tags.propertyName, color: '#f78c6c' },
  { tag: tags.number, color: '#f78c6c' },
  { tag: tags.string, color: '#c3e88d' },
  { tag: tags.comment, color: '#676e95', fontStyle: 'italic' },
  { tag: tags.operator, color: '#89ddff' },
  { tag: tags.bool, color: '#ff5370' }
]);

// Editor theme with visible white cursor
const loomletEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: '#f5f5f5',
    backgroundColor: 'transparent'
  },
  '.cm-scroller': {
    overflow: 'auto',
    backgroundColor: 'transparent'
  },
  '.cm-content': {
    caretColor: '#ffffff',
    fontFamily: 'Monaco, Menlo, Consolas, monospace',
    fontSize: '13px'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#ffffff !important'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#ffffff !important'
  },
  '.cm-gutters': {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    color: 'rgba(255, 255, 255, 0.45)',
    borderRight: '1px solid rgba(255, 255, 255, 0.10)'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(120, 170, 255, 0.35) !important'
  },
  '.cm-tooltip': {
    backgroundColor: 'rgba(24, 24, 24, 0.96)',
    color: '#f5f5f5',
    border: '1px solid rgba(255, 255, 255, 0.16)'
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'rgba(120, 170, 255, 0.28)',
    color: '#ffffff'
  }
});

// Find the nearest function call name before the cursor
function findNearestCallNameBefore(docText, cursorPos) {
  const beforeCursor = docText.slice(0, cursorPos);
  const matches = [...beforeCursor.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)];
  if (!matches.length) return null;
  return matches[matches.length - 1][1];
}

// Completion source for node/function names and parameters
function loomletCompletionSource(context, nodeTypes = {}) {
  const nodeNames = createNodeTypeNameSet(nodeTypes);

  // Get the word before the cursor
  const before = context.matchBefore(/\w*/);
  if (!before || (before.from === before.to && !context.explicit)) {
    return null;
  }

  const word = before.text.toLowerCase();
  const start = before.from;

  // Check if we're inside a function call
  const docText = context.state.doc.toString();
  const line = context.state.doc.lineAt(context.pos);
  const textBeforeOnLine = line.text.slice(0, context.pos - line.from);
  const hasOpenParenOnLine = textBeforeOnLine.includes('(');

  // Try parameter completion if we're inside a function call
  if (hasOpenParenOnLine) {
    const callName = findNearestCallNameBefore(docText, context.pos);
    if (callName) {
      const paramOptions = getParamCompletionOptionsForNode(nodeTypes, callName)
        .filter((option) => option.label.toLowerCase().startsWith(word));

      if (paramOptions.length > 0) {
        return {
          from: start,
          options: paramOptions
        };
      }
    }
  }

  const completions = [];

  // Function/node completion
  for (const name of nodeNames) {
    if (name.toLowerCase().startsWith(word)) {
      const nodeType = nodeTypes[name];
      const category = nodeType?.category || '';
      const description = nodeType?.description || '';

      completions.push({
        label: name,
        type: 'function',
        detail: category,
        info: description,
        apply: `${name}()`
      });
    }
  }

  // Keyword completion
  const KEYWORDS = ['render', 'true', 'false'];
  for (const kw of KEYWORDS) {
    if (kw.startsWith(word)) {
      completions.push({
        label: kw,
        type: 'keyword'
      });
    }
  }

  if (completions.length === 0) {
    return null;
  }

  return {
    from: start,
    options: completions
  };
}

// Helper functions for testing
export function createNodeCompletionOptions(nodeTypes = {}) {
  const nodeNames = createNodeTypeNameSet(nodeTypes);
  const options = [];

  for (const name of nodeNames) {
    const nodeType = nodeTypes[name];
    const category = nodeType?.category || '';

    options.push({
      label: name,
      type: 'function',
      detail: category,
      info: nodeType?.description || ''
    });
  }

  return options;
}

export function getParamCompletionOptionsForNode(nodeTypes = {}, nodeName) {
  const paramNames = getParamNamesForNode(nodeTypes, nodeName);
  return paramNames.map(name => ({
    label: name,
    type: 'property',
    apply: `${name}: `
  }));
}

export { findNearestCallNameBefore };

// Main export: return array of CodeMirror extensions
export function loomletDslExtensions({ nodeTypes } = {}) {
  const extensions = [
    createLoomletStreamLanguage(nodeTypes),
    syntaxHighlighting(loomletHighlightStyle),
    loomletEditorTheme,
    autocompletion({
      override: [
        (context) => loomletCompletionSource(context, nodeTypes)
      ],
      activateOnTyping: true
    })
  ];

  return extensions;
}
