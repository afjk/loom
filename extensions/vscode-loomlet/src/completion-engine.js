const path = require('node:path');
const metadata = require('../generated/library-metadata.json');

function getIncludePlanned(configGetter) {
  return Boolean(configGetter?.('loomlet.completion.includePlanned'));
}

function buildCompletionModel(includePlanned = false) {
  const libraries = (metadata.libraries || [])
    .filter((lib) => includePlanned || lib.status === 'implemented');
  return libraries.map((lib) => ({
    ...lib,
    functions: (lib.functions || []).filter((fn) => includePlanned || fn.status === 'implemented')
  }));
}

function inferPlaceholder(arg) {
  if (arg.type?.includes('string')) return '"sample"';
  if (arg.type?.includes('number')) return '0';
  if (arg.type?.includes('boolean')) return 'false';
  return arg.name;
}

function buildFunctionSnippet(member) {
  const args = member.inputs || [];
  const parts = [];
  let index = 1;
  args.forEach((arg, i) => {
    const placeholder = inferPlaceholder(arg);
    if (i === 0 || arg.positional) {
      parts.push(`\${${index}:${placeholder}}`);
    } else {
      parts.push(`${arg.name}: \${${index}:${placeholder}}`);
    }
    index += 1;
  });
  return `${member.name}(${parts.join(', ')})`;
}

function toSignature(libName, member) {
  return member.signature || `${libName}.${member.name}()`;
}

function buildCompletions(ctx, includePlanned = false) {
  const libs = buildCompletionModel(includePlanned);
  if (ctx.kind === 'import') {
    return libs.map((lib) => ({
      type: 'module',
      label: lib.name,
      insertText: lib.name,
      detail: lib.targets?.length === 1 && lib.targets[0] === 'cli' ? 'CLI only' : `${lib.name} library`,
      documentation: lib.description
    }));
  }

  if (ctx.kind === 'member' && ctx.library) {
    const lib = libs.find((entry) => entry.name === ctx.library);
    if (!lib) return [];
    return lib.functions.map((member) => ({
      type: 'function',
      label: member.name,
      insertText: buildFunctionSnippet(member),
      detail: includePlanned && member.status !== 'implemented' ? `${toSignature(lib.name, member)} (planned)` : toSignature(lib.name, member),
      documentation: member.description,
      namedArgs: (member.inputs || []).filter((a, i) => i > 0 || !a.positional).map((a) => a.name)
    }));
  }

  if (ctx.kind === 'callArgs' && ctx.library && ctx.functionName) {
    const lib = libs.find((entry) => entry.name === ctx.library);
    const member = lib?.functions.find((fn) => fn.name === ctx.functionName);
    if (!member) return [];
    const used = new Set(ctx.alreadyUsedArgNames || []);
    return (member.inputs || [])
      .map((input) => input.name)
      .filter((name) => !used.has(name))
      .map((name) => ({
        type: 'property',
        label: `${name}:`,
        insertText: `${name}: $0`,
        detail: `${ctx.library}.${ctx.functionName} named argument`,
        documentation: `Named argument for ${ctx.library}.${ctx.functionName}.`
      }));
  }

  return [];
}

module.exports = { buildCompletions, getIncludePlanned, buildFunctionSnippet };
