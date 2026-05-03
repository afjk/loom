import { autocompletion } from '@codemirror/autocomplete';
import { NODE_TYPES } from '../../src/loom.js';

function getDefinedIdentifiers(text, beforePos) {
  const ids = new Set();
  const lines = text.substring(0, beforePos).split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    if (match) ids.add(match[1]);
  }
  return Array.from(ids);
}

function nodeInfo(name) {
  const nt = NODE_TYPES[name];
  if (!nt) return null;
  return () => {
    const dom = document.createElement('div');
    dom.style.padding = '4px';
    dom.style.fontSize = '12px';
    dom.innerHTML = `
      <strong>${name}</strong> <em>(${nt.category || 'node'})</em><br>
      Inputs: ${(nt.inputs || []).map(p => p.name).join(', ') || 'none'}<br>
      Params: ${(nt.params || []).map(p => p.name).join(', ') || 'none'}<br>
      Outputs: ${(nt.outputs || []).map(p => p.name).join(', ') || 'none'}
    `;
    return dom;
  };
}

function dslCompletionSource(context) {
  const text = context.state.doc.toString();
  const pos = context.pos;
  const beforeText = text.substring(0, pos);
  const lineStart = beforeText.lastIndexOf('\n') + 1;
  const lineSoFar = beforeText.substring(lineStart);

  // Parameter name completion: inside a function call
  const callMatch = lineSoFar.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*$/);
  if (callMatch) {
    const funcName = callMatch[1];
    const nodeType = NODE_TYPES[funcName];
    if (nodeType) {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      const paramOptions = [
        ...(nodeType.inputs || []).map(p => ({ label: p.name + ': ', type: 'property', detail: 'input' })),
        ...(nodeType.params || []).map(p => ({ label: p.name + ': ', type: 'property', detail: 'param' }))
      ];
      const idents = getDefinedIdentifiers(text, pos);
      const identOptions = idents.map(id => ({ label: id, type: 'variable' }));
      return {
        from: word.from,
        options: [...paramOptions, ...identOptions],
        validFor: /^\w*$/
      };
    }
  }

  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  // After render keyword: only point, bar
  if (lineSoFar.match(/^\s*render\s+\w*$/)) {
    return {
      from: word.from,
      options: [
        { label: 'point', type: 'function', detail: 'render: point' },
        { label: 'bar', type: 'function', detail: 'render: bar' }
      ],
      validFor: /^\w*$/
    };
  }

  // Node type + identifier completion
  const nodeOptions = Object.keys(NODE_TYPES).map(name => ({
    label: name,
    type: 'function',
    detail: NODE_TYPES[name].category || 'node',
    info: nodeInfo(name)
  }));

  const idents = getDefinedIdentifiers(text, pos);
  const identOptions = idents.map(id => ({ label: id, type: 'variable' }));

  return {
    from: word.from,
    options: [...nodeOptions, ...identOptions],
    validFor: /^\w*$/
  };
}

export const dslCompletion = autocompletion({
  override: [dslCompletionSource]
});
