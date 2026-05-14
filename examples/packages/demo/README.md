# Demo Package

This is a trusted local package example.

It is not loaded from npm or a remote URL.
It proves the runtime registration API can extend Loomlet with package nodes.

The package also exports library metadata, making its nodes discoverable to editors and documentation tools.

## Usage

Register the package with a node registry, then use its nodes in DSL:

```loom
import demo

x = demo.double(value: 5)
y = demo.offset(x, amount: 3)
```

## Nodes

### demo.double

Multiplies a number by 2.

**Input:** `value` (number, default: 0)  
**Output:** `out` (number)

### demo.offset

Adds an amount to a number.

**Inputs:** 
- `value` (number, default: 0)
- `amount` (number, default: 1)

**Output:** `out` (number)
