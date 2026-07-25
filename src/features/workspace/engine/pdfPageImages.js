import * as pdfjsLib from "pdfjs-dist";

// PDFin workspace — extracts placed raster images (logos, signatures, photos)
// from a pdf.js page together with their position on the page, so exporters
// can put them back where the PDF had them instead of dropping them.

// Small placed images are exactly the icons and bullets a conversion is judged
// on, so the floor only excludes hairlines.
const MIN_SIDE_PT = 1.5;
const MAX_IMAGES_PER_PAGE = 60;
// pdf.js ImageKind
const GRAYSCALE_1BPP = 1;
const RGB_24BPP = 2;
const RGBA_32BPP = 3;

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

function resolveObject(page, name) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value || null);
    };
    setTimeout(() => finish(null), 4000);
    try {
      const objs = page.objs?.has?.(name) ? page.objs : page.commonObjs?.has?.(name) ? page.commonObjs : null;
      if (!objs) {
        finish(null);
        return;
      }
      objs.get(name, finish);
    } catch {
      finish(null);
    }
  });
}

async function toPngBytes(image) {
  const width = Number(image?.width) || 0;
  const height = Number(image?.height) || 0;
  if (!width || !height) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (image.bitmap) {
    ctx.drawImage(image.bitmap, 0, 0, width, height);
  } else if (image.data) {
    const source = image.data;
    const target = ctx.createImageData(width, height);
    // The declared kind beats a byte-count guess: a 1-bit image packs eight
    // pixels per byte, which the guess would read as a fraction of a channel.
    const kind = Number(image.kind) || 0;
    const channels = source.length / (width * height);
    if (kind === GRAYSCALE_1BPP) {
      const rowBytes = (width + 7) >> 3;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const byte = source[y * rowBytes + (x >> 3)] || 0;
          const value = byte & (128 >> (x & 7)) ? 255 : 0;
          const pixel = (y * width + x) * 4;
          target.data[pixel] = value;
          target.data[pixel + 1] = value;
          target.data[pixel + 2] = value;
          target.data[pixel + 3] = 255;
        }
      }
    } else if (kind === RGBA_32BPP || (!kind && channels >= 3.9)) {
      // pdf.js has already composited any soft mask here, so the alpha channel
      // is what keeps a transparent logo from becoming a white block.
      target.data.set(source.subarray(0, target.data.length));
    } else if (kind === RGB_24BPP || (!kind && channels >= 2.9)) {
      for (let pixel = 0; pixel < width * height; pixel++) {
        target.data[pixel * 4] = source[pixel * 3];
        target.data[pixel * 4 + 1] = source[pixel * 3 + 1];
        target.data[pixel * 4 + 2] = source[pixel * 3 + 2];
        target.data[pixel * 4 + 3] = 255;
      }
    } else if (channels >= 0.9) {
      for (let pixel = 0; pixel < width * height; pixel++) {
        const value = source[pixel];
        target.data[pixel * 4] = value;
        target.data[pixel * 4 + 1] = value;
        target.data[pixel * 4 + 2] = value;
        target.data[pixel * 4 + 3] = 255;
      }
    } else {
      return null;
    }
    ctx.putImageData(target, 0, 0);
  } else {
    return null;
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * @returns {Promise<Array<{data: Uint8Array, left: number, top: number, width: number, height: number}>>}
 * Positions are in PDF points with the origin at the top-left of the page.
 */
export async function extractPageImages(page, pageWidth, pageHeight, options = {}) {
  if (typeof page?.getOperatorList !== "function") return [];
  const OPS = pdfjsLib.OPS || {};
  let operatorList;
  try {
    operatorList = options.operatorList || await page.getOperatorList();
  } catch {
    return [];
  }
  const fnArray = operatorList?.fnArray || [];
  const argsArray = operatorList?.argsArray || [];

  const placements = [];
  const stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];

  for (let index = 0; index < fnArray.length; index++) {
    const fn = fnArray[index];
    const args = argsArray[index] || [];
    if (fn === OPS.save) {
      stack.push([...matrix]);
    } else if (fn === OPS.restore) {
      matrix = stack.pop() || [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform) {
      matrix = multiply(args.slice(0, 6), matrix);
    } else if (
      fn === OPS.paintImageXObject
      || fn === OPS.paintJpegXObject
      || fn === OPS.paintImageXObjectRepeat
      || fn === OPS.paintInlineImageXObject
    ) {
      const width = Math.hypot(matrix[0], matrix[1]);
      const height = Math.hypot(matrix[2], matrix[3]);
      if (width >= MIN_SIDE_PT && height >= MIN_SIDE_PT) {
        placements.push({
          source: fn === OPS.paintInlineImageXObject ? args[0] : String(args[0] || ""),
          inline: fn === OPS.paintInlineImageXObject,
          left: matrix[4] + Math.min(0, matrix[0]) + Math.min(0, matrix[2]),
          bottom: matrix[5] + Math.min(0, matrix[1]) + Math.min(0, matrix[3]),
          width,
          height,
        });
      }
      if (placements.length >= MAX_IMAGES_PER_PAGE) break;
    }
  }

  const images = [];
  const cache = new Map();
  for (const placement of placements) {
    try {
      let data = null;
      if (placement.inline) {
        data = await toPngBytes(placement.source);
      } else if (cache.has(placement.source)) {
        data = cache.get(placement.source);
      } else {
        data = await toPngBytes(await resolveObject(page, placement.source));
        cache.set(placement.source, data);
      }
      if (!data) continue;
      images.push({
        data,
        left: Math.max(0, placement.left),
        top: Math.max(0, pageHeight - placement.bottom - placement.height),
        width: Math.min(pageWidth, placement.width),
        height: Math.min(pageHeight, placement.height),
      });
    } catch {
      // A single undecodable image must not fail the whole conversion.
    }
  }
  return images;
}
