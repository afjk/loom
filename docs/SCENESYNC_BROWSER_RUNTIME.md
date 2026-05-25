# Scene Sync Browser Runtime Bundle

`dist/loomlet-scenesync-runtime.browser.js` is the browser ESM runtime bundle for Scene Sync behavior playback.

Build it from the Loomlet package root:

```sh
npm run build:scenesync-runtime
```

The bundle evaluates graph JSON directly. It does not parse Loomlet DSL source and does not include the DSL compiler. Hosts are responsible for supplying `env.time`, `env.deltaTime`, and `env.events`; the runtime does not fetch server time and has no CDN, afjk.jp, or presence-server dependency.

```js
import { createSceneSyncRuntime } from './loomlet-scenesync-runtime.browser.js';

const runtime = createSceneSyncRuntime(graphJson, {
  resolveTarget: (objectId) => sceneObjects.get(objectId)
});

runtime.evaluateAt({
  time: playbackTimeSeconds,
  deltaTime,
  events: committedEvents
});
```

The v0 bundle includes the JSON graph evaluator, host-provided time/event support, portable core/math/logic/text/list basics, state helpers, Scene Sync scene adapter nodes, and the legacy `sceneSet*`/`serverClock` aliases used by older Scene Sync graphs.
