import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TextRunLayer, clearTextRunCache } from "./tools-7.jsx";

vi.mock("../engine/pdfTextEdit.js", () => ({
  extractPageTextRuns: vi.fn(async () => [{
    id: "file-1:0:4",
    fileId: "file-1",
    srcIndex: 0,
    opIndex: 4,
    text: "Asli",
    rect: { x: 0.1, y: 0.2, w: 0.2, h: 0.05 },
    editable: true,
    style: { css: "Helvetica, Arial, sans-serif", weight: 400 },
  }]),
  clearTextRunReaders: vi.fn(),
}));

describe("TextRunLayer", () => {
  beforeEach(() => clearTextRunCache());
  afterEach(() => cleanup());

  it("keeps a longer replacement visible after the text field is deselected", async () => {
    const replacement = "Teks pengganti yang jauh lebih panjang";

    render(
      <TextRunLayer
        page={{ fileId: "file-1", srcIndex: 0 }}
        opts={{
          changes: [{ fileId: "file-1", srcIndex: 0, opIndex: 4, original: "Asli", text: replacement }],
          selectedId: null,
        }}
        setOpts={vi.fn()}
        lang="id"
      />
    );

    const preview = await screen.findByRole("button", { name: "Asli" });
    expect(preview.style.width).toMatch(/^\d+px$/);
    expect(preview.style.minWidth).toBe("20%");
    expect(preview.style.maxWidth).toBe("90%");
  });
});
