import { StreamLanguage, LanguageSupport } from '@codemirror/language';
import { NODE_TYPES } from '../../src/loom.js';

const NODE_NAMES = new Set(Object.keys(NODE_TYPES));
const KEYWORDS = new Set(['render', 'true', 'false']);
const RENDER_FUNCS = new Set(['point', 'bar']);

const dslStreamLanguage = StreamLanguage.define({
  name: 'loom-dsl',
  startState: () => ({}),
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/#.*/)) return 'comment';
    if (stream.match(/"[^"]*"/)) return 'string';
    if (stream.match(/-?\d+(\.\d+)?([eE][-+]?\d+)?/)) return 'number';
    if (stream.match(/\|>/)) return 'operator';
    if (stream.match(/[=,:()]/)) return 'punctuation';

    const wordMatch = stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (KEYWORDS.has(word)) return 'keyword';
      if (NODE_NAMES.has(word)) return 'typeName';
      if (RENDER_FUNCS.has(word)) return 'macroName';
      return 'variableName';
    }

    stream.next();
    return null;
  }
});

export function dslLanguage() {
  return new LanguageSupport(dslStreamLanguage);
}
