import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from "pdf-lib";
import { parseMarkdown } from "./markdownEngine.js";

// PDFin workspace — Markdown to PDF layout on top of pdf-lib. Text stays selectable
// and links stay clickable; everything runs locally in the browser.

export const MD_PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792], f4: [609.45, 935.43] };
export const MD_MARGINS = { narrow: 40, normal: 56, wide: 82 };

const COLORS = {
  body: rgb(0.16, 0.15, 0.24),
  heading: rgb(0.1, 0.08, 0.18),
  muted: rgb(0.45, 0.44, 0.55),
  link: rgb(0.33, 0.09, 0.71),
  codeBg: rgb(0.955, 0.95, 0.97),
  codeText: rgb(0.24, 0.2, 0.36),
  rule: rgb(0.85, 0.84, 0.89),
  quoteBar: rgb(0.72, 0.62, 0.9),
  tableLine: rgb(0.85, 0.84, 0.89),
  tableHeadBg: rgb(0.965, 0.96, 0.98),
};

const HEADING_SCALE = { 1: 1.9, 2: 1.5, 3: 1.25, 4: 1.1, 5: 1.0, 6: 0.9 };

// WinAnsi-safe text: standard PDF fonts cannot encode arbitrary Unicode. Strip
// combining marks where possible and substitute the rest so encoding never throws.
const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
const UNSAFE_CHAR_RE = new RegExp(`[^\\n\\u0020-\\u007E\\u00A0-\\u00FF${WIN_ANSI_EXTRA}]`, "g");
const REPLACEMENTS = { "→": "->", "←": "<-", "−": "-", " ": " ", "✓": "v", "✔": "v" };

export function toWinAnsi(text) {
  return String(text ?? "").replace(/\t/g, "  ").replace(UNSAFE_CHAR_RE, (ch) => {
    if (REPLACEMENTS[ch]) return REPLACEMENTS[ch];
    const stripped = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    if (stripped && !stripped.match(UNSAFE_CHAR_RE)) return stripped;
    return "?";
  });
}

export async function markdownToPdf(markdown, opts = {}, onProgress) {
  const blocks = parseMarkdown(markdown);
  const [pageW, pageH] = MD_PAGE_SIZES[opts.pageSize] || MD_PAGE_SIZES.a4;
  const margin = MD_MARGINS[opts.margin] || MD_MARGINS.normal;
  const baseSize = Math.min(14, Math.max(9, Number(opts.fontSize) || 11));

  const doc = await PDFDocument.create();
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await doc.embedFont(StandardFonts.Courier),
    monoBold: await doc.embedFont(StandardFonts.CourierBold),
  };

  const writer = createWriter(doc, { pageW, pageH, margin, footer: opts.pageNumbers ? 18 : 0 });
  const total = Math.max(1, blocks.length);
  for (let i = 0; i < blocks.length; i += 1) {
    drawBlock(writer, fonts, blocks[i], { x: margin, width: pageW - margin * 2, baseSize, quote: false });
    if (i < blocks.length - 1) writer.space(blockSpacing(blocks[i], blocks[i + 1], baseSize));
    if (onProgress) onProgress(Math.min(92, ((i + 1) / total) * 92));
  }
  if (!blocks.length) writer.ensure(baseSize); // empty document still gets one page

  if (opts.pageNumbers) {
    const pages = doc.getPages();
    pages.forEach((page, index) => {
      const label = `${index + 1} / ${pages.length}`;
      const size = Math.max(8, baseSize - 2);
      const width = fonts.regular.widthOfTextAtSize(label, size);
      page.drawText(label, { x: (pageW - width) / 2, y: margin / 2, size, font: fonts.regular, color: COLORS.muted });
    });
  }

  const title = firstHeadingText(blocks) || String(opts.title || "").trim();
  if (title) doc.setTitle(title.slice(0, 200));
  doc.setCreator("PDFin Browser Tools");
  doc.setProducer("PDFin Browser Tools");
  doc.setModificationDate(new Date());

  const bytes = await doc.save();
  if (onProgress) onProgress(100);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const name = opts.outputName || "markdown.pdf";
  return { outputs: [{ name, blob, size: blob.size, pages: doc.getPageCount() }] };
}

function firstHeadingText(blocks) {
  const heading = blocks.find((block) => block.type === "heading");
  return heading ? heading.spans.map((span) => span.text).join("") : "";
}

