#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
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
  LoomReplSession
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
  sceneEffectsToBroadcastPayload
} from '../src/scenesync/index.js';

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
  return `Loom CLI

Usage:
  loom <command> <file> [options]

Commands:
  compile <file>   Compile Loom DSL to GraphJSON
  format <file>    Format Loom DSL
  inspect <file>   Inspect Loom DSL and print a summary
  run <file>       Evaluate a Loom graph once
  repl             Start an interactive Loom REPL
  scenesync        Probe Scene Sync rooms
  help             Show help

Examples:
  loom compile examples/cli-basic.loom
  loom format examples/cli-basic.loom --check
  loom inspect examples/cli-basic.loom --json
  loom run examples/cli-basic.loom --get x.out --time 0.25
  loom scenesync redeem 238909
  loom scenesync objects --room <roomId> --session <sessionId>
  loom repl`;
}

function getCompileHelp() {
  return `Usage:
  loom compile <file> [--out <file>] [--pretty false] [--target <target>]

Options:
  -o, --out <file>   Write GraphJSON to a file
  --pretty false     Print compact JSON
  --target <target>  Validate imports for a runtime target. Default: any`;
}

function getFormatHelp() {
  return `Usage:
  loom format <file> [--write] [--check]

Options:
  --write   Overwrite the input file
  --check   Exit 1 if formatting would change the file`;
}

function getInspectHelp() {
  return `Usage:
  loom inspect <file> [--ast] [--graph] [--json] [--target <target>]

Options:
  --ast    Print Source AST JSON
  --graph  Print GraphJSON
  --json   Print the full inspection result as JSON
  --target <target>  Validate imports for a runtime target. Default: any`;
}

function getRunHelp() {
  return `Usage:
  loom run <file> --get <ref> [--time <number>] [--dt <number>] [--json] [--target <target>]

Options:
  --get <ref>       Output reference to read. Repeatable.
  --time <number>   Evaluation time in seconds. Default: 0
  --dt <number>     Delta time in seconds. Default: 0
  --json            Print result values as JSON
  --target <target> Only cli is supported by loom run in this version. Default: cli`;
}

function getReplHelp() {
  return `Usage:
  loom repl

Commands:
  :help      Show REPL help
  :source    Show accumulated source
  :inspect   Show current graph summary
  :graph     Show current GraphJSON
  :reset     Clear current session
  :quit      Exit the REPL
  :q         Exit the REPL
  :exit      Exit the REPL`;
}

function getSceneSyncHelp() {
  return `Usage:
  loom scenesync <command> [options]

Commands:
  redeem <code>      Redeem a Scene Sync AI link code
  session            Show saved Scene Sync session
  status             Alias for session
  logout             Clear saved Scene Sync session
  run <file>         Convert Loom scene effects to Scene Sync broadcast payload
  ping               Check Scene Sync room connection
  info               Get room information
  objects            List scene objects
  list-objects       Alias for objects

Options:
  --save               Save redeemed session locally
  --dry-run            Print payload without sending (default for run)
  --send               Broadcast payload to Scene Sync (run only)
  --room <room>        Scene Sync room code
  --session <id>       Scene Sync session ID
  --endpoint <url>     Scene Sync command endpoint. Default: ${DEFAULT_SCENESYNC_ENDPOINT}
  --json               Print raw JSON response

Examples:
  loom scenesync run examples/scene-effects.loom
  loom scenesync run examples/scene-effects.loom --send

Environment Variables:
  LOOM_SCENESYNC_ROOM              Default room code
  LOOM_SCENESYNC_SESSION           Default session ID
  LOOM_SCENESYNC_ENDPOINT          Default endpoint

Saved session path:
  ~/.config/loom/scenesync-session.json`;
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
    room = process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session) {
    session = process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOM_SCENESYNC_ENDPOINT || '';
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
    const type = object?.type || '<unknown>';
    const position = object?.position !== undefined
      ? `  position=${formatSceneSyncPosition(object.position)}`
      : '';
    print(`- ${id}  ${type}${position}`);
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
    room = process.env.LOOM_SCENESYNC_ROOM || '';
    if (!room && savedData) {
      room = savedData.roomId || '';
    }
  }

  if (!session) {
    session = process.env.LOOM_SCENESYNC_SESSION || '';
    if (!session && savedData) {
      session = savedData.sessionId || '';
    }
  }

  if (!endpoint) {
    endpoint = process.env.LOOM_SCENESYNC_ENDPOINT || '';
    if (!endpoint && savedData) {
      endpoint = savedData.endpoint || '';
    }
    if (!endpoint) {
      endpoint = DEFAULT_SCENESYNC_ENDPOINT;
    }
  }

  return { file, room, session, endpoint, dryRun, send, json };
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
    throw new Error('loom run currently only supports --target cli');
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

async function handleRepl(args) {
  if (args.includes('--help')) {
    print(getReplHelp());
    return 0;
  }

  const session = new LoomReplSession({ target: 'cli', time: 0, dt: 0 });
  print('Loom REPL');
  print('Type :help for commands, :quit to exit.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'loom> '
  });

  return await new Promise((resolve) => {
    rl.prompt();

    rl.on('line', (line) => {
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
  if (args.length === 0 || args.includes('--help')) {
    print(getSceneSyncHelp());
    return 0;
  }

  const [subcommand, ...rest] = args;
  if (rest.includes('--help')) {
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
      print('Use: loom scenesync redeem <code> --save');
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

        if (json) {
          print(stringifyJson({
            ok: true,
            payload,
            room,
            operationCount: Array.isArray(payload.ops) ? payload.ops.length : 1
          }));
        } else {
          const opCount = Array.isArray(payload.ops) ? payload.ops.length : 1;
          const lines = [
            'Sent Scene Sync broadcast payload.',
            `Room: ${room}`,
            `Operations: ${opCount}`
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
