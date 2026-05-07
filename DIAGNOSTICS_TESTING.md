# VS Code Diagnostics Manual Testing Guide

This guide explains how to test the VS Code diagnostics feature for Loomlet DSL that was just implemented.

## Prerequisites

Make sure all unit tests pass:

```bash
npm run test:unit
cd extensions/vscode-loomlet
npm test
```

## Launch Extension Development Host

1. Open the Loomlet workspace in VS Code
2. Navigate to `extensions/vscode-loomlet`
3. Press **F5** to launch the Extension Development Host
4. A new VS Code window will open with the extension running

## Test Cases

### 1. Valid DSL (No Diagnostics Expected)

Create a new file `test.loom` with:

```loom
x = 1
y = add(x, 5)
z = multiply(y, 2)
```

**Expected**: No Problems shown in VS Code Problems panel

### 2. Syntax Error (Parse Error Diagnostic Expected)

Create a file with an incomplete expression:

```loom
x = math.sine(t, frequency:
```

**Expected**: 
- Red squiggle appears on the incomplete line
- VS Code Problems panel shows parse error
- Error source is "loomlet"

### 3. Undefined Variable (Compile Error Diagnostic Expected)

Create a file:

```loom
a = 1
b = add(a, undefined_var)
```

**Expected**:
- Red squiggle on `undefined_var`
- Problems panel shows "Undefined identifier: undefined_var"
- Error code is "UNDEFINED_IDENTIFIER"

### 4. Unknown Node Type (Compile Error Diagnostic Expected)

Create a file:

```loom
x = nonexistent_function(1)
```

**Expected**:
- Red squiggle on `nonexistent_function`
- Problems panel shows "Unknown node type: nonexistent_function"
- Error code is "UNKNOWN_NODE_TYPE"

### 5. Real-Time Validation (Debouncing Verification)

1. Open a valid `.loom` file
2. Start typing an invalid syntax (e.g., `y = sink(`)
3. **Expected**: Diagnostics appear after you stop typing for ~250ms (debounce delay)
4. Delete the invalid code
5. **Expected**: Diagnostic clears after debounce delay

### 6. Editor Metadata Handling

Create a file with valid code AND metadata:

```loom
x = 1
y = add(x, 5)

# @loomlet.editor {"version":1,"layout":{"nodes":{"x":{"x":0,"y":0}}}}
```

**Expected**:
- No diagnostics (metadata should be stripped before validation)
- File can be saved and metadata is preserved

### 7. Document Close Behavior

1. Open a `.loom` file with diagnostics
2. Problems panel shows errors
3. Close the file tab
4. **Expected**: Diagnostics for that document are cleared from Problems panel

### 8. Multiple Files

1. Open two `.loom` files
2. Add errors to both
3. Switch between files
4. **Expected**: Problems panel updates to show diagnostics for the currently active file

## Implementation Details

### Validation Events

The diagnostics system validates on:

- **File Open**: Validate immediately when a `.loom` file is opened
- **Text Change**: Validate with 250ms debounce (prevents excessive re-parsing while typing)
- **File Save**: Validate immediately when file is saved
- **File Close**: Clear diagnostics for the closed file

### Error Conversion

- Parser/compiler line/column values are 1-based
- VS Code expects 0-based positions
- Ranges are clamped to document bounds to prevent invalid positions

### Supported Error Types

- **ParseError**: Syntax errors (tokenization, unexpected tokens, incomplete expressions)
- **CompileError**: Semantic errors (undefined variables, unknown node types, invalid arguments)

## Troubleshooting

If diagnostics don't appear:

1. Check that the file has `.loom` extension or `loomlet` language ID
2. Check VS Code Problems panel is visible (View > Problems)
3. Check console for errors (View > Output > Extension Host)
4. Check that no parse errors prevent compilation

If diagnostics are too noisy:

1. The 250ms debounce should prevent flicker while typing
2. If experiencing issues, check extension logs

## Performance Notes

- Validation runs synchronously for each document
- Complex graphs may take ~50-200ms to validate
- Debouncing prevents excessive CPU usage during rapid typing
- Large files with many nodes may have noticeable delay

## Feature Completeness

✅ Parse error diagnostics
✅ Compile error diagnostics
✅ Real-time validation
✅ Debounced text change handling
✅ Editor metadata stripping
✅ Document lifecycle management
✅ Error range clamping
✅ Unit tests

🚧 Not yet implemented (by design):
- Full Language Server Protocol
- Formatter
- Hover documentation
- Real graph preview
