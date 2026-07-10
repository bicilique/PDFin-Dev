import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolTile } from "./ToolTile.jsx";

describe("ToolTile", () => {
  it("renders disabled tools without link affordance or keyboard link focus", () => {
    render(
      <ToolTile
        disabled
        title="Coming Later"
        description="This tool is not available yet."
        icon={<span aria-hidden="true">T</span>}
      />,
    );

    expect(screen.queryByRole("link", { name: /coming later/i })).not.toBeInTheDocument();
    expect(screen.getByText("Coming Later").closest("[aria-disabled='true']")).toBeInTheDocument();
    expect(screen.getByText("Coming Later").closest("[tabindex]")).not.toBeInTheDocument();
  });
});
