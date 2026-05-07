#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';
import {
  compileLoomSource,
  formatLoomSource,
  inspectLoomSource,
  formatInspectionSummary,
  runLoomSource,
  formatLoomError,
  isKnownRuntimeTarget,
  LoomReplSession,
  formatLibrariesText,
  formatLibraryHelpText,
  formatFunctionHelpText,
  formatHelpJson
} from '../src/toolchain/index.js';
import {
  DEFAULT_ENDPOINT as DEFAULT_SCENESYNC_ENDPOINT,
  SceneSyncClient,
  formatSceneSyncError,
  getDefaultSceneSyncSessionPath,
  saveSceneSyncSession,
  loadSceneSyncSession,
  clearSceneSyncSession,
  maskSessionId,
  sceneEffectsToBroadcastOps,
  sceneEffectsToBroadcastPayload,
  createSceneGraphSetPayload,
  createSceneGraphClearPayload,
  compileLoomToSceneSyncGraph,
  loomGraphToSceneSyncGraph
} from '../src/scenesync/index.js';
import { SCENESYNC_DEMOS, getSceneSyncDemoByName } from '../src/scenesync/demo-registry.js';

function print(message = '') {
  process.stdout.write(`${message}\n`);
}

function printError(message = '') {
  process.stderr.write(`${message}\n`);
}

function formatEffectValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function printToolErrors(errors) {
  for (const error of errors) {
    printError(formatLoomError(error));
  }
}

function parseBoolean(value) {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new Error(`expected true or false, got: ${value}`);
}

