// PDFin workspace — shared content-stream geometry helpers.
//
// Both the redaction walker and the text editor need the same matrix algebra to
// turn text-state operators into page coordinates, so the tricky parts live in
// one place.

export const IDENTITY = [1, 0, 0, 1, 0, 0];

export function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

export function applyMatrix(matrix, x, y) {
  return [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
}

export function boxOfQuad(points) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

export function boxesIntersect(a, b) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

export function boxInside(inner, outer) {
  return inner.x0 >= outer.x0 && inner.x1 <= outer.x1 && inner.y0 >= outer.y0 && inner.y1 <= outer.y1;
}

// Nominal em-box extents used to give a glyph a height; PDF fonts do not carry
// per-glyph boxes in the content stream.
export const GLYPH_ASCENT = 0.9;
export const GLYPH_DESCENT = -0.25;

// Text rendering matrix for the current text state.
export function textRenderingMatrix({ fontSize, hScale, rise, textMatrix, ctm }) {
  return multiply(multiply([fontSize * hScale, 0, 0, fontSize, 0, rise], textMatrix), ctm);
}

export function glyphBox(trm, width) {
  return boxOfQuad([
    applyMatrix(trm, 0, GLYPH_DESCENT),
    applyMatrix(trm, width, GLYPH_DESCENT),
    applyMatrix(trm, width, GLYPH_ASCENT),
    applyMatrix(trm, 0, GLYPH_ASCENT),
  ]);
}

// Visible page box: /Rotate 90 or 270 swaps the media box dimensions.
export function visibleSize(width, height, rotation) {
  const angle = ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
  return angle === 90 || angle === 270
    ? { width: height, height: width, angle }
    : { width, height, angle };
}

// Maps a point in visible space (origin bottom-left of the visible box) onto
// PDF user space for the given page rotation.
export function visibleToUserMatrix(width, height, angle) {
  if (angle === 90) return [0, 1, -1, 0, width, 0];
  if (angle === 180) return [-1, 0, 0, -1, width, height];
  if (angle === 270) return [0, -1, 1, 0, 0, height];
  return [1, 0, 0, 1, 0, 0];
}

// Inverse of `visibleToUserMatrix`, used to report content-stream geometry back
// to the UI in the coordinates the preview overlay uses.
export function userToVisibleMatrix(width, height, angle) {
  if (angle === 90) return [0, -1, 1, 0, 0, width];
  if (angle === 180) return [-1, 0, 0, -1, width, height];
  if (angle === 270) return [0, 1, -1, 0, height, 0];
  return [1, 0, 0, 1, 0, 0];
}

// True when a matrix only scales and translates, which is what the text editor
// needs in order to redraw a replacement run without reconstructing rotation or
// skew.
export function isAxisAligned(matrix, tolerance = 1e-6) {
  return Math.abs(matrix[1]) < tolerance && Math.abs(matrix[2]) < tolerance && matrix[0] > 0 && matrix[3] > 0;
}
