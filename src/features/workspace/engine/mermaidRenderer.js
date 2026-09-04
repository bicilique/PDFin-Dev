import mermaid from "mermaid";

// Mermaid is bundled with the app. Strict mode keeps labels inert and disables
// diagram-authored links, while htmlLabels:false produces portable SVG text.
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  suppressErrorRendering: true,
  theme: "neutral",
  htmlLabels: false,
  fontFamily: "Arial, Helvetica, sans-serif",
  maxTextSize: 50_000,
});

let renderSequence = 0;

export async function renderMermaidSvg(source) {
  renderSequence += 1;
  const id = `pdfin-mermaid-${renderSequence}`;
  const { svg } = await mermaid.render(id, String(source || ""));
  return svg;
}

export function getSvgDimensions(svg, maxWidth = Infinity) {
  const documentNode = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = documentNode.documentElement;
  const viewBox = (root.getAttribute("viewBox") || "")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const viewBoxWidth = viewBox.length === 4 && viewBox.every(Number.isFinite) ? viewBox[2] : 0;
  const viewBoxHeight = viewBox.length === 4 && viewBox.every(Number.isFinite) ? viewBox[3] : 0;
  const explicitWidth = Number.parseFloat(root.getAttribute("width"));
  const explicitHeight = Number.parseFloat(root.getAttribute("height"));
  const sourceWidth = viewBoxWidth > 0 ? viewBoxWidth : explicitWidth > 0 ? explicitWidth : 800;
  const sourceHeight = viewBoxHeight > 0 ? viewBoxHeight : explicitHeight > 0 ? explicitHeight : 450;
  const widthLimit = Number(maxWidth) > 0 ? Number(maxWidth) : sourceWidth;
  const fit = Math.min(1, widthLimit / sourceWidth);
  return { width: sourceWidth * fit, height: sourceHeight * fit };
}

export async function renderMermaidToPng(source, { maxWidth = 1_000, scale = 2 } = {}) {
  const svg = await renderMermaidSvg(source);
  const { width, height } = getSvgDimensions(svg, maxWidth);
  const rasterScale = Math.max(0.1, Math.min(Number(scale) || 2, 4_096 / width, 8_192 / height));
  const image = await loadSvgImage(svg);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * rasterScale));
  canvas.height = Math.max(1, Math.round(height * rasterScale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D tidak tersedia untuk merender diagram Mermaid.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas);
  return { pngBytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}

function loadSvgImage(svg) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Diagram Mermaid tidak dapat dirasterisasi.")); };
    image.src = url;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Diagram Mermaid tidak dapat diubah menjadi PNG."));
    }, "image/png");
  });
}
