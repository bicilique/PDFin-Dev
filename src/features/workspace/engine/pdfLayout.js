// PDFin workspace — PDF layout reconstruction: turns pdf.js text items into
// lines, blocks (paragraph / list / table) and column bands so exporters can
// rebuild a document that visually matches the source page.

const ROTATION_TOLERANCE = 0.35;

export function itemFontSize(item) {
  const transform = item?.transform || [];
  const scale = Math.hypot(Number(transform[0]) || 0, Number(transform[1]) || 0);
  const size = scale || Number(item?.height) || 0;
  return Math.max(4, Math.min(200, size || 11));
}

export function itemLeft(item) {
  return Number(item?.transform?.[4]) || 0;
}

export function itemBaseline(item) {
  return Number(item?.transform?.[5]) || 0;
}

export function itemRight(item) {
  return itemLeft(item) + (Number(item?.width) || 0);
}

function isRotated(item) {
  const transform = item?.transform || [];
  const b = Math.abs(Number(transform[1]) || 0);
  const c = Math.abs(Number(transform[2]) || 0);
  const a = Math.abs(Number(transform[0]) || 0);
  return a > 0 && (b / a > ROTATION_TOLERANCE || c / a > ROTATION_TOLERANCE);
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// Approximate width of one space in the item's font; pdf.js rarely emits
// explicit space glyphs, so gaps have to be reconstructed from geometry.
function spaceWidth(item) {
  const text = String(item?.str || "");
  const trimmed = text.replace(/\s+$/, "");
  const size = itemFontSize(item);
  if (trimmed.length) {
    const perChar = (Number(item?.width) || 0) / Math.max(1, text.length);
    if (perChar > 0) return Math.max(size * 0.16, perChar * 0.42);
  }
  return size * 0.26;
}

/**
 * Group text items into visual lines by baseline proximity.
 * pdf.js `hasEOL` is unreliable (missing on many generators, spurious on
 * others), so lines are clustered geometrically and only sorted afterwards.
 */
export function buildLines(items) {
  const usable = (items || []).filter((item) => String(item?.str || "").length && !isRotated(item));
  if (!usable.length) return [];

  const sorted = [...usable].sort((a, b) => {
    const delta = itemBaseline(b) - itemBaseline(a);
    if (Math.abs(delta) > 0.5) return delta;
    return itemLeft(a) - itemLeft(b);
  });

  const lines = [];
  for (const item of sorted) {
    const baseline = itemBaseline(item);
    const size = itemFontSize(item);
    const current = lines.at(-1);
    const tolerance = Math.max(2, size * 0.42);
    if (current && Math.abs(current.baseline - baseline) <= tolerance) {
      current.items.push(item);
      current.baseline = (current.baseline * (current.items.length - 1) + baseline) / current.items.length;
    } else {
      lines.push({ baseline, items: [item] });
    }
  }

  return lines
    .map((line) => {
      const ordered = [...line.items].sort((a, b) => itemLeft(a) - itemLeft(b));
      const sizes = ordered.map(itemFontSize);
      return {
        baseline: line.baseline,
        items: ordered,
        left: Math.min(...ordered.map(itemLeft)),
        right: Math.max(...ordered.map(itemRight)),
        fontSize: median(sizes),
        maxFontSize: Math.max(...sizes),
        text: joinLineText(ordered),
      };
    })
    .filter((line) => line.text.trim().length)
    .sort((a, b) => b.baseline - a.baseline);
}

/**
 * Split a run of items into { item, text } parts, restoring the word spaces
 * that PDF generators encode as positioning rather than space glyphs.
 */
export function lineParts(items) {
  const parts = [];
  items.forEach((item, index) => {
    let value = String(item.str || "");
    if (index > 0) {
      const previous = items[index - 1];
      const gap = itemLeft(item) - itemRight(previous);
      const needsSpace = gap > spaceWidth(previous) * 0.55
        && !/\s$/.test(parts.at(-1).text)
        && !/^\s/.test(value);
      if (needsSpace) value = ` ${value}`;
    }
    parts.push({ item, text: value });
  });
  return parts;
}

export function joinLineText(items) {
  return lineParts(items).map((part) => part.text).join("");
}

/**
 * Split a line at wide horizontal gaps. Used both for tab-stop reconstruction
 * and for table column detection.
 */
export function splitCells(line, factor = 1.35) {
  const cells = [];
  let current = null;
  for (const item of line.items) {
    if (!current) {
      current = { items: [item] };
      cells.push(current);
      continue;
    }
    const previous = current.items.at(-1);
    const gap = itemLeft(item) - itemRight(previous);
    const threshold = Math.max(itemFontSize(previous) * factor, spaceWidth(previous) * 2.6);
    if (gap > threshold) {
      current = { items: [item] };
      cells.push(current);
    } else {
      current.items.push(item);
    }
  }
  return cells.map((cell) => ({
    items: cell.items,
    left: Math.min(...cell.items.map(itemLeft)),
    right: Math.max(...cell.items.map(itemRight)),
    text: joinLineText(cell.items),
  })).filter((cell) => cell.text.trim().length);
}

export function contentBox(lines, pageWidth, pageHeight) {
  if (!lines.length) {
    return { left: 72, right: pageWidth - 72, top: pageHeight - 72, bottom: 72, width: pageWidth - 144 };
  }
  const left = Math.min(...lines.map((line) => line.left));
  const right = Math.max(...lines.map((line) => line.right));
  const top = Math.max(...lines.map((line) => line.baseline + line.maxFontSize));
  const bottom = Math.min(...lines.map((line) => line.baseline - line.fontSize * 0.25));
  return {
    left: Math.max(0, left),
    right: Math.min(pageWidth, right),
    top: Math.min(pageHeight, top),
    bottom: Math.max(0, bottom),
    width: Math.max(1, Math.min(pageWidth, right) - Math.max(0, left)),
  };
}

/**
 * Detect a multi-column page (two or three balanced text bands separated by a
 * gutter that no line crosses). Returns null for ordinary single-column pages.
 */
export function detectColumns(lines, pageWidth) {
  if (lines.length < 8) return null;
  const bands = [];
  for (const line of [...lines].sort((a, b) => a.left - b.left)) {
    const current = bands.at(-1);
    if (current && line.left <= current.right + 1) {
      current.right = Math.max(current.right, line.right);
      current.lines.push(line);
    } else {
      bands.push({ left: line.left, right: line.right, lines: [line] });
    }
  }
  if (bands.length < 2 || bands.length > 3) return null;
  if (bands.some((band) => band.lines.length < 5)) return null;

  const widths = bands.map((band) => band.right - band.left);
  const widest = Math.max(...widths);
  const narrowest = Math.min(...widths);
  if (narrowest / widest < 0.72) return null;
  if (widest > pageWidth * 0.6) return null;

  const gutters = [];
  for (let index = 1; index < bands.length; index++) {
    const gutter = bands[index].left - bands[index - 1].right;
    if (gutter < 10) return null;
    gutters.push(gutter);
  }

  return {
    count: bands.length,
    space: Math.round(median(gutters)),
    bands: bands.map((band) => ({
      left: band.left,
      right: band.right,
      lines: [...band.lines].sort((a, b) => b.baseline - a.baseline),
    })),
  };
}

const LIST_MARKER = /^\s*([•▪◦‣·●○–—-]|\(?\d{1,3}[.)]|\(?[a-zA-Z][.)]|\(?[ivxIVX]{1,5}[.)])\s+/;

export function listMarker(text) {
  const match = LIST_MARKER.exec(text);
  return match ? match[0].replace(/^\s+/, "") : null;
}

function clusterAnchors(values, tolerance) {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters = [];
  for (const value of sorted) {
    const current = clusters.at(-1);
    if (current && value - current.at(-1) <= tolerance) current.push(value);
    else clusters.push([value]);
  }
  return clusters.map((cluster) => cluster.reduce((sum, value) => sum + value, 0) / cluster.length);
}

function nearestColumn(columns, value, tolerance) {
  let best = -1;
  let bestDistance = Infinity;
  for (let index = 0; index < columns.length; index++) {
    const distance = Math.abs(columns[index] - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return bestDistance <= tolerance ? best : -1;
}

/**
 * Detect a run of consecutive lines whose cell start positions align into
 * stable columns. Far more tolerant than exact-item-count matching: rows may
 * have missing cells as long as the ones present sit on shared anchors.
 */
function detectTableAt(lines, start, bodySize) {
  const tolerance = Math.max(6, bodySize * 0.7);
  const candidates = [];
  let previousBaseline = null;

  for (let index = start; index < lines.length; index++) {
    const line = lines[index];
    if (previousBaseline !== null && previousBaseline - line.baseline > Math.max(line.fontSize, bodySize) * 2.6) break;
    const cells = splitCells(line);
    if (cells.length < 2) break;
    candidates.push({ line, cells });
    previousBaseline = line.baseline;
  }
  if (candidates.length < 2) return null;

  const columns = clusterAnchors(
    candidates.flatMap((candidate) => candidate.cells.map((cell) => cell.left)),
    tolerance,
  );
  if (columns.length < 2 || columns.length > 16) return null;

  const rows = [];
  for (const candidate of candidates) {
    const mapped = [];
    let valid = true;
    for (const cell of candidate.cells) {
      const column = nearestColumn(columns, cell.left, tolerance);
      if (column === -1 || mapped.some((entry) => entry.column === column)) {
        valid = false;
        break;
      }
      mapped.push({ column, cell });
    }
    if (!valid) break;
    rows.push({ line: candidate.line, cells: mapped });
  }
  if (rows.length < 2) return null;

  const cellCounts = new Set(rows.map((row) => row.cells.length));
  if (rows.length === 2 && cellCounts.size > 1) return null;

  return { rows, columns, end: start + rows.length };
}

/**
 * Turn lines into layout blocks: tables, list items and paragraphs (with
 * wrapped lines merged back into a single flowing paragraph).
 */
export function buildBlocks(lines, box, bodySize) {
  const blocks = [];
  const leadings = [];
  for (let index = 1; index < lines.length; index++) {
    const gap = lines[index - 1].baseline - lines[index].baseline;
    if (gap > 0 && gap < bodySize * 3) leadings.push(gap);
  }
  const leading = median(leadings) || bodySize * 1.2;

  let index = 0;
  while (index < lines.length) {
    const table = detectTableAt(lines, index, bodySize);
    if (table) {
      blocks.push({
        type: "table",
        columns: table.columns,
        rows: table.rows,
        top: lines[index].baseline,
        fontSize: bodySize,
      });
      index = table.end;
      continue;
    }

    const line = lines[index];
    const marker = listMarker(line.text);
    const block = {
      type: marker ? "list" : "paragraph",
      marker,
      lines: [line],
      top: line.baseline,
      fontSize: line.fontSize,
      maxFontSize: line.maxFontSize,
      left: line.left,
      right: line.right,
    };
    index += 1;

    // Merge wrapped continuation lines into the same paragraph.
    while (index < lines.length) {
      const next = lines[index];
      const previous = block.lines.at(-1);
      const gap = previous.baseline - next.baseline;
      const sameSize = Math.abs(next.fontSize - previous.fontSize) <= Math.max(0.6, previous.fontSize * 0.12);
      const fullLine = previous.right >= box.right - Math.max(6, previous.fontSize * 1.6);
      const alignedLeft = Math.abs(next.left - (block.marker ? previous.left : block.left)) <= Math.max(2, bodySize * 0.35);
      const continues = sameSize
        && fullLine
        && alignedLeft
        && !listMarker(next.text)
        && gap > 0
        && gap <= leading * 1.45
        && splitCells(next).length < 2;
      if (!continues) break;
      block.lines.push(next);
      block.right = Math.max(block.right, next.right);
      index += 1;
    }

    block.bottom = block.lines.at(-1).baseline;
    block.maxFontSize = Math.max(...block.lines.map((entry) => entry.maxFontSize));
    blocks.push(block);
  }

  return { blocks, leading };
}

export function alignmentOf(block, box) {
  const first = block.lines[0];
  const leftGap = first.left - box.left;
  const rightGap = box.right - first.right;
  const tolerance = Math.max(4, block.fontSize * 0.6);
  const width = Math.max(1, box.width);
  if (Math.abs(leftGap - rightGap) <= Math.max(tolerance, width * 0.02) && leftGap > width * 0.06) return "center";
  if (rightGap <= tolerance && leftGap > width * 0.18) return "right";
  if (block.lines.length > 1) {
    const inner = block.lines.slice(0, -1);
    const justified = inner.every((line) => line.right >= box.right - Math.max(3, block.fontSize * 0.5));
    if (justified) return "justify";
  }
  return "left";
}
