import { describe, expect, it, vi } from "vitest";
import { createAnalytics, MEASUREMENT_ID } from "./analytics.js";

function createDocumentStub() {
  const appended = [];
  return {
    head: {
      appendChild: (node) => appended.push(node),
    },
    createElement: (tagName) => ({
      tagName,
      async: false,
      src: "",
    }),
    appended,
  };
}

function normalizeDataLayer(dataLayer) {
  return dataLayer.map((entry) => Array.from(entry));
}

describe("analytics", () => {
  it("does not load Google Analytics or send events outside production", () => {
    const doc = createDocumentStub();
    const win = {};
    const analytics = createAnalytics({ isProd: false, documentRef: doc, windowRef: win });

    analytics.initAnalytics();
    analytics.trackPdfEvent("pdf_tool_opened", { tool: "merge" });

    expect(doc.appended).toEqual([]);
    expect(win.dataLayer).toBeUndefined();
  });

  it("loads gtag and sends safe event parameters in production", () => {
    const doc = createDocumentStub();
    const win = {};
    const now = new Date("2026-07-12T00:00:00.000Z");
    const analytics = createAnalytics({
      isProd: true,
      documentRef: doc,
      windowRef: win,
      now: () => now,
    });

    analytics.initAnalytics();
    analytics.trackPdfEvent("pdf_tool_opened", {
      tool: "merge",
      file_count: 2,
      file_type: "pdf",
      file_size_bucket: "0-10MB",
      filename: "secret.pdf",
      password: "secret",
      ocr_text: "hidden",
    });

    expect(doc.appended).toHaveLength(1);
    expect(doc.appended[0].async).toBe(true);
    expect(doc.appended[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
    expect(normalizeDataLayer(win.dataLayer)).toEqual([
      ["js", now],
      ["config", MEASUREMENT_ID],
      ["event", "pdf_tool_opened", {
        tool: "merge",
        file_count: 2,
        file_type: "pdf",
        file_size_bucket: "0-10MB",
      }],
    ]);
  });

  it("does not append the gtag script more than once", () => {
    const doc = createDocumentStub();
    const win = { gtag: vi.fn() };
    const analytics = createAnalytics({ isProd: true, documentRef: doc, windowRef: win });

    analytics.initAnalytics();
    analytics.initAnalytics();

    expect(doc.appended).toHaveLength(1);
  });
});
