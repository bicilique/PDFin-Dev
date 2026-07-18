// PDFin workspace — small local Markdown parser shared by the live preview and the
// PDF layout engine so both render the same structure. No network, no dependencies.
//
// Supported blocks: ATX headings, paragraphs, ordered/unordered lists (nested,
// task items), fenced code blocks, blockquotes, tables, horizontal rules.
// Supported inline marks: bold, italic, inline code, strikethrough, links.
// Images are intentionally rendered as their alt text: the preview must not
// fetch remote resources (documents stay on the device).

const HR_RE = /^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const HEADING_RE = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE_RE = /^ {0,3}(```+|~~~+)\s*([\w+-]*)\s*$/;
const LIST_ITEM_RE = /^(\s*)(?:([-*+])|(\d{1,9})[.)])\s+(.*)$/;
const QUOTE_RE = /^ {0,3}>\s?(.*)$/;
const TABLE_DIVIDER_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const TASK_RE = /^\[([ xX])\]\s+(.*)$/;

export function parseMarkdown(source) {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  return parseBlocks(lines);
}

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(FENCE_RE);
    if (fence) {
      const marker = fence[1][0];
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].match(FENCE_RE)?.[1]?.startsWith(marker)) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence (or end of input)
      blocks.push({ type: "code", lang: fence[2] || "", text: body.join("\n") });
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, spans: parseInline(heading[2]) });
      i += 1;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const inner = [];
      while (i < lines.length && (QUOTE_RE.test(lines[i]) || (lines[i].trim() && inner.length && !isBlockStart(lines[i])))) {
        inner.push(lines[i].match(QUOTE_RE)?.[1] ?? lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "quote", blocks: parseBlocks(inner) });
      continue;
    }

    if (LIST_ITEM_RE.test(line)) {
      const parsed = parseList(lines, i);
      blocks.push(parsed.block);
      i = parsed.next;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && TABLE_DIVIDER_RE.test(lines[i + 1]) && lines[i + 1].includes("|")) {
      const header = splitTableRow(line);
      const aligns = splitTableRow(lines[i + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]).map((cell) => parseInline(cell)));
        i += 1;
      }
      blocks.push({
        type: "table",
        aligns,
        header: header.map((cell) => parseInline(cell)),
        rows,
      });
      continue;
    }

    // Paragraph: join soft-wrapped lines until a blank line or another block starts.
    const para = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", spans: parseInline(para.join(" ")) });
  }
  return blocks;
}

function isBlockStart(line) {
  return HEADING_RE.test(line) || FENCE_RE.test(line) || HR_RE.test(line)
    || QUOTE_RE.test(line) || LIST_ITEM_RE.test(line);
}

function splitTableRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  const cells = [];
  let current = "";
  for (let c = 0; c < row.length; c += 1) {
    if (row[c] === "\\" && row[c + 1] === "|") { current += "|"; c += 1; continue; }
    if (row[c] === "|") { cells.push(current.trim()); current = ""; continue; }
    current += row[c];
  }
  cells.push(current.trim());
  return cells;
}

function parseList(lines, start) {
  const first = lines[start].match(LIST_ITEM_RE);
  const baseIndent = first[1].length;
  const ordered = !first[2];
  const startNumber = ordered ? Number(first[3]) : 1;
  const items = [];
  let i = start;

  while (i < lines.length) {
    const match = lines[i].match(LIST_ITEM_RE);
    if (!match) break;
    const indent = match[1].length;
    if (indent < baseIndent) break;
    if (indent > baseIndent + 1) {
      // Nested list: attach to the previous item.
      const nested = parseList(lines, i);
      if (items.length) items[items.length - 1].children.push(nested.block);
      else items.push({ spans: [], checked: null, children: [nested.block] });
      i = nested.next;
      continue;
    }
    if ((!match[2]) !== ordered && items.length) break; // marker kind changed — new list
    let text = match[4];
    let checked = null;
    const task = text.match(TASK_RE);
    if (task && !ordered) {
      checked = task[1] !== " ";
      text = task[2];
    }
    items.push({ spans: parseInline(text), checked, children: [] });
    i += 1;
    // Continuation lines indented under the item join its text.
    while (i < lines.length && lines[i].trim() && !LIST_ITEM_RE.test(lines[i]) && !isBlockStart(lines[i]) && /^\s{2,}/.test(lines[i])) {
      const extra = parseInline(lines[i].trim());
      const target = items[items.length - 1];
      if (target.spans.length) target.spans.push({ text: " " });
      target.spans.push(...extra);
      i += 1;
    }
  }

  return { block: { type: "list", ordered, start: startNumber, items }, next: i };
}

// ---- Inline parsing ----

const INLINE_PATTERNS = [
  { kind: "code", re: /`([^`\n]+)`/ },
  { kind: "image", re: /!\[([^\]\n]*)\]\(([^)\n]*)\)/ },
  { kind: "link", re: /\[([^\]\n]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/ },
  { kind: "bold", re: /\*\*\*([^*\n]+)\*\*\*/, italic: true },
  { kind: "bold", re: /\*\*([^*\n]+)\*\*/ },
  { kind: "italic", re: /\*([^*\n]+)\*/ },
  { kind: "bold", re: /___([^_\n]+)___/, italic: true, wordBound: true },
  { kind: "bold", re: /__([^_\n]+)__/, wordBound: true },
  { kind: "italic", re: /_([^_\n]+)_/, wordBound: true },
  { kind: "strike", re: /~~([^~\n]+)~~/ },
];

