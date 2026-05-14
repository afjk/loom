export function registerDomNodes(registry) {
  registry.registerNodeType('keyDown', {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<string>', kind: 'event' }],
    params: [{ name: 'key', type: 'string', default: null }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const filterKey = node.params?.key || null;
      const handler = (e) => {
        if (!filterKey || e.key === filterKey) {
          engine.dispatchEvent(node.id + '.event', e.key);
        }
      };
      window.addEventListener('keydown', handler);
      node._eventHandler = handler;
    },
    onStop: (node, engine) => {
      if (node._eventHandler) {
        window.removeEventListener('keydown', node._eventHandler);
        delete node._eventHandler;
      }
    }
  });
  registry.registerNodeType('keyUp', {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<string>', kind: 'event' }],
    params: [{ name: 'key', type: 'string', default: null }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const filterKey = node.params?.key || null;
      const handler = (e) => {
        if (!filterKey || e.key === filterKey) {
          engine.dispatchEvent(node.id + '.event', e.key);
        }
      };
      window.addEventListener('keyup', handler);
      node._eventHandler = handler;
    },
    onStop: (node, engine) => {
      if (node._eventHandler) {
        window.removeEventListener('keyup', node._eventHandler);
        delete node._eventHandler;
      }
    }
  });
  registry.registerNodeType('pointerClick', {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'event', type: 'event<vec2>', kind: 'event' }],
    params: [{ name: 'target', type: 'string', default: 'window' }],
    evaluate: (inputs, params, ctx) => {
      // dispatchEvent 経由で this._values に設定済みのため、evaluate は呼ばれない
      return { event: [] };
    },
    onStart: (node, engine) => {
      const targetSelector = node.params?.target || 'window';
      const target = targetSelector === 'window' ? window : document.querySelector(targetSelector);
      if (!target) return;

      const handler = (e) => {
        engine.dispatchEvent(node.id + '.event', { x: e.clientX, y: e.clientY });
      };
      target.addEventListener('pointerdown', handler);
      node._eventHandler = handler;
      node._eventTarget = target;
    },
    onStop: (node, engine) => {
      if (node._eventTarget && node._eventHandler) {
        node._eventTarget.removeEventListener('pointerdown', node._eventHandler);
        delete node._eventHandler;
        delete node._eventTarget;
      }
    }
  });
  registry.registerNodeType('pointerPosition', {
    category: 'input',
    inputs: [],
    outputs: [{ name: 'pos', type: 'vec2', kind: 'behavior' }],
    params: [{ name: 'target', type: 'string', default: 'window' }],
    evaluate: (inputs, params, ctx) => {
      if (!ctx.engine || !ctx.engine._inputStates) {
        ctx.engine._inputStates = {};
      }
      const lastPos = ctx.engine._inputStates.lastPos || { x: 0, y: 0 };
      return { pos: lastPos };
    },
    onStart: (node, engine) => {
      const targetSelector = node.params?.target || 'window';
      const target = targetSelector === 'window' ? window : document.querySelector(targetSelector);
      if (!target) return;

      if (!engine._inputStates) {
        engine._inputStates = {};
      }

      const handler = (e) => {
        engine._inputStates.lastPos = { x: e.clientX, y: e.clientY };
      };
      target.addEventListener('pointermove', handler);
      node._eventHandler = handler;
      node._eventTarget = target;
    },
    onStop: (node, engine) => {
      if (node._eventTarget && node._eventHandler) {
        node._eventTarget.removeEventListener('pointermove', node._eventHandler);
        delete node._eventHandler;
        delete node._eventTarget;
      }
    }
  });
  registry.registerNodeType('setAttr', {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'name', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.name) return {};
      const el = document.querySelector(params.target);
      if (el) el.setAttribute(params.name, String(inputs.value));
      return {};
    }
  });
  registry.registerNodeType('setClass', {
    category: 'sink',
    inputs: [
      { name: 'enabled', type: 'boolean', default: true, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'className', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.className) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      el.classList.toggle(params.className, Boolean(inputs.enabled));
      return {};
    }
  });
  registry.registerNodeType('setCssVar', {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'name', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.name) return {};
      if (inputs.value === null || inputs.value === undefined) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      const cssVarName = params.name.startsWith('--') ? params.name : `--${params.name}`;
      el.style.setProperty(cssVarName, String(inputs.value) + params.unit);
      return {};
    }
  });
  registry.registerNodeType('setStyle', {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'property', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target || !params.property) return {};
      const el = document.querySelector(params.target);
      if (el) el.style[params.property] = String(inputs.value) + params.unit;
      return {};
    }
  });
  registry.registerNodeType('setText', {
    category: 'sink',
    inputs: [
      { name: 'value', type: 'any', default: '', kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target) return {};
      const el = document.querySelector(params.target);
      if (el) el.textContent = String(inputs.value);
      return {};
    }
  });
  registry.registerNodeType('setTransform2D', {
    category: 'sink',
    inputs: [
      { name: 'x', type: 'number', default: 0, kind: 'behavior' },
      { name: 'y', type: 'number', default: 0, kind: 'behavior' },
      { name: 'scale', type: 'number', default: 1, kind: 'behavior' },
      { name: 'rotate', type: 'number', default: 0, kind: 'behavior' }
    ],
    outputs: [],
    params: [
      { name: 'target', type: 'string', default: '' },
      { name: 'unit', type: 'string', default: 'px' },
      { name: 'rotateUnit', type: 'string', default: 'deg' }
    ],
    evaluate: (inputs, params, ctx) => {
      if (!params.target) return {};
      const el = document.querySelector(params.target);
      if (!el) return {};
      el.style.transform = `translate(${inputs.x}${params.unit}, ${inputs.y}${params.unit}) scale(${inputs.scale}) rotate(${inputs.rotate}${params.rotateUnit})`;
      return {};
    }
  });
}