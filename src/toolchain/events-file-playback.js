import { LoomReplSession } from './repl-session.js';

function playbackError(message) {
  const error = new Error(message);
  error.code = 'INVALID_EVENTS_FILE';
  return error;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(value, path) {
  if (!isPlainObject(value)) {
    throw playbackError(`${path} must be an object`);
  }
}

function assertFiniteNumber(value, path) {
  if (!Number.isFinite(value)) {
    throw playbackError(`${path} must be a finite number`);
  }
}

function normalizeScope(scope, path) {
  if (scope === undefined) {
    return undefined;
  }
  assertPlainObject(scope, path);
  if (scope.type === 'scene') {
    if (scope.id === undefined) {
      return { type: 'scene' };
    }
    if (typeof scope.id !== 'string' || scope.id.trim().length === 0) {
      throw playbackError(`${path}.id must be a non-empty string when provided`);
    }
    return { type: 'scene', id: scope.id.trim() };
  }
  if (scope.type === 'object') {
    if (typeof scope.id !== 'string' || scope.id.trim().length === 0) {
      throw playbackError(`${path}.id must be a non-empty string for object scope`);
    }
    return { type: 'object', id: scope.id.trim() };
  }
  throw playbackError(`${path}.type must be "scene" or "object"`);
}

function normalizeEvent(event, path, currentTime) {
  assertPlainObject(event, path);
  if (typeof event.channel !== 'string' || event.channel.trim().length === 0) {
    throw playbackError(`${path}.channel must be a non-empty string`);
  }
  const normalized = { ...event, channel: event.channel.trim() };
  if (normalized.timestamp === undefined) {
    normalized.timestamp = currentTime;
  }
  assertFiniteNumber(normalized.timestamp, `${path}.timestamp`);
  return normalized;
}

function normalizeStep(step, index) {
  const path = `steps[${index}]`;
  assertPlainObject(step, path);

  if (step.inputs !== undefined) {
    assertPlainObject(step.inputs, `${path}.inputs`);
  }
  if (step.time !== undefined) {
    assertFiniteNumber(step.time, `${path}.time`);
  }
  if (step.dt !== undefined) {
    assertFiniteNumber(step.dt, `${path}.dt`);
  }
  if (step.tick !== undefined) {
    assertFiniteNumber(step.tick, `${path}.tick`);
  }
  if (step.events !== undefined && !Array.isArray(step.events)) {
    throw playbackError(`${path}.events must be an array`);
  }

  return {
    label: typeof step.label === 'string' && step.label.length > 0 ? step.label : undefined,
    inputs: step.inputs ? { ...step.inputs } : undefined,
    time: step.time,
    dt: step.dt,
    tick: step.tick,
    events: step.events
  };
}

export function parseEventsFilePlaybackJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw playbackError(`Invalid events file JSON: ${error.message}`);
  }

  const root = Array.isArray(parsed) ? { steps: parsed } : parsed;
  assertPlainObject(root, 'events file');

  if (root.inputs !== undefined) {
    assertPlainObject(root.inputs, 'inputs');
  }
  if (root.time !== undefined) {
    assertFiniteNumber(root.time, 'time');
  }
  if (root.dt !== undefined) {
    assertFiniteNumber(root.dt, 'dt');
  }
  const scope = normalizeScope(root.scope, 'scope');

  if (root.steps !== undefined && !Array.isArray(root.steps)) {
    throw playbackError('steps must be an array');
  }

  return {
    inputs: root.inputs ? { ...root.inputs } : {},
    time: root.time,
    dt: root.dt,
    scope,
    steps: (root.steps || []).map((step, index) => normalizeStep(step, index))
  };
}

function selectValues(values, get) {
  if (Array.isArray(get) && get.length > 0) {
    const selected = {};
    for (const ref of get) {
      selected[ref] = values[ref];
    }
    return selected;
  }
  if (typeof get === 'string' && get.length > 0) {
    return { [get]: values[get] };
  }
  return values;
}

function serializeResult(result, get) {
  return {
    ok: result.ok,
    values: selectValues(result.values || {}, get),
    effects: result.effects || [],
    errors: result.errors || []
  };
}

function serializeSessionState(session) {
  return {
    time: session.getTime(),
    dt: session.getDeltaTime(),
    inputs: session.getInputs()
  };
}

function applyScope(session, scope) {
  if (!scope) {
    return;
  }
  if (scope.type === 'object') {
    session.setObjectScope(scope.id);
  } else if (scope.type === 'scene') {
    session.setSceneScope(scope.id);
  }
}

export function runLoomEventsFilePlayback(source, eventsFileText, options = {}) {
  const playback = parseEventsFilePlaybackJson(eventsFileText);
  const session = new LoomReplSession({
    target: options.target || 'cli',
    time: playback.time ?? options.time,
    dt: playback.dt ?? options.dt,
    nodeRegistry: options.nodeRegistry,
    metadataRegistry: options.metadataRegistry
  });

  applyScope(session, playback.scope);
  for (const [name, value] of Object.entries(playback.inputs)) {
    session.setInput(name, value);
  }

  const initial = session.loadSource(source);
  const initialState = serializeSessionState(session);
  if (!initial.ok) {
    return {
      ok: false,
      initial: {
        ...initialState,
        ...serializeResult(initial, options.get)
      },
      steps: [],
      errors: initial.errors || []
    };
  }

  const steps = [];
  for (let index = 0; index < playback.steps.length; index += 1) {
    const step = playback.steps[index];
    if (step.time !== undefined) {
      session.setTime(step.time);
    }
    if (step.dt !== undefined) {
      session.setDeltaTime(step.dt);
    }
    if (step.tick !== undefined) {
      session.tick(step.tick);
    }
    if (step.inputs) {
      for (const [name, value] of Object.entries(step.inputs)) {
        session.setInput(name, value);
      }
    }

    const currentTime = session.getTime();
    const events = (step.events || []).map((event, eventIndex) =>
      normalizeEvent(event, `steps[${index}].events[${eventIndex}]`, currentTime)
    );
    const result = events.length > 0
      ? session.injectEvents(events)
      : session.evaluateCurrent({ dedupeEffects: false });

    const serialized = {
      index,
      ...(step.label ? { label: step.label } : {}),
      time: session.getTime(),
      dt: session.getDeltaTime(),
      inputs: session.getInputs(),
      events,
      ...serializeResult(result, options.get)
    };
    steps.push(serialized);

    if (!result.ok) {
      return {
        ok: false,
        initial: {
          ...initialState,
          ...serializeResult(initial, options.get)
        },
        steps,
        errors: result.errors || []
      };
    }
  }

  return {
    ok: true,
    initial: {
      ...initialState,
      ...serializeResult(initial, options.get)
    },
    steps,
    errors: []
  };
}