function parseNumber(value, optionName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${optionName} expects a finite number`);
  }
  return parsed;
}

function parseTarget(value) {
  if (!value || value.startsWith('-')) {
    throw new Error('--target requires a runtime target');
  }
  if (!isKnownRuntimeTarget(value)) {
    throw new Error(`Unknown runtime target: ${value}`);
  }
  return value;
}

function parseCommonCommandArgs(args) {
  let file = null;
  const rest = [];

  for (const arg of args) {
    if (file === null && !arg.startsWith('-')) {
      file = arg;
    } else {
      rest.push(arg);
    }
  }

  return { file, rest };
}

function stringifyJson(value, pretty = true) {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

function getGeneralHelp() {
  return `Loomlet CLI

Usage:
  loomlet <command> <file> [options]

Commands:
  compile <file>   Compile Loomlet DSL to GraphJSON
  format <file>    Format Loomlet DSL
  inspect <file>   Inspect Loomlet DSL and print a summary
  run <file>       Evaluate a Loomlet graph once
  repl             Start an interactive Loomlet REPL
  docs             Browse library documentation
  scenesync        Probe Scene Sync rooms
  help             Show help

Examples:
  loomlet compile examples/cli-basic.loom
  loomlet format examples/cli-basic.loom --check
  loomlet inspect examples/cli-basic.loom --json
  loomlet run examples/cli-basic.loom --get x.out --time 0.25
  loomlet docs
  loomlet docs text
  loomlet docs text.upper
  loomlet scenesync redeem 238909
  loomlet scenesync objects --room <roomId> --session <sessionId>
  loomlet repl`;
}

function getCompileHelp() {
  return `Usage:
  loomlet compile <file> [--out <file>] [--pretty false] [--target <target>]

Options:
  -o, --out <file>   Write GraphJSON to a file
  --pretty false     Print compact JSON
  --target <target>  Validate imports for a runtime target. Default: any`;
}

function getFormatHelp() {
  return `Usage:
  loomlet format <file> [--write] [--check]

Options:
  --write   Overwrite the input file
  --check   Exit 1 if formatting would change the file`;
}

function getInspectHelp() {
  return `Usage:
  loomlet inspect <file> [--ast] [--graph] [--json] [--target <target>]

Options:
  --ast    Print Source AST JSON
  --graph  Print GraphJSON
  --json   Print the full inspection result as JSON
  --target <target>  Validate imports for a runtime target. Default: any`;
}

function getRunHelp() {
  return `Usage:
  loomlet run <file> --get <ref> [--time <number>] [--dt <number>] [--json] [--target <target>]

Options:
  --get <ref>       Output reference to read. Repeatable.
  --time <number>   Evaluation time in seconds. Default: 0
  --dt <number>     Delta time in seconds. Default: 0
  --json            Print result values as JSON
  --target <target> Only cli is supported by loomlet run in this version. Default: cli`;
}

function getReplHelp() {
  return `Usage:
  loomlet repl

Commands:
  :help              Show REPL help
  :libs              List all available libraries
  :help <library>    Show functions in a library
  :help <lib.func>   Show function documentation
  :load <file>       Load and evaluate a Loom file in this session
  :run <file>        Run a Loom file without mutating this session
  :vars              Show current variables
  :history           Show current session input history
  :clear             Clear the terminal (or print blank lines)
  :source            Show accumulated source
  :inspect           Show current graph summary
  :graph             Show current GraphJSON
  :reset             Clear current session
  :quit              Exit the REPL
  :q                 Exit the REPL
  :exit              Exit the REPL`;
}

function formatReplVarValue(value) {
  if (typeof value === 'function') {
    return '<function>';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  try {
    const text = JSON.stringify(value);
    if (!text) {
      return String(value);
    }
    return text.length > 120 ? `${text.slice(0, 117)}...` : text;
  } catch {
    return String(value);
  }
}

function getSceneSyncHelp() {
  return `Usage:
  loomlet scenesync <command> [options]

Commands:
  redeem <code>            Redeem a Scene Sync AI link code
  session                  Show saved Scene Sync session
  status                   Alias for session
  logout                   Clear saved Scene Sync session
  run <file>               Convert Loomlet scene effects to Scene Sync broadcast payload
  graph-compile <file>     Compile Loomlet DSL to Scene Sync behavior graph
  graph-run <file>         Compile and set a Scene Sync graph from Loomlet DSL
  graph-set <obj> <g>      Set a Loomlet graph behavior on a Scene Sync object
  graph-clear <obj>        Clear Loomlet graph behavior from a Scene Sync object
  dev <file>               Watch Loomlet DSL and live-send Scene Sync graph updates
  demo list                List built-in Scene Sync demo samples
  demo setup <name>        Check whether required demo objects exist
  demo run <name>          Run a built-in demo through scenesync dev
  ping                     Check Scene Sync room connection
  info                     Get room information
  objects                  List scene objects
  list-objects             Alias for objects

Options:
  --save               Save redeemed session locally
  --dry-run            Print payload without sending (default for run, graph-set, graph-clear)
  --send               Broadcast payload to Scene Sync
  --object <id>        Compile/run as an object-level graph (for graph-compile and graph-run)
  --scene              Compile/run as a scene-level graph (for graph-compile and graph-run)
  --room <room>        Scene Sync room code
  --session <id>       Scene Sync session ID
  --endpoint <url>     Scene Sync command endpoint. Default: ${DEFAULT_SCENESYNC_ENDPOINT}
  --json               Print raw JSON response

Examples:
  loomlet scenesync run examples/scene-effects.loom
  loomlet scenesync run examples/scene-effects.loom --send
  loomlet scenesync graph-compile examples/lissajous.loom
  loomlet scenesync graph-compile examples/lissajous.loom --object sample-cube
  loomlet scenesync graph-compile examples/lissajous.loom --scene
  loomlet scenesync graph-run examples/lissajous.loom --object sample-cube
  loomlet scenesync graph-run examples/lissajous.loom --object sample-cube --send
  loomlet scenesync graph-set sample-cube examples/scene-graphs/lissajous.json
  loomlet scenesync graph-set sample-cube examples/scene-graphs/lissajous.json --send
  loomlet scenesync graph-clear sample-cube --send
  loomlet scenesync demo list
  loomlet scenesync demo setup lissajous
  loomlet scenesync demo run lissajous

Graph Commands:
  By default graph-set, graph-clear, and graph-run are dry-run. Pass --send to broadcast.
  graph-compile and graph-run do not require room/session in dry-run mode.
  Use --object for object scope or --scene for scene scope (mutually exclusive).
  If neither is specified, scope is inferred from DSL.

Environment Variables:
  LOOMLET_SCENESYNC_ROOM              Default room code
  LOOMLET_SCENESYNC_SESSION           Default session ID
  LOOMLET_SCENESYNC_ENDPOINT          Default endpoint

Saved session path:
  ~/.config/loomlet/scenesync-session.json`;
}

function formatValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function printEffects(effects) {
  for (const effect of effects || []) {
    if (effect.type === 'scene.setPosition') {
      const [x, y, z] = effect.position || [];
      printError(`[scene.setPosition] ${effect.objectId} position=(${x}, ${y}, ${z})`);
    } else if (effect.type === 'scene.setRotation') {
      const [x, y, z, w] = effect.rotation || [];
      printError(`[scene.setRotation] ${effect.objectId} rotation=(${x}, ${y}, ${z}, ${w})`);
    } else if (effect.type === 'scene.setScale') {
      const [x, y, z] = effect.scale || [];
      printError(`[scene.setScale] ${effect.objectId} scale=(${x}, ${y}, ${z})`);
    } else {
      printError(`[${effect.level}] ${formatEffectValue(effect.value)}`);
    }
  }
}

function getAssignedIdentifier(snippet) {
  const match = snippet.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  return match ? match[1] : null;
}

function getImportedLibrary(snippet) {
  const match = snippet.trim().match(/^import\s+([A-Za-z_][A-Za-z0-9_]*)$/);
  return match ? match[1] : null;
}

function printSnippetResult(snippet, result) {
  printEffects(result.effects || []);

  const imported = getImportedLibrary(snippet);
  if (imported) {
    print(`imported ${imported}`);
    return;
  }

  const assigned = getAssignedIdentifier(snippet);
  if (!assigned) {
    return;
  }

  const refsToTry = [`${assigned}.out`, `${assigned}.t`, `${assigned}.pos`];
  for (const ref of refsToTry) {
    if (Object.hasOwn(result.values, ref) && result.values[ref] !== undefined) {
      print(`${ref} = ${formatValue(result.values[ref])}`);
      return;
    }
  }
}

async function readSourceFile(file) {
  return readFile(path.resolve(process.cwd(), file), 'utf8');
}

async function parseSceneSyncArgs(args) {
  let room = '';
  let session = '';
  let endpoint = '';
  let save = false;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else if (arg === '--save') {
      save = true;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { room, session, endpoint, save, json };
}

function requireSceneSyncRoom(room) {
  if (!room) {
    throw new Error('Scene Sync room is required. Pass --room <roomId> or set LOOM_SCENESYNC_ROOM.');
  }
}

function requireSceneSyncSession(session) {
  if (!session) {
    throw new Error('Scene Sync session is required. Pass --session <sessionId> or set LOOM_SCENESYNC_SESSION.');
  }
}

function formatSceneSyncPosition(position) {
  if (Array.isArray(position)) {
    return `(${position.join(', ')})`;
  }
  if (position && typeof position === 'object') {
    return `(${position.x ?? '?'}, ${position.y ?? '?'}, ${position.z ?? '?'})`;
  }
  return String(position);
}

function printSceneSyncInfo(room, envId, objectCount) {
  const lines = [
    `Room: ${room}`,
    `Environment: ${envId || '<unknown>'}`,
    `Objects: ${objectCount ?? 0}`
  ];
  print(lines.join('\n'));
}

function printSceneSyncObjects(objects) {
  if (!objects || typeof objects !== 'object' || Object.keys(objects).length === 0) {
    print('Objects: none');
    return;
  }

  print('Objects:');
  for (const [id, object] of Object.entries(objects)) {
    const label = object?.name || object?.type || '<unknown>';
    const position = object?.position !== undefined
      ? `  position=${formatSceneSyncPosition(object.position)}`
      : '';
    print(`- ${id}  ${label}${position}`);
  }
}

async function parseSceneSyncRunArgs(args) {
  let file = null;
  let room = '';
  let session = '';
  let endpoint = '';
  let dryRun = true;
  let send = false;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (file === null && !arg.startsWith('-')) {
      file = arg;
    } else if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--send') {
      send = true;
      dryRun = false;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!file) {
    throw new Error('scenesync run requires a file path');
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { file, room, session, endpoint, dryRun, send, json };
}

async function parseSceneSyncGraphSetArgs(args) {
  let objectId = null;
  let graphFile = null;
  let room = '';
  let session = '';
  let endpoint = '';
  let dryRun = true;
  let send = false;
  let json = false;
  let positionalIndex = 0;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('-')) {
      if (positionalIndex === 0) {
        objectId = arg;
        positionalIndex += 1;
      } else if (positionalIndex === 1) {
        graphFile = arg;
        positionalIndex += 1;
      }
    } else if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--send') {
      send = true;
      dryRun = false;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!objectId) {
    throw new Error('graph-set requires <objectId>');
  }

  if (!graphFile) {
    throw new Error('graph-set requires <graph.json>');
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room && send) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session && send) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { objectId, graphFile, room, session, endpoint, dryRun, send, json };
}

async function parseSceneSyncGraphClearArgs(args) {
  let objectId = null;
  let room = '';
  let session = '';
  let endpoint = '';
  let dryRun = true;
  let send = false;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('-') && !objectId) {
      objectId = arg;
    } else if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--send') {
      send = true;
      dryRun = false;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!objectId) {
    throw new Error('graph-clear requires <objectId>');
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room && send) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session && send) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { objectId, room, session, endpoint, dryRun, send, json };
}

async function parseSceneSyncGraphCompileArgs(args) {
  let file = null;
  let objectId = null;
  let scene = false;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (file === null && !arg.startsWith('-')) {
      file = arg;
    } else if (arg === '--object') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--object requires an object ID');
      }
      objectId = next;
      index += 1;
    } else if (arg === '--scene') {
      scene = true;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (objectId && scene) {
    throw new Error('SCOPE_CONFLICT - Use either --object or --scene, not both.');
  }

  if (!file) {
    throw new Error('graph-compile requires a file path');
  }

  let scope = null;
  if (objectId) {
    scope = { object: objectId };
  } else if (scene) {
    scope = { scene: true };
  }

  return { file, scope, json };
}

async function parseSceneSyncGraphRunArgs(args) {
  let file = null;
  let objectId = null;
  let scene = false;
  let room = '';
  let session = '';
  let endpoint = '';
  let dryRun = true;
  let send = false;
  let json = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (file === null && !arg.startsWith('-')) {
      file = arg;
    } else if (arg === '--object') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--object requires an object ID');
      }
      objectId = next;
      index += 1;
    } else if (arg === '--scene') {
      scene = true;
    } else if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else if (arg === '--send') {
      send = true;
      dryRun = false;
    } else if (arg === '--json') {
      json = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (objectId && scene) {
    throw new Error('SCOPE_CONFLICT - Use either --object or --scene, not both.');
  }

  if (!file) {
    throw new Error('graph-run requires a file path');
  }

  let scope = null;
  if (objectId) {
    scope = { object: objectId };
  } else if (scene) {
    scope = { scene: true };
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room && send) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session && send) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { file, scope, room, session, endpoint, dryRun, send, json };
}

async function compileSceneSyncGraphFile(filePath, options = {}) {
  const source = await readFile(path.resolve(process.cwd(), filePath), 'utf8');
  const result = compileLoomToSceneSyncGraph(source, { scope: options.scope });

  if (!result.scope) {
    throw new Error('SCOPE_REQUIRED - Pass --object <objectId>, --scene, or include an object id in scene.setPosition(...)');
  }

  const payload = createSceneGraphSetPayload(result.scope, result.graph);

  return {
    scope: result.scope,
    graph: result.graph,
    payload
  };
}

async function sendSceneSyncGraphPayload({ client, room, session, payload }) {
  return client.broadcast({ room, session, payload });
}

async function parseSceneSyncDevArgs(args) {
  let file = null;
  let objectId = null;
  let scene = false;
  let room = '';
  let session = '';
  let endpoint = '';
  let dryRun = false;
  let json = false;
  let once = false;
  let debounce = '300';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (file === null && !arg.startsWith('-')) {
      file = arg;
    } else if (arg === '--object') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--object requires an object ID');
      }
      objectId = next;
      index += 1;
    } else if (arg === '--scene') {
      scene = true;
    } else if (arg === '--debounce') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--debounce requires a number');
      }
      debounce = next;
      index += 1;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--once') {
      once = true;
    } else if (arg === '--room') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--room requires a room code');
      }
      room = next;
      index += 1;
    } else if (arg === '--session') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--session requires a session ID');
      }
      session = next;
      index += 1;
    } else if (arg === '--endpoint') {
      const next = args[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('--endpoint requires a URL');
      }
      endpoint = next;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (objectId && scene) {
    throw new Error('SCOPE_CONFLICT - Use either --object or --scene, not both.');
  }

  const debounceMs = Number.parseInt(debounce, 10);
  if (!Number.isFinite(debounceMs) || debounceMs < 0) {
    throw new Error('INVALID_DEBOUNCE - --debounce must be a non-negative number');
  }

  if (!file) {
    throw new Error('dev requires a file path');
  }

  let scope = null;
  if (objectId) {
    scope = { object: objectId };
  } else if (scene) {
    scope = { scene: true };
  }

  const savedSession = await loadSceneSyncSession();
  const savedData = savedSession.ok && savedSession.session ? savedSession.session : null;

  if (!room && !dryRun) {
    room = process.env.LOOMLET_SCENESYNC_ROOM || process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session && !dryRun) {
    session = process.env.LOOMLET_SCENESYNC_SESSION || process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOMLET_SCENESYNC_ENDPOINT || process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { file, scope, room, session, endpoint, dryRun, json, once, debounceMs };
}

function formatScopeForDisplay(scope) {
  if (!scope) return 'unknown';
  if (scope.object) return `object(${scope.object})`;
  if (scope.scene) return 'scene';
  return 'unknown';
}

function logEvent(event, jsonMode) {
  if (jsonMode) {
    print(stringifyJson(event, false));
  }
}

function formatTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function handleSceneSyncDev(args) {
  if (args.includes('--help')) {
    print(`Usage:
  loomlet scenesync dev <file> [--object <id>] [--scene] [--debounce <ms>] [--dry-run] [--json] [--once]

Options:
  --object <id>      Use object-level graph scope
  --scene            Use scene-level graph scope
  --debounce <ms>    Debounce file changes. Default: 300
  --dry-run          Compile on changes but do not send
  --json             Output JSON event logs
  --once             Run startup compile/send once and exit (test mode)

Examples:
  loomlet scenesync dev examples/lissajous.loom
  loomlet scenesync dev examples/lissajous.loom --object sample-cube
  loomlet scenesync dev examples/scene-control.loom --scene
  loomlet scenesync dev examples/lissajous.loom --dry-run --once`);
    return 0;
  }

  let parsedArgs;
  try {
    parsedArgs = await parseSceneSyncDevArgs(args);
  } catch (error) {
    printError(error.message || String(error));
    return 1;
  }

  const { file, scope, room, session, endpoint, dryRun, json: jsonMode, once, debounceMs } = parsedArgs;

  let client = null;
  if (!dryRun) {
    if (!room) {
      printError('Scene Sync room is required. Pass --room <roomId> or set LOOM_SCENESYNC_ROOM.');
      return 1;
    }
    if (!session) {
      printError('Scene Sync session is required. Pass --session <sessionId> or set LOOM_SCENESYNC_SESSION.');
      return 1;
    }
    client = new SceneSyncClient({ endpoint });
  }

  const filePath = path.resolve(process.cwd(), file);
  const resolvedFile = path.relative(process.cwd(), filePath);
  let lastValidGraph = null;
  let inferredScope = scope;
  let isFirstRun = true;
  let compileTimer = null;

  function log(message) {
    print(`[${formatTimestamp()}] ${message}`);
  }

  const startupMode = dryRun ? ' (dry-run)' : '';
  const scopeDisplay = scope ? formatScopeForDisplay(scope) : '(will be determined after first compile)';
  const lines = [
    `Scene Sync dev mode${startupMode}`,
    `File: ${resolvedFile}`,
    `Scope: ${scopeDisplay}`,
    `Debounce: ${debounceMs}ms`
  ];
  print(lines.join('\n'));

  if (jsonMode) {
    logEvent({
      event: 'start',
      file: resolvedFile,
      scope,
      dryRun,
      debounceMs
    }, true);
  }

  async function runCompileAndSend() {
    try {
      log('compiling');

      let compileResult;
      try {
        compileResult = await compileSceneSyncGraphFile(file, { scope });
      } catch (error) {
        const errorCode = error.message?.split(' - ')[0] || 'COMPILE_ERROR';
        const errorMsg = error.message || String(error);
        log(`compile failed`);
        if (jsonMode) {
          logEvent({
            event: 'compile_error',
            error: {
              code: errorCode,
              message: errorMsg
            }
          }, true);
        } else {
          printError(`${errorCode} - ${errorMsg}`);
        }
        return;
      }

      // Update inferred scope after first successful compile if not explicitly set
      if (isFirstRun && !scope) {
        inferredScope = compileResult.scope;
        const scopeDisplay = formatScopeForDisplay(inferredScope);
        log(`scope: ${scopeDisplay}`);
      }

      lastValidGraph = compileResult.graph;
      const nodeCount = compileResult.graph.nodes.length;
      const edgeCount = compileResult.graph.edges.length;

      log(`compiled ${nodeCount} nodes, ${edgeCount} edges`);

      if (jsonMode) {
        logEvent({
          event: 'compiled',
          nodeCount,
          edgeCount
        }, true);
      }

      if (dryRun) {
        if (!jsonMode) {
          print('dry-run graph-set payload:');
          print(stringifyJson(compileResult.payload, true));
        } else {
          logEvent({
            event: 'dry_run_payload',
            payload: compileResult.payload
          }, true);
        }
      } else {
        try {
          await sendSceneSyncGraphPayload({
            client,
            room,
            session,
            payload: compileResult.payload
          });

          log('sent graph-set');

          if (jsonMode) {
            logEvent({
              event: 'sent',
              room,
              nodeCount,
              edgeCount
            }, true);
          }
        } catch (sendError) {
          const errorCode = sendError.message?.split(' - ')[0] || 'SCENESYNC_ERROR';
          const errorMsg = sendError.message || String(sendError);
          log('send failed');
          if (jsonMode) {
            logEvent({
              event: 'send_error',
              error: {
                code: errorCode,
                message: errorMsg
              }
            }, true);
          } else {
            printError(`${errorCode} - ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      const errorCode = 'UNEXPECTED_ERROR';
      const errorMsg = error.message || String(error);
      log('unexpected error');
      if (jsonMode) {
        logEvent({
          event: 'error',
          error: {
            code: errorCode,
            message: errorMsg
          }
        }, true);
      } else {
        printError(`${errorCode} - ${errorMsg}`);
      }
    }
  }

  async function scheduleReload() {
    if (!isFirstRun) {
      log('file changed');
    }
    clearTimeout(compileTimer);
    compileTimer = setTimeout(() => {
      runCompileAndSend().catch(() => {});
    }, debounceMs);
  }

  try {
    await runCompileAndSend();
    isFirstRun = false;

    if (once) {
      if (jsonMode) {
        logEvent({ event: 'stop' }, true);
      }
      return 0;
    }

    print('Watching for changes. Press Ctrl+C to stop.');

    const watcher = watch(filePath, { persistent: true }, () => {
      scheduleReload().catch(() => {});
    });

    return await new Promise((resolve) => {
      process.on('SIGINT', () => {
        watcher.close();
        clearTimeout(compileTimer);
        if (jsonMode) {
          logEvent({ event: 'stop' }, true);
        } else {
          print('Stopped Scene Sync dev mode.');
          if (!dryRun) {
            print('Graph remains active. Use `loomlet scenesync graph-clear ... --send` to clear it.');
          }
        }
        resolve(0);
      });
    });
  } catch (error) {
    printError(error.message || String(error));
    if (jsonMode) {
      logEvent({
        event: 'error',
        error: {
          code: 'FATAL_ERROR',
          message: error.message || String(error)
        }
      }, true);
    }
    return 1;
  }
}

