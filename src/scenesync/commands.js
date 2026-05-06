function createRequestId() {
  return `loom-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createCommand(type, { room, requestId } = {}) {
  return {
    type,
    requestId: requestId || createRequestId(),
    room,
    payload: {}
  };
}

export function createScenePingCommand(options = {}) {
  return createCommand('scene.ping', options);
}

export function createSceneInfoCommand(options = {}) {
  return createCommand('scene.info', options);
}

export function createSceneListObjectsCommand(options = {}) {
  return createCommand('scene.listObjects', options);
}

export function normalizeSceneSyncResponse(response) {
  if (!response || typeof response !== 'object') {
    return {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Invalid Scene Sync response'
      }
    };
  }

  if (response.ok === true) {
    if (typeof response.type !== 'string') {
      return {
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid Scene Sync response'
        }
      };
    }

    return {
      ok: true,
      type: response.type,
      requestId: typeof response.requestId === 'string' ? response.requestId : null,
      result: response.result ?? {}
    };
  }

  if (response.ok === false) {
    const error = response.error || {};
    return {
      ok: false,
      type: typeof response.type === 'string' ? response.type : 'error',
      requestId: typeof response.requestId === 'string' ? response.requestId : null,
      error: {
        code: typeof error.code === 'string' ? error.code : 'SCENESYNC_ERROR',
        message: typeof error.message === 'string' ? error.message : 'Scene Sync request failed'
      }
    };
  }

  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message: 'Invalid Scene Sync response'
    }
  };
}

export function formatSceneSyncError(error) {
  if (!error || typeof error !== 'object') {
    return 'SCENESYNC_ERROR - Unknown Scene Sync error';
  }

  const code = typeof error.code === 'string' && error.code.length > 0
    ? error.code
    : 'SCENESYNC_ERROR';
  const message = typeof error.message === 'string' && error.message.length > 0
    ? error.message
    : 'Scene Sync request failed';

  return `${code} - ${message}`;
}
