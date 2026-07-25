import { readFile } from "node:fs/promises";
import path from "node:path";
import "@testing-library/jest-dom/vitest";

// The app fetches its embeddable fonts from /fonts at runtime; under jsdom there
// is no server, so tests read the very same files from public/. This is set as a
// global rather than by importing the font module, which would pull fontkit into
// every test file's startup.
globalThis.__pdfinFontLoader = async (fileName) =>
  new Uint8Array(await readFile(path.resolve(process.cwd(), "public/fonts", fileName)));

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ isIntersecting: true, target }]);
    }

    disconnect() {}
  };
}

if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo(options) {
    if (typeof options === "object" && options) this.scrollTop = options.top || 0;
  };
}

if (!Element.prototype.scrollBy) {
  Element.prototype.scrollBy = function scrollBy(options) {
    if (typeof options === "object" && options) this.scrollTop += options.top || 0;
  };
}

HTMLCanvasElement.prototype.getContext = () => ({
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    clearRect() {},
    fillText() {},
    drawImage() {},
    fillStyle: "",
    font: "",
    textBaseline: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "round",
    lineJoin: "round",
});

HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
  callback(new Blob(["canvas"], { type: "image/png" }));
};

HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,Y2FudmFz";
