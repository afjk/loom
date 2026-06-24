# CLI guide

Install:

```bash
npm install -g @afjk/loomlet
loomlet --help
```

Or run directly with `npx`:

```bash
npx -p @afjk/loomlet loomlet --help
```

Minimal compile flow:

```bash
echo 'x = 1' > hello.loom
npx -p @afjk/loomlet loomlet compile hello.loom
```

Related docs:

- [REPL reference](REPL.md)
- [Scene Sync integration](scene-sync.md)

## Host compatibility check

`loomlet check-compat` reports whether a graph can run on a host, and which
capabilities or nodes are unsupported, without executing the graph. The input
may be a `.loom` source (compiled first) or a GraphJSON `.json` file.

```bash
# Check every known host
loomlet check-compat behavior.loom

# Check a single host; exits non-zero if a required capability is missing
loomlet check-compat behavior.loom --target unity-runtime

# Machine-readable report
loomlet check-compat behavior.loom --target unity-runtime --json
```

Known hosts: `web-scenesync`, `unity-runtime`, `export-viewer`, `cli`.

The exit code is non-zero only when `--target` is given and the graph requires a
capability that host does not provide. Unclassified custom nodes (no capability
metadata) are reported as warnings and do not change the exit code. See the
[Host Capability Guide](HOST_CAPABILITY_GUIDE.md) and
[Graph Capability Metadata v0](design/graph-capability-metadata-v0.md) for the
underlying model.

## Events-file playback

`loomlet run` can replay a deterministic host-input/event script:

```bash
loomlet run behavior.loom --events-file events.json --get enter.event
```

Playback always prints JSON. The file is a small command script, not a persistent recording
format:

```json
{
  "time": 0,
  "dt": 0,
  "inputs": { "distance": 2 },
  "scope": { "type": "object", "id": "cube-01" },
  "steps": [
    { "label": "outside", "inputs": { "distance": 2 } },
    { "label": "enter", "tick": 0.1, "inputs": { "distance": 0.8 } },
    {
      "label": "click",
      "events": [
        { "channel": "pointer.click", "timestamp": 0.1, "target": "cube-01" }
      ]
    }
  ]
}
```

Top-level `inputs`, `time`, `dt`, and `scope` are applied before the graph is loaded. Each
step may update `inputs`, set `time` or `dt`, advance `tick`, and dispatch event envelopes via
`events`. Graph state is preserved across steps using the same persistent session semantics as
the REPL.
