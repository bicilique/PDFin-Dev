import { tokenizeContentStream } from "./contentStream.js";

// PDFin workspace — ToUnicode CMap parsing.
//
// Editing existing PDF text needs both directions: character codes in the
// content stream must be shown to the user as readable text, and the text they
// type has to be turned back into codes the *same* font can actually render.
// A ToUnicode CMap gives us the forward map; inverting it tells us exactly
// which characters a subset font is able to draw.

function hexToNumber(bytes) {
  let value = 0;
  for (const byte of bytes) value = value * 256 + byte;
  return value;
}

// CMap destination values are UTF-16BE strings, so one code can map to several
// characters (ligatures such as "ﬁ" -> "fi").
function utf16BeToString(bytes) {
  let out = "";
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    out += String.fromCharCode((bytes[index] << 8) | bytes[index + 1]);
  }
  if (bytes.length === 1) out += String.fromCharCode(bytes[0]);
  return out;
}

function incrementLastUnit(text, step) {
  if (!text) return text;
  const codes = [...text];
  const last = codes.pop();
  return codes.join("") + String.fromCharCode(last.charCodeAt(0) + step);
}

/**
 * Parses a ToUnicode CMap stream.
 *
 * Returns `{ toUnicode, fromUnicode, codeByteLength }`. `fromUnicode` keeps the
 * lowest code for each string so re-encoding is stable, and it only contains
 * characters the font demonstrably has a glyph for.
 */
export function parseToUnicodeCMap(bytes) {
  const toUnicode = new Map();
  const fromUnicode = new Map();
  let codeByteLength = 0;

  if (!bytes || !bytes.length) return { toUnicode, fromUnicode, codeByteLength: 0 };

  let operations;
  try {
    operations = tokenizeContentStream(bytes);
  } catch {
    return { toUnicode, fromUnicode, codeByteLength: 0 };
  }

  const record = (code, text) => {
    if (!text) return;
    toUnicode.set(code, text);
    const existing = fromUnicode.get(text);
    if (existing === undefined || code < existing) fromUnicode.set(text, code);
  };

  for (const { operator, operands } of operations) {
    if (operator === "endcodespacerange") {
      for (const operand of operands) {
        if (operand.type === "string") codeByteLength = Math.max(codeByteLength, operand.bytes.length);
      }
      continue;
    }

    if (operator === "endbfchar") {
      for (let index = 0; index + 1 < operands.length; index += 2) {
        const source = operands[index];
        const target = operands[index + 1];
        if (source?.type !== "string" || target?.type !== "string") continue;
        codeByteLength = Math.max(codeByteLength, source.bytes.length);
        record(hexToNumber(source.bytes), utf16BeToString(target.bytes));
      }
      continue;
    }

    if (operator === "endbfrange") {
      for (let index = 0; index + 2 < operands.length; index += 3) {
        const low = operands[index];
        const high = operands[index + 1];
        const target = operands[index + 2];
        if (low?.type !== "string" || high?.type !== "string") continue;
        codeByteLength = Math.max(codeByteLength, low.bytes.length);
        const start = hexToNumber(low.bytes);
        const end = Math.min(hexToNumber(high.bytes), start + 65535);

        if (target?.type === "array") {
          target.items.forEach((item, offset) => {
            if (item?.type === "string") record(start + offset, utf16BeToString(item.bytes));
          });
          continue;
        }
        if (target?.type !== "string") continue;
        const base = utf16BeToString(target.bytes);
        for (let code = start; code <= end; code += 1) record(code, incrementLastUnit(base, code - start));
      }
    }
  }

  return { toUnicode, fromUnicode, codeByteLength: codeByteLength || 1 };
}

// Encodes `text` with the given reverse map. Returns null when any character is
// missing, which is the signal that the original font cannot render the edit.
export function encodeWithCMap(text, fromUnicode, codeByteLength) {
  const codes = [];
  for (const char of String(text)) {
    const code = fromUnicode.get(char);
    if (code === undefined) return null;
    codes.push(code);
  }
  const out = new Uint8Array(codes.length * codeByteLength);
  codes.forEach((code, index) => {
    for (let byte = 0; byte < codeByteLength; byte += 1) {
      out[index * codeByteLength + byte] = (code >> (8 * (codeByteLength - 1 - byte))) & 0xff;
    }
  });
  return out;
}
