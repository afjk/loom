export function createStore() {
  const state = {
    sourceText: '',
    sourceAst: null,
    graph: null,
    editorModel: null,
    errors: [],
    engine: null,
    isRendering: false
  };

  const listeners = [];

  return {
    getState() {
      return state;
    },

    setState(updates) {
      Object.assign(state, updates);
      this.notify();
    },

    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },

    notify() {
      listeners.forEach(l => l(state));
    }
  };
}
