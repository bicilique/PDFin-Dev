import { describe, expect, it } from "vitest";
import { markdownStats, MARKDOWN_SAMPLE, parseInline, parseMarkdown } from "./markdownEngine.js";

describe("parseMarkdown blocks", () => {
  it("parses headings, paragraphs, and horizontal rules", () => {
    const blocks = parseMarkdown("# Judul\n\nParagraf pertama\nlanjutan baris.\n\n---\n\n## Sub judul");
    expect(blocks.map((block) => block.type)).toEqual(["heading", "paragraph", "hr", "heading"]);
    expect(blocks[0].level).toBe(1);
    expect(blocks[0].spans[0].text).toBe("Judul");
    expect(blocks[1].spans[0].text).toBe("Paragraf pertama lanjutan baris.");
    expect(blocks[3].level).toBe(2);
  });

  it("parses nested and task lists", () => {
    const blocks = parseMarkdown("- satu\n- dua\n  - anak\n- [x] selesai\n- [ ] belum");
    expect(blocks).toHaveLength(1);
    const list = blocks[0];
    expect(list.type).toBe("list");
    expect(list.ordered).toBe(false);
    expect(list.items).toHaveLength(4);
    expect(list.items[1].children[0].items[0].spans[0].text).toBe("anak");
    expect(list.items[2].checked).toBe(true);
    expect(list.items[3].checked).toBe(false);
  });

  it("parses ordered lists with a custom start", () => {
    const blocks = parseMarkdown("3. tiga\n4. empat");
    expect(blocks[0].ordered).toBe(true);
    expect(blocks[0].start).toBe(3);
    expect(blocks[0].items).toHaveLength(2);
  });

  it("keeps fenced code blocks verbatim", () => {
    const blocks = parseMarkdown("```js\nconst a = **not bold**;\n\n  indented\n```");
    expect(blocks).toEqual([{ type: "code", lang: "js", text: "const a = **not bold**;\n\n  indented" }]);
  });

  it("parses blockquotes recursively", () => {
    const blocks = parseMarkdown("> Kutipan **penting**\n> baris kedua");
    expect(blocks[0].type).toBe("quote");
    expect(blocks[0].blocks[0].type).toBe("paragraph");
    expect(blocks[0].blocks[0].spans.some((span) => span.bold)).toBe(true);
  });

  it("parses tables with alignment", () => {
    const blocks = parseMarkdown("| Nama | Nilai |\n| :--- | ---: |\n| A | 1 |\n| B | 2 |");
    const table = blocks[0];
    expect(table.type).toBe("table");
    expect(table.aligns).toEqual(["left", "right"]);
    expect(table.header[0][0].text).toBe("Nama");
    expect(table.rows).toHaveLength(2);
    expect(table.rows[1][1][0].text).toBe("2");
  });

  it("distinguishes a horizontal rule from a list item", () => {
    const blocks = parseMarkdown("---\n- item");
    expect(blocks.map((block) => block.type)).toEqual(["hr", "list"]);
  });

  it("returns an empty list of blocks for empty input", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("   \n\n  ")).toEqual([]);
  });

  it("parses the bundled sample without errors", () => {
    const blocks = parseMarkdown(MARKDOWN_SAMPLE);
    expect(blocks.length).toBeGreaterThan(8);
    expect(blocks.some((block) => block.type === "table")).toBe(true);
    expect(blocks.some((block) => block.type === "code")).toBe(true);
  });
});

describe("parseInline", () => {
  it("parses bold, italic, code, strikethrough, and links", () => {
    const spans = parseInline("teks **tebal** dan *miring* dengan `kode`, ~~coret~~, dan [tautan](https://example.com)");
    expect(spans.find((span) => span.bold)?.text).toBe("tebal");
    expect(spans.find((span) => span.italic)?.text).toBe("miring");
    expect(spans.find((span) => span.code)?.text).toBe("kode");
    expect(spans.find((span) => span.strike)?.text).toBe("coret");
    const link = spans.find((span) => span.href);
    expect(link.text).toBe("tautan");
    expect(link.href).toBe("https://example.com");
  });

  it("supports nested emphasis inside links", () => {
    const spans = parseInline("[teks **tebal**](https://example.com)");
    expect(spans).toHaveLength(2);
    expect(spans.every((span) => span.href === "https://example.com")).toBe(true);
    expect(spans[1].bold).toBe(true);
  });

  it("does not treat snake_case as emphasis", () => {
    const spans = parseInline("nama_variabel_penting tetap utuh");
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe("nama_variabel_penting tetap utuh");
    expect(spans[0].italic).toBeUndefined();
  });

  it("renders images as alt text without fetching them", () => {
    const spans = parseInline("![diagram alur](https://example.com/img.png)");
    expect(spans).toHaveLength(1);
    expect(spans[0].imageAlt).toBe(true);
    expect(spans[0].text).toBe("diagram alur");
  });
});

describe("markdownStats", () => {
  it("counts words and characters", () => {
    expect(markdownStats("satu dua tiga")).toEqual({ characters: 13, words: 3 });
    expect(markdownStats("")).toEqual({ characters: 0, words: 0 });
  });
});
