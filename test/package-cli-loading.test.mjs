import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createNodeRegistry,
  createLibraryMetadataRegistry,
  loadTrustedLocalPackage,
  registerBuiltinNodes
} from '../src/toolchain/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCli(args, options = {}) {
  const result = spawnSync('node', ['bin/loom.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: options.timeout || 5000
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error
  };
}

const DEMO_PACKAGE_PATH = './examples/packages/demo/index.js';
const MANIFEST_PACKAGE_PATH = './test/fixtures/manifest-package';
const FIXTURE_PACKAGE_DEMO_LOOM = './test/fixtures/package-demo.loom';
const FIXTURE_MANIFEST_PACKAGE_LOOM = './test/fixtures/manifest-package.loom';

test('loadTrustedLocalPackage loads demo package', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const result = await loadTrustedLocalPackage(DEMO_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  assert.strictEqual(result.path, DEMO_PACKAGE_PATH);
  assert.ok(result.resolvedPath);
  assert.ok(result.libraries.includes('demo'));
  assert.ok(result.nodeTypes.includes('demo.double'));
  assert.ok(result.nodeTypes.includes('demo.offset'));
  assert.ok(metadataRegistry.hasLibraryMetadata('demo'));
});

test('loadTrustedLocalPackage summary includes only package-added entries', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const result = await loadTrustedLocalPackage(DEMO_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  // Summary should contain only demo, not builtin libraries like math, text, etc.
  assert.deepEqual(result.libraries, ['demo']);
  assert.deepEqual(result.nodeTypes, ['demo.double', 'demo.offset']);

  // But the full registry should still have builtins
  assert.ok(nodeRegistry.hasNodeType('math.add'), 'Builtin math.add should still be in registry');
  // Package metadata is registered, but not builtin metadata (since we didn't register them)
  assert.ok(metadataRegistry.hasLibraryMetadata('demo'), 'Package demo should be in metadata');
});

test('loadTrustedLocalPackage summary filters out builtin libraries', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  // Register builtins first
  registerBuiltinNodes(nodeRegistry);

  // Verify builtins are there before loading package
  const beforeLoad = nodeRegistry.toObject();
  assert.ok(Object.keys(beforeLoad).some((key) => key.startsWith('math.')), 'Builtins should be registered');

  // Load package
  const result = await loadTrustedLocalPackage(DEMO_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  // Result should only contain demo entries
  assert.deepEqual(result.libraries, ['demo']);
  assert.deepEqual(result.nodeTypes, ['demo.double', 'demo.offset']);

  // No builtin libraries in summary
  assert.ok(!result.libraries.includes('math'), 'math should not be in summary');
  assert.ok(!result.libraries.includes('text'), 'text should not be in summary');
});

test('loadTrustedLocalPackage registers both nodes and metadata', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  await loadTrustedLocalPackage(DEMO_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  assert.ok(nodeRegistry.hasNodeType('demo.double'));
  assert.ok(nodeRegistry.hasNodeType('demo.offset'));

  const demoMeta = metadataRegistry.getLibraryMetadata('demo');
  assert.ok(demoMeta);
  assert.strictEqual(demoMeta.name, 'demo');
  assert.ok(demoMeta.functions.double);
  assert.ok(demoMeta.functions.offset);
});

test('loadTrustedLocalPackage preserves explicit file package loading', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const result = await loadTrustedLocalPackage(DEMO_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.path, DEMO_PACKAGE_PATH);
  assert.equal(result.manifestPath, null);
  assert.ok(result.entryPath.endsWith('/examples/packages/demo/index.js'));
  assert.ok(nodeRegistry.hasNodeType('demo.double'));
  assert.ok(metadataRegistry.hasLibraryMetadata('demo'));
});

test('loadTrustedLocalPackage loads directory manifest entry and metadata', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const result = await loadTrustedLocalPackage(MANIFEST_PACKAGE_PATH, {
    nodeRegistry,
    metadataRegistry
  });

  assert.equal(result.path, MANIFEST_PACKAGE_PATH);
  assert.ok(result.manifestPath.endsWith('/test/fixtures/manifest-package/loomlet.package.json'));
  assert.ok(result.entryPath.endsWith('/test/fixtures/manifest-package/index.js'));
  assert.ok(result.metadataPath.endsWith('/test/fixtures/manifest-package/metadata.json'));
  assert.deepEqual(result.libraries, ['manifestpkg']);
  assert.deepEqual(result.nodeTypes, ['manifestpkg.value']);
  assert.ok(nodeRegistry.hasNodeType('manifestpkg.value'));
  assert.ok(metadataRegistry.hasLibraryMetadata('manifestpkg'));
  assert.equal(metadataRegistry.getLibraryMetadata('manifestpkg').functions.value.returns, 'number');
});

test('loadTrustedLocalPackage throws for directory missing manifest', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  await assert.rejects(
    async () => {
      await loadTrustedLocalPackage('./test/fixtures/package-missing-manifest', {
        nodeRegistry,
        metadataRegistry
      });
    },
    (error) => {
      assert.ok(error.message.includes('Package manifest loomlet.package.json not found'));
      return true;
    }
  );
});

test('loadTrustedLocalPackage throws for directory missing entry', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  await assert.rejects(
    async () => {
      await loadTrustedLocalPackage('./test/fixtures/package-missing-entry', {
        nodeRegistry,
        metadataRegistry
      });
    },
    (error) => {
      assert.ok(error.message.includes('Failed to load package'));
      assert.ok(error.message.includes('missing.js'));
      return true;
    }
  );
});

