import test from 'node:test';
import assert from 'node:assert/strict';

import { syncPendingDslBeforeNodeOperation } from '../editor-studio/src/live-sync-guards.js';

test('syncPendingDslBeforeNodeOperation leaves node edits alone when DSL is already synced', async () => {
  let interrupted = false;
  let applied = false;

  const result = await syncPendingDslBeforeNodeOperation({
    hasUnsyncedDslText: false,
    getDslText: () => 'wave = sine()',
    applyDslTextToGraph: async () => {
      applied = true;
      return { ok: true };
    },
    interruptAutoApply: () => {
      interrupted = true;
    }
  });

  assert.deepEqual(result, { ok: true, synced: false, result: null });
  assert.equal(interrupted, false);
  assert.equal(applied, false);
});

test('syncPendingDslBeforeNodeOperation applies pending DSL before node edits', async () => {
  let interrupted = false;
  let receivedText = null;
  let receivedOptions = null;
  let syncedResult = null;

  const result = await syncPendingDslBeforeNodeOperation({
    hasUnsyncedDslText: true,
    getDslText: () => 'wave = sine(freq: 0.5)',
    applyDslTextToGraph: async (text, options) => {
      receivedText = text;
      receivedOptions = options;
      return { ok: true, graph: { nodes: [] } };
    },
    interruptAutoApply: () => {
      interrupted = true;
    },
    onSyncOk: (value) => {
      syncedResult = value;
    }
  });

  assert.equal(interrupted, true);
  assert.equal(receivedText, 'wave = sine(freq: 0.5)');
  assert.deepEqual(receivedOptions, {
    markDirty: true,
    preserveGraphOnError: true
  });
  assert.equal(result.ok, true);
  assert.equal(result.synced, true);
  assert.deepEqual(syncedResult, result.result);
});

test('syncPendingDslBeforeNodeOperation blocks node edits when pending DSL does not compile', async () => {
  let interrupted = false;
  let syncErrors = null;

  const result = await syncPendingDslBeforeNodeOperation({
    hasUnsyncedDslText: true,
    getDslText: () => 'wave =',
    applyDslTextToGraph: async () => ({
      ok: false,
      errors: [{ code: 'PARSE_ERROR', message: 'unexpected eof' }]
    }),
    interruptAutoApply: () => {
      interrupted = true;
    },
    onSyncError: (value) => {
      syncErrors = value.errors;
    }
  });

  assert.equal(interrupted, true);
  assert.equal(result.ok, false);
  assert.equal(result.synced, false);
  assert.deepEqual(syncErrors, [{ code: 'PARSE_ERROR', message: 'unexpected eof' }]);
});

