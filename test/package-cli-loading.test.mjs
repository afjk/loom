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
const FIXTURE_PACKAGE_DEMO_LOOM = './test/fixtures/package-demo.loom';

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

test('loom docs <library> --package shows library help', () => {
  const result = runCli(['docs', 'demo', `--package=${DEMO_PACKAGE_PATH}`]);

  assert.strictEqual(result.status, 0, `CLI should succeed. stderr: ${result.stderr}`);
  assert.ok(result.stdout.includes('demo'), 'Output should include demo library name');
  assert.ok(result.stdout.includes('double'), 'Output should include double function');
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
