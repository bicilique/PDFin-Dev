import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// PDFin workspace — PDF engine: pdf.js loading + cached page rendering + sample PDF.
  const PDFJS_OPTS = {
    standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`,
    cMapUrl: `${import.meta.env.BASE_URL}pdfjs/cmaps/`,
    cMapPacked: true,
  };

  let nextId = 1;
  const files = new Map(); // id -> { id, name, size, bytes, doc, pageCount }
  const canvasCache = new Map(); // key -> canvas
  const CACHE_MAX = 80;

  function fmtSize(bytes, lang) {
    const dec = lang === "id" ? "," : ".";
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1).replace(".", dec) + " MB";
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }

  async function loadFile(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    // pdf.js transfers the buffer to the worker; keep a copy for pdf-lib.
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(), ...PDFJS_OPTS }).promise;
    const rec = { id: nextId++, name: file.name, size: file.size, bytes, doc, pageCount: doc.numPages };
    files.set(rec.id, rec);
    return rec;
  }

  async function loadImage(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = URL.createObjectURL(new Blob([bytes], { type: file.type }));
    const img = await new Promise((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = url;
    });
    const rec = { id: nextId++, name: file.name, size: file.size, bytes, img, url, type: file.type, isImage: true, pageCount: 1, width: img.naturalWidth, height: img.naturalHeight };
    files.set(rec.id, rec);
    return rec;
  }

  function removeFile(id) {
    const rec = files.get(id);
    if (rec) {
      if (rec.doc) rec.doc.destroy().catch(() => {});
      if (rec.url) URL.revokeObjectURL(rec.url);
      files.delete(id);
      for (const k of [...canvasCache.keys()]) if (k.startsWith(id + ":")) canvasCache.delete(k);
    }
  }

  function reset() { for (const id of [...files.keys()]) removeFile(id); }

  // Render page (1-based) of file to a canvas at given CSS pixel width. Cached.
  async function renderPage(fileId, pageNo, width) {
    const key = fileId + ":" + pageNo + ":" + Math.round(width);
    if (canvasCache.has(key)) return canvasCache.get(key);
    const rec = files.get(fileId);
    if (!rec) return null;
    let canvas;
    if (rec.isImage) {
      canvas = document.createElement("canvas");
      const scale = width / rec.width;
      canvas.width = Math.round(width * 2);
      canvas.height = Math.round(rec.height * scale * 2);
      canvas.getContext("2d").drawImage(rec.img, 0, 0, canvas.width, canvas.height);
    } else {
      const page = await rec.doc.getPage(pageNo);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = (width / vp1.width) * 2; // 2x for crispness
      const vp = page.getViewport({ scale });
      canvas = document.createElement("canvas");
      canvas.width = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, intent: "print" }).promise;
    }
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    if (canvasCache.size >= CACHE_MAX) canvasCache.delete(canvasCache.keys().next().value);
    canvasCache.set(key, canvas);
    return canvas;
  }

  async function pageSize(fileId, pageNo) {
    const rec = files.get(fileId);
    if (!rec) return { width: 595, height: 842 };
    if (rec.isImage) return { width: rec.width, height: rec.height };
    const page = await rec.doc.getPage(pageNo);
    const vp = page.getViewport({ scale: 1 });
    return { width: vp.width, height: vp.height };
  }

  // Generate a realistic bilingual sample document.
  async function makeSamplePdf(pageCount, name) {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const sections = ["Ringkasan eksekutif", "Latar belakang", "Analisis pasar", "Rencana operasional", "Proyeksi keuangan", "Manajemen risiko", "Lampiran"];
    for (let i = 0; i < pageCount; i++) {
      const p = doc.addPage([595.28, 841.89]);
      const title = sections[i % sections.length];
      p.drawText("Laporan Tahunan 2026", { x: 56, y: 800, size: 9, font, color: rgb(0.45, 0.43, 0.55) });
      p.drawText(String(i + 1), { x: 525, y: 40, size: 9, font, color: rgb(0.45, 0.43, 0.55) });
      p.drawText(`${i + 1}. ${title}`, { x: 56, y: 754, size: 22, font: bold, color: rgb(0.11, 0.09, 0.19) });
      p.drawRectangle({ x: 56, y: 738, width: 60, height: 3, color: rgb(0.33, 0.09, 0.71) });
      let y = 700;
      for (let ln = 0; ln < 30; ln++) {
        const w = 483 - ((ln * 137) % 180);
        p.drawRectangle({ x: 56, y, width: ln % 8 === 7 ? w * 0.4 : w, height: 7, color: rgb(0.88, 0.87, 0.92) });
        y -= ln % 8 === 7 ? 30 : 17;
        if (y < 80) break;
      }
      if (i % 3 === 1) {
        p.drawRectangle({ x: 56, y: 90, width: 483, height: 150, borderColor: rgb(0.8, 0.78, 0.87), borderWidth: 1 });
        [30, 70, 110, 55, 90, 130, 45].forEach((h, bi) => {
          p.drawRectangle({ x: 80 + bi * 64, y: 100, width: 34, height: h, color: bi % 2 ? rgb(0.14, 0.8, 0.85) : rgb(0.33, 0.09, 0.71) });
        });
      }
    }
    const bytes = await doc.save();
    return new File([bytes], name || "contoh-laporan.pdf", { type: "application/pdf" });
  }

export const PdfEngine = { files, loadFile, loadImage, removeFile, reset, renderPage, pageSize, makeSamplePdf, fmtSize };
