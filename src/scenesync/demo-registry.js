export const SCENESYNC_DEMOS = [
  {
    name: 'lissajous',
    file: 'examples/tour/scenesync/demos/02-lissajous.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Move sample-cube in a Lissajous curve.'
  },
  {
    name: 'breathing-scale',
    file: 'examples/tour/scenesync/behaviors/05-breathing-scale.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Animate sample-cube with a breathing scale pulse.'
  },
  {
    name: 'orbit',
    file: 'examples/tour/scenesync/behaviors/04-orbit-offset.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Orbit sample-cube around a center point.'
  }
];

export function getSceneSyncDemoByName(name) {
  return SCENESYNC_DEMOS.find((demo) => demo.name === name) || null;
}
