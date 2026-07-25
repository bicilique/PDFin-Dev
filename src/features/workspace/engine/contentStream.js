// PDFin workspace — PDF content-stream tokenizer and serializer.
//
// Parses a content stream into a flat list of operations, keeping each
// operation's original byte range so untouched operations can be re-emitted
// verbatim. Only the operations we rewrite are regenerated, which keeps
// serialization lossless for everything else (inline images, odd number
// formats, unusual name escapes).

const TAB = 9;
const LF = 10;
const FF = 12;
const CR = 13;
const SPACE = 32;
const NUL = 0;

function isWhitespace(byte) {
  return byte === NUL || byte === TAB || byte === LF || byte === FF || byte === CR || byte === SPACE;
}

function isDelimiter(byte) {
  return byte === 0x28 || byte === 0x29 || byte === 0x3c || byte === 0x3e
    || byte === 0x5b || byte === 0x5d || byte === 0x7b || byte === 0x7d
    || byte === 0x2f || byte === 0x25;
}

function isRegular(byte) {
  return !isWhitespace(byte) && !isDelimiter(byte);
}

function hexValue(byte) {
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30;
  if (byte >= 0x41 && byte <= 0x46) return byte - 0x41 + 10;
  if (byte >= 0x61 && byte <= 0x66) return byte - 0x61 + 10;
  return -1;
}

class Lexer {
  constructor(bytes) {
    this.bytes = bytes;
    this.pos = 0;
  }

  skipTrivia() {
    while (this.pos < this.bytes.length) {
      const byte = this.bytes[this.pos];
      if (isWhitespace(byte)) {
        this.pos += 1;
        continue;
      }
      if (byte === 0x25) { // "%" comment runs to end of line
        while (this.pos < this.bytes.length && this.bytes[this.pos] !== LF && this.bytes[this.pos] !== CR) this.pos += 1;
        continue;
      }
      return;
    }
  }

  readName() {
    this.pos += 1; // "/"
    const out = [];
    while (this.pos < this.bytes.length && isRegular(this.bytes[this.pos])) {
      let byte = this.bytes[this.pos];
      if (byte === 0x23 && this.pos + 2 < this.bytes.length) {
        const high = hexValue(this.bytes[this.pos + 1]);
        const low = hexValue(this.bytes[this.pos + 2]);
        if (high >= 0 && low >= 0) {
          byte = high * 16 + low;
          this.pos += 2;
        }
      }
      out.push(byte);
      this.pos += 1;
    }
    return { type: "name", value: String.fromCharCode(...out) };
  }

  readLiteralString() {
    this.pos += 1; // "("
    const out = [];
    let depth = 1;
    while (this.pos < this.bytes.length) {
      const byte = this.bytes[this.pos];
      if (byte === 0x5c) { // backslash
        this.pos += 1;
        const escaped = this.bytes[this.pos];
        if (escaped === undefined) break;
        if (escaped >= 0x30 && escaped <= 0x37) { // octal, up to 3 digits
          let code = 0;
          let digits = 0;
          while (digits < 3 && this.bytes[this.pos] >= 0x30 && this.bytes[this.pos] <= 0x37) {
            code = code * 8 + (this.bytes[this.pos] - 0x30);
            this.pos += 1;
            digits += 1;
          }
          out.push(code & 0xff);
          continue;
        }
        const simple = { 0x6e: LF, 0x72: CR, 0x74: TAB, 0x62: 8, 0x66: FF };
        if (simple[escaped] !== undefined) out.push(simple[escaped]);
        else if (escaped === LF) { /* line continuation */ }
        else if (escaped === CR) { if (this.bytes[this.pos + 1] === LF) this.pos += 1; }
        else out.push(escaped);
        this.pos += 1;
        continue;
      }
      if (byte === 0x28) depth += 1;
      if (byte === 0x29) {
        depth -= 1;
        if (depth === 0) { this.pos += 1; break; }
      }
      out.push(byte);
      this.pos += 1;
    }
    return { type: "string", bytes: Uint8Array.from(out) };
  }

  readHexString() {
    this.pos += 1; // "<"
    const out = [];
    let high = -1;
    while (this.pos < this.bytes.length) {
      const byte = this.bytes[this.pos];
      this.pos += 1;
      if (byte === 0x3e) break;
      const value = hexValue(byte);
      if (value < 0) continue;
      if (high < 0) high = value;
      else { out.push(high * 16 + value); high = -1; }
    }
    if (high >= 0) out.push(high * 16); // odd digit count: pad with 0
    return { type: "string", bytes: Uint8Array.from(out) };
  }

  // Returns an operand token, or { type: "keyword", value } for operators and
  // the delimiters that end a composite value.
  next() {
    this.skipTrivia();
    if (this.pos >= this.bytes.length) return null;
    const byte = this.bytes[this.pos];

    if (byte === 0x2f) return this.readName();
    if (byte === 0x28) return this.readLiteralString();
    if (byte === 0x3c) {
      if (this.bytes[this.pos + 1] === 0x3c) { this.pos += 2; return { type: "dictOpen" }; }
      return this.readHexString();
    }
    if (byte === 0x3e && this.bytes[this.pos + 1] === 0x3e) { this.pos += 2; return { type: "dictClose" }; }
    if (byte === 0x5b) { this.pos += 1; return { type: "arrayOpen" }; }
    if (byte === 0x5d) { this.pos += 1; return { type: "arrayClose" }; }
    if (byte === 0x7b || byte === 0x7d) { this.pos += 1; return { type: "keyword", value: String.fromCharCode(byte) }; }

    if ((byte >= 0x30 && byte <= 0x39) || byte === 0x2b || byte === 0x2d || byte === 0x2e) {
      const start = this.pos;
      this.pos += 1;
      while (this.pos < this.bytes.length && isRegular(this.bytes[this.pos])) this.pos += 1;
      const raw = String.fromCharCode(...this.bytes.subarray(start, this.pos));
      const value = parseFloat(raw);
      return { type: "number", value: Number.isFinite(value) ? value : 0 };
    }

    const start = this.pos;
    while (this.pos < this.bytes.length && isRegular(this.bytes[this.pos])) this.pos += 1;
    if (this.pos === start) this.pos += 1; // unknown delimiter: never stall
    return { type: "keyword", value: String.fromCharCode(...this.bytes.subarray(start, this.pos)) };
  }
}

