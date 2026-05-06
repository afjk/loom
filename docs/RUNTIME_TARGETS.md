# Runtime Targets

Loom DSL programs will eventually target multiple runtimes instead of assuming a browser-only environment.

The new toolchain layer is shared by CLI, Web Studio, Scene Sync, and future AI/MCP integrations. Import syntax is not implemented in this PR, but future imports will declare required libraries and runtime capabilities against the compatibility table below.

Some libraries are universal and should work across every host. Others are intentionally runtime-specific because they depend on DOM APIs, file I/O, rendering adapters, or protocol bridges.

| import | CLI | Web Studio | Scene Sync | Unity | Description |
|---|---:|---:|---:|---:|---|
| math | yes | yes | yes | yes | Pure math |
| state | yes | yes | yes | yes | Explicit state nodes |
| text | yes | yes | yes | yes | String processing |
| json | yes | yes | yes | yes | JSON utilities |
| fs | yes | no | no | no/partial | File I/O |
| dom | no | yes | no | no | DOM operations |
| canvas | no | yes | no | no | Canvas preview |
| scene | no | partial | yes | yes | Scene object control |
| three | no | yes | partial | no | Three.js adapter |
| unity | no | no | no | yes | Unity adapter |
| scenesync | partial | yes | yes | partial | SceneSync protocol |
