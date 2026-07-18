import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceApp } from "./WorkspaceApp.jsx";
import { PdfEngine } from "./engine/pdfEngine.js";
import { PdfProcess } from "./engine/pdfProcess.js";
import { trackPdfEvent } from "../../app/analytics.js";

function setViewportWidth(width) {
  window.innerWidth = width;
  window.matchMedia = vi.fn((query) => {
    const max = query.match(/\(max-width:\s*(\d+)px\)/);
    const min = query.match(/\(min-width:\s*(\d+)px\)/);
    const matches = (max ? width <= Number(max[1]) : true) && (min ? width >= Number(min[1]) : true);
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

vi.mock("./engine/pdfEngine.js", () => ({
  PdfEngine: {
    fmtSize: (size) => `${size} B`,
    loadFile: vi.fn(async (file) => ({
      id: `file-${file.name}`,
      name: file.name,
      size: file.size,
      pageCount: 2,
    })),
    loadImage: vi.fn(),
    makeSamplePdf: vi.fn(),
    removeFile: vi.fn(),
    renderPage: vi.fn(async () => document.createElement("canvas")),
    pageSize: vi.fn(async () => ({ width: 595, height: 842 })),
    reset: vi.fn(),
  },
}));

vi.mock("./engine/pdfProcess.js", () => ({
  PdfProcess: {
    assemble: vi.fn(async (pages, name, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name,
            size: 128,
            pages: pages.length,
            blob: new Blob(["merged"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    split: vi.fn(async (pages, opts, baseName, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name: `${baseName}-1.pdf`,
            size: 64,
            pages: 2,
            blob: new Blob(["split"], { type: "application/pdf" }),
          },
          {
            name: `${baseName}-2.pdf`,
            size: 64,
            pages: 2,
            blob: new Blob(["split"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    compress: vi.fn(async (pages, opts, name, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name,
            size: 48,
            pages: pages.length,
            blob: new Blob(["compressed"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    readMetadata: vi.fn(async () => ({
      title: "Laporan Lama",
      author: "PDFin",
      subject: "Arsip",
      keywords: "lama, arsip",
    })),
    metadata: vi.fn(async (files, opts, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name: opts.outputName,
            size: 72,
            pages: 2,
            blob: new Blob(["metadata"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    sign: vi.fn(async (files, opts, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name: opts.outputName,
            size: 96,
            pages: 2,
            blob: new Blob(["signed"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    protect: vi.fn(async (files, opts, onProgress) => {
      onProgress(100);
      return {
        outputs: [
          {
            name: opts.outputName,
            size: 104,
            pages: 2,
            blob: new Blob(["protected"], { type: "application/pdf" }),
          },
        ],
      };
    }),
    ocr: vi.fn(async (files, opts, onProgress) => {
      onProgress(100, { phase: "done", page: 1, total: 2, done: 1 });
      return {
        outputs: [
          {
            name: opts.outputName,
            size: 120,
            pages: 2,
            blob: new Blob(["ocr"], { type: "application/pdf" }),
          },
        ],
        ocr: {
          processedPages: [1],
          skippedTextPages: [2],
          lowConfidencePages: [],
          failedPages: [],
          overlays: {
            1: [{ rect: { x: 0.1, y: 0.2, w: 0.2, h: 0.04 }, text: "Nomor", confidence: 88 }],
          },
        },
      };
    }),
    sourceHasDigitalSignature: vi.fn(() => false),
    sourceHasEncryption: vi.fn(() => false),
    clearCache: vi.fn(),
    parseRange: vi.fn((range = "", max = 0) => {
      const pages = new Set();
      range.split(",").forEach((part) => {
        const trimmed = part.trim();
        const span = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
        if (span) {
          for (let i = Number(span[1]); i <= Number(span[2]); i += 1) {
            if (i >= 1 && i <= max) pages.add(i - 1);
          }
        } else if (/^\d+$/.test(trimmed)) {
          const page = Number(trimmed);
          if (page >= 1 && page <= max) pages.add(page - 1);
        }
      });
      return [...pages].sort((a, b) => a - b);
    }),
  },
}));

vi.mock("../../app/analytics.js", () => ({
  trackPdfEvent: vi.fn(),
}));

async function addMergeFiles() {
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, {
    target: {
      files: [
        new File(["pdf-a"], "first.pdf", { type: "application/pdf" }),
        new File(["pdf-b"], "second.pdf", { type: "application/pdf" }),
      ],
    },
  });
  await waitFor(() => expect(screen.getByRole("option", { name: /page 1, first\.pdf/i })).toBeInTheDocument());
}

function runMerge() {
  const cta = screen
    .getAllByRole("button", { name: /^gabung pdf$/i })
    .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
  fireEvent.click(cta);
}

async function expectMergedOrder(order) {
  runMerge();
  await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
  const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
  expect(orderedPages.map((page) => `${page.sourceName}:${page.sourcePageNumber}`)).toEqual(order);
}

describe("WorkspaceApp canonical runtime", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
    localStorage.clear();
    delete window.matchMedia;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    PdfProcess.sourceHasDigitalSignature.mockReturnValue(false);
    PdfProcess.sourceHasEncryption.mockReturnValue(false);
  });

  it("tracks the core PDF analytics funnel without document identifiers", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("pdf_tool_opened", expect.objectContaining({ tool: "merge" })));
    trackPdfEvent.mockClear();

    await addMergeFiles();

    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("pdf_file_selected", expect.objectContaining({
      tool: "merge",
      file_count: 2,
      page_count: 4,
      file_type: "pdf",
      file_size_bucket: "0-10MB",
    })));
    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("file_upload", expect.objectContaining({
      tool: "merge",
      file_count: 2,
      page_count: 4,
      file_type: "pdf",
      file_size_bucket: "0-10MB",
    })));
    expect(JSON.stringify(trackPdfEvent.mock.calls)).not.toMatch(/first\.pdf|second\.pdf|pdf-a|pdf-b/i);

    runMerge();

    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("pdf_process_started", expect.objectContaining({
      tool: "merge",
      file_count: 2,
      page_count: 4,
    })));
    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("pdf_convert_success", expect.objectContaining({
      tool: "merge",
      file_count: 2,
      page_count: 4,
      output_count: 1,
      duration_ms: expect.any(Number),
      file_type: "pdf",
      file_size_bucket: "0-10MB",
    })));
    await waitFor(() => expect(trackPdfEvent).toHaveBeenCalledWith("pdf_process_completed", expect.objectContaining({
      tool: "merge",
      file_count: 2,
      page_count: 4,
      output_count: 1,
      duration_ms: expect.any(Number),
    })));
    expect(JSON.stringify(trackPdfEvent.mock.calls)).not.toMatch(/hasil-gabungan|first\.pdf|second\.pdf/i);

    fireEvent.click(await screen.findByRole("button", { name: /^unduh$/i }));

    expect(trackPdfEvent).toHaveBeenCalledWith("pdf_download_clicked", expect.objectContaining({
      tool: "merge",
      output_count: 1,
      page_count: 4,
      file_type: "pdf",
      file_size_bucket: "0-10MB",
    }));
    expect(trackPdfEvent).toHaveBeenCalledWith("pdf_download", expect.objectContaining({
      tool: "merge",
      output_count: 1,
      page_count: 4,
      file_type: "pdf",
      file_size_bucket: "0-10MB",
    }));
  });

  it("shows a disabled tool CTA with a next-action message when requirements are unmet", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "single.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("single.pdf")).toBeInTheDocument());

    const cta = screen.getAllByRole("button", { name: /^gabung pdf$/i }).find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(screen.getByText(/langkah berikutnya/i)).toBeInTheDocument();
    expect(screen.getAllByText(/tambahkan minimal 2 file pdf/i).length).toBeGreaterThan(0);
  });

  it("disables Split PDF when the page range does not match the document", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio", { name: /rentang/i }));
    fireEvent.change(screen.getByLabelText(/rentang halaman/i), { target: { value: "9-12" } });

    const cta = screen
      .getAllByRole("button", { name: /^pisah pdf$/i })
      .find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(screen.getAllByText(/masukkan rentang halaman yang valid/i).length).toBeGreaterThan(0);
  });

  it("shows split selection controls from the page workspace header", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^pilih halaman$/i }));

    const disabledCta = screen
      .getAllByRole("button", { name: /pisah pdf/i })
      .find((button) => button.disabled);
    expect(disabledCta).toBeDisabled();
    expect(screen.getByText(/pilih minimal 1 halaman/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pilih semua$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^hapus pilihan$/i })).toBeDisabled();
    expect(screen.getByText(/0 dari 2 halaman dipilih/i)).toBeInTheDocument();
    expect(screen.getByText(/0 halaman dipilih.*0 file pdf akan dibuat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /pilih halaman 1/i }));

    const readyCta = screen
      .getAllByRole("button", { name: /pisah pdf/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    expect(readyCta).toBeInTheDocument();
    expect(screen.getByText(/1 dari 2 halaman dipilih/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 halaman dipilih.*1 file pdf akan dibuat/i).length).toBeGreaterThan(0);
  });

  it("configures OCR PDF as a real local searchable-PDF workflow", async () => {
    window.history.replaceState(null, "", "/#ocr");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "scan.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("scan.pdf")).toBeInTheDocument());
    expect(screen.queryByText(/prototipe/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("OCR PDF").length).toBeGreaterThan(0);
    expect(screen.getByText(/ubah hasil pindaian menjadi pdf yang dapat dicari/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bahasa dokumen/i)).toHaveValue("ind+eng");
    expect(screen.getByText(/hanya halaman pindaian/i)).toBeInTheDocument();
    expect(screen.getByText(/seimbang/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nama file hasil/i)).toHaveValue("scan-ocr");

    const cta = screen
      .getAllByRole("button", { name: /buat pdf dapat dicari/i })
      .find((button) => !button.disabled);
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.ocr).toHaveBeenCalled());
    const [files, opts] = PdfProcess.ocr.mock.calls.at(-1);
    expect(files[0].name).toBe("scan.pdf");
    expect(opts.language).toBe("ind+eng");
    expect(opts.pageMode).toBe("scanned");
    expect(opts.quality).toBe("balanced");
    expect(opts.outputName).toBe("scan-ocr.pdf");
    expect(await screen.findByText(/OCR selesai/i)).toBeInTheDocument();
  });

  it("selects all and clears selected split pages", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^pilih halaman$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^pilih semua$/i }));

    expect(screen.getByText(/2 dari 2 halaman dipilih/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^hapus semua$/i })).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").filter((box) => box.checked)).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /^hapus pilihan$/i }));

    expect(screen.getByText(/0 dari 2 halaman dipilih/i)).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").filter((box) => box.checked)).toHaveLength(0);
  });

  it("switches to selected split mode when a page checkbox is used", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("checkbox", { name: /pilih halaman 2/i }));

    expect(screen.getByRole("radio", { name: /pilih halaman/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/1 dari 2 halaman dipilih/i)).toBeInTheDocument();
    expect(screen.getByText(/mode pilih halaman aktif/i)).toBeInTheDocument();
  });

  it("updates Split PDF range summary and validation inline", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio", { name: /rentang halaman/i }));

    expect(screen.getAllByText(/rentang 1-3/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 file pdf akan dibuat/i).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText(/rentang halaman/i), { target: { value: "2-1" } });

    expect(screen.getAllByText(/rentang harus dimulai/i).length).toBeGreaterThan(0);
    const disabledCta = screen
      .getAllByRole("button", { name: /pisah pdf/i })
      .find((button) => button.disabled);
    expect(disabledCta).toBeDisabled();
  });

  it("passes selected split pages to PDF generation in page order", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^pilih halaman$/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /pilih halaman 2/i }));

    const cta = screen
      .getAllByRole("button", { name: /pisah pdf/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.split).toHaveBeenCalled());
    const [pages, opts] = PdfProcess.split.mock.calls.at(-1);
    const selectedPages = pages.filter((page) => opts.selected.has(page.uid)).map((page) => page.srcIndex + 1);
    expect(opts.mode).toBe("selected");
    expect(selectedPages).toEqual([2]);
  });

  it("offers real continuation actions after a successful PDF output", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());
    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(screen.getAllByText(/hasil-gabungan\.pdf/i).length).toBeGreaterThan(0));
    expect(screen.getByRole("button", { name: /pisah pdf/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ocr pdf/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /kompres pdf/i }));

    expect(window.location.pathname).toBe("/compress/");
    await waitFor(() => {
      const activeTool = screen
        .getAllByRole("button", { name: /^kompres pdf$/i })
        .find((button) => button.getAttribute("aria-current") === "page");
      expect(activeTool).toBeInTheDocument();
    });
    expect(screen.getByText("first.pdf")).toBeInTheDocument();
  });

  it("summarizes the generated Merge PDF output after processing", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());
    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(screen.getAllByText(/hasil-gabungan\.pdf/i).length).toBeGreaterThan(0));
    expect(screen.getByText(/1 file pdf dibuat dari 4 halaman/i)).toBeInTheDocument();
  });

  it("summarizes how many files Split PDF created", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    const cta = screen
      .getAllByRole("button", { name: /pisah pdf/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    expect(await screen.findByText(/source-1\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/2 file pdf dibuat/i)).toBeInTheDocument();
  });

  it("communicates Compress PDF estimate and local-processing result", async () => {
    window.history.replaceState(null, "", "/#compress");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    expect(screen.getByText(/perkiraan pengurangan ukuran/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /ukuran lebih kecil/i })).toBeInTheDocument();
    expect(screen.getByText(/kompres 2 halaman secara lokal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nama file hasil/i)).toHaveValue("hasil-kompres");

    const cta = screen
      .getAllByRole("button", { name: /^kompres pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    expect(await screen.findByText(/hasil-kompres\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/ukuran sumber/i)).toBeInTheDocument();
  });

  it("shares PDF preview navigation with direct page validation", async () => {
    window.history.replaceState(null, "", "/#watermark");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /halaman sebelumnya/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /halaman berikutnya/i }));
    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("2"));
    expect(screen.getByRole("button", { name: /halaman berikutnya/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/ke halaman/i), { target: { value: "9" } });
    fireEvent.keyDown(screen.getByLabelText(/ke halaman/i), { key: "Enter" });
    expect(screen.getByRole("alert")).toHaveTextContent(/1-2/);

    fireEvent.change(screen.getByLabelText(/ke halaman/i), { target: { value: "1" } });
    fireEvent.keyDown(screen.getByLabelText(/ke halaman/i), { key: "Enter" });
    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("1"));
  });

  it("synchronizes current page when the shared preview scrolls", async () => {
    window.history.replaceState(null, "", "/#pagenum");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "numbered.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("numbered.pdf")).toBeInTheDocument());
    const scroller = screen.getByLabelText(/viewport pratinjau pdf/i);
    const pages = document.querySelectorAll("[data-pdf-preview-page]");
    Object.defineProperty(scroller, "clientHeight", { value: 700, configurable: true });
    scroller.getBoundingClientRect = () => ({ top: 0, height: 700 });
    pages[0].getBoundingClientRect = () => ({ top: -900, height: 800 });
    pages[1].getBoundingClientRect = () => ({ top: 80, height: 800 });

    fireEvent.scroll(scroller);

    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("2"));
  });

  it("updates watermark and page-number preview settings on the active page", async () => {
    window.history.replaceState(null, "", "/#watermark");
    const { unmount } = render(<WorkspaceApp />);

    let input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "watermark.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("watermark.pdf")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/^teks$/i), { target: { value: "DRAFT" } });
    expect(screen.getAllByText("DRAFT").length).toBeGreaterThan(0);
    expect(screen.getByText(/memperbarui pratinjau/i)).toBeInTheDocument();

    unmount();
    cleanup();
    window.history.replaceState(null, "", "/#pagenum");
    render(<WorkspaceApp />);
    input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "pages.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("pages.pdf")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/mulai dari/i), { target: { value: "10" } });
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("keeps overlay tool settings and preview guidance reachable on mobile", async () => {
    setViewportWidth(390);
    window.history.replaceState(null, "", "/#watermark");
    const { unmount } = render(<WorkspaceApp />);

    let input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByRole("button", { name: /^pengaturan$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^pengaturan$/i }));
    expect(screen.getByText(/pratinjau watermark mengikuti/i)).toBeInTheDocument();
    expect(screen.getAllByText(/penempatan/i).length).toBeGreaterThan(0);

    unmount();
    cleanup();
    window.history.replaceState(null, "", "/#pagenum");
    render(<WorkspaceApp />);

    input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "numbered.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByRole("button", { name: /^pengaturan$/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^pengaturan$/i }));
    expect(screen.getByText(/pratinjau nomor halaman/i)).toBeInTheDocument();
    expect(screen.getAllByText(/posisi/i).length).toBeGreaterThan(0);
  });

  it("guides Organize PDF users toward page-level actions", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    expect(screen.getByText(/susun 2 halaman/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    expect(screen.getByRole("button", { name: /putar ke kiri/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /duplikat/i })).not.toBeDisabled();
  });

  it("duplicates one organize page after the original with a unique page instance", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /duplikat halaman/i }));

    expect(screen.getByText(/salinan/i)).toBeInTheDocument();
    const cta = screen
      .getAllByRole("button", { name: /^atur halaman$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => page.sourcePageNumber)).toEqual([1, 1, 2]);
    expect(new Set(orderedPages.map((page) => page.pageInstanceId))).toHaveProperty("size", 3);
    expect(orderedPages[0].pageInstanceId).not.toBe(orderedPages[1].pageInstanceId);
  });

  it("rotates a duplicated organize page without rotating its original", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /duplikat halaman/i }));
    fireEvent.click(screen.getByRole("button", { name: /putar ke kanan/i }));

    const cta = screen
      .getAllByRole("button", { name: /^atur halaman$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => `${page.sourcePageNumber}:${page.rotation || 0}`)).toEqual([
      "1:0",
      "1:90",
      "2:0",
    ]);
  });

  it("duplicates multiple organize pages in place with unique page instances", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    fireEvent.click(screen.getByRole("option", { name: /page 2/i }));
    fireEvent.click(screen.getByRole("button", { name: /duplikat 2 halaman/i }));

    const cta = screen
      .getAllByRole("button", { name: /^atur halaman$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => page.sourcePageNumber)).toEqual([1, 1, 2, 2]);
    expect(new Set(orderedPages.map((page) => page.pageInstanceId))).toHaveProperty("size", 4);
  });

  it("deletes a selected duplicate without deleting its original", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /duplikat halaman/i }));
    fireEvent.click(screen.getByRole("button", { name: /hapus halaman/i }));

    const cta = screen
      .getAllByRole("button", { name: /^atur halaman$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => page.sourcePageNumber)).toEqual([1, 2]);
  });

  it("ignores rapid duplicate clicks while a duplicate command is applying", async () => {
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));
    const duplicate = screen.getByRole("button", { name: /duplikat halaman/i });
    fireEvent.click(duplicate);
    fireEvent.click(duplicate);

    const cta = screen
      .getAllByRole("button", { name: /^atur halaman$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => page.sourcePageNumber)).toEqual([1, 1, 2]);
    expect(screen.getAllByText(/halaman diduplikat/i)).toHaveLength(1);
  });

  it("shows a recoverable thumbnail error instead of a blank duplicated page", async () => {
    PdfEngine.renderPage.mockRejectedValueOnce(new Error("render failed"));
    window.history.replaceState(null, "", "/#organize");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    expect(await screen.findByText(/thumbnail gagal dirender/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /coba lagi/i })).toBeInTheDocument();
  });

  it("uses mobile workspace sheets and keeps the primary action reachable", async () => {
    setViewportWidth(390);
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByRole("option", { name: /page 1, first\.pdf/i })).toBeInTheDocument());

    expect(screen.getByRole("button", { name: /^file$/i })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /file/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /halaman/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pengaturan$/i })).toBeInTheDocument();
    expect(screen.queryByText(/^pintasan$/i)).not.toBeInTheDocument();

    const readyCta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    expect(readyCta).toBeInTheDocument();
    expect(screen.getByText(/siap diproses/i)).toBeInTheDocument();
  });

  it("lets mobile users open file review and settings sheets", async () => {
    setViewportWidth(390);
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByRole("option", { name: /page 1, first\.pdf/i })).toBeInTheDocument());

    expect(screen.getByRole("option", { name: /page 1/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^file$/i }));
    expect(screen.getByRole("dialog", { name: /^file$/i })).toBeInTheDocument();
    expect(screen.getByText("first.pdf")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /^file$/i })).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^pengaturan$/i }));
    expect(screen.getByRole("dialog", { name: /^pengaturan$/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: /^pengaturan$/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/siap diproses/i)).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button", { name: /^gabung pdf$/i })
        .find((button) => !button.disabled && !button.hasAttribute("aria-current"))
    ).toBeInTheDocument();
  });

  it("preserves the desktop three-zone workspace without mobile tabs", async () => {
    setViewportWidth(1440);
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());

    expect(screen.queryByRole("tab", { name: /file/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^pintasan$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^pengaturan$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /page 1/i })).toBeInTheDocument();
  });

  it("offers a skip link that moves keyboard focus to the workspace main area", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const skipLink = screen.getByRole("link", { name: /lewati ke ruang kerja/i });
    expect(skipLink).toHaveAttribute("href", "#workspace-main");

    fireEvent.click(skipLink);

    expect(document.activeElement).toHaveAttribute("id", "workspace-main");
  });

  it("announces processing progress and completion with a polite live region", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());
    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    expect(screen.getByRole("status", { name: /status ruang kerja/i })).toHaveTextContent(/memproses/i);
    await waitFor(() => expect(screen.getAllByText(/hasil-gabungan\.pdf/i).length).toBeGreaterThan(0));
    expect(screen.getByRole("status", { name: /status ruang kerja/i })).toHaveTextContent(/selesai/i);
  });

  it("announces file loading errors through an alert live region", async () => {
    PdfEngine.loadFile.mockRejectedValueOnce(new Error("invalid pdf"));
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["bad"], "broken.pdf", { type: "application/pdf" })],
      },
    });

    expect(await screen.findByRole("alert", { name: /kesalahan ruang kerja/i })).toHaveTextContent(/file tidak dapat dibaca/i);
  });

  it("keeps valid files when an invalid file is added in the same batch", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "valid.pdf", { type: "application/pdf" }),
          new File(["text"], "notes.txt", { type: "text/plain" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("valid.pdf")).toBeInTheDocument());
    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getAllByText(/file harus berupa pdf/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("option", { name: /page 1, valid\.pdf/i })).toBeInTheDocument();
  });

  it("flags duplicate PDFs instead of silently adding them", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const first = new File(["same"], "same.pdf", { type: "application/pdf", lastModified: 10 });
    const duplicate = new File(["same"], "same.pdf", { type: "application/pdf", lastModified: 10 });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [first, duplicate] },
    });

    await waitFor(() => expect(screen.getAllByText("same.pdf").length).toBeGreaterThan(1));
    expect(screen.getAllByText(/sudah ditambahkan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("option", { name: /same\.pdf/i })).toHaveLength(2);
  });

  it("merges according to the reordered file order", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf-a"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf-b"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("second.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /pindahkan second\.pdf ke atas/i }));

    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => page.sourceName)).toEqual([
      "second.pdf",
      "second.pdf",
      "first.pdf",
      "first.pdf",
    ]);
  });

  it("merges according to the reordered page order", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf-a"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf-b"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByRole("option", { name: /page 3, second\.pdf/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /move second\.pdf page 1 earlier/i }));

    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.assemble).toHaveBeenCalled());
    const orderedPages = PdfProcess.assemble.mock.calls.at(-1)[0];
    expect(orderedPages.map((page) => `${page.sourceName}:${page.sourcePageNumber}`)).toEqual([
      "first.pdf:1",
      "second.pdf:1",
      "first.pdf:2",
      "second.pdf:2",
    ]);
  });

  it("moves the same page right twice based on the latest order", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    fireEvent.click(screen.getByRole("button", { name: /move first\.pdf page 1 later/i }));
    fireEvent.click(screen.getByRole("button", { name: /move first\.pdf page 1 later/i }));

    expect(screen.queryByText(/halaman dipindahkan/i)).not.toBeInTheDocument();
    await expectMergedOrder([
      "first.pdf:2",
      "second.pdf:1",
      "first.pdf:1",
      "second.pdf:2",
    ]);
  });

  it("moves the same page left twice based on the latest order", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    fireEvent.click(screen.getByRole("button", { name: /move second\.pdf page 2 earlier/i }));
    fireEvent.click(screen.getByRole("button", { name: /move second\.pdf page 2 earlier/i }));

    await expectMergedOrder([
      "first.pdf:1",
      "second.pdf:2",
      "first.pdf:2",
      "second.pdf:1",
    ]);
  });

  it("moves the same page right then left back to its prior position", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    fireEvent.click(screen.getByRole("button", { name: /move first\.pdf page 2 later/i }));
    fireEvent.click(screen.getByRole("button", { name: /move first\.pdf page 2 earlier/i }));

    await expectMergedOrder([
      "first.pdf:1",
      "first.pdf:2",
      "second.pdf:1",
      "second.pdf:2",
    ]);
  });

  it("handles rapid repeated clicks without moving the wrong page", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    const moveFirstLater = screen.getByRole("button", { name: /move first\.pdf page 1 later/i });
    fireEvent.click(moveFirstLater);
    fireEvent.click(moveFirstLater);
    fireEvent.click(moveFirstLater);

    await expectMergedOrder([
      "first.pdf:2",
      "second.pdf:1",
      "second.pdf:2",
      "first.pdf:1",
    ]);
  });

  it("disables page movement at first and last boundaries", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    expect(screen.getByRole("button", { name: /move first\.pdf page 1 earlier/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move second\.pdf page 2 later/i })).toBeDisabled();
  });

  it("uses a sanitized custom merge filename", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    fireEvent.change(screen.getByLabelText(/nama file hasil/i), { target: { value: ' laporan/juli?.pdf.pdf ' } });
    runMerge();

    await waitFor(() => expect(screen.getAllByText(/laporan-juli\.pdf/i).length).toBeGreaterThan(0));
    expect(PdfProcess.assemble.mock.calls.at(-1)[1]).toBe("laporan-juli.pdf");
    expect(screen.getByText(/siap diunduh: laporan-juli\.pdf/i)).toBeInTheDocument();
  });

  it("keeps merge disabled with inline validation for an empty output filename", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);
    await addMergeFiles();

    fireEvent.change(screen.getByLabelText(/nama file hasil/i), { target: { value: "   " } });

    const cta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(screen.getAllByText(/nama file tidak boleh kosong/i).length).toBeGreaterThan(0);
  });

  it("opens a readable page preview with zoom controls", async () => {
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf-a"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf-b"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByRole("option", { name: /page 1, first\.pdf/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("option", { name: /page 1, first\.pdf/i }));

    expect(await screen.findByRole("dialog", { name: /halaman 1 dari 4/i })).toBeInTheDocument();
    expect(screen.getAllByText(/first\.pdf/i).length).toBeGreaterThan(1);
    fireEvent.click(screen.getAllByRole("button", { name: /zoom in/i }).at(-1));
    expect(screen.getByRole("button", { name: /140%/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /halaman 1 dari 4/i })).not.toBeInTheDocument());
  });

  it("connects compact workspace tabs to their tab panels", async () => {
    setViewportWidth(820);
    window.history.replaceState(null, "", "/#merge");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [
          new File(["pdf"], "first.pdf", { type: "application/pdf" }),
          new File(["pdf"], "second.pdf", { type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());

    const filesTab = screen.getByRole("tab", { name: /file/i });
    expect(filesTab).toHaveAttribute("aria-controls", "workspace-panel-files");
    expect(screen.getByRole("tabpanel", { name: /file/i })).toHaveAttribute("id", "workspace-panel-files");

    fireEvent.click(screen.getByRole("tab", { name: /halaman/i }));
    expect(screen.getByRole("tab", { name: /halaman/i })).toHaveAttribute("aria-controls", "workspace-panel-pages");
    expect(screen.getByRole("tabpanel", { name: /halaman/i })).toHaveAttribute("id", "workspace-panel-pages");
  });

  it("preloads, resets, clears, and processes Metadata PDF fields", async () => {
    window.history.replaceState(null, "", "/#metadata");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByLabelText(/judul/i)).toHaveValue("Laporan Lama"));
    expect(screen.getByText(/perubahan metadata tidak mengubah tampilan isi pdf/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /halaman berikutnya/i }));
    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("2"));
    expect(screen.getByText("lama")).toBeInTheDocument();
    expect(screen.getByText("arsip")).toBeInTheDocument();
    expect(screen.getByLabelText(/nama file hasil/i)).toHaveValue("source-metadata");

    fireEvent.change(screen.getByLabelText(/judul/i), { target: { value: "Laporan Baru" } });
    expect(screen.getByText(/judul akan diperbarui/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reset perubahan/i }));
    expect(screen.getByLabelText(/judul/i)).toHaveValue("Laporan Lama");

    fireEvent.click(screen.getByRole("button", { name: /^hapus metadata$/i }));
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi hapus/i }));
    expect(screen.getByLabelText(/judul/i)).toHaveValue("");
    expect(screen.queryByText("lama")).not.toBeInTheDocument();

    const cta = screen
      .getAllByRole("button", { name: /^metadata pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.metadata).toHaveBeenCalled());
    const [, opts] = PdfProcess.metadata.mock.calls.at(-1);
    expect(opts).toMatchObject({
      title: "",
      author: "",
      subject: "",
      keywords: [],
      outputName: "source-metadata.pdf",
    });
  });

  it("places visual initials on page 2 and preserves page-relative coordinates", async () => {
    window.history.replaceState(null, "", "/#sign");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "contract.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("contract.pdf")).toBeInTheDocument());
    expect(screen.getByText(/bukan tanda tangan elektronik atau tanda tangan digital tersertifikasi/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^nama$/i), { target: { value: "Budi" } });
    await waitFor(() => expect(screen.getByAltText(/pratinjau paraf/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /halaman berikutnya/i }));
    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("2"));
    expect(screen.getByText(/akan ditempatkan di.*halaman 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /tambahkan ke halaman ini/i }));
    expect(screen.getByRole("button", { name: /halaman 2.*paraf 1/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^kiri$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^perbesar$/i }));

    const cta = screen
      .getAllByRole("button", { name: /^paraf dokumen pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.sign).toHaveBeenCalled());
    const [, opts] = PdfProcess.sign.mock.calls.at(-1);
    expect(opts.outputName).toBe("contract-diparaf.pdf");
    expect(opts.placements).toHaveLength(1);
    expect(opts.placements[0].srcIndex).toBe(1);
    expect(opts.placements[0].rect.x).toBeGreaterThanOrEqual(0);
    expect(opts.placements[0].rect.w).toBeGreaterThan(0.28);
  });

  it("enables Kunci PDF for matching passwords, navigates preview pages, and clears passwords after success", async () => {
    window.history.replaceState(null, "", "/#protect");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "secure.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("secure.pdf")).toBeInTheDocument());
    expect(screen.getByText(/pratinjau dokumen asli/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/password akan diterapkan saat pdf diproses/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /halaman berikutnya/i }));
    await waitFor(() => expect(screen.getByLabelText(/ke halaman/i)).toHaveValue("2"));

    const disabledCta = screen
      .getAllByRole("button", { name: /^kunci pdf$/i })
      .find((button) => button.disabled);
    expect(disabledCta).toBeDisabled();
    expect(screen.getByText(/masukkan password untuk membuka pdf/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^password untuk membuka pdf$/i), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText(/^konfirmasi password$/i), { target: { value: "different" } });
    expect(screen.getAllByText(/konfirmasi password tidak sama/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/lemah/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^konfirmasi password$/i), { target: { value: "short" } });
    expect(screen.getByLabelText(/nama file hasil/i)).toHaveValue("secure-terkunci");

    const cta = screen
      .getAllByRole("button", { name: /^kunci pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    await waitFor(() => expect(PdfProcess.protect).toHaveBeenCalledTimes(1));
    const [, opts] = PdfProcess.protect.mock.calls.at(-1);
    expect(opts).toMatchObject({
      password: "short",
      outputName: "secure-terkunci.pdf",
    });
    expect(screen.getByText(/pdf terkunci dan siap diunduh/i)).toBeInTheDocument();
    expect(screen.getByText("secure-terkunci.pdf")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /kembali ke ruang kerja/i }));
    expect(screen.getByLabelText(/^password untuk membuka pdf$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^konfirmasi password$/i)).toHaveValue("");
    expect(localStorage.getItem("pdfin-ws-recent")).toBeNull();
    expect(localStorage.getItem("pdfin-ws-recent-tools")).not.toContain("short");
  });

  it("blocks existing encrypted PDFs and warns for existing digital signatures in Kunci PDF", async () => {
    window.history.replaceState(null, "", "/#protect");
    PdfProcess.sourceHasDigitalSignature.mockReturnValue(true);
    PdfProcess.sourceHasEncryption.mockReturnValue(true);
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "signed-secure.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("signed-secure.pdf")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/tanda tangan digital yang ada tidak lagi valid/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getAllByText(/pdf ini sudah dilindungi password/i).length).toBeGreaterThan(0));

    fireEvent.change(screen.getByLabelText(/^password untuk membuka pdf$/i), { target: { value: "correct horse battery staple" } });
    fireEvent.change(screen.getByLabelText(/^konfirmasi password$/i), { target: { value: "correct horse battery staple" } });

    const cta = screen
      .getAllByRole("button", { name: /^kunci pdf$/i })
      .find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(PdfProcess.protect).not.toHaveBeenCalled();
    PdfProcess.sourceHasDigitalSignature.mockReturnValue(false);
    PdfProcess.sourceHasEncryption.mockReturnValue(false);
  });

  it("prevents duplicate Kunci PDF jobs and clears passwords after failure", async () => {
    window.history.replaceState(null, "", "/#protect");
    let rejectJob;
    PdfProcess.protect.mockImplementationOnce(() => new Promise((resolve, reject) => {
      rejectJob = reject;
    }));
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "secure.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("secure.pdf")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/^password untuk membuka pdf$/i), { target: { value: "correct horse battery staple" } });
    fireEvent.change(screen.getByLabelText(/^konfirmasi password$/i), { target: { value: "correct horse battery staple" } });

    const cta = screen
      .getAllByRole("button", { name: /^kunci pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);
    fireEvent.click(cta);

    expect(PdfProcess.protect).toHaveBeenCalledTimes(1);
    rejectJob(new Error("PDF_ALREADY_ENCRYPTED"));

    await waitFor(() => expect(screen.getAllByText(/pdf tidak dapat dikunci/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(screen.getByLabelText(/^password untuk membuka pdf$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^konfirmasi password$/i)).toHaveValue("");
  });

  it("uses the release prototype label consistently in workspace settings", async () => {
    window.history.replaceState(null, "", "/#unlock");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "secure.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("secure.pdf")).toBeInTheDocument());

    expect(screen.getByText("Prototipe")).toBeInTheDocument();
    expect(screen.queryByText(/^demo$/i)).not.toBeInTheDocument();
  });
});
