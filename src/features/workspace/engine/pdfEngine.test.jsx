import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfEngine } from "./pdfEngine.js";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: {},
  getDocument: vi.fn(),
}));

vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({
  default: "/pdf.worker.min.mjs",
}));

describe("PdfEngine thumbnail rendering", () => {
  afterEach(() => {
    PdfEngine.reset();
    vi.restoreAllMocks();
  });

  it("returns a fresh canvas for repeated renders of the same cached source page", async () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    }));

    PdfEngine.files.set("doc-1", {
      id: "doc-1",
      name: "source.pdf",
      size: 100,
      pageCount: 1,
      doc: {
        getPage: vi.fn(async () => ({
          getViewport: ({ scale }) => ({ width: 200 * scale, height: 300 * scale }),
          render: vi.fn(() => ({ promise: Promise.resolve() })),
        })),
        destroy: vi.fn(async () => {}),
      },
    });

    try {
      const first = await PdfEngine.renderPage("doc-1", 1, 148);
      const second = await PdfEngine.renderPage("doc-1", 1, 148);

      expect(first).toBeInstanceOf(HTMLCanvasElement);
      expect(second).toBeInstanceOf(HTMLCanvasElement);
      expect(second).not.toBe(first);
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });
});
