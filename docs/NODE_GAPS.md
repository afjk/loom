# Node Gaps

## Scene Sync status snapshot
- Current end-to-end sinks: `scene.setPosition`, `scene.setRotation`, `scene.setScale`.
- Planned for end-to-end Scene Sync graph target parity: `scene.setColor`, `scene.setVisible`.
- Deferred: `scene.setText` (waiting on Scene Sync text primitive support).
- Planned: `scene.setAsset` for GLB/image/video reassignment workflows.

## High priority
- timeline.progress
- timeline.between
- audio.level

## Medium priority
- signal.lfo
- signal.smooth
- signal.trigger
- state.toggle
- state.counter

## Planned scene nodes

### scene.setText
Status:
deferred

Reason:
Scene Sync currently represents visible content primarily through GLB assets. Dynamic text requires Scene Sync text asset or textOverlay support.

Proposed direction:
Add Scene Sync `asset.type: "text"` or `textOverlay` support, then map Loomlet `scene.setText` to that.

### scene.setAsset
Status:
planned

Reason:
Scene Sync uses GLB as the main carrier for visible objects. Assigning or replacing an asset is a natural primitive for future demos.
