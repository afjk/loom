const DEFAULT_ENDPOINT = 'https://afjk.jp/presence/api/ai';

function normalizeEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.trim().length === 0) {
    return DEFAULT_ENDPOINT;
  }
  return endpoint.trim();
}

function normalizeApiResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Invalid response'
      }
    };
  }

  if (payload.ok === false) {
    const error = payload.error || {};
    return {
      ok: false,
      error: {
        code: typeof error.code === 'string' ? error.code : 'API_ERROR',
        message: typeof error.message === 'string' ? error.message : 'API request failed',
        retryable: typeof error.retryable === 'boolean' ? error.retryable : undefined
      }
    };
  }

  if (payload.ok === true) {
    return {
      ok: true,
      data: payload
    };
  }

  return {
    ok: false,
    error: {
      code: 'INVALID_RESPONSE',
      message: 'Invalid response'
    }
  };
}

export class SceneSyncClient {
  constructor(options = {}) {
    this.endpoint = normalizeEndpoint(options.endpoint);
    this.fetchImpl = options.fetchImpl || globalThis.fetch;
  }

  async #request(path, body) {
    if (typeof this.fetchImpl !== 'function') {
      return {
        ok: false,
        error: {
          code: 'FETCH_UNAVAILABLE',
          message: 'fetch is not available in this runtime'
        }
      };
    }

    try {
      const url = `${this.endpoint.replace(/\/+$/, '')}${path}`;
      const response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const payload = await response.json();

      if (!response.ok) {
        return normalizeApiResponse(payload);
      }

      return normalizeApiResponse(payload);
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  async redeem({ code } = {}) {
    if (!code) {
      return {
        ok: false,
        error: {
          code: 'CODE_REQUIRED',
          message: 'Redeem code is required'
        }
      };
    }

    return this.#request('/link/redeem', { code });
  }

  async getScene({ room, session } = {}) {
    if (!room) {
      return {
        ok: false,
        error: {
          code: 'ROOM_REQUIRED',
          message: 'Scene Sync room is required'
        }
      };
    }

    if (!session) {
      return {
        ok: false,
        error: {
          code: 'SESSION_REQUIRED',
          message: 'Scene Sync session is required'
        }
      };
    }

    return this.#request(`/room/${encodeURIComponent(room)}/scene`, { sessionId: session });
  }

  async revoke({ session } = {}) {
    if (!session) {
      return {
        ok: false,
        error: {
          code: 'SESSION_REQUIRED',
          message: 'Scene Sync session is required'
        }
      };
    }

    return this.#request('/link/revoke', { sessionId: session });
  }

  async ping({ room, session } = {}) {
    return this.getScene({ room, session });
  }

  async info({ room, session } = {}) {
    return this.getScene({ room, session });
  }

  async listObjects({ room, session } = {}) {
    return this.getScene({ room, session });
  }
}

export { DEFAULT_ENDPOINT };
