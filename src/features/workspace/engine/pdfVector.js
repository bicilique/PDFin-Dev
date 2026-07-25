import * as pdfjsLib from "pdfjs-dist";

// PDFin workspace — reads the parts of a page that `getTextContent()` throws
// away: vector fills/strokes (table shading, rules, coloured bars, banners) and
// the fill colour that was active while each piece of text was drawn.
// Positions are returned in PDF points with the origin at the top-left.

const MAX_SHAPES_PER_PAGE = 220;
const MIN_SHAPE_SIDE_PT = 0.6;
const MIN_POLYGON_SIDE_PT = 3;
const PAGE_COVER_RATIO = 0.92;
const MAX_ART_REGIONS_PER_PAGE = 24;
const MIN_ART_SIDE_PT = 1.5;
const ART_MERGE_GAP_PT = 3;

function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

function applyMatrix(matrix, x, y) {
  return [
    matrix[0] * x + matrix[2] * y + matrix[4],
    matrix[1] * x + matrix[3] * y + matrix[5],
  ];
}

function matrixScale(matrix) {
  return Math.sqrt(Math.abs(matrix[0] * matrix[3] - matrix[1] * matrix[2])) || 1;
}

const channel = (value) => {
  const number = Math.round(Number(value) || 0);
  return Math.min(255, Math.max(0, number));
};

