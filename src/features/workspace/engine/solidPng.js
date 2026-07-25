// PDFin workspace — builds a 1×1 solid colour PNG without a canvas, so vector
// fills recovered from a PDF can be stretched into a DOCX as coloured boxes.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes) {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function be32(value) {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

function chunk(type, data) {
  const name = [...type].map((character) => character.charCodeAt(0));
  const body = Uint8Array.from([...name, ...data]);
  return [...be32(data.length), ...body, ...be32(crc32(body))];
}

const cache = new Map();

/**
 * @param {string} hex six digit RGB, e.g. "1F2937".
 * @returns {Uint8Array} PNG bytes for a single opaque pixel of that colour.
 */
export function solidPng(hex) {
  const key = String(hex || "000000").replace(/^#/, "").toUpperCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const number = parseInt(/^[0-9A-F]{6}$/.test(key) ? key : "000000", 16);
  const raw = Uint8Array.from([0, (number >> 16) & 255, (number >> 8) & 255, number & 255]);
  // zlib stream with one stored (uncompressed) deflate block.
  const zlib = Uint8Array.from([
    0x78, 0x01,
    0x01, raw.length & 255, (raw.length >> 8) & 255, ~raw.length & 255, (~raw.length >> 8) & 255,
    ...raw,
    ...be32(adler32(raw)),
  ]);

  const png = Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunk("IHDR", [...be32(1), ...be32(1), 8, 2, 0, 0, 0]),
    ...chunk("IDAT", zlib),
    ...chunk("IEND", []),
  ]);
  cache.set(key, png);
  return png;
}
