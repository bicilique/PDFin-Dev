import React from "react";
import { Alert, Button, Icons, Select, Switch } from "../../../components/index.js";
import { Field, OutputNameField, Segmented, SliderRow, TX, TOOL_DEFS, getOutputNameError, getPdfOutputName } from "./tools-1.jsx";
import { MARKDOWN_SAMPLE, markdownStats, parseMarkdown } from "../engine/markdownEngine.js";
import { markdownToPdf } from "../engine/markdownPdf.js";

// PDFin workspace — tool defs part 4: Markdown to PDF (standalone editor + live preview).

const MAX_MARKDOWN_FILE_BYTES = 2 * 1024 * 1024;
const MARKDOWN_FILE_RE = /\.(md|markdown|mdown|txt)$/i;

function isMarkdownFile(file) {
  return MARKDOWN_FILE_RE.test(file?.name || "") || /^text\/(markdown|plain)$/.test(file?.type || "");
}

async function loadMarkdownFile(file, { setOpts, toast, lang }) {
  if (!isMarkdownFile(file)) {
    toast(TX(lang, "File harus berupa Markdown (.md) atau teks (.txt).", "The file must be Markdown (.md) or text (.txt)."), "error");
    return;
  }
  if (file.size > MAX_MARKDOWN_FILE_BYTES) {
    toast(TX(lang, "File Markdown maksimal 2 MB.", "Markdown files can be up to 2 MB."), "error");
    return;
  }
  try {
    const text = await file.text();
    setOpts((opts) => ({ ...opts, markdown: text }));
    toast(TX(lang, `${file.name} dimuat ke editor.`, `${file.name} loaded into the editor.`), "neutral");
  } catch {
    toast(TX(lang, "File tidak dapat dibaca.", "The file could not be read."), "error");
  }
}

// ---------- Live preview ----------

const PREVIEW_HEADING_SIZE = { 1: 28, 2: 22, 3: 18, 4: 15.5, 5: 14, 6: 12.5 };

// The preview page mimics the generated PDF (dark ink on white paper), so it uses
// fixed ink colors that match markdownPdf COLORS instead of theme tokens — the
// paper stays readable in dark mode too.
const INK = {
  body: "#29263D",
  heading: "#1A1430",
  muted: "#736F8C",
  link: "#5518B4",
  codeBg: "#F4F2F7",
  codeBorder: "#E5E3EB",
  codeText: "#3D3355",
  rule: "#D9D7E3",
  quoteBar: "#B89EE6",
  tableHeadBg: "#F6F5FA",
};

function PreviewSpans({ spans }) {
  return spans.map((span, index) => {
    let node = span.text;
    if (span.code) {
      node = (
        <code key={index} style={{
          font: "0.88em var(--font-mono)", background: INK.codeBg,
          border: `1px solid ${INK.codeBorder}`, borderRadius: 4, padding: "1px 4px", color: INK.codeText,
        }}>{node}</code>
      );
      return node;
    }
    if (span.bold) node = <strong>{node}</strong>;
    if (span.italic) node = <em>{node}</em>;
    if (span.strike) node = <del>{node}</del>;
    if (span.imageAlt) node = <em style={{ color: INK.muted }}>[{node || "gambar"}]</em>;
    if (span.href) {
      node = (
        <a href={span.href} target="_blank" rel="noopener noreferrer" style={{ color: INK.link }}>
          {node}
        </a>
      );
    }
    return <React.Fragment key={index}>{node}</React.Fragment>;
  });
}