export function rgbToHex(rgb) {
  return [rgb[0], rgb[1], rgb[2]]
    .map((value) => channel(value).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// pdf.js hands colours over as either [r,g,b] arrays or "#rrggbb" strings
// depending on the operator, so normalise both shapes here. Patterns and
// shadings carry no single colour and return null.
function toRgb(value) {
  if (Array.isArray(value) || ArrayBuffer.isView(value)) {
    if (value.length < 3 || [...value].slice(0, 3).some((entry) => !Number.isFinite(Number(entry)))) return null;
    return [channel(value[0]), channel(value[1]), channel(value[2])];
  }
  const text = String(value || "");
  const match = /^#?([0-9a-f]{6})$/i.exec(text.trim());
  if (!match) return null;
  const number = parseInt(match[1], 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

// DOCX images have no alpha channel, so simulate constant alpha by blending the
// fill towards white the way it would look on a white page.
function blendWhite(rgb, alpha) {
  if (!rgb) return null;
  if (!(alpha < 0.995)) return rgb;
  const ratio = Math.max(0, Math.min(1, alpha));
  return rgb.map((value) => channel(value * ratio + 255 * (1 - ratio)));
}

function isNearWhite(rgb) {
  return rgb[0] >= 250 && rgb[1] >= 250 && rgb[2] >= 250;
}

const PATH_ARGS = new Map();

function pathArgCounts() {
  if (PATH_ARGS.size) return PATH_ARGS;
  const OPS = pdfjsLib.OPS || {};
  PATH_ARGS.set(OPS.moveTo, 2);
  PATH_ARGS.set(OPS.lineTo, 2);
  PATH_ARGS.set(OPS.curveTo, 6);
  PATH_ARGS.set(OPS.curveTo2, 4);
  PATH_ARGS.set(OPS.curveTo3, 4);
  PATH_ARGS.set(OPS.closePath, 0);
  PATH_ARGS.set(OPS.rectangle, 4);
  return PATH_ARGS;
}

/**
 * Split a `constructPath` operand pair into subpaths of {points, kind}.
 * Curved subpaths are reported so callers can drop them instead of painting a
 * wrong-shaped block over the page.
 */
function subpathsOf(ops, coords) {
  const OPS = pdfjsLib.OPS || {};
  const counts = pathArgCounts();
  const subpaths = [];
  let current = null;
  let cursor = 0;
  for (const op of ops) {
    const size = counts.get(op);
    if (size === undefined) return subpaths;
    const args = Array.from(coords).slice(cursor, cursor + size).map(Number);
    cursor += size;
    if (op === OPS.rectangle) {
      subpaths.push({
        curved: false,
        controls: [],
        rect: true,
        points: [
          [args[0], args[1]],
          [args[0] + args[2], args[1]],
          [args[0] + args[2], args[1] + args[3]],
          [args[0], args[1] + args[3]],
        ],
      });
      current = null;
    } else if (op === OPS.moveTo) {
      current = { curved: false, controls: [], points: [[args[0], args[1]]] };
      subpaths.push(current);
    } else if (op === OPS.lineTo) {
      if (!current) {
        current = { curved: false, controls: [], points: [] };
        subpaths.push(current);
      }
      current.points.push([args[0], args[1]]);
    } else if (op === OPS.closePath) {
      current = null;
    } else if (current) {
      current.curved = true;
      // Control points bound the curve, so they are kept apart for callers that
      // need the area the ink can reach, not the on-path corners.
      for (let offset = 0; offset + 1 < size - 2; offset += 2) {
        current.controls.push([args[offset], args[offset + 1]]);
      }
      current.points.push([args[size - 2], args[size - 1]]);
    }
  }
  return subpaths;
}

function boundsOf(points, matrix) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const mapped = points.map(([x, y]) => applyMatrix(matrix, x, y));
  for (const [x, y] of mapped) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY, mapped };
}

function shoelace(points) {
  let area = 0;
  for (let index = 0; index < points.length; index++) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

// Only rectangle-shaped fills survive: a DOCX can reproduce a filled box, not
// an arbitrary polygon, and painting a polygon's bounding box would smear
// colour across the page.
function fillRect(subpath, matrix) {
  if (subpath.points.length < 2) return null;
  const { minX, minY, maxX, maxY, mapped } = boundsOf(subpath.points, matrix);
  const width = maxX - minX;
  const height = maxY - minY;
  if (!(width > 0) || !(height > 0)) return null;
  if (subpath.curved) {
    // Rounded rectangles/pills: accept when the curves only round the corners.
    if (shoelace(mapped) < width * height * 0.72) return null;
  } else if (mapped.length > 2 && shoelace(mapped) < width * height * 0.88) {
    return null;
  }
  // Vector wordmarks and icons are polygons whose stems are rectangle-shaped;
  // only sizeable polygons are worth painting as a block.
  if (!subpath.rect && Math.min(width, height) < MIN_POLYGON_SIDE_PT) return null;
  return { left: minX, bottom: minY, width, height };
}

function strokeRect(subpath, matrix, lineWidth) {
  if (subpath.points.length < 2 || subpath.curved) return null;
  const { minX, minY, maxX, maxY } = boundsOf(subpath.points, matrix);
  const thickness = Math.max(0.6, lineWidth * matrixScale(matrix));
  const width = maxX - minX;
  const height = maxY - minY;
  // Straight rules only; a stroked box is emitted as its four edges.
  if (width > thickness && height > thickness) {
    return [
      { left: minX, bottom: maxY - thickness, width, height: thickness },
      { left: minX, bottom: minY, width, height: thickness },
      { left: minX, bottom: minY, width: thickness, height },
      { left: maxX - thickness, bottom: minY, width: thickness, height },
    ];
  }
  return [{
    left: minX,
    bottom: height <= thickness ? minY - thickness / 2 : minY,
    width: Math.max(width, thickness),
    height: Math.max(height, thickness),
  }];
}

// Clip regions are tracked as their bounding box: a fill is only visible where
// it overlaps the active clip, and PDF generators routinely paint oversized
// rectangles that a clip trims back to a card, banner or table cell.
function intersect(a, b) {
  if (!b) return a;
  const minX = Math.max(a.minX, b.minX);
  const minY = Math.max(a.minY, b.minY);
  const maxX = Math.min(a.maxX, b.maxX);
  const maxY = Math.min(a.maxY, b.maxY);
  return maxX > minX && maxY > minY ? { minX, minY, maxX, maxY } : { minX, minY, maxX: minX, maxY: minY };
}

function clipRect(rect, clip) {
  if (!clip) return rect;
  const left = Math.max(rect.left, clip.minX);
  const bottom = Math.max(rect.bottom, clip.minY);
  const right = Math.min(rect.left + rect.width, clip.maxX);
  const top = Math.min(rect.bottom + rect.height, clip.maxY);
  if (!(right > left) || !(top > bottom)) return null;
  return { left, bottom, width: right - left, height: top - bottom };
}

function pushShape(shapes, rect, rgb, pageWidth, pageHeight) {
  if (!rect || !rgb || shapes.length >= MAX_SHAPES_PER_PAGE) return;
  const left = Math.max(0, rect.left);
  const top = Math.max(0, pageHeight - rect.bottom - rect.height);
  const width = Math.min(pageWidth - left, rect.width);
  const height = Math.min(pageHeight - top, rect.height);
  if (width < MIN_SHAPE_SIDE_PT || height < MIN_SHAPE_SIDE_PT) return;
  // A white page-sized backdrop is what Word already draws.
  if (isNearWhite(rgb) && width >= pageWidth * PAGE_COVER_RATIO && height >= pageHeight * PAGE_COVER_RATIO) return;
  shapes.push({ left, top, width, height, color: rgbToHex(rgb) });
}

// Everything a DOCX cannot draw — icons, logos, curves, gradients, stencil
// masks — is recorded as a page region so the caller can paint that patch as a
// raster image instead of dropping the artwork.
function pushArt(regions, bounds, clip, pageWidth, pageHeight) {
  if (!bounds) return;
  const box = clip ? intersect(bounds, clip) : bounds;
  const left = Math.max(0, box.minX);
  const bottom = Math.max(0, box.minY);
  const right = Math.min(pageWidth, box.maxX);
  const top = Math.min(pageHeight, box.maxY);
  const width = right - left;
  const height = top - bottom;
  if (width < MIN_ART_SIDE_PT || height < MIN_ART_SIDE_PT) return;
  // A page-sized patch is the whole page rendered twice, not an illustration.
  if (width >= pageWidth * PAGE_COVER_RATIO && height >= pageHeight * PAGE_COVER_RATIO) return;
  regions.push({ left, top: pageHeight - top, width, height });
}

// Art painted as many small ops (an icon is dozens of subpaths) is merged back
// into the few patches a reader perceives, so each drawing is one image.
function mergeArt(regions, limit = MAX_ART_REGIONS_PER_PAGE) {
  const boxes = regions.map((region) => ({
    left: region.left,
    top: region.top,
    right: region.left + region.width,
    bottom: region.top + region.height,
  }));
  let merged = true;
  while (merged) {
    merged = false;
    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        const overlapX = Math.min(boxes[a].right, boxes[b].right) - Math.max(boxes[a].left, boxes[b].left);
        const overlapY = Math.min(boxes[a].bottom, boxes[b].bottom) - Math.max(boxes[a].top, boxes[b].top);
        if (overlapX < -ART_MERGE_GAP_PT || overlapY < -ART_MERGE_GAP_PT) continue;
        boxes[a] = {
          left: Math.min(boxes[a].left, boxes[b].left),
          top: Math.min(boxes[a].top, boxes[b].top),
          right: Math.max(boxes[a].right, boxes[b].right),
          bottom: Math.max(boxes[a].bottom, boxes[b].bottom),
        };
        boxes.splice(b, 1);
        b--;
        merged = true;
      }
    }
  }
  return boxes
    .map((box) => ({
      left: box.left,
      top: box.top,
      width: box.right - box.left,
      height: box.bottom - box.top,
    }))
    .filter((region) => region.width >= MIN_ART_SIDE_PT && region.height >= MIN_ART_SIDE_PT)
    .sort((a, b) => b.width * b.height - a.width * a.height)
    .slice(0, limit);
}

// The ink of a curve stays inside the hull of its on-path and control points.
function artBounds(subpath, matrix) {
  return boundsOf(subpath.controls?.length ? [...subpath.points, ...subpath.controls] : subpath.points, matrix);
}

function unitBounds(matrix) {
  const { minX, minY, maxX, maxY } = boundsOf([[0, 0], [1, 0], [1, 1], [0, 1]], matrix);
  return { minX, minY, maxX, maxY };
}

/**
 * @returns {Promise<{shapes: Array, textColors: Array, artRegions: Array}>}
 * `shapes` are filled/stroked rectangles ready to be placed behind the text.
 * `textColors` are {x, y, color} samples taken at each text-drawing operator.
 * `artRegions` are page patches whose artwork only a raster image can carry.
 */
export async function extractPageGraphics(page, pageWidth, pageHeight, options = {}) {
  if (typeof page?.getOperatorList !== "function") return { shapes: [], textColors: [], artRegions: [] };
  const OPS = pdfjsLib.OPS || {};
  let operatorList;
  try {
    operatorList = options.operatorList || await page.getOperatorList();
  } catch {
    return { shapes: [], textColors: [], artRegions: [] };
  }
  const fnArray = operatorList?.fnArray || [];
  const argsArray = operatorList?.argsArray || [];

  const shapes = [];
  const textColors = [];
  const artRegions = [];
  const wantsArt = options.art !== false;
  const stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  let fill = [0, 0, 0];
  let stroke = [0, 0, 0];
  let alpha = 1;
  let strokeAlpha = 1;
  let lineWidth = 1;
  let clip = null;
  let pending = null;
  let textMatrix = [1, 0, 0, 1, 0, 0];
  let lineMatrix = [1, 0, 0, 1, 0, 0];
  let leading = 0;
  let invisibleText = false;

  const state = () => ({
    matrix: [...matrix],
    fill: fill && [...fill],
    stroke: stroke && [...stroke],
    alpha,
    strokeAlpha,
    lineWidth,
    clip: clip && { ...clip },
  });

  for (let index = 0; index < fnArray.length; index++) {
    const fn = fnArray[index];
    const args = argsArray[index] || [];

    if (fn === OPS.save) {
      stack.push(state());
    } else if (fn === OPS.restore) {
      const previous = stack.pop();
      if (previous) {
        matrix = previous.matrix;
        fill = previous.fill;
        stroke = previous.stroke;
        alpha = previous.alpha;
        strokeAlpha = previous.strokeAlpha;
        lineWidth = previous.lineWidth;
        clip = previous.clip;
      }
    } else if (fn === OPS.transform) {
      matrix = multiply(Array.from(args).slice(0, 6).map(Number), matrix);
    } else if (fn === OPS.setFillRGBColor || fn === OPS.setFillColorN || fn === OPS.setFillColor) {
      // A pattern or shading fill has no flat colour; painting a block would be
      // worse than leaving the area empty, so the fill is disabled instead.
      fill = toRgb(args.length > 1 ? args : args[0]);
    } else if (fn === OPS.setStrokeRGBColor || fn === OPS.setStrokeColorN || fn === OPS.setStrokeColor) {
      stroke = toRgb(args.length > 1 ? args : args[0]);
    } else if (fn === OPS.setLineWidth) {
      lineWidth = Number(args[0]) || lineWidth;
    } else if (fn === OPS.setGState) {
      for (const [key, value] of args[0] || []) {
        if (key === "ca") alpha = Number(value);
        else if (key === "CA") strokeAlpha = Number(value);
        else if (key === "LW") lineWidth = Number(value) || lineWidth;
      }
    } else if (fn === OPS.constructPath) {
      pending = { ops: args[0] || [], coords: args[1] || [], matrix: [...matrix] };
    } else if (fn === OPS.fill || fn === OPS.eoFill || fn === OPS.fillStroke || fn === OPS.eoFillStroke || fn === OPS.closeFillStroke || fn === OPS.closeEOFillStroke) {
      if (pending && options.shapes !== false) {
        const rgb = blendWhite(fill, alpha);
        for (const subpath of subpathsOf(pending.ops, pending.coords)) {
          const rect = rgb ? fillRect(subpath, pending.matrix) : null;
          if (rect) {
            pushShape(shapes, clipRect(rect, clip), rgb, pageWidth, pageHeight);
          } else if (wantsArt && alpha > 0.02) {
            // Either the shape is not a rectangle (an icon, a logo, a chart
            // wedge) or the fill is a pattern/gradient with no flat colour.
            pushArt(artRegions, artBounds(subpath, pending.matrix), clip, pageWidth, pageHeight);
          }
        }
      }
      if (fn !== OPS.fill && fn !== OPS.eoFill) pending = null;
    } else if (fn === OPS.stroke || fn === OPS.closeStroke) {
      if (pending && options.shapes !== false) {
        const rgb = blendWhite(stroke, strokeAlpha);
        for (const subpath of subpathsOf(pending.ops, pending.coords)) {
          const rects = rgb ? strokeRect(subpath, pending.matrix, lineWidth) : null;
          if (rects) {
            for (const rect of rects) pushShape(shapes, clipRect(rect, clip), rgb, pageWidth, pageHeight);
          } else if (wantsArt && strokeAlpha > 0.02) {
            const bounds = artBounds(subpath, pending.matrix);
            const pad = Math.max(0.6, lineWidth * matrixScale(pending.matrix)) / 2;
            pushArt(artRegions, {
              minX: bounds.minX - pad,
              minY: bounds.minY - pad,
              maxX: bounds.maxX + pad,
              maxY: bounds.maxY + pad,
            }, clip, pageWidth, pageHeight);
          }
        }
      }
      pending = null;
    } else if (fn === OPS.clip || fn === OPS.eoClip) {
      if (pending) {
        let box = null;
        for (const subpath of subpathsOf(pending.ops, pending.coords)) {
          const bounds = artBounds(subpath, pending.matrix);
          box = box
            ? { minX: Math.min(box.minX, bounds.minX), minY: Math.min(box.minY, bounds.minY), maxX: Math.max(box.maxX, bounds.maxX), maxY: Math.max(box.maxY, bounds.maxY) }
            : { minX: bounds.minX, minY: bounds.minY, maxX: bounds.maxX, maxY: bounds.maxY };
        }
        if (box) clip = intersect(box, clip);
      }
    } else if (fn === OPS.shadingFill) {
      // A gradient paints the whole active clip; there is no flat colour to
      // approximate, so the patch is rasterised.
      if (wantsArt && clip) pushArt(artRegions, clip, null, pageWidth, pageHeight);
      pending = null;
    } else if (
      fn === OPS.paintImageMaskXObject
      || fn === OPS.paintImageMaskXObjectGroup
      || fn === OPS.paintImageMaskXObjectRepeat
    ) {
      // Stencil masks carry most vector icons and scanned signatures. Their
      // pixels are the fill colour, which no rectangle can express.
      // A group draws several stamps, each with its own transform.
      const stamps = fn === OPS.paintImageMaskXObjectGroup && Array.isArray(args[0])
        ? args[0].map((entry) => (
          Array.isArray(entry?.transform) ? multiply(entry.transform.map(Number), matrix) : matrix
        ))
        : [matrix];
      if (wantsArt) {
        for (const stamp of stamps) pushArt(artRegions, unitBounds(stamp), clip, pageWidth, pageHeight);
      }
      pending = null;
    } else if (fn === OPS.endPath) {
      pending = null;
    } else if (fn === OPS.beginText) {
      textMatrix = [1, 0, 0, 1, 0, 0];
      lineMatrix = [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.setTextMatrix) {
      textMatrix = Array.from(args).slice(0, 6).map(Number);
      lineMatrix = [...textMatrix];
    } else if (fn === OPS.setLeading) {
      leading = Number(args[0]) || 0;
    } else if (fn === OPS.setLeadingMoveText || fn === OPS.moveText) {
      if (fn === OPS.setLeadingMoveText) leading = -Number(args[1]) || leading;
      lineMatrix = multiply([1, 0, 0, 1, Number(args[0]) || 0, Number(args[1]) || 0], lineMatrix);
      textMatrix = [...lineMatrix];
    } else if (fn === OPS.nextLine || fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText) {
      lineMatrix = multiply([1, 0, 0, 1, 0, -leading], lineMatrix);
      textMatrix = [...lineMatrix];
    } else if (fn === OPS.setTextRenderingMode) {
      invisibleText = Number(args[0]) === 3;
    }

    if (
      !invisibleText
      && (fn === OPS.showText || fn === OPS.showSpacedText || fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText)
    ) {
      const trm = multiply(textMatrix, matrix);
      textColors.push({ x: trm[4], y: trm[5], color: rgbToHex(blendWhite(fill, alpha)) });
    }
  }

  return { shapes, textColors, artRegions: mergeArt(artRegions) };
}

/**
 * Resolve the real PostScript font names behind pdf.js font ids. `getTextContent`
 * styles often report a generic "sans-serif", which hides bold/italic; the
 * loaded font object still carries names like `AAAAA+Inter-Regular_SemiBold`.
 */
export function resolveFontNames(page, styles) {
  const names = {};
  for (const key of Object.keys(styles || {})) {
    try {
      const objs = page?.commonObjs?.has?.(key) ? page.commonObjs : null;
      const font = objs?.get?.(key);
      const name = font?.name || font?.loadedName;
      if (name) names[key] = String(name);
    } catch {
      // A missing font object only costs bold/italic detection for that font.
    }
  }
  return names;
}

/**
 * Attach the sampled fill colour to each text item by position. Samples are
 * taken at the start of every text-showing operator, so the nearest sample on
 * the same baseline is the colour that item was drawn with.
 */
export function colorLookup(samples) {
  const buckets = new Map();
  for (const sample of samples || []) {
    const key = Math.round(sample.y);
    for (const offset of [-1, 0, 1]) {
      const list = buckets.get(key + offset) || [];
      list.push(sample);
      buckets.set(key + offset, list);
    }
  }
  return (x, y) => {
    const list = buckets.get(Math.round(y));
    if (!list?.length) return null;
    let best = null;
    let bestDistance = Infinity;
    for (const sample of list) {
      const distance = Math.abs(sample.x - x);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = sample;
      }
    }
    return bestDistance <= 24 ? best.color : null;
  };
}
