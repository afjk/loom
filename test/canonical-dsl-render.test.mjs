import test from 'node:test';
import assert from 'node:assert/strict';

import { graphToCanonicalDSL } from '../src/canonical-dsl.js';
import { parseDSLToAST, compileToGraph } from '../src/loom-dsl.js';

test('graphToCanonicalDSL preserves render point and keys params', () => {
  const pointGraph = {
    nodes: [
      { id: 't', type: 'clock', params: {} },
      { id: 'r', type: 'sine', params: { freq: 0.5 } }
    ],
    edges: [{ from: 't.t', to: 'r.t' }],
    render: {
      type: 'point',
      x: 320,
      y: 240,
      radius: 'r.out',
      trail: 0.2,
      enabled: true
    }
  };

  const pointDsl = graphToCanonicalDSL(pointGraph);
  assert.match(pointDsl, /render point\(/);
  assert.match(pointDsl, /radius: r/);
  assert.match(pointDsl, /trail: 0\.2/);
  assert.match(pointDsl, /enabled: true/);

  const { ast: pointAst, errors: pointErrors } = parseDSLToAST(pointDsl);
  assert.equal(pointErrors.length, 0);
  const { graph: pointRoundTrip } = compileToGraph(pointAst);
  assert.equal(pointRoundTrip.render.type, 'point');
  assert.equal(pointRoundTrip.render.radius, 'r.out');
  assert.equal(pointRoundTrip.render.trail, 0.2);
  assert.equal(pointRoundTrip.render.enabled, true);

  const keysGraph = {
    nodes: [],
    edges: [],
    render: {
      type: 'keys',
      space: '__loomlet_host:key:Space',
      left: '__loomlet_host:key:ArrowLeft',
      right: '__loomlet_host:key:ArrowRight',
      up: '__loomlet_host:key:ArrowUp',
      down: '__loomlet_host:key:ArrowDown'
    }
  };

  const keysDsl = graphToCanonicalDSL(keysGraph);
  assert.match(keysDsl, /render keys\(/);
  for (const key of ['space', 'left', 'right', 'up', 'down']) {
    assert.match(keysDsl, new RegExp(`${key}:`));
  }

  const { ast: keysAst, errors: keysErrors } = parseDSLToAST(keysDsl);
  assert.equal(keysErrors.length, 0);
  const { graph: keysRoundTrip } = compileToGraph(keysAst);
  assert.equal(keysRoundTrip.render.type, 'keys');
  assert.equal(keysRoundTrip.render.space, '__loomlet_host:key:Space');
  assert.equal(keysRoundTrip.render.left, '__loomlet_host:key:ArrowLeft');
  assert.equal(keysRoundTrip.render.right, '__loomlet_host:key:ArrowRight');
  assert.equal(keysRoundTrip.render.up, '__loomlet_host:key:ArrowUp');
  assert.equal(keysRoundTrip.render.down, '__loomlet_host:key:ArrowDown');
});
