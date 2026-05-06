import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  getDefaultSceneSyncSessionPath,
  saveSceneSyncSession,
  loadSceneSyncSession,
  clearSceneSyncSession,
  maskSessionId
} from '../src/scenesync/session-store.js';

test('getDefaultSceneSyncSessionPath respects XDG_CONFIG_HOME', () => {
  const result = getDefaultSceneSyncSessionPath({
    XDG_CONFIG_HOME: '/tmp/config'
  });

  assert.equal(result, '/tmp/config/loom/scenesync-session.json');
});

test('getDefaultSceneSyncSessionPath uses ~/.config when XDG_CONFIG_HOME is not set', () => {
  const result = getDefaultSceneSyncSessionPath({});
  assert.match(result, /\.config.*loom.*scenesync-session\.json/);
});

test('save and load session', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await saveSceneSyncSession({
    endpoint: 'https://example.com/presence/api/ai',
    roomId: 'room-1',
    sessionId: 'v1.test',
    expiresAt: 123
  }, { path: filePath, now: 100 });

  const loaded = await loadSceneSyncSession({ path: filePath });

  assert.equal(loaded.ok, true);
  assert.equal(loaded.session.roomId, 'room-1');
  assert.equal(loaded.session.sessionId, 'v1.test');
  assert.equal(loaded.session.endpoint, 'https://example.com/presence/api/ai');
  assert.equal(loaded.session.expiresAt, 123);
  assert.equal(loaded.session.savedAt, 100);
});

test('saved file is readable as JSON', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await saveSceneSyncSession({
    roomId: 'room-1',
    sessionId: 'v1.test',
    expiresAt: 123
  }, { path: filePath, now: 100 });

  const content = await readFile(filePath, 'utf8');
  const data = JSON.parse(content);

  assert.equal(data.roomId, 'room-1');
  assert.equal(data.sessionId, 'v1.test');
});

test('saved file has 0600 permissions on supported platforms', async () => {
  if (process.platform === 'win32') {
    return;
  }

  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await saveSceneSyncSession({
    roomId: 'room-1',
    sessionId: 'v1.test',
    expiresAt: 123
  }, { path: filePath, now: 100 });

  const stats = await stat(filePath);
  assert.equal(stats.mode & 0o777, 0o600);
});

test('missing session returns ok with null session', async () => {
  const filePath = path.join(tmpdir(), `nonexistent-${Date.now()}-${Math.random()}.json`);
  const loaded = await loadSceneSyncSession({ path: filePath });

  assert.equal(loaded.ok, true);
  assert.equal(loaded.session, null);
});

test('invalid JSON returns error', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await new Promise((resolve) => {
    import('node:fs').then(({ writeFileSync }) => {
      writeFileSync(filePath, 'not valid json');
      resolve();
    });
  });

  const loaded = await loadSceneSyncSession({ path: filePath });

  assert.equal(loaded.ok, false);
  assert.equal(loaded.error.code, 'SESSION_FILE_INVALID');
});

test('missing roomId or sessionId returns error', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await new Promise((resolve) => {
    import('node:fs').then(({ writeFileSync }) => {
      writeFileSync(filePath, JSON.stringify({ roomId: 'room-1' }));
      resolve();
    });
  });

  const loaded = await loadSceneSyncSession({ path: filePath });

  assert.equal(loaded.ok, false);
  assert.equal(loaded.error.code, 'SESSION_FILE_INVALID');
});

test('save validates roomId', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  try {
    await saveSceneSyncSession({
      sessionId: 'v1.test'
    }, { path: filePath });
    assert.fail('Should have thrown');
  } catch (error) {
    assert.match(error.message, /roomId/i);
  }
});

test('save validates sessionId', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  try {
    await saveSceneSyncSession({
      roomId: 'room-1'
    }, { path: filePath });
    assert.fail('Should have thrown');
  } catch (error) {
    assert.match(error.message, /sessionId/i);
  }
});

test('clear session removes file', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'loom-session-'));
  const filePath = path.join(dir, 'session.json');

  await saveSceneSyncSession({
    roomId: 'room-1',
    sessionId: 'v1.test',
    expiresAt: 123
  }, { path: filePath });

  const result = await clearSceneSyncSession({ path: filePath });
  assert.equal(result.ok, true);

  const loaded = await loadSceneSyncSession({ path: filePath });
  assert.equal(loaded.ok, true);
  assert.equal(loaded.session, null);
});

test('clear session succeeds on missing file', async () => {
  const filePath = path.join(tmpdir(), `nonexistent-${Date.now()}-${Math.random()}.json`);
  const result = await clearSceneSyncSession({ path: filePath });

  assert.equal(result.ok, true);
  assert.equal(result.path, filePath);
});

test('maskSessionId masks long IDs', () => {
  const masked = maskSessionId('v1.abcdefghijklmnopqrstuvwxyz');
  assert.equal(masked, 'v1.abc...wxyz');
});

test('maskSessionId returns **** for short IDs', () => {
  assert.equal(maskSessionId('short'), '****');
  assert.equal(maskSessionId(''), '****');
  assert.equal(maskSessionId(null), '****');
});

test('maskSessionId works with prefixed IDs', () => {
  const masked = maskSessionId('v1.4ONCabcdefghijklmnopqrstuvwxyz123fBg');
  assert.match(masked, /^v1\.4/);
  assert.match(masked, /fBg$/);
  assert.match(masked, /\.\.\./);
});
