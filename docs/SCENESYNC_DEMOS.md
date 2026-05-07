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

Some samples assume objects already exist:

- `sample-cube`
- `dancer`
- `wave-1` ... `wave-5`
- `pulse-target`
- `color-target`
- `grid-1` ... `grid-9`

## Adding GLB models

Use the Scene Sync UI or AI command flow to import a GLB model URL.
Then rename or assign the object ID used by the sample (for example, `dancer`).

## Running live samples

Use either:

`loomlet scenesync dev examples/tour/scenesync/02-lissajous.loom`

or:

`loomlet scenesync dev examples/tour/live/01-pulse.loom`

## Skybox / image / video notes

Scene/environment asset import (skyboxes, images, videos, GLBs) should be done through Scene Sync UI/commands before running Loomlet graphs.
Loomlet demo graphs in this PR intentionally control transforms, color, and visibility of existing objects.

## Notes

Loomlet graph samples control existing objects.
They do not create objects during live graph evaluation.


## Runtime support notes

- Multi-object graph sketches (for example `05-wave-objects` and `03-grid-wave`) are marked draft because the current Scene Sync graph adapter targets a single object scope.
- `scene.setColor` and `scene.setVisible` may compile through the Loomlet graph adapter, but samples remain draft until Scene Sync receiver/runtime support is confirmed.
