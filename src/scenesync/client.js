import {
  createSceneInfoCommand,
  createSceneListObjectsCommand,
  createScenePingCommand,
  normalizeSceneSyncResponse
} from './commands.js';

const DEFAULT_ENDPOINT = 'https://afjk.jp/pipe';

function normalizeEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.trim().length === 0) {
    return DEFAULT_ENDPOINT;
  }
  return endpoint.trim();
}

function buildCommandUrl(endpoint, room) {
  const base = normalizeEndpoint(endpoint).replace(/\/+$/, '');
  return `${base}/api/scenesync/command/${encodeURIComponent(room)}`;
}

function createRoomRequiredError() {
  return {
    ok: false,
    error: {
      code: 'ROOM_REQUIRED',
      message: 'Scene Sync room is required'
    }
  };
}

export class SceneSyncClient {
  constructor(options = {}) {
    this.endpoint = normalizeEndpoint(options.endpoint);
    this.fetchImpl = options.fetchImpl || globalThis.fetch;
  }

  async sendCommand(command) {
    if (!command || typeof command !== 'object' || !command.room) {
      return createRoomRequiredError();
    }

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
      const response = await this.fetchImpl(buildCommandUrl(this.endpoint, command.room), {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(command)
      });

      if (!response.ok) {
        return {
          ok: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}`
          }
        };
      }

      const payload = await response.json();
      return normalizeSceneSyncResponse(payload);
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

  async ping({ room } = {}) {
    if (!room) {
      return createRoomRequiredError();
    }
    return this.sendCommand(createScenePingCommand({ room }));
  }

  async info({ room } = {}) {
    if (!room) {
      return createRoomRequiredError();
    }
    return this.sendCommand(createSceneInfoCommand({ room }));
  }

  async listObjects({ room } = {}) {
    if (!room) {
      return createRoomRequiredError();
    }
    return this.sendCommand(createSceneListObjectsCommand({ room }));
  }
}

export { DEFAULT_ENDPOINT };
