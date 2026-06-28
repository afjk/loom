# Scene Sync Demos

## Setup

1. Open Scene Sync.
2. Link Loomlet:

`loomlet scenesync redeem <code> --save`

3. Confirm session:

`loomlet scenesync session`

4. Confirm objects:

`loomlet scenesync objects`

## Required object IDs

Some demos assume objects already exist:

- `sample-cube` (move-cube demo)
- `lissajous-target` (lissajous demo)

Object-scoped behaviors under `examples/tour/scenesync/behaviors/` omit
`objectId` and apply to whichever object you attach them to.

## Adding GLB models

Use the Scene Sync UI or AI command flow to import a GLB model URL.
Then rename or assign the object ID used by the sample (for example, `dancer`).

## Running live samples

Use either:

`loomlet scenesync dev examples/tour/scenesync/demos/02-lissajous.loom`

or:

`loomlet scenesync dev examples/tour/scenesync/behaviors/02-float-y.loom`

## Demo helper commands

List demos:

`loomlet scenesync demo list`

Check setup:

`loomlet scenesync demo setup lissajous`

Run demo:

`loomlet scenesync demo run lissajous`

## Skybox / image / video notes

Scene/environment asset import (skyboxes, images, videos, GLBs) should be done through Scene Sync UI/commands before running Loomlet graphs.
Loomlet demo graphs in this PR intentionally control transforms, color, and visibility of existing objects.

## Notes

Loomlet graph samples control existing objects.
They do not create objects during live graph evaluation.


## Runtime support notes

- The current Scene Sync graph adapter targets a single object scope, so the tour
  ships single-object behaviors rather than multi-object graphs.
- The click behavior (`01-click-color`) compiles through the graph adapter and is
  marked `manual-runnable`: it needs real click events on the `pointer.click`
  channel to do anything visible.
- `scene.setColor` may compile through the Loomlet graph adapter, but visible
  results depend on Scene Sync receiver/runtime support.
