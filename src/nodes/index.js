import { registerCoreNodes } from './core.js';
import { registerFunctionNodes } from './function.js';
import { registerMathNodes } from './math.js';
import { registerLogicNodes } from './logic.js';
import { registerTextNodes } from './text.js';
import { registerListNodes } from './list.js';
import { registerSceneNodes } from './scene.js';
import { registerDomNodes } from './dom.js';

export { registerCoreNodes, registerFunctionNodes, registerMathNodes, registerLogicNodes, registerTextNodes, registerListNodes, registerSceneNodes, registerDomNodes };

export function registerBuiltinNodes(registry) {
  registerCoreNodes(registry);
  registerFunctionNodes(registry);
  registerMathNodes(registry);
  registerLogicNodes(registry);
  registerTextNodes(registry);
  registerListNodes(registry);
  registerSceneNodes(registry);
  registerDomNodes(registry);
  return registry;
}
