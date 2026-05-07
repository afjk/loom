import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { LIBRARY_METADATA } from '../src/toolchain/library-metadata.js';

function toGenerated() {
  const libraries = Object.values(LIBRARY_METADATA).map((lib) => ({
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

const outPath = resolve('extensions/vscode-loomlet/generated/library-metadata.json');
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(toGenerated(), null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
