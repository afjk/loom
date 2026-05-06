import { mkdir, writeFile, readFile, chmod, rm, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export function getDefaultSceneSyncSessionPath(env = process.env) {
  const configHome = env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(configHome, 'loomlet', 'scenesync-session.json');
}

export async function getDefaultSceneSyncSessionPathWithFallback(env = process.env) {
  const newPath = getDefaultSceneSyncSessionPath(env);
  const oldPath = path.join(env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'loom', 'scenesync-session.json');

  try {
    await access(newPath);
    return newPath;
  } catch {
    try {
      await access(oldPath);
      return oldPath;
    } catch {
      return newPath;
    }
  }
}

export async function saveSceneSyncSession(session, options = {}) {
  const { path: filePath = getDefaultSceneSyncSessionPath(), now = Date.now() } = options;

  if (!session.roomId || typeof session.roomId !== 'string') {
    throw new Error('Session roomId is required and must be a string');
  }

  if (!session.sessionId || typeof session.sessionId !== 'string') {
    throw new Error('Session sessionId is required and must be a string');
  }

  const data = {
    endpoint: session.endpoint || 'https://afjk.jp/presence/api/ai',
    roomId: session.roomId,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
    savedAt: now
  };

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
  await chmod(filePath, 0o600).catch(() => {});

  return filePath;
}

export async function loadSceneSyncSession(options = {}) {
  let filePath = options.path;
  if (!filePath) {
    filePath = await getDefaultSceneSyncSessionPathWithFallback();
  }

  try {
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!data || typeof data !== 'object') {
      return {
        ok: false,
        error: {
          code: 'SESSION_FILE_INVALID',
          message: 'Scene Sync session file is invalid'
        }
      };
    }

    if (!data.roomId || !data.sessionId) {
      return {
        ok: false,
        error: {
          code: 'SESSION_FILE_INVALID',
          message: 'Scene Sync session file is missing roomId or sessionId'
        }
      };
    }

    return {
      ok: true,
      session: data
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        ok: true,
        session: null
      };
    }

    if (error instanceof SyntaxError) {
      return {
        ok: false,
        error: {
          code: 'SESSION_FILE_INVALID',
          message: 'Scene Sync session file is invalid'
        }
      };
    }

    return {
      ok: false,
      error: {
        code: 'SESSION_FILE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to read session file'
      }
    };
  }
}

export async function clearSceneSyncSession(options = {}) {
  const { path: filePath = getDefaultSceneSyncSessionPath() } = options;

  try {
    await rm(filePath);
    return {
      ok: true,
      path: filePath
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        ok: true,
        path: filePath
      };
    }

    return {
      ok: false,
      error: {
        code: 'SESSION_CLEAR_ERROR',
        message: error instanceof Error ? error.message : 'Failed to clear session'
      }
    };
  }
}

export function maskSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length <= 8) {
    return '****';
  }

  const start = sessionId.substring(0, 6);
  const end = sessionId.substring(sessionId.length - 4);
  return `${start}...${end}`;
}
