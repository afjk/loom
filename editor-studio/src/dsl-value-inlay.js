import { StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';

// Effect used to push the latest set of inline values into the editor.
// Payload: array of { line, text } where `line` is 1-based.
export const setValueInlaysEffect = StateEffect.define();

// Renders a single end-of-line value badge like ⟦0.42⟧.
// It is decorative only: not editable, not selectable, and excluded from copy.
class ValueInlayWidget extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  eq(other) {
    return other instanceof ValueInlayWidget && other.text === this.text;
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-loom-value-inlay';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = `⟦${this.text}⟧`;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

function buildDecorations(doc, inlays) {
  const builder = new RangeSetBuilder();
  const lineCount = doc.lines;

  const items = [];
  for (const item of inlays || []) {
    if (!item || typeof item.line !== 'number') continue;
    if (item.line < 1 || item.line > lineCount) continue;
    if (item.text == null || item.text === '') continue;
    const line = doc.line(item.line);
    items.push({ pos: line.to, text: item.text });
  }

  // RangeSetBuilder requires positions added in ascending order.
  items.sort((a, b) => a.pos - b.pos);

  for (const item of items) {
    builder.add(
      item.pos,
      item.pos,
      Decoration.widget({
        widget: new ValueInlayWidget(item.text),
        side: 1
      })
    );
  }

  return builder.finish();
}

// Holds the current decoration set. Decorations are mapped through document
// changes so badges stay attached while typing, and fully rebuilt whenever a
// fresh set of values arrives via setValueInlaysEffect.
export const valueInlayField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    let next = decorations.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setValueInlaysEffect)) {
        next = buildDecorations(tr.state.doc, effect.value);
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field)
});

const valueInlayTheme = EditorView.theme({
  '.cm-loom-value-inlay': {
    marginLeft: '1.5ch',
    padding: '0 0.4ch',
    color: 'rgba(130, 170, 255, 0.6)',
    fontStyle: 'normal',
    fontSize: '0.92em',
    fontFamily: 'Monaco, Menlo, Consolas, monospace',
    userSelect: 'none',
    pointerEvents: 'none',
    whiteSpace: 'pre'
  }
});

export function valueInlayExtensions() {
  return [valueInlayField, valueInlayTheme];
}

// Push a new set of inline values to the editor. `inlays` is an array of
// { line, text }. Passing an empty array clears all badges.
export function dispatchValueInlays(view, inlays) {
  if (!view) return;
  view.dispatch({ effects: setValueInlaysEffect.of(inlays || []) });
}

// Exposed for unit testing the line -> decoration mapping.
export { buildDecorations as __buildDecorationsForTest };