function PreviewList({ block, depth = 0 }) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag start={block.ordered ? block.start : undefined} style={{
      margin: "0 0 10px", paddingLeft: 24,
      listStyle: block.ordered ? "decimal" : depth === 0 ? "disc" : depth === 1 ? "circle" : "square",
    }}>
      {block.items.map((item, index) => (
        <li key={index} style={{ margin: "3px 0", listStyle: item.checked != null ? "none" : undefined, marginLeft: item.checked != null ? -18 : 0 }}>
          {item.checked != null && (
            <input type="checkbox" checked={item.checked} readOnly aria-hidden="true" tabIndex={-1} style={{ marginRight: 7, accentColor: "var(--action-primary)" }} />
          )}
          <PreviewSpans spans={item.spans} />
          {item.children.map((child, childIndex) => (
            <PreviewList key={childIndex} block={child} depth={depth + 1} />
          ))}
        </li>
      ))}
    </Tag>
  );
}

function PreviewBlock({ block }) {
  if (block.type === "heading") {
    const Tag = `h${block.level}`;
    return (
      <Tag style={{
        margin: "0 0 8px", font: `var(--weight-bold) ${PREVIEW_HEADING_SIZE[block.level]}px/1.3 var(--font-sans)`,
        letterSpacing: "-0.01em", color: block.level >= 6 ? INK.muted : INK.heading,
        borderBottom: block.level <= 2 ? `1px solid ${INK.rule}` : "none",
        paddingBottom: block.level <= 2 ? 6 : 0,
      }}>
        <PreviewSpans spans={block.spans} />
      </Tag>
    );
  }
  if (block.type === "paragraph") {
    return <p style={{ margin: "0 0 10px", lineHeight: 1.65 }}><PreviewSpans spans={block.spans} /></p>;
  }
  if (block.type === "hr") {
    return <hr style={{ border: "none", borderTop: `1px solid ${INK.rule}`, margin: "16px 0" }} />;
  }
  if (block.type === "quote") {
    return (
      <blockquote style={{
        margin: "0 0 10px", padding: "2px 0 2px 14px", borderLeft: `3px solid ${INK.quoteBar}`,
        color: INK.muted,
      }}>
        {block.blocks.map((child, index) => <PreviewBlock key={index} block={child} />)}
      </blockquote>
    );
  }
  if (block.type === "code") {
    return (
      <pre style={{
        margin: "0 0 10px", padding: "10px 12px", overflowX: "auto",
        background: INK.codeBg, border: `1px solid ${INK.codeBorder}`, color: INK.codeText,
        borderRadius: "var(--radius-md)", font: "0.86em/1.55 var(--font-mono)", whiteSpace: "pre",
      }}><code>{block.text}</code></pre>
    );
  }
  if (block.type === "list") {
    return <PreviewList block={block} />;
  }
  if (block.type === "table") {
    return (
      <div style={{ overflowX: "auto", margin: "0 0 10px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", font: "0.94em/1.5 var(--font-sans)" }}>
          <thead>
            <tr>
              {block.header.map((cell, index) => (
                <th key={index} style={{
                  border: `1px solid ${INK.rule}`, background: INK.tableHeadBg,
                  padding: "6px 10px", textAlign: block.aligns[index] || "left", color: INK.heading,
                }}>
                  <PreviewSpans spans={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {block.header.map((_, colIndex) => (
                  <td key={colIndex} style={{
                    border: `1px solid ${INK.rule}`, padding: "6px 10px",
                    textAlign: block.aligns[colIndex] || "left",
                  }}>
                    <PreviewSpans spans={row[colIndex] || []} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

function MarkdownPreviewPane({ markdown, lang, baseFontSize }) {
  const deferred = React.useDeferredValue(markdown);
  const blocks = React.useMemo(() => parseMarkdown(deferred), [deferred]);
  return (
    <div aria-label={TX(lang, "Pratinjau Markdown", "Markdown preview")} style={{
      flex: 1, minWidth: 0, minHeight: 0, overflow: "auto", background: "var(--surface-sunken)",
      border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "18px 14px",
    }}>
      <div style={{
        maxWidth: 680, margin: "0 auto", minHeight: "100%", background: "var(--color-pdf-page)",
        border: "1px solid var(--border-default)", boxShadow: "var(--shadow-card)",
        borderRadius: 2, padding: "clamp(18px, 5vw, 44px)",
        font: `${baseFontSize + 3}px/1.6 var(--font-sans)`, color: INK.body,
        overflowWrap: "break-word", colorScheme: "light",
      }}>
        {blocks.length
          ? blocks.map((block, index) => <PreviewBlock key={index} block={block} />)
          : (
            <p style={{ color: INK.muted, font: "var(--type-body-sm)", textAlign: "center", margin: "40px 0" }}>
              {TX(lang, "Pratinjau dokumen akan muncul di sini saat Anda menulis.", "The document preview appears here as you write.")}
            </p>
          )}
      </div>
    </div>
  );
}

// ---------- Editor ----------

function EditorToolButton({ label, onClick, children, disabled }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} style={{
      minWidth: 30, height: 30, padding: "0 7px", display: "inline-flex", alignItems: "center", justifyContent: "center",
      border: "1px solid var(--border-default)", borderRadius: 7, background: "var(--surface-card)",
      color: disabled ? "var(--text-faint)" : "var(--text-body)", cursor: disabled ? "default" : "pointer",
      font: "var(--weight-semibold) 12.5px/1 var(--font-sans)",
    }}>{children}</button>
  );
}

function MarkdownWorkspace({ t, lang, opts, setOpts, isCompact, onToast }) {
  const textareaRef = React.useRef(null);
  const fileRef = React.useRef(null);
  const markdown = opts.markdown || "";
  const stats = markdownStats(markdown);
  const mode = isCompact
    ? (opts.viewMode === "preview" ? "preview" : "write")
    : (opts.viewMode === "write" || opts.viewMode === "preview" ? opts.viewMode : "split");
  const setMode = (viewMode) => setOpts((next) => ({ ...next, viewMode }));
  const showEditor = mode !== "preview";
  const showPreview = mode !== "write";

  const updateMarkdown = (value, selectStart, selectEnd) => {
    setOpts((next) => ({ ...next, markdown: value }));
    if (selectStart != null) {
      requestAnimationFrame(() => {
        const area = textareaRef.current;
        if (!area) return;
        area.focus();
        area.setSelectionRange(selectStart, selectEnd ?? selectStart);
      });
    }
  };

  const wrapSelection = (before, after = before, placeholder = "") => {
    const area = textareaRef.current;
    if (!area) return;
    const { selectionStart, selectionEnd, value } = area;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    updateMarkdown(next, selectionStart + before.length, selectionStart + before.length + selected.length);
  };

  const prefixLines = (prefix, numbered = false) => {
    const area = textareaRef.current;
    if (!area) return;
    const { selectionStart, selectionEnd, value } = area;
    const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const endIndex = value.indexOf("\n", selectionEnd);
    const end = endIndex === -1 ? value.length : endIndex;
    const target = value.slice(start, end);
    const changed = target
      .split("\n")
      .map((line, index) => (numbered ? `${index + 1}. ${line}` : `${prefix}${line}`))
      .join("\n");
    updateMarkdown(value.slice(0, start) + changed + value.slice(end), start, start + changed.length);
  };

  const onKeyDown = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") { event.preventDefault(); wrapSelection("**", "**", TX(lang, "teks tebal", "bold text")); }
    if (key === "i") { event.preventDefault(); wrapSelection("*", "*", TX(lang, "teks miring", "italic text")); }
  };

  const toolButtons = [
    { label: TX(lang, "Tebal (Ctrl+B)", "Bold (Ctrl+B)"), text: "B", run: () => wrapSelection("**", "**", TX(lang, "teks tebal", "bold text")) },
    { label: TX(lang, "Miring (Ctrl+I)", "Italic (Ctrl+I)"), text: <em>I</em>, run: () => wrapSelection("*", "*", TX(lang, "teks miring", "italic text")) },
    { label: TX(lang, "Judul", "Heading"), text: "H", run: () => prefixLines("## ") },
    { label: TX(lang, "Daftar poin", "Bullet list"), text: "•", run: () => prefixLines("- ") },
    { label: TX(lang, "Daftar bernomor", "Numbered list"), text: "1.", run: () => prefixLines("", true) },
    { label: TX(lang, "Kutipan", "Quote"), text: Icons.quote(15), run: () => prefixLines("> ") },
    { label: TX(lang, "Kode", "Code"), text: "</>", run: () => wrapSelection("`", "`", "kode") },
    { label: TX(lang, "Tautan", "Link"), text: Icons.link(15), run: () => wrapSelection("[", "](https://)", TX(lang, "teks tautan", "link text")) },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10, padding: isCompact ? "10px 14px 14px" : "12px 24px 18px" }}>
      <div role="toolbar" aria-label={TX(lang, "Alat format Markdown", "Markdown formatting tools")} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {showEditor && toolButtons.map((button) => (
          <EditorToolButton key={button.label} label={button.label} onClick={button.run}>{button.text}</EditorToolButton>
        ))}
        <span style={{ flex: 1 }} />
        <Segmented
          value={mode}
          onChange={setMode}
          options={isCompact
            ? [
              { value: "write", label: TX(lang, "Tulis", "Write") },
              { value: "preview", label: TX(lang, "Pratinjau", "Preview") },
            ]
            : [
              { value: "write", label: TX(lang, "Tulis", "Write") },
              { value: "split", label: TX(lang, "Berdampingan", "Split") },
              { value: "preview", label: TX(lang, "Pratinjau", "Preview") },
            ]}
        />
        <Button variant="secondary" size="sm" icon={Icons.upload(15)} onClick={() => fileRef.current && fileRef.current.click()}>
          {TX(lang, "Buka file .md", "Open .md file")}
        </Button>
        <Button variant="ghost" size="sm" icon={Icons.sparkle(15)} onClick={() => {
          updateMarkdown(MARKDOWN_SAMPLE);
          onToast(TX(lang, "Contoh Markdown dimuat.", "Sample Markdown loaded."), "neutral");
        }}>
          {TX(lang, "Contoh", "Sample")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.mdown,.txt,text/markdown,text/plain"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files && event.target.files[0];
            if (file) loadMarkdownFile(file, { setOpts, toast: onToast, lang });
            event.target.value = "";
          }}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>
        {showEditor && (
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(event) => setOpts((next) => ({ ...next, markdown: event.target.value }))}
            onKeyDown={onKeyDown}
            aria-label={TX(lang, "Editor Markdown", "Markdown editor")}
            placeholder={TX(lang,
              "Tulis atau tempel Markdown di sini…\n\n# Judul dokumen\n\nTeks dengan **tebal**, *miring*, dan daftar:\n- Poin pertama\n- Poin kedua",
              "Write or paste Markdown here…\n\n# Document title\n\nText with **bold**, *italics*, and lists:\n- First point\n- Second point")}
            spellCheck={false}
            style={{
              flex: 1, minWidth: 0, minHeight: 0, resize: "none", padding: "14px 16px",
              border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
              background: "var(--surface-card)", color: "var(--text-heading)",
              font: "13px/1.7 var(--font-mono)", outline: "none",
            }}
          />
        )}
        {showPreview && <MarkdownPreviewPane markdown={markdown} lang={lang} baseFontSize={Number(opts.fontSize) || 11} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ font: "11.5px var(--font-mono)", color: "var(--text-faint)" }}>
          {stats.words} {TX(lang, "kata", "words")} · {stats.characters} {TX(lang, "karakter", "characters")}
        </span>
        <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>
          {TX(lang, "Teks diproses di perangkat Anda.", "Text is processed on your device.")}
        </span>
        {!!markdown && (
          <Button variant="ghost" size="sm" onClick={() => {
            updateMarkdown("");
            onToast(TX(lang, "Editor dikosongkan.", "Editor cleared."), "neutral");
          }}>
            {TX(lang, "Kosongkan", "Clear")}
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------- Tool definition ----------

TOOL_DEFS.md2pdf = {
  standalone: true,
  defaults: {
    markdown: "",
    viewMode: "split",
    pageSize: "a4",
    margin: "normal",
    fontSize: 11,
    pageNumbers: true,
    outputName: "dokumen-markdown",
  },
  Main: MarkdownWorkspace,
  acceptDroppedFile: (files, helpers) => {
    const file = files.find(isMarkdownFile) || files[0];
    if (file) loadMarkdownFile(file, helpers);
  },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Select label={TX(lang, "Ukuran halaman", "Page size")} value={opts.pageSize}
        onChange={(event) => setOpts({ ...opts, pageSize: event.target.value })}
        options={[
          { value: "a4", label: "A4" },
          { value: "letter", label: "Letter" },
          { value: "f4", label: "F4 (Folio)" },
        ]} />
      <Field label={TX(lang, "Margin", "Margins")}>
        <Segmented value={opts.margin} onChange={(margin) => setOpts({ ...opts, margin })} options={[
          { value: "narrow", label: TX(lang, "Sempit", "Narrow") },
          { value: "normal", label: TX(lang, "Normal", "Normal") },
          { value: "wide", label: TX(lang, "Lebar", "Wide") },
        ]} />
      </Field>
      <SliderRow label={TX(lang, "Ukuran teks dasar", "Base text size")} value={opts.fontSize} min={9} max={14} unit="pt"
        onChange={(fontSize) => setOpts({ ...opts, fontSize })} />
      <Switch label={TX(lang, "Nomor halaman di PDF", "Page numbers in the PDF")} checked={!!opts.pageNumbers}
        onChange={(pageNumbers) => setOpts({ ...opts, pageNumbers })} />
      <OutputNameField lang={lang} value={opts.outputName} inputId="md2pdf-output-name"
        onChange={(outputName) => setOpts({ ...opts, outputName })} />
      <Alert tone="info">{TX(lang,
        "Gambar dari tautan tidak dimuat demi privasi; teks alternatifnya yang ditampilkan.",
        "Linked images are not fetched for privacy; their alt text is shown instead.")}</Alert>
    </div>
  ),
  disabled: (ctx, opts, lang = "id") => !String(opts.markdown || "").trim() || !!getOutputNameError(opts.outputName, lang),
  disabledReason: (ctx, opts, t, lang) => {
    if (!String(opts.markdown || "").trim()) return TX(lang, "Tulis atau tempel teks Markdown terlebih dulu.", "Write or paste Markdown text first.");
    return getOutputNameError(opts.outputName, lang) || t.toolRequirements.md2pdf;
  },
  actionLabel: (ctx, opts, t, lang) => TX(lang, "Buat PDF", "Create PDF"),
  nextAction: (ctx, opts, t, lang) => {
    const stats = markdownStats(opts.markdown);
    return TX(lang,
      `PDF dibuat dari ${stats.words} kata secara lokal di browser.`,
      `The PDF is created from ${stats.words} word${stats.words === 1 ? "" : "s"} locally in your browser.`);
  },
  processLabel: (t, lang) => TX(lang, "Menyusun PDF dari Markdown…", "Building the PDF from Markdown…"),
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName || TX(lang, "dokumen-markdown", "markdown-document"), lang),
  successSummary: (result, ctx, opts, t, lang) => {
    const output = result.outputs[0];
    return TX(lang,
      `${output?.name || ""} dibuat dengan ${output?.pages || 0} halaman dari Markdown Anda.`,
      `${output?.name || ""} was created with ${output?.pages || 0} page${output?.pages === 1 ? "" : "s"} from your Markdown.`);
  },
  process: (ctx, opts, onProgress, lang) => markdownToPdf(opts.markdown, {
    pageSize: opts.pageSize,
    margin: opts.margin,
    fontSize: opts.fontSize,
    pageNumbers: opts.pageNumbers,
    outputName: TOOL_DEFS.md2pdf.outName(lang, opts),
  }, onProgress),
};