function findInlineImageEnd(bytes, from) {
  // Scan for "EI" delimited by whitespace; the binary payload may contain the
  // bytes "EI" itself, so require whitespace on both sides.
  for (let i = from; i < bytes.length - 1; i += 1) {
    if (bytes[i] !== 0x45 || bytes[i + 1] !== 0x49) continue;
    const before = bytes[i - 1];
    const after = bytes[i + 2];
    if (isWhitespace(before) && (after === undefined || isWhitespace(after) || isDelimiter(after))) return i + 2;
  }
  return bytes.length;
}

// Parses `bytes` into [{ operator, operands, start, end }]. `start`/`end` cover
// the operands and the operator so a whole operation can be replaced or copied.
export function tokenizeContentStream(bytes) {
  const lexer = new Lexer(bytes);
  const operations = [];
  let operands = [];
  let start = -1;

  const readComposite = (closeType, build) => {
    const items = [];
    for (;;) {
      const token = lexer.next();
      if (!token || token.type === closeType) return build(items);
      if (token.type === "arrayOpen") { items.push(readComposite("arrayClose", (inner) => ({ type: "array", items: inner }))); continue; }
      if (token.type === "dictOpen") { items.push(readComposite("dictClose", (inner) => ({ type: "dict", items: inner }))); continue; }
      if (token.type === "keyword") { items.push({ type: "keyword", value: token.value }); continue; }
      items.push(token);
    }
  };

  for (;;) {
    lexer.skipTrivia();
    const tokenStart = lexer.pos;
    const token = lexer.next();
    if (!token) break;
    if (start < 0) start = tokenStart;

    if (token.type === "arrayOpen") { operands.push(readComposite("arrayClose", (items) => ({ type: "array", items }))); continue; }
    if (token.type === "dictOpen") { operands.push(readComposite("dictClose", (items) => ({ type: "dict", items }))); continue; }
    if (token.type !== "keyword") { operands.push(token); continue; }

    if (token.value === "true" || token.value === "false") { operands.push({ type: "boolean", value: token.value === "true" }); continue; }
    if (token.value === "null") { operands.push({ type: "null" }); continue; }

    if (token.value === "BI") {
      // Inline image: keep the whole BI…EI run as one opaque operation.
      let scan = lexer.pos;
      for (;;) {
        const inner = lexer.next();
        if (!inner) break;
        if (inner.type === "keyword" && inner.value === "ID") { scan = lexer.pos + 1; break; }
        scan = lexer.pos;
      }
      const end = findInlineImageEnd(bytes, scan);
      lexer.pos = end;
      operations.push({ operator: "INLINE_IMAGE", operands: [], start, end });
      operands = [];
      start = -1;
      continue;
    }

    operations.push({ operator: token.value, operands, start, end: lexer.pos });
    operands = [];
    start = -1;
  }

  return operations;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6)));
}

function hexString(bytes) {
  let out = "<";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return `${out}>`;
}

// Operands are re-emitted in a normalized form: strings always become hex
// strings, which sidesteps every literal-string escaping edge case.
export function formatOperand(operand) {
  if (!operand) return "";
  if (operand.type === "number") return formatNumber(operand.value);
  if (operand.type === "name") return `/${operand.value.replace(/[^\w.\-+]/g, (char) => `#${char.charCodeAt(0).toString(16).padStart(2, "0")}`)}`;
  if (operand.type === "string") return hexString(operand.bytes);
  if (operand.type === "boolean") return operand.value ? "true" : "false";
  if (operand.type === "null") return "null";
  if (operand.type === "array") return `[${operand.items.map(formatOperand).join(" ")}]`;
  if (operand.type === "dict") return `<<${operand.items.map(formatOperand).join(" ")}>>`;
  if (operand.type === "keyword") return operand.value;
  return "";
}

export function formatOperation(operator, operands = []) {
  const parts = operands.map(formatOperand).filter((part) => part !== "");
  parts.push(operator);
  return parts.join(" ");
}

// Rebuilds a content stream. `replacements` maps an operation index to the
// replacement source text; `null` drops the operation entirely.
export function serializeContentStream(bytes, operations, replacements = new Map()) {
  const encoder = new TextEncoder();
  const chunks = [];
  let cursor = 0;
  for (let index = 0; index < operations.length; index += 1) {
    if (!replacements.has(index)) continue;
    const operation = operations[index];
    if (operation.start > cursor) chunks.push(bytes.subarray(cursor, operation.start));
    const replacement = replacements.get(index);
    if (replacement !== null) chunks.push(encoder.encode(`\n${replacement}\n`));
    cursor = operation.end;
  }
  if (cursor < bytes.length) chunks.push(bytes.subarray(cursor));

  let size = 0;
  for (const chunk of chunks) size += chunk.length;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
