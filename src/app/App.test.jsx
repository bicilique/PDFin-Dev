import { readFileSync } from "node:fs";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.jsx";

describe("App tool hash routing", () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("opens the selected workspace tool from a deterministic hash", async () => {
    window.history.replaceState(null, "", "/#split");

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
    expect(screen.getByText(/tambahkan minimal 2 file pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/file anda diproses di browser/i)).toBeInTheDocument();
  });

  it("renders the home catalog with deterministic workspace links", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: /alat pdf gratis yang bekerja di perangkat anda/i })).toBeInTheDocument();
    expect(screen.getByText(/gabungkan, pisahkan, atur, dan kelola pdf/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /jelajahi alat/i })).toHaveAttribute("href", "#tool-categories");
    expect(screen.getAllByRole("link", { name: /lihat di github/i })[0]).toHaveAttribute("href", "https://github.com/bicilique");
    expect(screen.getByText(/gratis digunakan/i)).toBeInTheDocument();
    expect(screen.getByText(/tanpa akun/i)).toBeInTheDocument();
    expect(screen.getByText(/diproses lokal di browser/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pelajari privasi dan batasan alat/i })).toHaveAttribute("href", "#privacy-security");
    expect(screen.getByRole("heading", { name: /kelola halaman/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /konversi dan optimasi/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /keamanan dan informasi/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gabung pdf/i })).toHaveAttribute("href", "/#merge");
    expect(screen.getByRole("link", { name: /pisah pdf/i })).toHaveAttribute("href", "/#split");
    expect(screen.getByRole("link", { name: /metadata pdf/i })).toHaveAttribute("href", "/#metadata");
    expect(screen.getByRole("link", { name: /ocr pdf/i })).toHaveAttribute("href", "/#ocr");
    expect(screen.queryByRole("link", { name: /buka pdf terkunci/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/buka pdf terkunci/i).some((node) => node.closest("[aria-disabled='true']"))).toBe(true);
    expect(screen.getAllByText(/dalam pengembangan/i).some((node) => node.tagName.toLowerCase() === "span")).toBe(true);
    expect(screen.getByRole("heading", { name: /privasi dan batasan alat/i })).toBeInTheDocument();
    expect(screen.getByText(/preferensi bahasa\/tema dan daftar nama file terakhir/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /terbuka untuk dipelajari dan dijalankan sendiri/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hubungi untuk self-hosting/i })).toHaveAttribute("href", "mailto:afiffaizianur@gmail.com");
    expect(screen.queryByRole("link", { name: /workspace alat/i })).not.toBeInTheDocument();
    expect(document.querySelectorAll('main a[href="#"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href="#"]')).toHaveLength(0);
  });

  it("keeps the URL hash synchronized when a home tool is opened", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/");

    render(<App />);
    await user.click(screen.getByRole("link", { name: /kompres pdf/i }));

    expect(window.location.hash).toBe("#compress");
    expect(await screen.findByRole("heading", { name: /kompres pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /kompres pdf/i })).toBeInTheDocument();
  });

  it("exposes semantic active states for navigation and controls", async () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: /semua alat/i })).toHaveAttribute("aria-current", "page");
    expect(header.getByRole("link", { name: /ruang kerja/i })).toBeInTheDocument();
    expect(header.getByRole("link", { name: /privasi & keamanan/i })).toHaveAttribute("href", "/#privacy-security");
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

    expect(screen.getByText(/pdfin memproses file langsung di browser anda/i)).toBeInTheDocument();
    expect(screen.getByRole("contentinfo").querySelectorAll("[aria-disabled='true']")).toHaveLength(0);
    const footer = within(screen.getByRole("contentinfo"));
    expect(footer.getByRole("link", { name: /privasi & keamanan/i })).toHaveAttribute("href", "/#privacy-security");
    expect(footer.getByRole("link", { name: /^github$/i })).toHaveAttribute("href", "https://github.com/bicilique");
    expect(footer.getByRole("link", { name: /self-hosting \/ on-premise/i })).toHaveAttribute("href", "mailto:afiffaizianur@gmail.com");
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
    expect(localStorage.getItem("pdfin-ws-theme")).toBe("dark");
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
    expect(localStorage.getItem("pdfin-ws-theme")).toBe("light");
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
});

describe("release documentation", () => {
  it("documents the canonical workspace route model and release verification", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toMatch(/canonical workspace/i);
    expect(readme).toMatch(/\/#merge/);
    expect(readme).toMatch(/\/#split/);
    expect(readme).toMatch(/GITHUB_PAGES=true npm run build/);
    expect(readme).toMatch(/output\/playwright/);
  });
});
