import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";

vi.mock("./qpdfEncrypt.js", () => ({
  encryptPdfWithQpdf: vi.fn(async (inputBytes, userPassword, ownerPassword) => {
    const dir = mkdtempSync(join(tmpdir(), "pdfin-qpdf-mock-"));
    const inputPath = join(dir, "input.pdf");
    const outputPath = join(dir, "output.pdf");
    writeFileSync(inputPath, inputBytes);
    execFileSync("qpdf", ["--encrypt", userPassword, ownerPassword, "256", "--", inputPath, outputPath], { stdio: "pipe" });
    return readFileSync(outputPath);
  }),
}));

function hasQpdf() {
  try {
    execFileSync("qpdf", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function makeSourcePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([300, 200]);
  page.drawText("PDFin protect test", { x: 24, y: 120, size: 18, font });
  return doc.save();
}

describe("PdfProcess.protect", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it.runIf(hasQpdf())("creates an interoperable AES-256 encrypted PDF that requires the correct password", async () => {
    const bytes = await makeSourcePdf();
    PdfEngine.files.set("secure-doc", {
      id: "secure-doc",
      name: "secure.pdf",
      size: bytes.length,
      bytes,
      pageCount: 1,
    });

    const result = await PdfProcess.protect([{ id: "secure-doc", name: "secure.pdf" }], {
      password: "correct horse battery staple",
      outputName: "secure-terkunci.pdf",
    });
    const output = result.outputs[0];
    const encrypted = new Uint8Array(await output.blob.arrayBuffer());
    const text = new TextDecoder("latin1").decode(encrypted);
    expect(output.name).toBe("secure-terkunci.pdf");
    expect(text).toContain("/Encrypt");
    expect(text).toContain("/R 6");
    expect(text).toContain("/AESV3");

    const dir = mkdtempSync(join(tmpdir(), "pdfin-protect-"));
    const encryptedPath = join(dir, "encrypted.pdf");
    const decryptedPath = join(dir, "decrypted.pdf");
    writeFileSync(encryptedPath, encrypted);

    expect(() => execFileSync("qpdf", ["--check", encryptedPath], { stdio: "pipe" })).toThrow();
    expect(() => execFileSync("qpdf", ["--password=wrong", "--check", encryptedPath], { stdio: "pipe" })).toThrow();
    execFileSync("qpdf", ["--password=correct horse battery staple", "--decrypt", encryptedPath, decryptedPath], { stdio: "pipe" });
    execFileSync("qpdf", ["--check", decryptedPath], { stdio: "pipe" });
    expect(execFileSync("qpdf", ["--show-npages", decryptedPath], { encoding: "utf8" }).trim()).toBe("1");

    const decrypted = await PDFDocument.load(new Uint8Array(readFileSync(decryptedPath)));
    expect(decrypted.getPageCount()).toBe(1);
  });

  it("rejects already encrypted source PDFs before producing output", async () => {
    const bytes = new TextEncoder().encode("%PDF-1.7\ntrailer\n<< /Encrypt 3 0 R >>\n%%EOF");
    PdfEngine.files.set("already-encrypted", {
      id: "already-encrypted",
      name: "locked.pdf",
      size: bytes.length,
      bytes,
      pageCount: 1,
    });

    await expect(PdfProcess.protect([{ id: "already-encrypted", name: "locked.pdf" }], {
      password: "correct horse battery staple",
      outputName: "locked-terkunci.pdf",
    })).rejects.toThrow("PDF_ALREADY_ENCRYPTED");
  });
});