test('loadTrustedLocalPackage throws for invalid directory manifest', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  await assert.rejects(
    async () => {
      await loadTrustedLocalPackage('./test/fixtures/package-invalid-manifest', {
        nodeRegistry,
        metadataRegistry
      });
    },
    (error) => {
      assert.ok(error.message.includes('Invalid package manifest'));
      assert.ok(error.message.includes('Required field "name"'));
      return true;
    }
  );
});

test('loadTrustedLocalPackage throws for missing file', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const invalidPath = './does-not-exist.js';

  await assert.rejects(
    async () => {
      await loadTrustedLocalPackage(invalidPath, {
        nodeRegistry,
        metadataRegistry
      });
    },
    (error) => {
      assert.ok(error.message.includes('Package file not found'));
      assert.ok(error.message.includes(invalidPath));
      return true;
    }
  );
});

test('loadTrustedLocalPackage throws for invalid package', async () => {
  const nodeRegistry = createNodeRegistry();
  const metadataRegistry = createLibraryMetadataRegistry();

  registerBuiltinNodes(nodeRegistry);

  const invalidPath = './package.json';

  await assert.rejects(
    async () => {
      await loadTrustedLocalPackage(invalidPath, {
        nodeRegistry,
        metadataRegistry
      });
    },
    (error) => {
      // JSON file won't be a valid module with registerLoomletPackage export
      assert.ok(error.message);
      return true;
    }
  );
});

test('loom docs --package shows loaded package metadata', () => {
  const result = runCli(['docs', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library');
});

test('loom docs --package=<path> form works', () => {
  const result = runCli(['docs', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library');
});

test('loom docs --package <path> form works', () => {
  const result = runCli(['docs', '--package', DEMO_PACKAGE_PATH]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library');
});

test('loom docs --package <directory> shows manifest metadata', () => {
  const result = runCli(['docs', '--package', MANIFEST_PACKAGE_PATH]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('manifestpkg'), 'Output should include manifest package library');
  assert.ok(result.stdout.includes('Manifest package fixture metadata'));
});

test('loom docs with package shows both builtin and package libraries', () => {
  const result = runCli(['docs', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library');
  assert.ok(result.stdout.includes('math'), 'Output should include builtin math library');
});

test('loom docs <library> --package shows library help', () => {
  const result = runCli(['docs', 'demo', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library name');
  assert.ok(result.stdout.includes('double'), 'Output should include double function');
});

test('loom docs math --package still shows builtin library help', () => {
  const result = runCli(['docs', 'math', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('math'), 'Output should include math library name');
  assert.ok(result.stdout.includes('add') || result.stdout.includes('subtract'), 'Output should include math functions');
});

test('loom docs <lib.func> --package shows function help', () => {
  const result = runCli(['docs', 'demo.double', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('double'), 'Output should include function name');
  assert.ok(result.stdout.includes('Doubles'), 'Output should include function description');
});

test('loom run <file> --package loads and executes code with package', () => {
  const result = runCli(['run', FIXTURE_PACKAGE_DEMO_LOOM, `--package=${DEMO_PACKAGE_PATH}`, '--get', 'x.out']);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('42'), 'demo.double(21) should return 42');
});

test('loom run <file> --package <directory> loads and executes manifest package', () => {
  const result = runCli([
    'run',
    FIXTURE_MANIFEST_PACKAGE_LOOM,
    '--package',
    MANIFEST_PACKAGE_PATH,
    '--get',
    'x.out'
  ]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('7'), 'manifestpkg.value() should return 7');
});

test('loom compile rejects manifest package import for unsupported target', () => {
  const result = runCli([
    'compile',
    FIXTURE_MANIFEST_PACKAGE_LOOM,
    '--package',
    MANIFEST_PACKAGE_PATH,
    '--target',
    'unity'
  ]);

  assert.notStrictEqual(result.status, 0, 'Compile should reject unsupported target');
  assert.ok(result.stderr.includes("Import 'manifestpkg' is not available in target 'unity'"));
});

test('loom run <file> --package with same package flag twice fails', () => {
  const result = runCli([
    'run',
    FIXTURE_PACKAGE_DEMO_LOOM,
    `--package=${DEMO_PACKAGE_PATH}`,
    `--package=${DEMO_PACKAGE_PATH}`,
    '--get',
    'x.out'
  ]);

  assert.notStrictEqual(result.status, 0, 'Loading the same package twice should fail');
  assert.ok(result.stderr.includes('Duplicate'), 'Error should mention duplicate node types');
});

test('loom inspect <file> --package works with package', () => {
  const result = runCli(['inspect', FIXTURE_PACKAGE_DEMO_LOOM, `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo.double'), 'Inspection should include demo.double node');
  assert.ok(result.stdout.includes('demo.offset'), 'Inspection should include demo.offset node');
});

test('loom compile <file> --package works with package', () => {
  const result = runCli(['compile', FIXTURE_PACKAGE_DEMO_LOOM, `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  const output = JSON.parse(result.stdout);
  assert.ok(output.nodes, 'Output should have nodes');
  const hasDemo = output.nodes.some((node) => node.type.startsWith('demo.'));
  assert.ok(hasDemo, 'Compiled graph should include demo nodes');
});

test('loom run without --package uses only builtin nodes', () => {
  const result = runCli(['run', FIXTURE_PACKAGE_DEMO_LOOM]);

  assert.notStrictEqual(result.status, 0, 'Should fail without --package since demo is not a builtin library');
  assert.ok(result.stderr.includes('demo') || result.stderr.includes('UNKNOWN'), 'Error should mention unknown library/node');
});