function blockSpacing(current, next, baseSize) {
  if (next.type === "heading") return baseSize * 1.15;
  if (current.type === "heading") return baseSize * 0.45;
  return baseSize * 0.75;
}

function createWriter(doc, { pageW, pageH, margin, footer }) {
  let page = null;
  let y = 0;
  const bottom = margin + footer;
  const writer = {
    get page() { return page; },
    get y() { return y; },
    addPage() {
      page = doc.addPage([pageW, pageH]);
      y = pageH - margin;
    },
    ensure(height) {
      if (!page || y - height < bottom) writer.addPage();
    },
    consume(height) { y -= height; },
    space(height) {
      if (page && y - height > bottom) y -= height;
    },
  };
  return writer;
}

function fontFor(fonts, span) {
  if (span.code) return span.bold ? fonts.monoBold : fonts.mono;
  if (span.bold && span.italic) return fonts.boldItalic;
  if (span.bold) return fonts.bold;
  if (span.italic) return fonts.italic;
  return fonts.regular;
}

// Split styled spans into word tokens and greedily wrap them into lines.
function wrapSpans(fonts, spans, size, maxWidth) {
  const tokens = [];
  for (const span of spans) {
    const font = fontFor(fonts, span);
    const parts = toWinAnsi(span.text).split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      tokens.push({
        text: part,
        space: /^\s+$/.test(part),
        width: font.widthOfTextAtSize(part, size),
        font,
        size,
        span,
      });
    }
  }

  const lines = [];
  let line = [];
  let lineWidth = 0;
  const push = () => {
    while (line.length && line[line.length - 1].space) line.pop();
    if (line.length) lines.push(line);
    line = [];
    lineWidth = 0;
  };
  for (const token of tokens) {
    if (token.space && !line.length) continue;
    if (lineWidth + token.width > maxWidth && line.length && !token.space) {
      push();
      if (token.width > maxWidth) {
        // A single over-long word: hard-break by characters.
        let chunk = "";
        for (const ch of token.text) {
          const width = token.font.widthOfTextAtSize(chunk + ch, token.size);
          if (width > maxWidth && chunk) {
            lines.push([{ ...token, text: chunk, width: token.font.widthOfTextAtSize(chunk, token.size) }]);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        if (chunk) {
          line = [{ ...token, text: chunk, width: token.font.widthOfTextAtSize(chunk, token.size) }];
          lineWidth = line[0].width;
        }
        continue;
      }
    }
    line.push(token);
    lineWidth += token.width;
  }
  push();
  return lines;
}

function drawTextLine(writer, line, x, size, { color, quoteX }) {
  const lineHeight = size * 1.5;
  writer.ensure(lineHeight);
  writer.consume(lineHeight);
  const baseline = writer.y + size * 0.35;
  if (quoteX != null) {
    writer.page.drawRectangle({ x: quoteX, y: writer.y, width: 3, height: lineHeight, color: COLORS.quoteBar });
  }
  let cursor = x;
  for (const token of line) {
    const span = token.span;
    if (span.code && !token.space) {
      writer.page.drawRectangle({
        x: cursor - 1, y: baseline - size * 0.28, width: token.width + 2, height: size * 1.25, color: COLORS.codeBg,
      });
    }
    const tokenColor = span.href ? COLORS.link : span.code ? COLORS.codeText : span.imageAlt ? COLORS.muted : color;
    writer.page.drawText(token.text, { x: cursor, y: baseline, size: token.size, font: token.font, color: tokenColor });
    if (span.href) {
      writer.page.drawLine({
        start: { x: cursor, y: baseline - 1.6 }, end: { x: cursor + token.width, y: baseline - 1.6 },
        thickness: 0.7, color: COLORS.link,
      });
      addLinkAnnotation(writer.page, span.href, cursor, baseline - 2, token.width, size * 1.2);
    }
    if (span.strike) {
      writer.page.drawLine({
        start: { x: cursor, y: baseline + size * 0.3 }, end: { x: cursor + token.width, y: baseline + size * 0.3 },
        thickness: 0.7, color: COLORS.muted,
      });
    }
    cursor += token.width;
  }
}

function addLinkAnnotation(page, href, x, y, width, height) {
  if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) return;
  try {
    const context = page.doc.context;
    const annotation = context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(href) },
    });
    const ref = context.register(annotation);
    const key = PDFName.of("Annots");
    const annots = page.node.lookup(key);
    if (annots) annots.push(ref);
    else page.node.set(key, context.obj([ref]));
  } catch {
    // The link text still renders; only the clickable region is skipped.
  }
}