async function handleCompile(args) {
  if (args.includes('--help')) {
    print(getCompileHelp());
    return 0;
  }

  const { file, rest } = parseCommonCommandArgs(args);
  if (!file) {
    throw new Error('compile requires <file>');
  }

  let outputPath = null;
  let pretty = true;
  let target = 'any';

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '-o' || arg === '--out') {
      const next = rest[index + 1];
      if (!next || next.startsWith('-')) {
        throw new Error(`${arg} requires a file path`);
      }
      outputPath = next;
      index += 1;
    } else if (arg === '--pretty') {
      const next = rest[index + 1];
      if (next === undefined || next.startsWith('-')) {
        throw new Error('--pretty requires true or false');
      }
      pretty = parseBoolean(next);
      index += 1;
    } else if (arg === '--target') {
      target = parseTarget(rest[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const source = await readSourceFile(file);
  const result = compileLoomSource(source, { filename: file, target });
  if (!result.ok) {
    printToolErrors(result.errors);
    return 1;
  }

  const json = stringifyJson(result.graph, pretty);
  if (outputPath) {
    await writeFile(path.resolve(process.cwd(), outputPath), `${json}\n`, 'utf8');
  } else {
    print(json);
  }
  return 0;
}

async function handleFormat(args) {
  if (args.includes('--help')) {
    print(getFormatHelp());
    return 0;
  }

  const { file, rest } = parseCommonCommandArgs(args);
  if (!file) {
    throw new Error('format requires <file>');
  }

  let shouldWrite = false;
  let shouldCheck = false;

  for (const arg of rest) {
    if (arg === '--write') {
      shouldWrite = true;
    } else if (arg === '--check') {
      shouldCheck = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const source = await readSourceFile(file);
  const result = formatLoomSource(source, { filename: file });
  if (!result.ok) {
    printToolErrors(result.errors);
    return 1;
  }

  if (shouldCheck) {
    if (result.formatted !== source) {
      printError(`file is not formatted: ${file}`);
      return 1;
    }
    return 0;
  }

  if (shouldWrite) {
    await writeFile(path.resolve(process.cwd(), file), result.formatted, 'utf8');
    return 0;
  }

  print(result.formatted.trimEnd());
  return 0;
}

async function handleInspect(args) {
  if (args.includes('--help')) {
    print(getInspectHelp());
    return 0;
  }

  const { file, rest } = parseCommonCommandArgs(args);
  if (!file) {
    throw new Error('inspect requires <file>');
  }

  let showAst = false;
  let showGraph = false;
  let showJson = false;
  let target = 'any';

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--ast') {
      showAst = true;
    } else if (arg === '--graph') {
      showGraph = true;
    } else if (arg === '--json') {
      showJson = true;
    } else if (arg === '--target') {
      target = parseTarget(rest[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  const source = await readSourceFile(file);
  const result = inspectLoomSource(source, { filename: file, target });
  if (!result.ok) {
    printToolErrors(result.errors);
    return 1;
  }

  if (showJson) {
    print(stringifyJson(result));
    return 0;
  }

  if (showAst) {
    print(stringifyJson(result.ast));
    return 0;
  }

  if (showGraph) {
    print(stringifyJson(result.graph));
    return 0;
  }

  print(formatInspectionSummary(result.summary));
  return 0;
}

async function handleRun(args) {
  if (args.includes('--help')) {
    print(getRunHelp());
    return 0;
  }

  const { file, rest } = parseCommonCommandArgs(args);
  if (!file) {
    throw new Error('run requires <file>');
  }

  const get = [];
  let time = 0;
  let dt = 0;
  let json = false;
  let target = 'cli';

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--get') {
      const ref = rest[index + 1];
      if (!ref) {
        throw new Error('--get requires a ref');
      }
      get.push(ref);
      index += 1;
    } else if (arg === '--time') {
      time = parseNumber(rest[index + 1], '--time');
      index += 1;
    } else if (arg === '--dt') {
      dt = parseNumber(rest[index + 1], '--dt');
      index += 1;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--target') {
      target = parseTarget(rest[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (target !== 'cli') {
    throw new Error('loomlet run currently only supports --target cli');
  }

  const source = await readSourceFile(file);
  const result = runLoomSource(source, {
    filename: file,
    target,
    get: get.length === 1 ? get[0] : get.length > 1 ? get : undefined,
    time,
    dt
  });
  if (!result.ok) {
    printToolErrors(result.errors);
    return 1;
  }

  printEffects(result.effects || []);

  if (!json && get.length === 1) {
    print(String(result.values[get[0]]));
    return 0;
  }

  print(stringifyJson(result.values));
  return 0;
}

async function handleDocs(args) {
  if (args.includes('--help')) {
    const lines = [
      'Usage:',
      '  loomlet docs              List all available libraries',
      '  loomlet docs <library>    Show functions in a library',
      '  loomlet docs <lib.func>   Show function documentation',
      '',
      'Options:',
      '  --json                 Output as JSON',
      '',
      'Examples:',
      '  loomlet docs',
      '  loomlet docs text',
      '  loomlet docs text.upper',
      '  loomlet docs text.upper --json'
    ];
    print(lines.join('\n'));
    return 0;
  }

  let query = '';
  let outputJson = false;
  let positionalCount = 0;

  for (const arg of args) {
    if (arg === '--json') {
      outputJson = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positionalCount += 1;
      if (positionalCount > 1) {
        throw new Error('docs command accepts at most one positional argument');
      }
      query = arg;
    }
  }

  try {
    if (outputJson) {
      const result = formatHelpJson(query);
      print(stringifyJson(result));
    } else {
      let output;
      if (!query) {
        output = formatLibrariesText();
      } else if (query.includes('.')) {
        output = formatFunctionHelpText(query);
      } else {
        output = formatLibraryHelpText(query);
      }
      print(output);
    }
    return 0;
  } catch (error) {
    if (error.code === 'UNKNOWN_LIBRARY' || error.code === 'UNKNOWN_FUNCTION') {
      printError(error.message);
      return 1;
    }
    throw error;
  }
}

async function handleRepl(args) {
  if (args.includes('--help')) {
    print(getReplHelp());
    return 0;
  }

  const session = new LoomReplSession({ target: 'cli', time: 0, dt: 0 });
  print('Loomlet REPL');
  print('Type :help for commands, :quit to exit.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'loomlet> '
  });

  return await new Promise((resolve) => {
    rl.prompt();

    rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (trimmed === ':quit' || trimmed === ':q' || trimmed === ':exit') {
        rl.close();
        return;
      }
      if (trimmed === ':help') {
        print(getReplHelp());
        rl.prompt();
        return;
      }
      if (trimmed === ':libs') {
        print(formatLibrariesText());
        rl.prompt();
        return;
      }
      if (trimmed === ':vars') {
        const variables = session.getVariables();
        if (variables.length === 0) {
          print('Variables:\n\n<none>');
        } else {
          print('Variables:\n');
          for (const variable of variables) {
            print(`${variable.name} = ${formatReplVarValue(variable.value)}`);
          }
        }
        rl.prompt();
        return;
      }
      if (trimmed === ':history') {
        const history = session.getHistory();
        if (history.length === 0) {
          print('<empty history>');
        } else {
          history.forEach((entry, index) => {
            print(`${index + 1}: ${entry}`);
          });
        }
        rl.prompt();
        return;
      }
      if (trimmed === ':clear') {
        if (process.stdout.isTTY) {
          process.stdout.write('\x1Bc');
        } else {
          print('\n'.repeat(20));
        }
        rl.prompt();
        return;
      }
      if (trimmed.startsWith(':help ')) {
        const query = trimmed.slice(6).trim();
        try {
          if (query.includes('.')) {
            print(formatFunctionHelpText(query));
          } else {
            print(formatLibraryHelpText(query));
          }
        } catch (error) {
          if (error.code === 'UNKNOWN_LIBRARY') {
            printError(`UNKNOWN_LIBRARY - No Loom library named "${query}"`);
          } else if (error.code === 'UNKNOWN_FUNCTION') {
            printError(`UNKNOWN_FUNCTION - No Loom function named "${query}"`);
          } else {
            printError(error.message || String(error));
          }
        }
        rl.prompt();
        return;
      }
      if (trimmed.startsWith(':load ')) {
        const filePath = trimmed.slice(6).trim();
        try {
          const source = await readFile(path.resolve(process.cwd(), filePath), 'utf8');
          const result = session.loadSource(source);
          if (!result.ok) {
            printToolErrors(result.errors);
          } else {
            printSnippetResult(source, result);
          }
        } catch (error) {
          printError(error.message || String(error));
        }
        rl.prompt();
        return;
      }
      if (trimmed.startsWith(':run ')) {
        const filePath = trimmed.slice(5).trim();
        try {
          const source = await readFile(path.resolve(process.cwd(), filePath), 'utf8');
          const result = session.runSource(source);
          if (!result.ok) {
            printToolErrors(result.errors);
          } else {
            printSnippetResult(source, result);
          }
        } catch (error) {
          printError(error.message || String(error));
        }
        rl.prompt();
        return;
      }
      if (trimmed === ':source') {
        print(session.getSource() || '<empty>');
        rl.prompt();
        return;
      }
      if (trimmed === ':inspect') {
        const inspection = session.inspect();
        if (!inspection.ok) {
          printToolErrors(inspection.errors);
        } else {
          print(formatInspectionSummary(inspection.summary));
        }
        rl.prompt();
        return;
      }
      if (trimmed === ':graph') {
        const graph = session.getGraph();
        print(graph ? stringifyJson(graph) : '<no graph>');
        rl.prompt();
        return;
      }
      if (trimmed === ':reset') {
        session.reset();
        print('session reset');
        rl.prompt();
        return;
      }

      const result = session.evaluateSnippet(line);
      if (!result.ok) {
        printToolErrors(result.errors);
      } else if (!result.empty) {
        printSnippetResult(line, result);
      }
      rl.prompt();
    });

    rl.on('close', () => {
      resolve(0);
    });
  });
}

async function handleSceneSync(args) {
  if (args.length === 0) {
    print(getSceneSyncHelp());
    return 0;
  }

  const [subcommand, ...rest] = args;

  // Allow these subcommands to handle their own --help
  const selfHelpSubcommands = ['dev', 'graph-compile', 'graph-run', 'graph-set', 'graph-clear'];

  if (args.includes('--help')) {
    if (selfHelpSubcommands.includes(subcommand)) {
      // Let the subcommand handle its own help
    } else {
      print(getSceneSyncHelp());
      return 0;
    }
  }

  if (rest.includes('--help') && !selfHelpSubcommands.includes(subcommand)) {
    print(getSceneSyncHelp());
    return 0;
  }

  if (subcommand === 'session' || subcommand === 'status') {
    const { json } = await parseSceneSyncArgs(rest);
    const result = await loadSceneSyncSession();

    if (!result.ok) {
      printError(formatSceneSyncError(result.error));
      return 1;
    }

    if (!result.session) {
      print('No saved Scene Sync session.');
      print('Use: loomlet scenesync redeem <code> --save');
      return 0;
    }

    if (json) {
      print(stringifyJson(result.session));
      return 0;
    }

    const session = result.session;
    const sessionPath = getDefaultSceneSyncSessionPath();
    const maskedId = maskSessionId(session.sessionId);
    const lines = [
      'Scene Sync session:',
      `Endpoint: ${session.endpoint || DEFAULT_SCENESYNC_ENDPOINT}`,
      `Room: ${session.roomId || '<unknown>'}`,
      `Session: ${maskedId}`,
      `Expires At: ${session.expiresAt || '<unknown>'}`,
      `Path: ${sessionPath}`
    ];
    print(lines.join('\n'));
    return 0;
  }

  if (subcommand === 'logout') {
    const result = await clearSceneSyncSession();

    if (!result.ok) {
      printError(formatSceneSyncError(result.error));
      return 1;
    }

    print('Cleared saved Scene Sync session.');
    return 0;
  }

  if (subcommand === 'redeem') {
    let code = null;
    let codeIndex = -1;

    for (let index = 0; index < rest.length; index += 1) {
      const arg = rest[index];
      if (!arg.startsWith('-') && !['--room', '--session', '--endpoint', '--json', '--save'].includes(rest[index - 1])) {
        code = arg;
        codeIndex = index;
        break;
      }
    }

    if (!code && rest.length > 0 && !rest[0].startsWith('-')) {
      code = rest[0];
      codeIndex = 0;
    }

    if (!code) {
      throw new Error('redeem requires a code argument');
    }

    const argsWithoutCode = codeIndex >= 0 ? rest.filter((_, i) => i !== codeIndex) : rest;
    const { endpoint, save, json } = await parseSceneSyncArgs(argsWithoutCode);
    const client = new SceneSyncClient({ endpoint });
    const result = await client.redeem({ code });

    if (!result.ok) {
      printError(formatSceneSyncError(result.error));
      return 1;
    }

    const data = result.data || {};

    if (save) {
      try {
        const savedPath = await saveSceneSyncSession({
          endpoint,
          roomId: data.roomId,
          sessionId: data.sessionId,
          expiresAt: data.expiresAt
        });

        if (json) {
          print(stringifyJson({
            ok: true,
            data,
            savedPath
          }));
          return 0;
        }

        const lines = [
          'Linked Scene Sync room.',
          `Room: ${data.roomId || '<unknown>'}`,
          `Session: saved to ${savedPath}`,
          `Expires At: ${data.expiresAt || '<unknown>'}`
        ];
        print(lines.join('\n'));
        return 0;
      } catch (error) {
        printError(`Failed to save session: ${error.message || String(error)}`);
        return 1;
      }
    }

    if (json) {
      print(stringifyJson(result.data));
      return 0;
    }

    const lines = [
      'Linked Scene Sync room.',
      `Room: ${data.roomId || '<unknown>'}`,
      `Session: ${data.sessionId || '<unknown>'}`,
      `Expires At: ${data.expiresAt || '<unknown>'}`
    ];
    print(lines.join('\n'));
    return 0;
  }

  if (subcommand === 'run') {
    const { file, room, session, endpoint, dryRun, send, json } = await parseSceneSyncRunArgs(rest);

    try {
      const source = await readSourceFile(file);
      const result = runLoomSource(source, { target: 'cli' });

      if (!result.ok) {
        printToolErrors(result.errors);
        return 1;
      }

      const payload = sceneEffectsToBroadcastPayload(result.effects || []);

      if (!payload) {
        print('No Scene Sync scene effects found.');
        return 0;
      }

      if (dryRun) {
        if (json) {
          print(stringifyJson({
            ok: true,
            dryRun: true,
            payload,
            effects: result.effects
          }));
        } else {
          print('Scene Sync broadcast payload:');
          print(stringifyJson(payload, true));
          print('Dry run only. Pass --send to broadcast to Scene Sync.');
          const ops = sceneEffectsToBroadcastOps(result.effects || []);
          if (ops.length > 0) {
            print(`Send mode will broadcast ${ops.length} scene-delta operation${ops.length === 1 ? '' : 's'}.`);
          }
        }
        return 0;
      }

      if (send) {
        requireSceneSyncRoom(room);
        requireSceneSyncSession(session);

        const client = new SceneSyncClient({ endpoint });
        const ops = sceneEffectsToBroadcastOps(result.effects || []);

        if (ops.length === 0) {
          print('No Scene Sync scene effects to broadcast.');
          return 0;
        }

        const sentOps = [];
        for (const op of ops) {
          const broadcastResult = await client.broadcast({ room, session, payload: op });

          if (!broadcastResult.ok) {
            printError(formatSceneSyncError(broadcastResult.error));
            return 1;
          }
          sentOps.push(op);
        }

        if (json) {
          print(stringifyJson({
            ok: true,
            room,
            operationCount: sentOps.length,
            operations: sentOps
          }));
        } else {
          const lines = [
            'Sent Scene Sync broadcast operations.',
            `Room: ${room}`,
            `Operations: ${sentOps.length}`
          ];
          print(lines.join('\n'));
        }
        return 0;
      }
    } catch (error) {
      printError(error.message || String(error));
      return 1;
    }
  }

  if (subcommand === 'graph-set') {
    const { objectId, graphFile, room, session, endpoint, dryRun, send, json: jsonOutput } = await parseSceneSyncGraphSetArgs(rest);

    try {
      const graphContent = await readSourceFile(graphFile);
      const graph = JSON.parse(graphContent);
      const payload = createSceneGraphSetPayload(objectId, graph);

      if (dryRun) {
        if (jsonOutput) {
          print(stringifyJson({
            ok: true,
            dryRun: true,
            payload
          }));
        } else {
          print('Scene Sync graph-set payload:');
          print(stringifyJson(payload, true));
          print('Dry run only. Pass --send to broadcast to Scene Sync.');
        }
        return 0;
      }

      if (send) {
        requireSceneSyncRoom(room);
        requireSceneSyncSession(session);

        const client = new SceneSyncClient({ endpoint });
        const broadcastResult = await client.broadcast({ room, session, payload });

        if (!broadcastResult.ok) {
          printError(formatSceneSyncError(broadcastResult.error));
          return 1;
        }

        if (jsonOutput) {
          print(stringifyJson({
            ok: true,
            room,
            objectId,
            nodeCount: graph.nodes ? graph.nodes.length : 0,
            edgeCount: graph.edges ? graph.edges.length : 0
          }));
        } else {
          const lines = [
            'Sent Scene Sync graph.',
            `Room: ${room}`,
            `Object: ${objectId}`,
            `Nodes: ${graph.nodes ? graph.nodes.length : 0}`,
            `Edges: ${graph.edges ? graph.edges.length : 0}`
          ];
          print(lines.join('\n'));
        }
        return 0;
      }
    } catch (error) {
      printError(error.message || String(error));
      return 1;
    }
  }

  if (subcommand === 'graph-clear') {
    const { objectId, room, session, endpoint, dryRun, send, json: jsonOutput } = await parseSceneSyncGraphClearArgs(rest);

    try {
      const payload = createSceneGraphClearPayload(objectId);

      if (dryRun) {
        if (jsonOutput) {
          print(stringifyJson({
            ok: true,
            dryRun: true,
            payload
          }));
        } else {
          print('Scene Sync graph-clear payload:');
          print(stringifyJson(payload, true));
          print('Dry run only. Pass --send to broadcast to Scene Sync.');
        }
        return 0;
      }

      if (send) {
        requireSceneSyncRoom(room);
        requireSceneSyncSession(session);

        const client = new SceneSyncClient({ endpoint });
        const broadcastResult = await client.broadcast({ room, session, payload });

        if (!broadcastResult.ok) {
          printError(formatSceneSyncError(broadcastResult.error));
          return 1;
        }

        if (jsonOutput) {
          print(stringifyJson({
            ok: true,
            room,
            objectId
          }));
        } else {
          const lines = [
            'Cleared Scene Sync graph.',
            `Room: ${room}`,
            `Object: ${objectId}`
          ];
          print(lines.join('\n'));
        }
        return 0;
      }
    } catch (error) {
      printError(error.message || String(error));
      return 1;
    }
  }

  if (subcommand === 'graph-compile') {
    const { file, scope, json: jsonOutput } = await parseSceneSyncGraphCompileArgs(rest);

    try {
      const source = await readSourceFile(file);
      const result = compileLoomToSceneSyncGraph(source, { scope });

      if (!result.scope) {
        throw new Error('SCOPE_REQUIRED - Pass --object <objectId>, --scene, or include an object id in scene.setPosition(...)');
      }

      if (jsonOutput) {
        print(stringifyJson({
          ok: true,
          scope: result.scope,
          graph: result.graph
        }));
      } else {
        print(stringifyJson(result.graph, true));
      }
      return 0;
    } catch (error) {
      printError(error.message || String(error));
      return 1;
    }
  }

  if (subcommand === 'graph-run') {
    const { file, scope, room, session, endpoint, dryRun, send, json: jsonOutput } = await parseSceneSyncGraphRunArgs(rest);

    try {
      const source = await readSourceFile(file);
      const result = compileLoomToSceneSyncGraph(source, { scope });

      if (!result.scope) {
        throw new Error('SCOPE_REQUIRED - Pass --object <objectId>, --scene, or include an object id in scene.setPosition(...)');
      }

      const payload = createSceneGraphSetPayload(result.scope, result.graph);

      if (dryRun) {
        if (jsonOutput) {
          print(stringifyJson({
            ok: true,
            dryRun: true,
            payload
          }));
        } else {
          print('Scene Sync graph-set payload:');
          print(stringifyJson(payload, true));
          print('Dry run only. Pass --send to broadcast to Scene Sync.');
        }
        return 0;
      }

      if (send) {
        requireSceneSyncRoom(room);
        requireSceneSyncSession(session);

        const client = new SceneSyncClient({ endpoint });
        const broadcastResult = await client.broadcast({ room, session, payload });

        if (!broadcastResult.ok) {
          printError(formatSceneSyncError(broadcastResult.error));
          return 1;
        }

        if (jsonOutput) {
          const output = {
            ok: true,
            room,
            scope: result.scope,
            nodeCount: result.graph.nodes.length,
            edgeCount: result.graph.edges.length
          };
          if (result.scope.object) {
            output.objectId = result.scope.object;
          }
          print(stringifyJson(output));
        } else {
          const lines = [
            'Sent Scene Sync graph.',
            `Room: ${room}`
          ];
          if (result.scope.object) {
            lines.push(`Object: ${result.scope.object}`);
          } else if (result.scope.scene) {
            lines.push('Scope: scene');
          }
          lines.push(`Nodes: ${result.graph.nodes.length}`);
          lines.push(`Edges: ${result.graph.edges.length}`);
          print(lines.join('\n'));
        }
        return 0;
      }
    } catch (error) {
      printError(error.message || String(error));
      return 1;
    }
  }

  if (subcommand === 'dev') {
    return await handleSceneSyncDev(rest);
  }

  if (subcommand === 'demo') {
    const action = rest[0];
    const name = rest[1];

    if (!action || action === '--help') {
      print(`Usage:
  loomlet scenesync demo list
  loomlet scenesync demo setup <name>
  loomlet scenesync demo run <name>`);
      return 0;
    }

    if (action === 'list') {
      print('Scene Sync demos:\n');
      for (const demo of SCENESYNC_DEMOS) {
        print(`- ${demo.name}`);
        print(`  file: ${demo.file}`);
        if (demo.requiredObjects?.length) {
          print(`  object: ${demo.requiredObjects.join(', ')}`);
        }
        print(`  status: ${demo.status}`);
        print('');
      }
      return 0;
    }

    if (action === 'setup') {
      if (!name) {
        throw new Error('demo setup requires <name>');
      }
      const demo = getSceneSyncDemoByName(name);
      if (!demo) {
        throw new Error(`Unknown Scene Sync demo: ${name}`);
      }
      const { room, session, endpoint, json } = await parseSceneSyncArgs(rest.slice(2));
      if (!room || !session) {
        print('No saved Scene Sync session.');
        print('Run:');
        print('  loomlet scenesync redeem <code> --save');
        return 0;
      }

      const client = new SceneSyncClient({ endpoint });
      const result = await client.listObjects({ room, session });
      if (!result.ok) {
        printError(formatSceneSyncError(result.error));
        return 1;
      }

      const objects = result.data?.objects || {};
      const missing = (demo.requiredObjects || []).filter((objectId) => !Object.hasOwn(objects, objectId));
      if (json) {
        print(stringifyJson({ ok: true, demo: demo.name, missingRequiredObjects: missing }));
        return 0;
      }
      if (missing.length === 0) {
        print(`Demo setup OK: ${demo.name}`);
        print(`Required objects found: ${(demo.requiredObjects || []).join(', ') || '(none)'}`);
        return 0;
      }
      print(`Demo requires objectId: ${missing[0]}`);
      print('');
      print(`Create or rename an object in Scene Sync with objectId \`${missing[0]}\`.`);
      print('Then run:');
      print(`  loomlet scenesync demo run ${demo.name}`);
      return 0;
    }

    if (action === 'run') {
      if (!name) {
        throw new Error('demo run requires <name>');
      }
      const demo = getSceneSyncDemoByName(name);
      if (!demo) {
        throw new Error(`Unknown Scene Sync demo: ${name}`);
      }
      const savedSession = await loadSceneSyncSession();
      if (!(savedSession.ok && savedSession.session)) {
        print('No saved Scene Sync session.');
        print('Run:');
        print('  loomlet scenesync redeem <code> --save');
        return 0;
      }
      return await handleSceneSyncDev([demo.file, ...rest.slice(2)]);
    }

    throw new Error(`Unknown scenesync demo command: ${action}`);
  }

  const { room, session, endpoint, json } = await parseSceneSyncArgs(rest);

  if (subcommand === 'ping' || subcommand === 'info' || subcommand === 'objects' || subcommand === 'list-objects') {
    requireSceneSyncRoom(room);
    requireSceneSyncSession(session);

    const client = new SceneSyncClient({ endpoint });
    let result;

    if (subcommand === 'ping') {
      result = await client.ping({ room, session });
    } else if (subcommand === 'info') {
      result = await client.info({ room, session });
    } else {
      result = await client.listObjects({ room, session });
    }

    if (!result.ok) {
      printError(formatSceneSyncError(result.error));
      return 1;
    }

    if (json) {
      print(stringifyJson(result.data));
      return 0;
    }

    if (subcommand === 'ping') {
      print(`Scene Sync room ${room} is reachable.`);
      return 0;
    }

    const data = result.data || {};
    const envId = data.envId || '<unknown>';
    const objects = data.objects || {};
    const objectCount = Object.keys(objects).length;

    if (subcommand === 'info') {
      printSceneSyncInfo(room, envId, objectCount);
      return 0;
    }

    printSceneSyncObjects(objects);
    return 0;
  }

  throw new Error(`Unknown scenesync command: ${subcommand}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === 'help') {
    print(getGeneralHelp());
    return;
  }

  let exitCode = 0;
  try {
    if (command === 'compile') {
      exitCode = await handleCompile(args.slice(1));
    } else if (command === 'format') {
      exitCode = await handleFormat(args.slice(1));
    } else if (command === 'inspect') {
      exitCode = await handleInspect(args.slice(1));
    } else if (command === 'run') {
      exitCode = await handleRun(args.slice(1));
    } else if (command === 'repl') {
      exitCode = await handleRepl(args.slice(1));
    } else if (command === 'docs') {
      exitCode = await handleDocs(args.slice(1));
    } else if (command === 'scenesync') {
      exitCode = await handleSceneSync(args.slice(1));
    } else {
      throw new Error(`unknown command: ${command}`);
    }
  } catch (error) {
    printError(error.message || String(error));
    exitCode = 1;
  }

  process.exitCode = exitCode;
}

main();
