import React from "react";
import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
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
    expect(screen.getByText(/gabungkan beberapa file pdf menjadi satu/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pdf hingga 100 mb/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/tambahkan minimal 2 file pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/file anda diproses di browser/i)).toBeInTheDocument();
  });

  it("renders the home catalog with deterministic workspace links", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("link", { name: /gabung pdf/i })).toHaveAttribute("href", "/#merge");
    expect(screen.getByRole("link", { name: /pisah pdf/i })).toHaveAttribute("href", "/#split");
    expect(screen.getByRole("link", { name: /metadata pdf/i })).toHaveAttribute("href", "/#metadata");
    expect(screen.getByRole("link", { name: /ocr pdf/i })).toHaveAttribute("href", "/#ocr");
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

    expect(screen.getByRole("link", { name: /semua alat/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /dark mode/i })).toHaveAttribute("aria-pressed", "false");

    cleanup();
    window.history.replaceState(null, "", "/#merge");
    render(<App />);

    expect(await screen.findByRole("button", { name: /gabung pdf/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /dark mode/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("offers a home skip link that moves keyboard focus to the tool catalog", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    const skipLink = screen.getByRole("link", { name: /lewati ke katalog alat/i });
    expect(skipLink).toHaveAttribute("href", "#home-main");

    skipLink.click();

    expect(document.activeElement).toHaveAttribute("id", "home-main");
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
