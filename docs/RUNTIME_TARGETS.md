# Runtime Targets

Loom DSL programs can now declare minimal top-level imports and will eventually target multiple runtimes instead of assuming a browser-only environment.

The new toolchain layer is shared by CLI, Web Studio, Scene Sync, and future AI/MCP integrations. This PR only supports simple line-based imports:

```text
import math
import fs
import scene
```

Imports are metadata and validation only in this phase. They do not load modules yet and do not add library-specific nodes by themselves.

Some libraries are universal and should work across every host. Others are intentionally runtime-specific because they depend on DOM APIs, file I/O, rendering adapters, or protocol bridges.

| import | CLI | Web Studio | Scene Sync | Unity | Description |
|---|---:|---:|---:|---:|---|
| math | yes | yes | yes | yes | Pure math |
| state | yes | yes | yes | yes | Explicit state nodes |
| text | yes | yes | yes | yes | String processing, including `text.upper`, `text.lower`, `text.trim`, `text.replace` |
| json | yes | yes | yes | yes | JSON utilities, including `json.parse` and `json.stringify` |
| fs | yes | no | no | no/partial | File I/O |
| console | yes | yes | yes | yes | Host logging, including `console.log`, `console.warn`, `console.error` |
| dom | no | yes | no | no | DOM operations |
| canvas | no | yes | no | no | Canvas preview |
| scene | no | partial | yes | yes | Scene object control |
| three | no | yes | partial | no | Three.js adapter |
| unity | no | no | no | yes | Unity adapter |
| scenesync | partial | yes | yes | partial | SceneSync protocol |

## Target validation

- `loom compile ... --target <target>` validates imports for a runtime target.
- `loom inspect ... --target <target>` validates imports and reports compatible targets.
- `loom run ...` defaults to `--target cli`.
- `compile` and `inspect` default to `target: any`, which allows runtime-specific imports for generic parse/format/inspect workflows.

Example:

```text
import fs
x = constant(value: 1)
```

- `loom compile script.loom --target cli` succeeds
- `loom compile script.loom --target web` fails with `UNSUPPORTED_IMPORT`
