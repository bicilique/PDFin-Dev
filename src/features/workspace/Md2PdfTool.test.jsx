import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkspaceApp } from "./WorkspaceApp.jsx";

vi.mock("./engine/pdfEngine.js", () => ({
  PdfEngine: {
    fmtSize: (size) => `${size} B`,
    loadFile: vi.fn(),
    loadImage: vi.fn(),
    makeSamplePdf: vi.fn(),
    removeFile: vi.fn(),
    renderPage: vi.fn(async () => document.createElement("canvas")),
    pageSize: vi.fn(async () => ({ width: 595, height: 842 })),
    reset: vi.fn(),
  },
}));

vi.mock("../../app/analytics.js", () => ({
  trackPdfEvent: vi.fn(),
}));

// Markdown to PDF runs the real engine: it has no PDF/file inputs to mock.

describe("Markdown to PDF tool", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("opens straight into the editor without a file-upload empty state", () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    expect(screen.getByLabelText(/editor markdown/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pratinjau markdown/i)).toBeInTheDocument();
    expect(screen.queryByText(/letakkan file di sini/i)).not.toBeInTheDocument();

    const cta = screen.getAllByRole("button", { name: /^buat pdf$/i }).find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(screen.getAllByText(/tulis atau tempel teks markdown terlebih dulu/i).length).toBeGreaterThan(0);
  });

  it("renders a live preview while typing", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), {
      target: { value: "# Halo Dunia\n\nTeks dengan **tebal** dan tabel:\n\n| A | B |\n| - | - |\n| 1 | 2 |" },
    });

    expect(await screen.findByRole("heading", { name: /halo dunia/i })).toBeInTheDocument();
    expect(screen.getByText("tebal")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/\d+ kata · \d+ karakter/i)).toBeInTheDocument();
  });

  it("creates a downloadable PDF from the editor content", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), {
      target: { value: "# Dokumen Uji\n\nIsi dokumen." },
    });

    const cta = screen
      .getAllByRole("button", { name: /^buat pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    expect(screen.getByText(/pdf dibuat dari 5 kata secara lokal/i)).toBeInTheDocument();
    fireEvent.click(cta);

    expect((await screen.findAllByText(/dokumen-markdown\.pdf/i)).length).toBeGreaterThan(0);
    expect(screen.getByText(/dibuat dengan 1 halaman dari markdown anda/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^unduh$/i })).toBeInTheDocument();
  });

  it("loads the bundled sample document into the editor", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.click(screen.getByRole("button", { name: /^contoh$/i }));

    await waitFor(() => expect(screen.getByLabelText(/editor markdown/i).value).toMatch(/laporan rapat tim/i));
    expect(await screen.findByRole("heading", { name: /laporan rapat tim/i })).toBeInTheDocument();
  });

  it("carries the generated PDF into a continuation tool", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), {
      target: { value: "# Dokumen Uji\n\nIsi dokumen." },
    });
    const cta = screen
      .getAllByRole("button", { name: /^buat pdf$/i })
      .find((button) => !button.disabled && !button.hasAttribute("aria-current"));
    fireEvent.click(cta);
    await screen.findAllByText(/dokumen-markdown\.pdf/i);

    const { PdfEngine } = await import("./engine/pdfEngine.js");
    PdfEngine.loadFile.mockResolvedValue({ id: "file-out", name: "dokumen-markdown.pdf", size: 100, pageCount: 1 });
    fireEvent.click(screen.getByRole("button", { name: /kompres pdf/i }));

    await waitFor(() => expect(PdfEngine.loadFile).toHaveBeenCalled());
    expect(PdfEngine.loadFile.mock.calls.at(-1)[0].name).toBe("dokumen-markdown.pdf");
    expect(await screen.findByText(/^dokumen-markdown\.pdf$/i)).toBeInTheDocument();
  });

  it("keeps settings and output-name validation wired to the CTA", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), { target: { value: "Halo" } });
    fireEvent.change(screen.getByLabelText(/nama file hasil/i), { target: { value: "   " } });

    const cta = screen.getAllByRole("button", { name: /^buat pdf$/i }).find((button) => button.disabled);
    expect(cta).toBeDisabled();
    expect(screen.getAllByText(/nama file tidak boleh kosong/i).length).toBeGreaterThan(0);
  });

  it("opens a full preview overlay with zoom and closes it with Escape", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), {
      target: { value: "# Dokumen Penuh\n\nIsi dokumen." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^pratinjau penuh$/i }));

    const dialog = await screen.findByRole("dialog", { name: /pratinjau penuh/i });
    expect(dialog).toBeInTheDocument();
    const { getByRole, getByText } = within(dialog);
    expect(getByRole("heading", { name: /dokumen penuh/i })).toBeInTheDocument();
    expect(getByText(/\d+ kata · \d+ karakter/i)).toBeInTheDocument();

    fireEvent.click(getByRole("button", { name: /zoom in/i }));
    expect(getByText("110%")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: /pratinjau penuh/i })).not.toBeInTheDocument());
    expect(screen.getByLabelText(/editor markdown/i)).toBeInTheDocument();
  });

  it("opens the full preview from the preview pane corner button", async () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    fireEvent.change(screen.getByLabelText(/editor markdown/i), { target: { value: "# Judul" } });
    fireEvent.click(screen.getByRole("button", { name: /buka pratinjau penuh/i }));

    expect(await screen.findByRole("dialog", { name: /pratinjau penuh/i })).toBeInTheDocument();
  });

  it("applies bold formatting from the toolbar to the selection", () => {
    window.history.replaceState(null, "", "/#md2pdf");
    render(<WorkspaceApp />);

    const editor = screen.getByLabelText(/editor markdown/i);
    fireEvent.change(editor, { target: { value: "kata penting" } });
    editor.setSelectionRange(5, 12);
    fireEvent.click(screen.getByRole("button", { name: /tebal \(ctrl\+b\)/i }));

    expect(screen.getByLabelText(/editor markdown/i).value).toBe("kata **penting**");
  });
});
