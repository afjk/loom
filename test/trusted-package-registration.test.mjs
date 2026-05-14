import test from 'node:test';
import assert from 'node:assert/strict';
import { createNodeRegistry } from '../src/runtime/node-registry.js';
import { registerBuiltinNodes } from '../src/nodes/index.js';
import { registerTrustedPackage } from '../src/runtime/package-registration.js';
import * as demoPackage from '../examples/packages/demo/index.js';

test('registerTrustedPackage registers package nodes', () => {
  const registry = createNodeRegistry();
  registerBuiltinNodes(registry);

  registerTrustedPackage(registry, demoPackage);

  assert.equal(registry.hasNodeType('demo.double'), true);
  assert.equal(registry.hasNodeType('demo.offset'), true);
});

test('registerTrustedPackage rejects module without registerLoomletPackage', () => {
  const registry = createNodeRegistry();

  assert.throws(
    () => registerTrustedPackage(registry, {}),
    /registerLoomletPackage/
  );
});

test('registerTrustedPackage rejects invalid registry', () => {
  assert.throws(
    () => registerTrustedPackage(null, demoPackage),
    /node registry/
  );
});

test('registerTrustedPackage rejects duplicate node registration', () => {
  const registry = createNodeRegistry();

  registerTrustedPackage(registry, demoPackage);

  assert.throws(
    () => registerTrustedPackage(registry, demoPackage),
    /Duplicate node type/
  );
});
