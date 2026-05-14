import { pathToFileURL } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { canUseTwoPositionalArgs } from '../src/loom.js';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';

export function buildVSCodeLibraryMetadata(metadata = LIBRARY_METADATA) {
  const libraries = Object.values(metadata).map((lib) => ({
    name: lib.name,
    status: lib.status ?? 'implemented',
    description: lib.description ?? '',
    targets: lib.targets ?? [],
    functions: Object.values(lib.functions ?? {}).map((fn) => ({
      name: fn.name,
      fullName: `${lib.name}.${fn.name}`,
      status: fn.status ?? 'implemented',
      signature: fn.signature ?? `${lib.name}.${fn.name}()`,
      description: fn.description ?? '',
      returns: fn.returns ?? 'any',
      allowsTwoPositionalArgs: canUseTwoPositionalArgs(`${lib.name}.${fn.name}`, { inputs: fn.args ?? [] }),
      inputs: (fn.args ?? []).map((arg) => ({
        name: arg.name,
        type: arg.type ?? 'any',
        positional: Boolean(arg.positional),
        description: arg.description ?? ''
      }))
    }))
  }));

  return { libraries };
}

export function renderVSCodeLibraryMetadataJson(metadata = LIBRARY_METADATA) {
  return `${JSON.stringify(buildVSCodeLibraryMetadata(metadata), null, 2)}\n`;
}

export async function writeVSCodeLibraryMetadata() {
  const json = renderVSCodeLibraryMetadataJson();
  const outPath = resolve('extensions/vscode-loomlet/generated/library-metadata.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, json, 'utf8');
  console.log(`Wrote ${outPath}`);
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (isDirectExecution()) {
  await writeVSCodeLibraryMetadata();
}
