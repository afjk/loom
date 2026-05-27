import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const sourcePath = 'test/fixtures/runtime-parity/portable-node-cases.json';
const unityPath = 'unity/com.afjk.loomlet-runtime/Tests/Fixtures/portable-node-cases.json';

function sha256(path) {
  return crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
}

test('Unity runtime parity fixtures stay in sync with JS runtime fixtures', () => {
  assert.equal(
    sha256(unityPath),
    sha256(sourcePath),
    `${unityPath} is copied from ${sourcePath}; refresh the Unity fixture subset when portable parity cases change.`
  );
});