function drawSpansBlock(writer, fonts, spans, ctx, size, color) {
  const lines = wrapSpans(fonts, spans, size, ctx.width);
  for (const line of lines) {
    drawTextLine(writer, line, ctx.x, size, { color, quoteX: ctx.quote ? ctx.quoteBarX : null });
  }
  if (!lines.length) {
    writer.ensure(size * 1.5);
    writer.consume(size * 1.5);
  }
}

function drawBlock(writer, fonts, block, ctx) {
  const { baseSize } = ctx;
  if (block.type === "heading") {
    const size = baseSize * HEADING_SCALE[block.level];
    const spans = block.spans.map((span) => ({ ...span, bold: true }));
    drawSpansBlock(writer, fonts, spans, ctx, size, block.level >= 6 ? COLORS.muted : COLORS.heading);
    if (block.level <= 2) {
      writer.space(4);
      writer.page.drawLine({
        start: { x: ctx.x, y: writer.y }, end: { x: ctx.x + ctx.width, y: writer.y },
        thickness: 0.8, color: COLORS.rule,
      });
      writer.space(2);
    }
    return;
  }

  if (block.type === "paragraph") {
    drawSpansBlock(writer, fonts, block.spans, ctx, baseSize, ctx.quote ? COLORS.muted : COLORS.body);
    return;
  }

  if (block.type === "hr") {
    writer.ensure(10);
    writer.consume(10);
    writer.page.drawLine({
      start: { x: ctx.x, y: writer.y + 5 }, end: { x: ctx.x + ctx.width, y: writer.y + 5 },
      thickness: 1, color: COLORS.rule,
    });
    return;
  }

  if (block.type === "quote") {
    const inner = { ...ctx, x: ctx.x + 14, width: ctx.width - 14, quote: true, quoteBarX: ctx.x };
    block.blocks.forEach((child, index) => {
      drawBlock(writer, fonts, child, inner);
      if (index < block.blocks.length - 1) writer.space(baseSize * 0.5);
    });
    return;
  }

  if (block.type === "code") {
    drawCodeBlock(writer, fonts, block, ctx);
    return;
  }

  if (block.type === "list") {
    drawList(writer, fonts, block, ctx, 0);
    return;
  }

  if (block.type === "table") {
    drawTable(writer, fonts, block, ctx);
  }
}

