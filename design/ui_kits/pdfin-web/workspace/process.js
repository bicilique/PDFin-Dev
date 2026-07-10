// PDFin workspace — real PDF processing via pdf-lib (+ pdf.js rendering for raster ops).
// Exposes window.PdfProcess. All functions return { outputs: [{ name, blob, size, pages }] }.
(function () {
  const P = () => window.PDFLib;
  const E = () => window.PdfEngine;

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
      outputs.push(out(baseName + suffix + ".pdf", await doc.save(), groups[g].length));
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
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      let image = null;
      if (opts.kind === "image" && opts.imageBytes) {
        image = opts.imageType === "image/png" ? await doc.embedPng(opts.imageBytes) : await doc.embedJpg(opts.imageBytes);
      }
      const pagesArr = doc.getPages();
      for (let i = 0; i < pagesArr.length; i++) {
        const page = pagesArr[i];
        const { width, height } = page.getSize();
        const pos = anchor(opts.align, width, height);
        if (opts.kind === "text") {
          const size = (opts.size / 100) * (width / 3);
          const tw = font.widthOfTextAtSize(opts.text, size);
          page.drawText(opts.text, {
            x: pos.x - (tw / 2) * Math.cos((opts.rotation * Math.PI) / 180),
            y: pos.y - (tw / 2) * Math.sin((opts.rotation * Math.PI) / 180),
            size, font, color: rgb(0.42, 0.4, 0.53), opacity: opts.opacity / 100, rotate: degrees(opts.rotation),
          });
        } else if (image) {
          const w = (opts.size / 100) * width * 0.9;
          const h = w * (image.height / image.width);
          page.drawImage(image, { x: pos.x - w / 2, y: pos.y - h / 2, width: w, height: h, opacity: opts.opacity / 100, rotate: degrees(opts.rotation) });
        }
        if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
      }
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-watermark.pdf", await doc.save(), pagesArr.length));
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
    const live = pages.filter((p) => !p.deleted && (!opts.selected || !opts.selected.size || opts.selected.has(p.uid)));
    const outputs = [];
    const scaleW = (opts.dpi / 72) * 595; // approx A4 width at dpi
    for (let i = 0; i < live.length; i++) {
      const canvas = await E().renderPage(live[i].fileId, live[i].srcIndex + 1, scaleW / 2);
      const mime = opts.format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((r) => canvas.toBlob(r, mime, opts.format === "png" ? undefined : opts.quality / 100));
      outputs.push({ name: `${baseName}-${i + 1}.${opts.format}`, blob, size: blob.size, isImage: true });
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
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(fonts[opts.font] || fonts.helvetica);
      const pagesArr = doc.getPages();
      pagesArr.forEach((page, i) => {
        const { width, height } = page.getSize();
        const label = opts.format === "n_of_total" ? `${i + 1} / ${pagesArr.length}` : opts.format === "page_n" ? `Halaman ${i + 1}` : String(i + 1);
        const tw = font.widthOfTextAtSize(label, opts.fontSize);
        const x = opts.position.endsWith("left") ? opts.margin : opts.position.endsWith("center") ? (width - tw) / 2 : width - opts.margin - tw;
        const y = opts.position.startsWith("top") ? height - opts.margin - opts.fontSize : opts.margin;
        page.drawText(label, { x, y, size: opts.fontSize, font, color: colors[opts.color] || colors.ink });
        if (onProgress) onProgress(((f + (i + 1) / pagesArr.length) / files.length) * 95);
      });
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-bernomor.pdf", await doc.save(), pagesArr.length));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function flatten(files, opts, onProgress) {
    const { PDFDocument } = P();
    const outputs = [];
    for (let f = 0; f < files.length; f++) {
      const doc = await PDFDocument.load(E().files.get(files[f].id).bytes, { ignoreEncryption: true });
      try { doc.getForm().flatten(); } catch (e) { /* no form fields — pass through */ }
      if (onProgress) onProgress(((f + 1) / files.length) * 90);
      const base = files[f].name.replace(/\.pdf$/i, "");
      outputs.push(out(base + "-flat.pdf", await doc.save(), doc.getPageCount()));
      await tick();
    }
    if (onProgress) onProgress(100);
    return { outputs };
  }

  async function metadata(files, opts, onProgress) {
    const { PDFDocument } = P();
    const doc = await PDFDocument.load(E().files.get(files[0].id).bytes, { ignoreEncryption: true, updateMetadata: true });
    if (opts.title != null) doc.setTitle(opts.title);
    if (opts.author != null) doc.setAuthor(opts.author);
    if (opts.subject != null) doc.setSubject(opts.subject);
    if (opts.keywords != null) doc.setKeywords(opts.keywords.split(",").map((s) => s.trim()).filter(Boolean));
    doc.setModificationDate(new Date());
    if (onProgress) onProgress(80);
    const base = files[0].name.replace(/\.pdf$/i, "");
    const res = { outputs: [out(base + "-metadata.pdf", await doc.save(), doc.getPageCount())] };
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
    const doc = await PDFDocument.load(E().files.get(files[0].id).bytes, { ignoreEncryption: true });
    const png = await doc.embedPng(opts.signaturePng);
    const page = doc.getPage(opts.pageIndex);
    const { width, height } = page.getSize();
    // opts.rect is fractional {x, y, w} relative to the page (y from top)
    const w = opts.rect.w * width;
    const h = w * (png.height / png.width);
    page.drawImage(png, { x: opts.rect.x * width, y: height - opts.rect.y * height - h, width: w, height: h });
    if (onProgress) onProgress(90);
    const base = files[0].name.replace(/\.pdf$/i, "");
    const res = { outputs: [out(base + "-ditandatangani.pdf", await doc.save(), doc.getPageCount())] };
    if (onProgress) onProgress(100);
    return res;
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

  window.PdfProcess = {
    clearCache, assemble, split, parseRange, compress, watermark, imagesToPdf,
    pdfToImages, pageNumbers, flatten, metadata, readMetadata, sign, passthrough,
  };
})();
