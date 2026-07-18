import { readFileSync } from "node:fs";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.jsx";
import { SelfHostedPage } from "../features/selfHosted/SelfHostedPage.jsx";
import { LANG_STORAGE_KEY } from "./locale.js";

function forceNavigatorLanguage(language) {
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(language);
  if ("userLanguage" in window.navigator) {
    vi.spyOn(window.navigator, "userLanguage", "get").mockReturnValue(language);
  }
  if ("languages" in window.navigator) {
    vi.spyOn(window.navigator, "languages", "get").mockReturnValue([language]);
  }
}

describe("App tool routing", () => {
  beforeEach(() => {
    forceNavigatorLanguage("id-ID");
  });

  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("opens the selected workspace tool from a deterministic hash", async () => {
    window.history.replaceState(null, "", "/split/");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /pisah pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pisah pdf/i })).toBeInTheDocument();
    expect(screen.queryByText(/alat pdf mudah/i)).not.toBeInTheDocument();
  });

  it("explains the active tool requirements in the workspace empty state", async () => {
    window.history.replaceState(null, "", "/#merge");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /gabung pdf/i })).toBeInTheDocument();
    expect(screen.getByText(/gabungkan beberapa pdf menjadi satu file/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pdf hingga 100 mb/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tambahkan minimal 2 file pdf/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dokumen diproses di perangkat anda/i).length).toBeGreaterThan(0);
  });

  it("renders the home catalog with deterministic workspace and self-hosted links", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /kelola pdf langsung di browser/i })).toBeInTheDocument();
    expect(screen.getAllByText(/untuk alat yang mendukung pemrosesan lokal/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /pilih alat pdf/i })).toHaveAttribute("href", "#tool-categories");
    expect(screen.getAllByRole("link", { name: /kirim masukan/i })[0]).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(screen.getByText(/tanpa akun untuk fungsi dasar/i)).toBeInTheDocument();
    expect(screen.getByText(/processing location dijelaskan per tool/i)).toBeInTheDocument();
    expect(screen.getByText(/self-hosted api untuk local network/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /baca privacy & security/i })).toHaveAttribute("href", "/privacy-security/");
    expect(screen.getByRole("heading", { name: /kelola halaman/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /konversi dan optimasi/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /keamanan dan informasi/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gabung pdf/i })).toHaveAttribute("href", "/merge/");
    expect(screen.getByRole("link", { name: /pisah pdf/i })).toHaveAttribute("href", "/split/");
    expect(screen.getByRole("link", { name: /metadata pdf/i })).toHaveAttribute("href", "/metadata/");
    expect(screen.getByRole("link", { name: /ocr pdf/i })).toHaveAttribute("href", "/ocr/");
    expect(screen.queryByRole("link", { name: /buka pdf terkunci/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/buka pdf terkunci/i).some((node) => node.closest("[aria-disabled='true']"))).toBe(true);
    expect(screen.getAllByText(/dalam pengembangan/i).some((node) => node.tagName.toLowerCase() === "span")).toBe(true);
    expect(screen.getByRole("heading", { name: /batasan yang perlu diketahui/i })).toBeInTheDocument();
    expect(screen.getByText(/recent filename tidak disimpan/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /memerlukan api untuk aplikasi internal/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pelajari self-hosted/i })).toHaveAttribute("href", "/self-hosted/");
    expect(screen.queryByRole("link", { name: /workspace alat/i })).not.toBeInTheDocument();
    expect(document.querySelectorAll('main a[href="#"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href="#"]')).toHaveLength(0);
  });

  it("keeps the URL hash synchronized when a home tool is opened", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/");

    render(<App />);
    await user.click(screen.getByRole("link", { name: /kompres pdf/i }));

    expect(window.location.pathname).toBe("/compress/");
    expect(await screen.findByRole("heading", { name: /kompres pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /kompres pdf/i })).toBeInTheDocument();
  });

  it("exposes semantic active states for navigation and controls", async () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: /semua alat/i })).toHaveAttribute("aria-current", "page");
    expect(header.getByRole("link", { name: /ruang kerja/i })).toBeInTheDocument();
    expect(header.getByRole("link", { name: /privasi & keamanan/i })).toHaveAttribute("href", "/privacy-security/");
    expect(header.getByRole("link", { name: /self-hosted/i })).toHaveAttribute("href", "/self-hosted/");
    expect(screen.getByRole("button", { name: /beralih ke mode gelap/i })).toHaveAttribute("aria-pressed", "false");

    cleanup();
    window.history.replaceState(null, "", "/#merge");
    render(<App />);

    expect(await screen.findByRole("button", { name: /gabung pdf/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /beralih ke mode gelap/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("renders only real footer navigation destinations", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByText(/self-hosted menjalankan api di infrastruktur anda/i)).toBeInTheDocument();
    expect(screen.getByRole("contentinfo").querySelectorAll("[aria-disabled='true']")).toHaveLength(0);
    const footer = within(screen.getByRole("contentinfo"));
    expect(footer.getByRole("link", { name: /privasi & keamanan/i })).toHaveAttribute("href", "/privacy-security/");
    expect(footer.getByRole("link", { name: /^github$/i })).toHaveAttribute("href", "https://github.com/bicilique");
    expect(footer.getByRole("link", { name: /kirim masukan/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(footer.getByRole("link", { name: /self-hosted/i })).toHaveAttribute("href", "/self-hosted/");
    expect(footer.getByRole("link", { name: /afiffaizianur@gmail.com/i })).toHaveAttribute("href", "mailto:afiffaizianur@gmail.com");
    expect(screen.queryByText(/syarat & ketentuan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/aplikasi desktop/i)).not.toBeInTheDocument();
  });

  it("offers a home skip link that moves keyboard focus to the tool catalog", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    const skipLink = screen.getByRole("link", { name: /lewati ke katalog alat/i });
    expect(skipLink).toHaveAttribute("href", "#home-main");

    skipLink.click();

    expect(document.activeElement).toHaveAttribute("id", "home-main");
  });

  it("renders the factual privacy and security page", () => {
    window.history.replaceState(null, "", "/privacy-security/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /lokasi pemrosesan dokumen dibuat jelas/i })).toBeInTheDocument();
    expect(screen.getByText(/browser tetap dapat mengunduh runtime asset/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /matrix pemrosesan browser tools/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /self-hosted/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /kirim masukan/i })[0]).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
  });

  it("renders the self-hosted service page directly", () => {
    window.history.replaceState(null, "", "/self-hosted/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /pemrosesan pdf di local network anda/i })).toBeInTheDocument();
    expect(screen.getByText(/api tersedia sebagai bagian dari pdfin self-hosted/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /diskusikan deployment/i })[0]).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(screen.getByRole("heading", { name: /cara kerja/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /capability awal/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /ocr pdf/i })).toBeInTheDocument();
  });

  it("explains the customer-managed processing flow", () => {
    window.history.replaceState(null, "", "/self-hosted/");

    render(<App />);

    const figure = screen.getByRole("figure", { name: /alur pemrosesan pdfin self-hosted di infrastruktur anda/i });
    expect(within(figure).getByText(/pdf \+ opsi melalui https/i)).toBeInTheDocument();
    expect(within(figure).getAllByText(/mesin pemrosesan/i).length).toBeGreaterThan(0);
    expect(within(figure).getByText(/baca input \/ tulis hasil/i)).toBeInTheDocument();
    expect(within(figure).getAllByText(/status job dan hasil/i).length).toBeGreaterThan(0);
    expect(within(figure).getByText(/penyimpanan sementara berlangsung di infrastruktur yang anda kelola/i)).toBeInTheDocument();
    expect(within(figure).queryByText(/local network/i)).not.toBeInTheDocument();
  });

  it("provides an English equivalent for the self-hosted processing flow", () => {
    render(<SelfHostedPage lang="en" />);

    expect(screen.getByRole("figure", { name: /pdfin self-hosted processing flow in your infrastructure/i })).toBeInTheDocument();
    expect(screen.getByText(/pdf \+ options over https/i)).toBeInTheDocument();
    expect(screen.getAllByText(/job status and result/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/read input \/ write output/i)).toBeInTheDocument();
  });

  it("uses a persisted dark theme before the workspace and home screens share it", async () => {
    localStorage.setItem("pdfin-theme", "dark");
    window.history.replaceState(null, "", "/");

    render(<App />);

    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "dark"));
    expect(screen.getByRole("button", { name: /beralih ke mode terang/i })).toHaveAttribute("aria-pressed", "true");

    await userEvent.setup().click(screen.getByRole("link", { name: /ruang kerja/i }));

    expect(await screen.findByRole("heading", { name: /gabung pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /beralih ke mode terang/i })).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("pdfin-theme")).toBe("dark");
    expect(localStorage.getItem("pdfin-ws-theme")).toBeNull();
  });

  it("migrates the legacy workspace theme key and persists future changes to the shared key", async () => {
    const user = userEvent.setup();
    localStorage.setItem("pdfin-ws-theme", "dark");
    window.history.replaceState(null, "", "/");

    render(<App />);

    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "dark"));
    await user.click(screen.getByRole("button", { name: /beralih ke mode terang/i }));

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("pdfin-theme")).toBe("light");
    expect(localStorage.getItem("pdfin-ws-theme")).toBeNull();
    expect(screen.getByRole("button", { name: /beralih ke mode gelap/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("uses theme-specific semantic gradients for the hero and workspace drop zone", async () => {
    window.history.replaceState(null, "", "/");

    const { container } = render(<App />);

    const hero = container.querySelector("main > section");
    expect(hero).toHaveStyle({ background: "var(--gradient-hero)" });

    await userEvent.setup().click(screen.getByRole("link", { name: /ruang kerja/i }));

    const dropTitle = await screen.findByText(/letakkan file di sini/i);
    const dropZone = dropTitle.closest("div[style*='2px dashed']");
    expect(dropZone).toHaveStyle({ background: "var(--gradient-upload)" });
  });

  it("defaults to Indonesian for Indonesian browser locale", () => {
    forceNavigatorLanguage("id-ID");
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /kelola pdf langsung di browser/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ruang kerja/i })).toHaveAttribute("href", "/merge/");
  });

  it("defaults to English for non-Indonesian browser locale", () => {
    forceNavigatorLanguage("en-US");
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /manage pdfs directly in your browser/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /workspace/i })).toHaveAttribute("href", "/merge/");
  });

  it("uses persisted language preference over navigator language", () => {
    forceNavigatorLanguage("en-US");
    localStorage.setItem(LANG_STORAGE_KEY, "id");
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /kelola pdf langsung di browser/i })).toBeInTheDocument();
  });
});

describe("release documentation", () => {
  it("documents the canonical workspace route model and release verification", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toMatch(/canonical workspace/i);
    expect(readme).toMatch(/\/merge\//);
    expect(readme).toMatch(/\/split\//);
    expect(readme).toMatch(/www\.pdfin\.fun/);
    expect(readme).toMatch(/output\/playwright/);
  });
});
