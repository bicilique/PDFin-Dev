import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DownloadCard } from "./DownloadCard.jsx";

describe("DownloadCard", () => {
  it("shows a Word document icon for DOCX output", () => {
    const { container } = render(
      <DownloadCard name="laporan.docx" meta="9 KB" onDownload={vi.fn()} />,
    );

    expect(container.querySelector(".tabler-icon-file-type-docx")).toBeInTheDocument();
    expect(container.querySelector(".tabler-icon-file-type-pdf")).not.toBeInTheDocument();
  });
});
