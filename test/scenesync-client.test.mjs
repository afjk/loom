import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SceneSyncClient
} from '../src/scenesync/index.js';

test('redeem posts to /link/redeem', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true,
          roomId: 'room-123',
          sessionId: 'v1.test',
          expiresAt: 1234567890
        };
      }
    };
  };

  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl
  });

  const result = await client.redeem({ code: '238909' });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(String(calls[0].url), /\/link\/redeem$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), { code: '238909' });
  assert.equal(result.data.roomId, 'room-123');
  assert.equal(result.data.sessionId, 'v1.test');
});

test('getScene posts sessionId to /room/:room/scene', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true,
          envId: 'studio',
          objects: {
            cube1: { type: 'Cube', position: [0, 0.5, 0] }
          }
        };
      }
    };
  };

  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl
  });

  const result = await client.getScene({
    room: 'room-1',
    session: 'v1.test'
  });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(String(calls[0].url), /\/room\/room-1\/scene$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), { sessionId: 'v1.test' });
  assert.equal(result.data.envId, 'studio');
  assert.deepEqual(result.data.objects.cube1, { type: 'Cube', position: [0, 0.5, 0] });
});

test('missing code returns CODE_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.redeem();
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'CODE_REQUIRED');
});

test('missing session returns SESSION_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.getScene({ room: 'room-1' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'SESSION_REQUIRED');
});

test('missing room returns ROOM_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.getScene({ session: 'v1.test' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'ROOM_REQUIRED');
});

test('HTTP error preserves API error', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 401,
    async json() {
      return {
        ok: false,
        error: {
          code: 'unauthorized',
          message: 'session expired',
          retryable: false
        }
      };
    }
  });

  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl
  });

  const result = await client.getScene({ room: 'room-1', session: 'v1.invalid' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'unauthorized');
  assert.equal(result.error.message, 'session expired');
  assert.equal(result.error.retryable, false);
});

test('network error returns NETWORK_ERROR', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('boom');
    }
  });

  const result = await client.redeem({ code: '238909' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'NETWORK_ERROR');
});

test('getScene accepts raw scene snapshot response', async () => {
  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return {
          envId: 'outdoor_day',
          objects: {
            'sample-cube': {
              name: 'sample-cube',
              position: [0, 0.5, 0],
              rotation: [0, 0, 0, 1],
              scale: [1, 1, 1]
            }
          }
        };
      }
    })
  });

  const result = await client.getScene({
    room: 'jwjsy8',
    session: 'v1.test'
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.envId, 'outdoor_day');
  assert.equal(result.data.objects['sample-cube'].name, 'sample-cube');
});

test('array response returns INVALID_RESPONSE', async () => {
  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return [];
      }
    })
  });

  const result = await client.getScene({
    room: 'room-1',
    session: 'v1.test'
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'INVALID_RESPONSE');
});

test('null response returns INVALID_RESPONSE', async () => {
  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return null;
      }
    })
  });

  const result = await client.getScene({
    room: 'room-1',
    session: 'v1.test'
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'INVALID_RESPONSE');
});

test('broadcast posts to /room/:room/broadcast', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true
        };
      }
    };
  };

  const client = new SceneSyncClient({
    endpoint: 'https://example.com/presence/api/ai',
    fetchImpl
  });

  const payload = {
    kind: 'scene-delta',
    objectId: 'sample-cube',
    position: [1, 0.5, 0]
  };

  const result = await client.broadcast({
    room: 'room-1',
    session: 'v1.test',
    payload
  });

  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(String(calls[0].url), /\/room\/room-1\/broadcast$/);
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.sessionId, 'v1.test');
  assert.deepEqual(body.payload, payload);
});

test('broadcast missing room returns ROOM_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.broadcast({
    session: 'v1.test',
    payload: { kind: 'scene-delta' }
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'ROOM_REQUIRED');
});

test('broadcast missing session returns SESSION_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.broadcast({
    room: 'room-1',
    payload: { kind: 'scene-delta' }
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'SESSION_REQUIRED');
});

test('broadcast missing payload returns PAYLOAD_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.broadcast({
    room: 'room-1',
    session: 'v1.test'
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'PAYLOAD_REQUIRED');
});

test('broadcast with invalid payload returns PAYLOAD_REQUIRED', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.broadcast({
    room: 'room-1',
    session: 'v1.test',
    payload: null
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'PAYLOAD_REQUIRED');
});
