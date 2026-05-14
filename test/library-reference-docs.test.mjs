import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';
import { renderStandardLibraryReferenceMarkdown } from '../scripts/generate-library-reference-docs.mjs';

const docsPath = resolve('docs/STANDARD_LIBRARY_REFERENCE.md');

const expected = renderStandardLibraryReferenceMarkdown(LIBRARY_METADATA);
const actual = await readFile(docsPath, 'utf8');

if (expected !== actual) {
  console.error('FAIL: Standard library reference docs are stale');
  console.error(`Run: npm run generate:library-docs`);
  process.exit(1);
}

console.log('PASS: Standard library reference docs are up to date');
