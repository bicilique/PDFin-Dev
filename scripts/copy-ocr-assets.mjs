import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outRoot = join(root, "public", "ocr");
const tesseractRoot = join(root, "node_modules", "tesseract.js");
const coreRoot = join(root, "node_modules", "tesseract.js-core");
const dataRoot = join(root, "node_modules", "@tesseract.js-data");

await mkdir(join(outRoot, "tesseract"), { recursive: true });
await mkdir(join(outRoot, "tesseract-core"), { recursive: true });
await mkdir(join(outRoot, "tessdata"), { recursive: true });

await cp(join(tesseractRoot, "dist", "worker.min.js"), join(outRoot, "tesseract", "worker.min.js"));

const coreFiles = [
  "tesseract-core.js",
  "tesseract-core.wasm",
  "tesseract-core.wasm.js",
  "tesseract-core-lstm.js",
  "tesseract-core-lstm.wasm",
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-simd.js",
  "tesseract-core-simd.wasm",
  "tesseract-core-simd.wasm.js",
  "tesseract-core-simd-lstm.js",
  "tesseract-core-simd-lstm.wasm",
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-relaxedsimd.js",
  "tesseract-core-relaxedsimd.wasm",
  "tesseract-core-relaxedsimd.wasm.js",
  "tesseract-core-relaxedsimd-lstm.js",
  "tesseract-core-relaxedsimd-lstm.wasm",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
];

for (const file of coreFiles) {
  await cp(join(coreRoot, file), join(outRoot, "tesseract-core", file));
}

await cp(join(dataRoot, "ind", "4.0.0_best_int", "ind.traineddata.gz"), join(outRoot, "tessdata", "ind.traineddata.gz"));
await cp(join(dataRoot, "eng", "4.0.0_best_int", "eng.traineddata.gz"), join(outRoot, "tessdata", "eng.traineddata.gz"));
