import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseEventsFilePlaybackJson,
  runLoomEventsFilePlayback
} from '../src/toolchain/events-file-playback.js';

test('parseEventsFilePlaybackJson accepts inputs, time, scope, and steps', () => {
  const parsed = parseEventsFilePlaybackJson(JSON.stringify({
    inputs: { distance: 2 },
    time: 1,
    dt: 0,
    scope: { type: 'object', id: 'cube-01' },
    steps: [
      { label: 'enter', tick: 0.25, inputs: { distance: 0.8 }, events: [] }
    ]
  }));

  assert.deepEqual(parsed.inputs, { distance: 2 });
  assert.equal(parsed.time, 1);
  assert.equal(parsed.dt, 0);
  assert.deepEqual(parsed.scope, { type: 'object', id: 'cube-01' });
  assert.equal(parsed.steps.length, 1);
  assert.equal(parsed.steps[0].label, 'enter');
});

test('parseEventsFilePlaybackJson reports invalid JSON clearly', () => {
  assert.throws(
    () => parseEventsFilePlaybackJson('{bad'),
    /Invalid events file JSON/
  );
});

test('parseEventsFilePlaybackJson reports invalid shape clearly', () => {
  assert.throws(
    () => parseEventsFilePlaybackJson(JSON.stringify({ steps: { tick: 1 } })),
    /steps must be an array/
  );
});

test('runLoomEventsFilePlayback updates inputs and preserves edge state', () => {
  const source = [
    'distance = input("distance", 999)',
    'near = lessThan(distance, 1.0)',
    'enter = risingEdge(value: near)',
    'send = sendEvent(trigger: enter, channel: "custom.enterRange")'
  ].join('\n');
  const eventsFile = JSON.stringify({
    inputs: { distance: 2 },
    time: 0,
    steps: [
      { label: 'outside', inputs: { distance: 2 } },
      { label: 'enter', inputs: { distance: 0.8 } },
      { label: 'stay', inputs: { distance: 0.6 } }
    ]
  });

  const result = runLoomEventsFilePlayback(source, eventsFile, { target: 'cli', get: 'enter.event' });

  assert.equal(result.ok, true);
  assert.deepEqual(result.initial.values['enter.event'], []);
  assert.deepEqual(result.steps[0].values['enter.event'], []);
  assert.equal(result.steps[1].values['enter.event'].length, 1);
  assert.equal(result.steps[1].effects.filter((effect) => effect.kind === 'event.send').length, 1);
  assert.deepEqual(result.steps[2].values['enter.event'], []);
});

test('runLoomEventsFilePlayback dispatches event envelopes to onEvent', () => {
  const result = runLoomEventsFilePlayback(
    'listener = onEvent(channel: "pointer.click")',
    JSON.stringify({
      time: 2,
      steps: [
        { events: [{ channel: 'pointer.click', timestamp: 2, payload: { button: 0 } }] }
      ]
    }),
    { target: 'cli', get: 'listener.event' }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.steps[0].values['listener.event'], [
    { channel: 'pointer.click', timestamp: 2, payload: { button: 0 } }
  ]);
});

test('runLoomEventsFilePlayback advances time with tick', () => {
  const result = runLoomEventsFilePlayback(
    'now = clock()',
    JSON.stringify({
      time: 1,
      dt: 0,
      steps: [
        { tick: 0.25 }
      ]
    }),
    { target: 'cli', get: 'now.t' }
  );

  assert.equal(result.ok, true);
  assert.equal(result.initial.values['now.t'], 1);
  assert.equal(result.steps[0].values['now.t'], 1.25);
  assert.equal(result.steps[0].dt, 0.25);
});
