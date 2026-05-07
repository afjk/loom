# Loomlet REPL

Start:

`loomlet repl`

Commands:

- `:libs`
- `:help <library>`
- `:help <library.function>`
- `:load <file>`
- `:run <file>`
- `:vars`
- `:reset`
- `:history`
- `:clear`
- `:exit` (also `:quit`)

Notes:

- Definitions persist across REPL snippets.
- `:load` evaluates a file into the current session, so loaded definitions remain available.
- `:run` executes a file in isolation and does not mutate the current session.
- REPL errors do not close the session.

Examples:

`math.add(1, 2)`

`double = fn(x) => math.multiply(x, 2)`

`double(21)`
