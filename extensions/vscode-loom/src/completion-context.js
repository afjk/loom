function getCompletionContext(text, offset) {
  const source = String(text ?? '');
  const safeOffset = Math.max(0, Math.min(offset ?? 0, source.length));
  const before = source.slice(0, safeOffset);

  if (/^\s*$/.test(before)) {
    return { kind: 'topLevel', prefix: '', library: null, functionName: null, alreadyUsedArgNames: [] };
  }

  const importMatch = before.match(/(?:^|\n)\s*import\s+([A-Za-z_]*)$/);
  if (importMatch) {
    return { kind: 'import', prefix: importMatch[1] || '', library: null, functionName: null, alreadyUsedArgNames: [] };
  }

  const memberMatch = before.match(/\b([A-Za-z_][\w]*)\.([A-Za-z_]*)$/);
  if (memberMatch) {
    return {
      kind: 'member',
      prefix: memberMatch[2] || '',
      library: memberMatch[1],
      functionName: null,
      alreadyUsedArgNames: []
    };
  }

  const callContext = getCallArgsContext(before);
  if (callContext) {
    return callContext;
  }

  return { kind: 'unknown', prefix: '', library: null, functionName: null, alreadyUsedArgNames: [] };
}

function getCallArgsContext(before) {
  let depth = 0;
  for (let i = before.length - 1; i >= 0; i -= 1) {
    const ch = before[i];
    if (ch === ')') depth += 1;
    else if (ch === '(') {
      if (depth === 0) {
        const callSite = before.slice(0, i);
        const callMatch = callSite.match(/\b([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)\s*$/);
        if (!callMatch) return null;

        const argsSource = before.slice(i + 1);
        const alreadyUsed = [];
        const nameRegex = /\b([A-Za-z_][\w]*)\s*:/g;
        let m;
        while ((m = nameRegex.exec(argsSource)) !== null) {
          if (!alreadyUsed.includes(m[1])) alreadyUsed.push(m[1]);
        }

        const prefixMatch = argsSource.match(/(?:^|,)\s*([A-Za-z_]*)$/);
        return {
          kind: 'callArgs',
          prefix: prefixMatch ? prefixMatch[1] : '',
          library: callMatch[1],
          functionName: callMatch[2],
          alreadyUsedArgNames: alreadyUsed
        };
      }
      depth -= 1;
    }
  }
  return null;
}

module.exports = {
  getCompletionContext
};
