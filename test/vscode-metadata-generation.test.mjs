import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';
// Importing the renderer must be side-effect free; this test compares committed metadata to expected generated output.
import { renderVSCodeLibraryMetadataJson } from '../scripts/generate-vscode-metadata.mjs';

const metadataPath = resolve('extensions/vscode-loomlet/generated/library-metadata.json');

const expected = renderVSCodeLibraryMetadataJson(LIBRARY_METADATA);
const actual = await readFile(metadataPath, 'utf8');

if (expected !== actual) {
  console.error('FAIL: VS Code generated library metadata is stale');
  console.error(`Run: npm run generate:vscode-metadata`);
  process.exit(1);
}

console.log('PASS: VS Code generated library metadata is up to date');
