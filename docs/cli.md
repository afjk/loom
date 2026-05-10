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
