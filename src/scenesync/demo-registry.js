export const SCENESYNC_DEMOS = [
  {
    name: 'lissajous',
    file: 'examples/tour/scenesync/demos/02-lissajous.loom',
    requiredObjects: ['lissajous-target'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Move lissajous-target in a Lissajous curve.'
  },
  {
    // Object-scoped behavior: applies to whichever object you attach it to.
    name: 'breathing-scale',
    file: 'examples/tour/scenesync/behaviors/04-breathing-scale.loom',
    requiredObjects: [],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Object-scoped breathing scale pulse for any attached object.'
  },
  {
    // Object-scoped behavior: applies to whichever object you attach it to.
    name: 'orbit',
    file: 'examples/tour/scenesync/behaviors/03-orbit-offset.loom',
    requiredObjects: [],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Object-scoped circular orbit offset for any attached object.'
  }
];

export function getSceneSyncDemoByName(name) {
  return SCENESYNC_DEMOS.find((demo) => demo.name === name) || null;
}
