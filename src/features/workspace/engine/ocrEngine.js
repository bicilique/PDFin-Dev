import { PdfEngine } from "./pdfEngine.js";

const OCR_BASE = `${import.meta.env.BASE_URL}ocr`;

export const OCR_LANGUAGE_OPTIONS = [
  { value: "ind+eng", label: "Indonesia + English" },
  { value: "ind", label: "Indonesia" },
  { value: "eng", label: "English" },
];

export const OCR_QUALITY_PRESETS = {
  fast: { renderWidth: 1100, label: "Cepat" },
  balanced: { renderWidth: 1500, label: "Seimbang" },
  accurate: { renderWidth: 1900, label: "Akurat" },
};

function hasTextItem(item) {
  return typeof item?.str === "string" && item.str.replace(/\s+/g, "").length >= 2;
}

function normalizeWords(data) {
  const words = data?.words || data?.blocks?.flatMap((block) =>
    (block.paragraphs || []).flatMap((paragraph) =>
      (paragraph.lines || []).flatMap((line) => line.words || [])
    )
  ) || [];

  return words
    .map((word) => ({
      text: String(word.text || "").trim(),
      confidence: Number.isFinite(word.confidence) ? word.confidence : Number(word.confidence || 0),
      bbox: word.bbox || {
        x0: word.x0,
        y0: word.y0,
        x1: word.x1,
        y1: word.y1,
      },
    }))
    .filter((word) => word.text && word.bbox && Number.isFinite(Number(word.bbox.x0)));
}

export async function analyzePageText(fileId, pageNo) {
  const rec = PdfEngine.files.get(fileId);
  if (!rec?.doc) return false;
  const page = await rec.doc.getPage(pageNo);
  const text = await page.getTextContent();
  const usableChars = (text.items || [])
    .filter(hasTextItem)
    .map((item) => item.str)
    .join("")
    .replace(/\s+/g, "").length;
  return usableChars >= 12;
}

export async function renderOcrPage(fileId, pageNo, quality = "balanced", rotation = 0) {
  const preset = OCR_QUALITY_PRESETS[quality] || OCR_QUALITY_PRESETS.balanced;
  const canvas = await PdfEngine.renderPage(fileId, pageNo, preset.renderWidth / 2, rotation);
  if (!canvas) throw new Error("OCR_RENDER_FAILED");
  return canvas;
}

export async function createTesseractOcrEngine({ language = "ind+eng", quality = "balanced", onStatus } = {}) {
  const { createWorker } = await import("tesseract.js");
  let worker = null;
  const workerOptions = {
    workerPath: `${OCR_BASE}/tesseract/worker.min.js`,
    corePath: `${OCR_BASE}/tesseract-core`,
    langPath: `${OCR_BASE}/tessdata`,
    cacheMethod: "write",
    gzip: true,
    logger: (message) => {
      if (!onStatus || !message || typeof message !== "object") return;
      onStatus({
        status: message.status || "",
        progress: Number.isFinite(message.progress) ? message.progress : 0,
      });
    },
  };
  worker = await createWorker(language, 1, workerOptions);

  return {
    analyzePageText,
    async recognizePage(fileId, pageNo, page, progress) {
      const canvas = await renderOcrPage(fileId, pageNo, quality, page?.rotation || 0);
      progress && progress({ phase: "recognize", page: pageNo });
      const { data } = await worker.recognize(canvas, {}, { text: true, blocks: true });
      return {
        page: pageNo,
        text: data?.text || "",
        image: { width: canvas.width, height: canvas.height },
        words: normalizeWords(data),
      };
    },
    async terminate() {
      if (worker) {
        const current = worker;
        worker = null;
        await current.terminate();
      }
    },
  };
}
