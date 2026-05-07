export const SCENESYNC_DEMOS = [
  {
    name: 'lissajous',
    file: 'examples/tour/scenesync/02-lissajous.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Move sample-cube in a Lissajous curve.'
  },
  {
    name: 'breathing-scale',
    file: 'examples/tour/scenesync/04-breathing-scale.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Animate sample-cube with a breathing scale pulse.'
  },
  {
    name: 'orbit',
    file: 'examples/tour/scenesync/03-orbit.loom',
    requiredObjects: ['sample-cube'],
    command: 'dev',
    status: 'manual-runnable',
    description: 'Orbit sample-cube around a center point.'
  }
];

export function getSceneSyncDemoByName(name) {
  return SCENESYNC_DEMOS.find((demo) => demo.name === name) || null;
}
