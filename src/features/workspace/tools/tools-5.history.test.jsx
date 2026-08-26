import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TOOL_DEFS } from "./tools-1.jsx";
import "./tools-5.jsx";

describe("Edit PDF history", () => {
  it("shows a responsible-use disclosure in the edit panel", () => {
    render(<TOOL_DEFS.edit.Panel
      lang="id"
      opts={{ ...TOOL_DEFS.edit.defaults, loadedFor: "file-1", outputName: "hasil" }}
      setOpts={vi.fn()}
      ctx={{ files: [{ id: "file-1", name: "contoh.pdf" }] }}
    />);

    expect(screen.getByText(/gunakan fitur edit pdf dengan bijak/i)).toBeInTheDocument();
    expect(screen.getByText(/jangan menyalahgunakannya/i)).toBeInTheDocument();
  });

  it("invalidates the processed preview when a text position changes", () => {
    const change = { fileId: "file-1", srcIndex: 0, opIndex: 4, original: "Asli", text: "Pengganti" };
    const before = TOOL_DEFS.edit.previewKey({ objects: [], changes: [change] });
    const after = TOOL_DEFS.edit.previewKey({ objects: [], changes: [{ ...change, offset: { x: 0.1, y: 0.1 } }] });

    expect(after).not.toBe(before);
  });

  it("undo restores text changes from a completed drag gesture", () => {
    const previousChanges = [{
      fileId: "file-1", srcIndex: 0, opIndex: 4, original: "Asli", text: "Pengganti",
    }];
    const movedChanges = [{
      ...previousChanges[0], offset: { x: 0.1, y: 0.1 },
    }];
    const setOpts = vi.fn();

    const opts = {
      ...TOOL_DEFS.edit.defaults,
      loadedFor: "file-1",
      outputName: "hasil",
      changes: movedChanges,
      past: [{ objects: [], changes: previousChanges }],
    };
    render(<TOOL_DEFS.edit.Panel
      lang="id"
      opts={opts}
      setOpts={setOpts}
      ctx={{ files: [{ id: "file-1", name: "contoh.pdf" }] }}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Urungkan" }));

    const states = setOpts.mock.calls.map(([update]) => typeof update === "function" ? update(opts) : update);
    expect(states).toContainEqual(expect.objectContaining({
      changes: previousChanges,
      future: [{ objects: [], changes: movedChanges }],
    }));
  });
});
