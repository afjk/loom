export async function syncPendingDslBeforeNodeOperation({
  hasUnsyncedDslText,
  getDslText,
  applyDslTextToGraph,
  interruptAutoApply,
  onSyncOk,
  onSyncError
}) {
  if (!hasUnsyncedDslText) {
    return { ok: true, synced: false, result: null };
  }

  interruptAutoApply?.();

  const result = await applyDslTextToGraph(getDslText(), {
    markDirty: true,
    preserveGraphOnError: true
  });

  if (!result.ok) {
    onSyncError?.(result);
    return { ok: false, synced: false, result };
  }

  onSyncOk?.(result);
  return { ok: true, synced: true, result };
}

