import { describe, expect, it } from "vitest";
import { PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";
import { getIndexableSeoPages, homeSeoPage, seoPages, SITE_BASE_PATH, SITE_URL } from "./seoPages.js";

describe("SEO page catalog", () => {
  it("defines one SEO page for every workspace tool", () => {
    expect(seoPages.map((page) => page.toolId)).toEqual(WORKSPACE_TOOL_IDS);
  });

  it("uses unique crawlable slugs", () => {
    const slugs = seoPages.map((page) => page.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+$/.test(slug))).toBe(true);
  });

  it("keeps prototype tools out of the sitemap index set", () => {
    const indexableToolIds = getIndexableSeoPages().map((page) => page.toolId);

    for (const prototypeToolId of PROTOTYPE_TOOL_IDS) {
      expect(indexableToolIds).not.toContain(prototypeToolId);
    }
  });

  it("marks all production tools as indexable", () => {
    const prototypeToolIds = Array.from(PROTOTYPE_TOOL_IDS);
    const productionToolIds = WORKSPACE_TOOL_IDS.filter((toolId) => !prototypeToolIds.includes(toolId));

    expect(getIndexableSeoPages().map((page) => page.toolId)).toEqual(productionToolIds);
  });

  it("publishes protect as available and keeps unlock as the only in-development security tool", () => {
    const protect = seoPages.find((page) => page.toolId === "protect");
    const unlock = seoPages.find((page) => page.toolId === "unlock");

    expect(protect.indexable).toBe(true);
    expect(protect.description).toMatch(/password/i);
    expect(protect.description).not.toMatch(/prototipe|simulasi/i);
    expect(unlock.indexable).toBe(false);
    expect(unlock.description).toMatch(/dalam pengembangan|simulasi/i);
  });

  it("has canonical custom-domain defaults", () => {
    expect(SITE_URL).toBe("https://www.pdfin.fun");
    expect(SITE_BASE_PATH).toBe("/");
    expect(homeSeoPage.indexable).toBe(true);
    expect(homeSeoPage.h1).toBe("Alat PDF gratis yang bekerja di perangkat Anda");
    expect(homeSeoPage.description).toMatch(/tanpa mengunggah file ke server/i);
  });

  it("has complete metadata for every static page", () => {
    for (const page of [homeSeoPage, ...seoPages]) {
      expect(page.title.length).toBeGreaterThan(10);
      expect(page.description.length).toBeGreaterThan(40);
      expect(page.h1.length).toBeGreaterThan(5);
      expect(page.intro.length).toBeGreaterThan(40);
    }
  });
});