function drawCodeBlock(writer, fonts, block, ctx) {
  const size = Math.max(8, ctx.baseSize - 1.5);
  const lineHeight = size * 1.45;
  const padding = 8;
  const rawLines = toWinAnsi(block.text).split("\n");
  // Wrap long code lines by characters so nothing is clipped.
  const lines = [];
  const maxWidth = ctx.width - padding * 2;
  for (const raw of rawLines) {
    if (!raw) { lines.push(""); continue; }
    let chunk = "";
    for (const ch of raw) {
      if (fonts.mono.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else chunk += ch;
    }
    lines.push(chunk);
  }

  // Each line paints its own background strip so page breaks stay seamless.
  lines.forEach((line, index) => {
    const extraTop = index === 0 ? padding : 0;
    const extraBottom = index === lines.length - 1 ? padding : 0;
    const height = lineHeight + extraTop + extraBottom;
    writer.ensure(height);
    writer.consume(height);
    writer.page.drawRectangle({ x: ctx.x, y: writer.y, width: ctx.width, height, color: COLORS.codeBg });
    if (line) {
      writer.page.drawText(line, {
        x: ctx.x + padding,
        y: writer.y + extraBottom + size * 0.4,
        size,
        font: fonts.mono,
        color: COLORS.codeText,
      });
    }
  });
}

function drawList(writer, fonts, block, ctx, depth) {
  const { baseSize } = ctx;
  const indent = 18;
  const markerGap = 6;
  let number = block.ordered ? block.start : 0;
  for (const item of block.items) {
    const marker = item.checked != null
      ? (item.checked ? "[x]" : "[ ]")
      : block.ordered
        ? `${number}.`
        : depth === 0 ? "•" : depth === 1 ? "–" : "·";
    if (block.ordered) number += 1;
    const markerFont = item.checked != null ? fonts.mono : fonts.regular;
    const markerWidth = markerFont.widthOfTextAtSize(marker, baseSize);
    const contentX = ctx.x + indent;
    const contentCtx = { ...ctx, x: contentX, width: ctx.width - indent };

    if (item.spans.length) {
      const lines = wrapSpans(fonts, item.spans, baseSize, contentCtx.width);
      lines.forEach((line, lineIndex) => {
        drawTextLine(writer, line, contentX, baseSize, { color: COLORS.body, quoteX: ctx.quote ? ctx.quoteBarX : null });
        if (lineIndex === 0) {
          writer.page.drawText(marker, {
            x: contentX - markerGap - markerWidth,
            y: writer.y + baseSize * 0.35,
            size: baseSize,
            font: markerFont,
            color: item.checked != null ? COLORS.link : COLORS.muted,
          });
        }
      });
    }
    for (const child of item.children) {
      drawList(writer, fonts, child, contentCtx, depth + 1);
    }
  }
}

function drawTable(writer, fonts, block, ctx) {
  const size = Math.max(8, ctx.baseSize - 1);
  const padX = 6;
  const padY = 5;
  const lineHeight = size * 1.4;
  const columnCount = Math.max(block.header.length, ...block.rows.map((row) => row.length), 1);

  // Natural width per column from unwrapped content, then scale to fit.
  const natural = new Array(columnCount).fill(30);
  const measureRow = (row, bold) => row.forEach((cell, index) => {
    const width = cell.reduce((total, span) => {
      const font = fontFor(fonts, { ...span, bold: bold || span.bold });
      return total + font.widthOfTextAtSize(toWinAnsi(span.text), size);
    }, 0) + padX * 2 + 2;
    natural[index] = Math.max(natural[index], Math.min(width, ctx.width));
  });
  measureRow(block.header, true);
  block.rows.forEach((row) => measureRow(row, false));
  const naturalTotal = natural.reduce((a, b) => a + b, 0);
  const scale = naturalTotal > ctx.width ? ctx.width / naturalTotal : 1;
  const widths = natural.map((width) => width * scale);
  const tableWidth = widths.reduce((a, b) => a + b, 0);

  const drawRow = (cells, isHeader) => {
    const wrapped = widths.map((width, index) => {
      const spans = (cells[index] || []).map((span) => (isHeader ? { ...span, bold: true } : span));
      return wrapSpans(fonts, spans, size, width - padX * 2);
    });
    const rowLines = Math.max(1, ...wrapped.map((lines) => lines.length));
    const rowHeight = rowLines * lineHeight + padY * 2;
    writer.ensure(rowHeight);
    writer.consume(rowHeight);
    const top = writer.y + rowHeight;
    if (isHeader) {
      writer.page.drawRectangle({ x: ctx.x, y: writer.y, width: tableWidth, height: rowHeight, color: COLORS.tableHeadBg });
    }
    let cellX = ctx.x;
    wrapped.forEach((lines, index) => {
      const align = block.aligns[index] || "left";
      lines.forEach((line, lineIndex) => {
        const lineWidth = line.reduce((total, token) => total + token.width, 0);
        const offset = align === "right"
          ? widths[index] - padX - lineWidth
          : align === "center"
            ? (widths[index] - lineWidth) / 2
            : padX;
        const baseline = top - padY - (lineIndex + 1) * lineHeight + size * 0.4;
        let cursor = cellX + Math.max(padX, offset);
        for (const token of line) {
          const color = token.span.href ? COLORS.link : isHeader ? COLORS.heading : COLORS.body;
          writer.page.drawText(token.text, { x: cursor, y: baseline, size, font: token.font, color });
          cursor += token.width;
        }
      });
      cellX += widths[index];
    });
    // Grid lines: each row paints its own borders so page breaks stay consistent.
    writer.page.drawLine({ start: { x: ctx.x, y: top }, end: { x: ctx.x + tableWidth, y: top }, thickness: 0.6, color: COLORS.tableLine });
    writer.page.drawLine({ start: { x: ctx.x, y: writer.y }, end: { x: ctx.x + tableWidth, y: writer.y }, thickness: 0.6, color: COLORS.tableLine });
    let gridX = ctx.x;
    for (let index = 0; index <= widths.length; index += 1) {
      writer.page.drawLine({ start: { x: gridX, y: writer.y }, end: { x: gridX, y: top }, thickness: 0.6, color: COLORS.tableLine });
      gridX += widths[index] || 0;
    }
  };

  drawRow(block.header, true);
  block.rows.forEach((row) => drawRow(row, false));
}
