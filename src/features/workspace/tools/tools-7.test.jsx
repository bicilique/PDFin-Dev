import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  function MovableLayer({ selected = false }) {
    const [opts, setOpts] = React.useState({
      changes: [{ fileId: "file-1", srcIndex: 0, opIndex: 4, original: "Asli", text: "Pengganti" }],
      selectedId: selected ? "file-1:0:4" : null,
    });
    return (
      <>
        <TextRunLayer page={{ fileId: "file-1", srcIndex: 0 }} opts={opts} setOpts={setOpts} lang="id" />
        <output data-testid="offset">{JSON.stringify(opts.changes[0]?.offset || null)}</output>
      </>
    );
  }

  function setDragGeometry(element) {
    const layer = element.closest("div[style*='inset: 0']");
    vi.spyOn(layer, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 400, bottom: 300, width: 400, height: 300, x: 0, y: 0, toJSON() {},
    });
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      left: 40, top: 60, right: 120, bottom: 75, width: 80, height: 15, x: 40, y: 60, toJSON() {},
    });
  }

  it("moves an edited text box by dragging the box directly", async () => {
    render(<MovableLayer />);
    const preview = await screen.findByRole("button", { name: "Asli" });
    setDragGeometry(preview);

    fireEvent.pointerDown(preview, { pointerId: 1, clientX: 80, clientY: 70 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 120, clientY: 100 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 120, clientY: 100 });

    expect(screen.getByTestId("offset")).toHaveTextContent('{"x":0.1,"y":0.1}');
    expect(preview.style.left).toBe("20%");
    expect(preview.style.top).toBe("30%");
  });

  it("offers a drag handle while the text input is active", async () => {
    render(<MovableLayer selected />);
    const handle = await screen.findByRole("button", { name: "Geser teks" });
    expect(handle).toBeVisible();
  });
});
