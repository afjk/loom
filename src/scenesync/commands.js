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

export function formatObjectMap(objects) {
  if (!objects || typeof objects !== 'object') {
    return [];
  }

  return Object.entries(objects).map(([id, object]) => ({
    id,
    ...object
  }));
}
