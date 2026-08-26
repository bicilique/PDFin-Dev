export function editorSnapshot(opts) {
  return { objects: opts.objects || [], changes: opts.changes || [] };
}

function restoreSnapshot(entry, current) {
  return Array.isArray(entry)
    ? { objects: entry, changes: current.changes || [] }
    : { objects: entry?.objects || [], changes: entry?.changes || [] };
}

export function undoEditor(opts) {
  const past = opts.past || [];
  if (!past.length) return opts;
  return {
    ...opts,
    ...restoreSnapshot(past[past.length - 1], opts),
    past: past.slice(0, -1),
    future: [...(opts.future || []), editorSnapshot(opts)],
    selectedId: null,
    selectedRun: null,
  };
}

export function redoEditor(opts) {
  const future = opts.future || [];
  if (!future.length) return opts;
  return {
    ...opts,
    ...restoreSnapshot(future[future.length - 1], opts),
    past: [...(opts.past || []), editorSnapshot(opts)],
    future: future.slice(0, -1),
    selectedId: null,
    selectedRun: null,
  };
}
