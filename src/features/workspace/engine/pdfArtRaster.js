// PDFin workspace — paints the parts of a page that a DOCX cannot describe.
// Icons, logos, gradients, chart wedges and stencil masks stay vector art in
// the PDF; here each such region is rendered once and cropped into a small
// transparent PNG that the exporter drops back at the same spot.

const DEFAULT_SCALE = 3;
const MAX_CANVAS_SIDE_PX = 4000;
const MAX_REGION_SIDE_PX = 1600;

// pdf.js draws glyphs through `fillText`, so a context that ignores those calls
// renders the artwork alone. Text is re-created as editable runs by the
// exporter, and painting it twice would double every character.
function textFreeContext(ctx) {
  return new Proxy(ctx, {
    get(target, key) {
      if (key === "fillText" || key === "strokeText") return () => {};
      const value = target[key];
      return typeof value === "function" ? value.bind(target) : value;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

async function toPng(canvas) {
  const blob = await new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, "image/png");
    } catch {
      resolve(null);
    }
  });
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

// A crop that is fully transparent means the region held nothing visible (a
// clipped-away path, an invisible mask); embedding it would only bloat the file.
function hasInk(ctx, width, height) {
  try {
    const { data } = ctx.getImageData(0, 0, width, height);
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 8) return true;
    }
    return false;
  } catch {
    // Without pixel access (tainted or stubbed canvas) keep the crop.
    return true;
  }
}

/**
 * @param {Array<{left: number, top: number, width: number, height: number}>} regions
 *   Page patches in PDF points with the origin at the top-left.
 * @returns {Promise<Array<{data: Uint8Array, left: number, top: number, width: number, height: number}>>}
 */
export async function renderArtRegions(page, regions, pageWidth, pageHeight, options = {}) {
  if (!regions?.length || typeof page?.render !== "function" || typeof document === "undefined") return [];

  const requested = Number(options.scale) || DEFAULT_SCALE;
  const scale = Math.max(1, Math.min(
    requested,
    MAX_CANVAS_SIDE_PX / Math.max(pageWidth, pageHeight, 1),
  ));

  let source;
  try {
    const viewport = page.getViewport({ scale });
    source = createCanvas(viewport.width, viewport.height);
    const ctx = source.getContext("2d");
    if (!ctx) return [];
    await page.render({
      canvasContext: textFreeContext(ctx),
      viewport,
      // Transparent, so the crops carry only the artwork and never a white box
      // over whatever the DOCX already draws underneath.
      background: "rgba(0,0,0,0)",
      intent: "print",
    }).promise;
  } catch {
    return [];
  }

  const images = [];
  for (const region of regions) {
    if (options.signal?.aborted) break;
    const sx = Math.max(0, Math.floor(region.left * scale));
    const sy = Math.max(0, Math.floor(region.top * scale));
    const sw = Math.min(source.width - sx, Math.ceil(region.width * scale));
    const sh = Math.min(source.height - sy, Math.ceil(region.height * scale));
    if (sw < 1 || sh < 1) continue;
    // Very wide regions (a full-width illustrated banner) are downsampled so a
    // single page cannot push the DOCX into tens of megabytes.
    const fit = Math.min(1, MAX_REGION_SIDE_PX / Math.max(sw, sh));
    try {
      const crop = createCanvas(sw * fit, sh * fit);
      const ctx = crop.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, crop.width, crop.height);
      if (!hasInk(ctx, crop.width, crop.height)) continue;
      const data = await toPng(crop);
      if (!data) continue;
      images.push({
        data,
        left: sx / scale,
        top: sy / scale,
        width: Math.min(pageWidth, sw / scale),
        height: Math.min(pageHeight, sh / scale),
      });
    } catch {
      // One unrenderable patch must not cost the rest of the page.
    }
  }
  return images;
}
