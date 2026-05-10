# Examples

Note: these examples are part of the GitHub repository. They are not included in the npm package tarball.

## Examples

- [cli-basic.loom](cli-basic.loom) - minimal CLI compile example
- [cli-json.loom](cli-json.loom) - JSON parse/stringify example
- [cli-text.loom](cli-text.loom) - text processing example
- [scene-effects.loom](scene-effects.loom) - Scene Sync effect example
- [lissajous.loom](lissajous.loom) - Scene Sync behavior graph example
- [scene-offset-position.loom](scene-offset-position.loom) - object offset behavior example
- [scene-offset-circle.loom](scene-offset-circle.loom) - circular offset behavior example

## Run with CLI

From the repository root:

```bash
npx -p @afjk/loomlet loomlet compile examples/cli-basic.loom
```

From a local checkout (without global install):

```bash
node bin/loomlet.mjs compile examples/cli-basic.loom
```
