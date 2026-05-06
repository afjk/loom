#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  compileLoomSource,
  formatLoomSource,
  inspectLoomSource,
  formatInspectionSummary,
  runLoomSource,
  formatLoomError
} from '../src/toolchain/index.js';

function print(message = '') {
  process.stdout.write(`${message}\n`);
}

function printError(message = '') {
  process.stderr.write(`${message}\n`);
}

function printToolErrors(errors) {
  for (const error of errors) {
    printError(formatLoomError(error));
  }
}

function parseBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
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
  help             Show help

Examples:
  loom compile examples/cli-basic.loom
  loom format examples/cli-basic.loom --check
  loom inspect examples/cli-basic.loom --json
  loom run examples/cli-basic.loom --get x.out --time 0.25`;
}

function getCompileHelp() {
  return `Usage:
  loom compile <file> [--out <file>] [--pretty false]

Options:
  -o, --out <file>   Write GraphJSON to a file
  --pretty false     Print compact JSON`;
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
  loom inspect <file> [--ast] [--graph] [--json]

Options:
  --ast    Print Source AST JSON
  --graph  Print GraphJSON
  --json   Print the full inspection result as JSON`;
}

function getRunHelp() {
  return `Usage:
  loom run <file> --get <ref> [--time <number>] [--dt <number>] [--json]

Options:
  --get <ref>       Output reference to read. Repeatable.
  --time <number>   Evaluation time in seconds. Default: 0
  --dt <number>     Delta time in seconds. Default: 0
  --json            Print result values as JSON`;
}

async function readSourceFile(file) {
  return readFile(path.resolve(process.cwd(), file), 'utf8');
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

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '-o' || arg === '--out') {
      outputPath = rest[index + 1];
      index += 1;
    } else if (arg === '--pretty') {
      pretty = parseBoolean(rest[index + 1], true);
      index += 1;
    } else {
      throw new Error(`unknown option for compile: ${arg}`);
    }
  }

  if (outputPath === null && rest.includes('-o')) {
    throw new Error('-o requires a file path');
  }
  if (outputPath === null && rest.includes('--out')) {
    throw new Error('--out requires a file path');
  }

  const source = await readSourceFile(file);
  const result = compileLoomSource(source, { filename: file, target: 'cli' });
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
      throw new Error(`unknown option for format: ${arg}`);
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

  for (const arg of rest) {
    if (arg === '--ast') {
      showAst = true;
    } else if (arg === '--graph') {
      showGraph = true;
    } else if (arg === '--json') {
      showJson = true;
    } else {
      throw new Error(`unknown option for inspect: ${arg}`);
    }
  }

  const source = await readSourceFile(file);
  const result = inspectLoomSource(source, { filename: file, target: 'cli' });
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
    } else {
      throw new Error(`unknown option for run: ${arg}`);
    }
  }

  const source = await readSourceFile(file);
  const result = runLoomSource(source, {
    filename: file,
    target: 'cli',
    get: get.length === 1 ? get[0] : get.length > 1 ? get : undefined,
    time,
    dt
  });
  if (!result.ok) {
    printToolErrors(result.errors);
    return 1;
  }

  if (!json && get.length === 1) {
    print(String(result.values[get[0]]));
    return 0;
  }

  print(stringifyJson(result.values));
  return 0;
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