export function parseInline(text, style = {}) {
  const spans = [];
  let rest = String(text ?? "");
  while (rest.length) {
    let best = null;
    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.re.exec(rest);
      if (!match) continue;
      if (pattern.wordBound) {
        const before = rest[match.index - 1];
        if (before && /[\w$]/.test(before)) continue; // snake_case is not emphasis
      }
      if (!best || match.index < best.match.index) best = { pattern, match };
    }
    if (!best) {
      pushText(spans, rest, style);
      break;
    }
    const { pattern, match } = best;
    if (match.index > 0) pushText(spans, rest.slice(0, match.index), style);
    if (pattern.kind === "code") {
      spans.push({ ...style, text: match[1], code: true });
    } else if (pattern.kind === "image") {
      // Never fetch the image: keep the document local. Alt text stands in.
      spans.push({ ...style, text: match[1] || match[2] || "", italic: true, imageAlt: true });
    } else if (pattern.kind === "link") {
      spans.push(...parseInline(match[1], { ...style, href: match[2] }));
    } else if (pattern.kind === "bold") {
      spans.push(...parseInline(match[1], { ...style, bold: true, ...(pattern.italic ? { italic: true } : {}) }));
    } else if (pattern.kind === "italic") {
      spans.push(...parseInline(match[1], { ...style, italic: true }));
    } else if (pattern.kind === "strike") {
      spans.push(...parseInline(match[1], { ...style, strike: true }));
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return spans;
}

function pushText(spans, text, style) {
  if (!text) return;
  spans.push({ ...style, text });
}

export function markdownStats(source) {
  const text = String(source || "");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { characters: text.length, words };
}

export const MARKDOWN_SAMPLE = `# Laporan Rapat Tim

Dokumen ini adalah **contoh Markdown** yang menunjukkan hasil konversi ke PDF.
Semua pemrosesan terjadi *di perangkat Anda*.

## Agenda

1. Pembukaan dan tujuan rapat
2. Pembahasan progres proyek
3. Rencana tindak lanjut

## Catatan penting

- Target rilis tetap pada kuartal berikutnya
- Perlu review dokumen [spesifikasi produk](https://example.com/spec)
- [x] Notulen rapat sebelumnya sudah disetujui
- [ ] Jadwalkan sesi lanjutan

> Keputusan: fitur ekspor akan diprioritaskan setelah perbaikan bug utama.

## Pembagian tugas

| Nama | Tugas | Tenggat |
| --- | --- | --- |
| Sari | Menyusun draf proposal | Senin |
| Bud | Review teknis \`modul ekspor\` | Rabu |
| Rina | Uji coba pengguna | Jumat |

### Contoh kode

\`\`\`js
function halo(nama) {
  return "Halo, " + nama + "!";
}
\`\`\`

---

Dokumen dibuat dengan alat Markdown ke PDF.
`;
