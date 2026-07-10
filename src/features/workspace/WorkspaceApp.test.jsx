import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceApp } from "./WorkspaceApp.jsx";
import { PdfEngine } from "./engine/pdfEngine.js";

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

describe("WorkspaceApp canonical runtime", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
    localStorage.clear();
    delete window.matchMedia;
    vi.restoreAllMocks();
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
    expect(screen.getByText(/masukkan rentang halaman yang valid/i)).toBeInTheDocument();
  });

  it("enables Split PDF selected-page mode after a page is selected", async () => {
    window.history.replaceState(null, "", "/#split");
    render(<WorkspaceApp />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: {
        files: [new File(["pdf"], "source.pdf", { type: "application/pdf" })],
      },
    });

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio", { name: /pilihan/i }));

    const disabledCta = screen
      .getAllByRole("button", { name: /^pisah pdf$/i })
      .find((button) => button.disabled);
    expect(disabledCta).toBeDisabled();
    expect(screen.getByText(/pilih minimal 1 halaman/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /page 1/i }));

    const readyCta = screen
      .getAllByRole("button", { name: /^pisah pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    expect(readyCta).toBeInTheDocument();
    expect(screen.getByText(/1 halaman siap dipisahkan/i)).toBeInTheDocument();
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

    expect(await screen.findByText(/hasil-gabungan\.pdf/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pisah pdf/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ocr pdf/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /kompres pdf/i }));

    expect(window.location.hash).toBe("#compress");
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

    expect(await screen.findByText(/hasil-gabungan\.pdf/i)).toBeInTheDocument();
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
      .getAllByRole("button", { name: /^pisah pdf$/i })
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
    expect(screen.getByText(/perkiraan hasil/i)).toBeInTheDocument();
    expect(screen.getByText(/kompres 2 halaman secara lokal/i)).toBeInTheDocument();

    const cta = screen
      .getAllByRole("button", { name: /^kompres pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);

    expect(await screen.findByText(/hasil-kompres\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/dikompres di browser/i)).toBeInTheDocument();
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

    await waitFor(() => expect(screen.getByText("source.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("tab", { name: /pengaturan/i }));
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

    await waitFor(() => expect(screen.getByText("numbered.pdf")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("tab", { name: /pengaturan/i }));
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

  it("uses mobile workspace tabs and keeps the primary action reachable", async () => {
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

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());

    expect(screen.getByRole("tab", { name: /file/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /halaman/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /pengaturan/i })).toBeInTheDocument();
    expect(screen.queryByText(/^pintasan$/i)).not.toBeInTheDocument();

    const readyCta = screen
      .getAllByRole("button", { name: /^gabung pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    expect(readyCta).toBeInTheDocument();
    expect(screen.getByText(/siap diproses/i)).toBeInTheDocument();
  });

  it("lets mobile users switch between file review, pages, and settings", async () => {
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

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("tab", { name: /halaman/i }));
    expect(screen.getByRole("tab", { name: /halaman/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /page 1/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /pengaturan/i }));
    expect(screen.getByRole("tab", { name: /pengaturan/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: /^pengaturan$/i })).toBeInTheDocument();
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
    expect(await screen.findByText(/hasil-gabungan\.pdf/i)).toBeInTheDocument();
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

  it("connects compact workspace tabs to their tab panels", async () => {
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

    await waitFor(() => expect(screen.getByText("first.pdf")).toBeInTheDocument());

    const filesTab = screen.getByRole("tab", { name: /file/i });
    expect(filesTab).toHaveAttribute("aria-controls", "workspace-panel-files");
    expect(screen.getByRole("tabpanel", { name: /file/i })).toHaveAttribute("id", "workspace-panel-files");

    fireEvent.click(screen.getByRole("tab", { name: /halaman/i }));
    expect(screen.getByRole("tab", { name: /halaman/i })).toHaveAttribute("aria-controls", "workspace-panel-pages");
    expect(screen.getByRole("tabpanel", { name: /halaman/i })).toHaveAttribute("id", "workspace-panel-pages");
  });

  it("uses the release prototype label consistently in workspace settings", async () => {
    window.history.replaceState(null, "", "/#protect");
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
