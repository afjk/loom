import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSceneListObjectsCommand,
  SceneSyncClient
} from '../src/scenesync/index.js';

test('command helper creates listObjects command', () => {
  const command = createSceneListObjectsCommand({ room: '121555', requestId: 'test-1' });
  assert.equal(command.type, 'scene.listObjects');
  assert.equal(command.room, '121555');
  assert.equal(command.requestId, 'test-1');
  assert.deepEqual(command.payload, {});
});

test('client sends command to expected URL', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          ok: true,
          type: 'scene.ping.result',
          requestId: 'test',
          result: { pong: true }
        };
      }
    };
  };

  const client = new SceneSyncClient({
    endpoint: 'https://example.com/pipe',
    fetchImpl
  });

  const result = await client.ping({ room: '121555' });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(String(calls[0].url), /121555/);
  assert.equal(JSON.parse(calls[0].options.body).type, 'scene.ping');
});

test('HTTP error returns normalized error', async () => {
  const client = new SceneSyncClient({
    endpoint: 'https://example.com/pipe',
    fetchImpl: async () => ({
      ok: false,
      status: 404,
      async json() {
        return {};
      }
    })
  });

  const result = await client.info({ room: '121555' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'HTTP_ERROR');
});

test('malformed response returns INVALID_RESPONSE', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return {};
      }
    })
  });

  const result = await client.listObjects({ room: '121555' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'INVALID_RESPONSE');
});

test('room required', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('should not be called');
    }
  });

  const result = await client.listObjects();
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'ROOM_REQUIRED');
});

test('network error returns NETWORK_ERROR', async () => {
  const client = new SceneSyncClient({
    fetchImpl: async () => {
      throw new Error('boom');
    }
  });

  const result = await client.ping({ room: '121555' });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'NETWORK_ERROR');
});
