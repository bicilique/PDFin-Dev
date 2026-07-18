import {
  PDFDocument,
  StandardFonts,
  TextRenderingMode,
  beginText,
  degrees,
  endText,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setFontAndSize,
  setTextMatrix,
  setTextRenderingMode,
  showText,
} from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { createTesseractOcrEngine } from "./ocrEngine.js";
import { encryptPdfWithQpdf } from "./qpdfEncrypt.js";
import { sanitizePdfBaseName, createNameDeduper } from "./outputName.js";

// PDFin workspace — real PDF processing via pdf-lib (+ pdf.js rendering for raster ops).
// All functions return { outputs: [{ name, blob, size, pages }] }.
  const P = () => ({ PDFDocument, StandardFonts, degrees, rgb });
  const E = () => PdfEngine;

  const srcCache = new Map(); // fileId -> PDFDocument promise
  function srcDoc(fileId) {
    if (!srcCache.has(fileId)) {
      const rec = E().files.get(fileId);
      srcCache.set(fileId, P().PDFDocument.load(rec.bytes, { ignoreEncryption: true }));
    }
    return srcCache.get(fileId);
  }
  function clearCache() { srcCache.clear(); }

  function out(name, bytes, pages) {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: "application/pdf" });
    return { name, blob, size: blob.size, pages };
  }
  const tick = () => new Promise((r) => setTimeout(r, 0));

  function randomOwnerPassword() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hasDigitalSignatureMarkers(bytes) {
    if (!bytes) return false;
    const head = bytes.slice(0, Math.min(bytes.length, 256 * 1024));
    const tail = bytes.slice(Math.max(0, bytes.length - 256 * 1024));
    const text = new TextDecoder("latin1").decode(head) + "\n" + new TextDecoder("latin1").decode(tail);
    return /\/ByteRange\b/.test(text) || /\/Sig\b/.test(text) || /\/FT\s*\/Sig\b/.test(text);
  }

  function hasEncryptionMarkers(bytes) {
    if (!bytes) return false;
    const tail = bytes.slice(Math.max(0, bytes.length - 256 * 1024));
    const text = new TextDecoder("latin1").decode(tail);
    return /\/Encrypt\b/.test(text);
  }

  function sourceHasDigitalSignature(fileId) {
    return hasDigitalSignatureMarkers(E().files.get(fileId)?.bytes);
  }

  function sourceHasEncryption(fileId) {
    return hasEncryptionMarkers(E().files.get(fileId)?.bytes);
  }

  function assertNotCancelled(signal) {
    if (signal?.aborted) throw new Error("OCR_CANCELLED");
  }

  function liveOcrPages(files, opts = {}) {
    const explicitPages = (opts.pages || []).filter((p) => !p.deleted);
    if (explicitPages.length) return explicitPages;
    const rec = E().files.get(files[0]?.id);
    if (!rec) return [];
    return Array.from({ length: rec.pageCount }, (_, index) => ({
      fileId: rec.id,
      srcIndex: index,
      rotation: 0,
      sourceName: rec.name,
      sourcePageNumber: index + 1,
    }));
  }

  function selectedOcrPageIndexes(opts, pageCount) {
    if (!opts?.range || opts.pageMode !== "range") return null;
    return new Set(parseRange(opts.range, pageCount));
  }

  function normalizeOcrWords(result) {
    return (result?.words || [])
      .map((word) => ({
        text: String(word.text || "").trim(),
        confidence: Number.isFinite(word.confidence) ? word.confidence : Number(word.confidence || 0),
        bbox: word.bbox,
      }))
      .filter((word) => word.text && word.bbox);
  }

  function addInvisibleOcrText(page, font, ocrResult) {
    const words = normalizeOcrWords(ocrResult);
    if (!words.length) return [];
    page.setFont(font);
    const fontKey = page.fontKey || font.name;
    const { width, height } = page.getSize();
    const imageWidth = Number(ocrResult?.image?.width) || width;
    const imageHeight = Number(ocrResult?.image?.height) || height;
    const overlay = [];

    for (const word of words) {
      const box = word.bbox;
      const x0 = Number(box.x0 ?? box.left ?? 0);
      const y0 = Number(box.y0 ?? box.top ?? 0);
      const x1 = Number(box.x1 ?? (box.left + box.width));
      const y1 = Number(box.y1 ?? (box.top + box.height));
      if (![x0, y0, x1, y1].every(Number.isFinite) || x1 <= x0 || y1 <= y0) continue;

      const x = (x0 / imageWidth) * width;
      const y = height - (y1 / imageHeight) * height;
      const targetWidth = Math.max(1, ((x1 - x0) / imageWidth) * width);
      const targetHeight = Math.max(1, ((y1 - y0) / imageHeight) * height * 0.86);
      const textWidth = Math.max(0.1, font.widthOfTextAtSize(word.text, 1));
      const xScale = targetWidth / textWidth;
      const encoded = font.encodeText(word.text);

      page.pushOperators(
        pushGraphicsState(),
        beginText(),
        setTextRenderingMode(TextRenderingMode.Invisible),
        setFontAndSize(fontKey, 1),
        setTextMatrix(xScale, 0, 0, targetHeight, x, y),
        showText(encoded),
        endText(),
        popGraphicsState()
      );

      overlay.push({
        text: word.text,
        confidence: word.confidence,
        rect: {
          x: x / width,
          y: (height - y - targetHeight) / height,
          w: targetWidth / width,
          h: targetHeight / height,
        },
      });
    }

    return overlay;
  }

  // Assemble a new PDF from a worklist of pages [{fileId, srcIndex, rotation, deleted}].
  async function assemble(pages, name, onProgress) {
    const { PDFDocument, degrees } = P();
    const doc = await PDFDocument.create();
    const live = pages.filter((p) => !p.deleted);
    // Group contiguous copies per source for speed
    for (let i = 0; i < live.length; i++) {
      const pg = live[i];
      const src = await srcDoc(pg.fileId);
      const [copied] = await doc.copyPages(src, [pg.srcIndex]);
      if (pg.rotation) copied.setRotation(degrees(((copied.getRotation().angle + pg.rotation) % 360 + 360) % 360));
      doc.addPage(copied);
      if (onProgress) onProgress(((i + 1) / live.length) * 90);
      if (i % 10 === 9) await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return { outputs: [out(name, bytes, live.length)] };
  }

  async function split(pages, opts, baseName, onProgress) {
    const base = sanitizePdfBaseName(baseName) || "hasil";
    const dedupe = createNameDeduper();
    const live = pages.filter((p) => !p.deleted);
    const groups = [];
    if (opts.mode === "every") {
      const n = Math.max(1, opts.n | 0);
      for (let i = 0; i < live.length; i += n) groups.push(live.slice(i, i + n));
    } else if (opts.mode === "range") {
      const sel = parseRange(opts.range, live.length);
      groups.push(sel.map((i) => live[i]));
    } else {
      groups.push(live.filter((p) => opts.selected.has(p.uid)));
    }
    const outputs = [];
    const { PDFDocument, degrees } = P();
    let done = 0, total = groups.reduce((a, g) => a + g.length, 0) || 1;
    for (let g = 0; g < groups.length; g++) {
      if (!groups[g].length) continue;
      const doc = await PDFDocument.create();
      for (const pg of groups[g]) {
        const src = await srcDoc(pg.fileId);
        const [c] = await doc.copyPages(src, [pg.srcIndex]);
        if (pg.rotation) c.setRotation(degrees(((c.getRotation().angle + pg.rotation) % 360 + 360) % 360));
        doc.addPage(c);
        done++; if (onProgress) onProgress((done / total) * 95);
      }
      const suffix = groups.length > 1 ? "-" + String(g + 1) : opts.mode === "range" ? "-" + opts.range.replace(/[^0-9,-]/g, "") : "-halaman";
      outputs.push(out(dedupe(base + suffix + ".pdf"), await doc.save(), groups[g].length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  function parseRange(str, max) {
    const set = new Set();
    (str || "").split(",").forEach((part) => {
      const m = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) { for (let i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= max) set.add(i - 1); }
      else if (/^\d+$/.test(part.trim())) { const i = +part.trim(); if (i >= 1 && i <= max) set.add(i - 1); }
    });
    return [...set].sort((a, b) => a - b);
  }

  function appliesToPage(opts, index, pageCount) {
    if (opts?.excludeFirst && index === 0) return false;
    if (opts?.scope !== "range") return true;
    return parseRange(opts.range, pageCount).includes(index);
  }

  function appliedPageNumber(opts, index, pageCount) {
    const start = Number(opts?.startAt) || 0;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      if (appliesToPage(opts, i, pageCount)) offset++;
    }
    return start + offset;
  }

  function hexRgb(hex, fallback) {
    const value = String(hex || "").trim();
    const m = value.match(/^#?([0-9a-f]{6})$/i);
    if (!m) return fallback;
    const n = Number.parseInt(m[1], 16);
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }

  // Re-render every page to JPEG at a quality level and rebuild the PDF.
  async function compress(pages, opts, name, onProgress) {
    const { PDFDocument } = P();
    const doc = await PDFDocument.create();
    const live = pages.filter((p) => !p.deleted);
    const widths = { low: 900, medium: 1200, high: 1600 };
    const quality = { low: 0.5, medium: 0.68, high: 0.82 }[opts.level];
    for (let i = 0; i < live.length; i++) {
      const pg = live[i];
      const size = await E().pageSize(pg.fileId, pg.srcIndex + 1);
      const canvas = await E().renderPage(pg.fileId, pg.srcIndex + 1, widths[opts.level] / 2);
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
      const jpg = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const page = doc.addPage([size.width, size.height]);
      page.drawImage(jpg, { x: 0, y: 0, width: size.width, height: size.height });
      if (onProgress) onProgress(((i + 1) / live.length) * 92);
      await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return { outputs: [out(name, bytes, live.length)] };
  }

  async function watermark(files, opts, onProgress) {
    const { PDFDocument, StandardFonts, degrees, rgb } = P();
    const outputs = [];
    const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
    const dedupe = createNameDeduper();
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      let image = null;
      if (opts.kind === "image" && opts.imageBytes) {
        image = opts.imageType === "image/png" ? await doc.embedPng(opts.imageBytes) : await doc.embedJpg(opts.imageBytes);
      }
      const pagesArr = doc.getPages();
      for (let i = 0; i < pagesArr.length; i++) {
        if (!appliesToPage(opts, i, pagesArr.length)) {
          if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
          continue;
        }
        const page = pagesArr[i];
        const { width, height } = page.getSize();
        const pos = anchor(opts.align, width, height);
        if (opts.kind === "text") {
          const size = (opts.size / 100) * (width / 3);
          const tw = font.widthOfTextAtSize(opts.text, size);
          page.drawText(opts.text, {
            x: pos.x - (tw / 2) * Math.cos((opts.rotation * Math.PI) / 180),
            y: pos.y - (tw / 2) * Math.sin((opts.rotation * Math.PI) / 180),
            size, font, color: hexRgb(opts.color, rgb(0.42, 0.4, 0.53)), opacity: opts.opacity / 100, rotate: degrees(opts.rotation),
          });
        } else if (image) {
          const w = (opts.size / 100) * width * 0.9;
          const h = w * (image.height / image.width);
          page.drawImage(image, { x: pos.x - w / 2, y: pos.y - h / 2, width: w, height: h, opacity: opts.opacity / 100, rotate: degrees(opts.rotation) });
        }
        if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
      }
      const fallbackBase = sanitizePdfBaseName(files[f].name) || `dokumen-${f + 1}`;
      const name = customBase
        ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
        : `${fallbackBase}-watermark.pdf`;
      outputs.push(out(dedupe(name), await doc.save(), pagesArr.length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  function anchor(align, w, h) {
    const xs = { left: w * 0.25, center: w / 2, right: w * 0.75 };
    const ys = { top: h * 0.8, middle: h / 2, bottom: h * 0.18 };
    const [v, hz] = align.split("-"); // e.g. "middle-center"
    return { x: xs[hz] || w / 2, y: ys[v] || h / 2 };
  }

  const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792], f4: [609.45, 935.43] };

  async function imagesToPdf(images, opts, name, onProgress) {
    const { PDFDocument } = P();
    const doc = await PDFDocument.create();
    for (let i = 0; i < images.length; i++) {
      const rec = E().files.get(images[i].id);
      let dims = PAGE_SIZES[opts.pageSize] || PAGE_SIZES.a4;
      if (opts.orientation === "landscape") dims = [dims[1], dims[0]];
      if (opts.pageSize === "fit") dims = [rec.width * 0.75, rec.height * 0.75];
      const margin = { none: 0, small: 24, large: 56 }[opts.margin] || 0;
      const img = rec.type === "image/png"
        ? await doc.embedPng(rec.bytes)
        : await doc.embedJpg(rec.bytes);
      const page = doc.addPage(dims);
      const availW = dims[0] - margin * 2, availH = dims[1] - margin * 2;
      const scale = Math.min(availW / img.width, availH / img.height);
      const w = img.width * scale, h = img.height * scale;
      page.drawImage(img, { x: (dims[0] - w) / 2, y: (dims[1] - h) / 2, width: w, height: h });
      if (onProgress) onProgress(((i + 1) / images.length) * 92);
      await tick();
    }
    const bytes = await doc.save();
    if (onProgress) onProgress(100);
    return { outputs: [out(name, bytes, images.length)] };
  }

  async function pdfToImages(pages, opts, baseName, onProgress) {
    const base = sanitizePdfBaseName(baseName) || "halaman";
    const dedupe = createNameDeduper();
    const live = pages.filter((p) => !p.deleted && (!opts.selected || !opts.selected.size || opts.selected.has(p.uid)));
    const outputs = [];
    const scaleW = (opts.dpi / 72) * 595; // approx A4 width at dpi
    for (let i = 0; i < live.length; i++) {
      const canvas = await E().renderPage(live[i].fileId, live[i].srcIndex + 1, scaleW / 2);
      const mime = opts.format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((r) => canvas.toBlob(r, mime, opts.format === "png" ? undefined : opts.quality / 100));
      outputs.push({ name: dedupe(`${base}-${i + 1}.${opts.format}`), blob, size: blob.size, isImage: true });
      if (onProgress) onProgress(((i + 1) / live.length) * 96);
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function pageNumbers(files, opts, onProgress) {
    const { PDFDocument, StandardFonts, rgb } = P();
    const fonts = { helvetica: StandardFonts.Helvetica, times: StandardFonts.TimesRoman, courier: StandardFonts.Courier };
    const colors = { ink: rgb(0.17, 0.14, 0.3), gray: rgb(0.55, 0.53, 0.65), violet: rgb(0.33, 0.09, 0.71) };
    const outputs = [];
    const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
    const dedupe = createNameDeduper();
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(fonts[opts.font] || fonts.helvetica);
      const pagesArr = doc.getPages();
      pagesArr.forEach((page, i) => {
        if (!appliesToPage(opts, i, pagesArr.length)) {
          if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
          return;
        }
        const { width, height } = page.getSize();
        const number = appliedPageNumber(opts, i, pagesArr.length);
        const label = opts.format === "n_of_total" ? `${number} / ${pagesArr.length}` : opts.format === "page_n" ? `Halaman ${number}` : String(number);
        const tw = font.widthOfTextAtSize(label, opts.fontSize);
        const x = opts.position.endsWith("left") ? opts.margin : opts.position.endsWith("center") ? (width - tw) / 2 : width - opts.margin - tw;
        const y = opts.position.startsWith("top") ? height - opts.margin - opts.fontSize : opts.margin;
        page.drawText(label, { x, y, size: opts.fontSize, font, color: colors[opts.color] || colors.ink });
        if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
      });
      const fallbackBase = sanitizePdfBaseName(files[f].name) || `dokumen-${f + 1}`;
      const name = customBase
        ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
        : `${fallbackBase}-bernomor.pdf`;
      outputs.push(out(dedupe(name), await doc.save(), pagesArr.length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function flatten(files, opts, onProgress) {
    const { PDFDocument } = P();
    const outputs = [];
    const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
    const dedupe = createNameDeduper();
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      if (opts.forms) {
        try { doc.getForm().flatten(); } catch (e) { /* no form fields — pass through */ }
      }
      if (opts.annotations) {
        // pdf-lib does not provide a safe generic annotation rasterization API.
        // Keep annotations intact rather than deleting review/comment data.
      }
      if (onProgress) onProgress(((f + 1) / files.length) * 90);
      const fallbackBase = sanitizePdfBaseName(files[f].name) || `dokumen-${f + 1}`;
      const name = customBase
        ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
        : `${fallbackBase}-flat.pdf`;
      outputs.push(out(dedupe(name), await doc.save(), doc.getPageCount()));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function metadata(files, opts, onProgress) {
    const { PDFDocument } = P();
    const doc = await PDFDocument.load(E().files.get(files[0].id).bytes, { ignoreEncryption: true, updateMetadata: true });
    doc.setTitle(String(opts.title || ""));
    doc.setAuthor(String(opts.author || ""));
    doc.setSubject(String(opts.subject || ""));
    doc.setKeywords((Array.isArray(opts.keywords) ? opts.keywords : String(opts.keywords || "").split(",")).map((s) => String(s).trim()).filter(Boolean));
    doc.setModificationDate(new Date());
    if (onProgress) onProgress(80);
    const base = files[0].name.replace(/\.pdf$/i, "");
    const res = { outputs: [out(opts.outputName || base + "-metadata.pdf", await doc.save(), doc.getPageCount())] };
    if (onProgress) onProgress(100);
    return res;
  }

  async function readMetadata(fileId) {
    const { PDFDocument } = P();
    const doc = await PDFDocument.load(E().files.get(fileId).bytes, { ignoreEncryption: true });
    return {
      title: safe(() => doc.getTitle()) || "",
      author: safe(() => doc.getAuthor()) || "",
      subject: safe(() => doc.getSubject()) || "",
      keywords: safe(() => doc.getKeywords()) || "",
    };
  }
  function safe(fn) { try { return fn(); } catch (e) { return ""; } }

  async function sign(files, opts, onProgress) {
    const { PDFDocument } = P();
    const placements = opts.placements || [];
    // Files without their own placements inherit the placement set of the
    // first file (in `files` order) that has one, mapped onto the same
    // page index (clamped to that file's own page count).
    const templateFile = files.find((f) => placements.some((pl) => pl.fileId === f.id));
    const templateFileId = templateFile?.id;
    const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
    const dedupe = createNameDeduper();
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      const doc = await PDFDocument.load(E().files.get(file.id).bytes, { ignoreEncryption: true });
      const pageCount = doc.getPageCount();
      let filePlacements = placements.filter((pl) => pl.fileId === file.id);
      if (!filePlacements.length && templateFileId) {
        filePlacements = placements
          .filter((pl) => pl.fileId === templateFileId)
          .map((pl) => ({ ...pl, srcIndex: Math.min(pl.srcIndex, Math.max(0, pageCount - 1)) }));
      }
      for (let i = 0; i < filePlacements.length; i++) {
        const placement = filePlacements[i];
        const bytes = placement.source?.bytes;
        if (!bytes) continue;
        const image = placement.source?.type === "image/jpeg"
          ? await doc.embedJpg(bytes)
          : await doc.embedPng(bytes);
        const page = doc.getPage(Math.min(placement.srcIndex, pageCount - 1));
        const { width, height } = page.getSize();
        const rect = placement.rect || { x: 0.36, y: 0.72, w: 0.28 };
        const w = rect.w * width;
        const h = w * (image.height / image.width);
        page.drawImage(image, {
          x: Math.min(width - w, Math.max(0, rect.x * width)),
          y: Math.min(height - h, Math.max(0, height - rect.y * height - h)),
          width: w,
          height: h,
        });
      }
      if (onProgress) onProgress(((f + 1) / files.length) * 90);
      const fallbackBase = sanitizePdfBaseName(file.name) || `dokumen-${f + 1}`;
      const name = customBase
        ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
        : `${fallbackBase}-diparaf.pdf`;
      outputs.push(out(dedupe(name), await doc.save(), pageCount));
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function protect(files, opts, onProgress) {
    const rec = E().files.get(files[0].id);
    if (!rec?.bytes) throw new Error("PDF_SOURCE_MISSING");
    if (hasEncryptionMarkers(rec.bytes)) throw new Error("PDF_ALREADY_ENCRYPTED");
    const password = String(opts.password || opts.pw || "");
    if (!password) throw new Error("PDF_PASSWORD_REQUIRED");
    if (onProgress) onProgress(8);
    await tick();
    const encrypted = await encryptPdfWithQpdf(rec.bytes, password, opts.ownerPassword || randomOwnerPassword());
    if (onProgress) onProgress(96);
    await tick();
    const base = rec.name.replace(/\.pdf$/i, "");
    const res = { outputs: [out(opts.outputName || base + "-terkunci.pdf", encrypted, rec.pageCount)] };
    if (onProgress) onProgress(100);
    return res;
  }

  async function ocr(files, opts = {}, onProgress) {
    const rec = E().files.get(files[0]?.id);
    if (!rec?.bytes) throw new Error("PDF_SOURCE_MISSING");
    if (hasEncryptionMarkers(rec.bytes)) throw new Error("PDF_ALREADY_ENCRYPTED");

    const signal = opts.signal;
    assertNotCancelled(signal);

    const live = liveOcrPages(files, opts);
    const pageCount = live.length;
    const selectedIndexes = selectedOcrPageIndexes(opts, pageCount);
    const engine = opts.engine || await createTesseractOcrEngine({
      language: opts.language || "ind+eng",
      quality: opts.quality || "balanced",
      onStatus: (status) => {
        if (onProgress && status.progress) {
          onProgress(Math.min(96, Math.max(1, status.progress * 100)), { phase: status.status || "ocr" });
        }
      },
    });

    const processedPages = [];
    const skippedTextPages = [];
    const failedPages = [];
    const lowConfidencePages = [];
    const overlays = {};
    try {
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const sourceDocs = new Map();

      for (let i = 0; i < live.length; i++) {
        assertNotCancelled(signal);
        const pageRef = live[i];
        if (!sourceDocs.has(pageRef.fileId)) sourceDocs.set(pageRef.fileId, await srcDoc(pageRef.fileId));
        const src = sourceDocs.get(pageRef.fileId);
        const [copied] = await doc.copyPages(src, [pageRef.srcIndex]);
        if (pageRef.rotation) copied.setRotation(degrees(((copied.getRotation().angle + pageRef.rotation) % 360 + 360) % 360));
        doc.addPage(copied);
      }
      const copiedPages = doc.getPages();

      const totalToCheck = selectedIndexes ? selectedIndexes.size : live.length;
      if (!totalToCheck) throw new Error("OCR_NO_PAGES_SELECTED");
      let completed = 0;

      for (let i = 0; i < live.length; i++) {
        const pageNumber = i + 1;
        const pageRef = live[i];
        if (selectedIndexes && !selectedIndexes.has(i)) continue;
        assertNotCancelled(signal);

        onProgress && onProgress((completed / totalToCheck) * 88, {
          phase: "detect",
          page: pageNumber,
          total: live.length,
          done: completed,
        });

        const hasNativeText = opts.pageMode !== "all" && await engine.analyzePageText(pageRef.fileId, pageRef.srcIndex + 1, pageRef);
        if (hasNativeText) {
          skippedTextPages.push(pageNumber);
          completed++;
          onProgress && onProgress((completed / totalToCheck) * 88, {
            phase: "skipped",
            page: pageNumber,
            total: live.length,
            done: completed,
          });
          continue;
        }

        try {
          const result = await engine.recognizePage(pageRef.fileId, pageRef.srcIndex + 1, pageRef, (detail) => {
            onProgress && onProgress((completed / totalToCheck) * 88, {
              ...detail,
              page: pageNumber,
              total: live.length,
              done: completed,
            });
          });
          assertNotCancelled(signal);
          const overlay = addInvisibleOcrText(copiedPages[i], font, result);
          overlays[pageNumber] = overlay;
          processedPages.push(pageNumber);
          const confidentWords = overlay.filter((word) => Number.isFinite(word.confidence));
          if (confidentWords.length) {
            const avg = confidentWords.reduce((sum, word) => sum + word.confidence, 0) / confidentWords.length;
            if (avg < 62) lowConfidencePages.push(pageNumber);
          }
        } catch (error) {
          if (error?.message === "OCR_CANCELLED") throw error;
          failedPages.push({ page: pageNumber, message: error?.message || "OCR_PAGE_FAILED" });
        }
        completed++;
        onProgress && onProgress((completed / totalToCheck) * 88, {
          phase: "page-complete",
          page: pageNumber,
          total: live.length,
          done: completed,
        });
        await tick();
      }

      if (!processedPages.length && skippedTextPages.length && !failedPages.length && opts.pageMode !== "all") {
        return {
          outputs: [],
          ocr: {
            noScannedPages: true,
            processedPages,
            skippedTextPages,
            failedPages,
            lowConfidencePages,
            overlays,
          },
        };
      }

      assertNotCancelled(signal);
      const bytes = await doc.save({ useObjectStreams: false });
      onProgress && onProgress(100, { phase: "done", total: live.length, done: processedPages.length });
      return {
        outputs: [out(opts.outputName || rec.name.replace(/\.pdf$/i, "-ocr.pdf"), bytes, pageCount)],
        ocr: {
          processedPages,
          skippedTextPages,
          failedPages,
          lowConfidencePages,
          overlays,
        },
      };
    } finally {
      await engine.terminate?.();
    }
  }

  // Simulated ops (encryption + OCR are out of scope for this prototype engine):
  // output is a faithful copy; UI labels these as prototype simulations.
  async function passthrough(files, suffix, onProgress, slow) {
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const rec = E().files.get(files[f].id);
      const steps = slow ? 24 : 8;
      for (let s = 0; s < steps; s++) {
        await new Promise((r) => setTimeout(r, slow ? 140 : 60));
        if (onProgress) onProgress(((f + (s + 1) / steps) / files.length) * 100);
      }
      const base = rec.name.replace(/\.pdf$/i, "");
      outputs.push(out(base + suffix + ".pdf", rec.bytes.slice(), rec.pageCount));
    }
    return { outputs };
  }

export const PdfProcess = {
    clearCache, assemble, split, parseRange, compress, watermark, imagesToPdf,
    pdfToImages, pageNumbers, flatten, metadata, readMetadata, sign, protect,
    ocr, passthrough, hasDigitalSignatureMarkers, hasEncryptionMarkers,
    sourceHasDigitalSignature, sourceHasEncryption,
  };
