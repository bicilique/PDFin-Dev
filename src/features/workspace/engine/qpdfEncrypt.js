import createQpdf from "@jspawn/qpdf-wasm/qpdf.mjs";
import qpdfWasmUrl from "@jspawn/qpdf-wasm/qpdf.wasm?url";

let qpdfModulePromise = null;
let jobCounter = 1;

function getQpdfModule() {
  if (!qpdfModulePromise) {
    qpdfModulePromise = createQpdf({
      locateFile: (path) => path.endsWith(".wasm") ? qpdfWasmUrl : path,
      print: () => {},
      printErr: () => {},
    });
  }
  return qpdfModulePromise;
}

function safeUnlink(fs, path) {
  try {
    fs.unlink(path);
  } catch {
    // MEMFS cleanup best effort.
  }
}

export async function encryptPdfWithQpdf(inputBytes, userPassword, ownerPassword) {
  const module = await getQpdfModule();
  const inputPath = `/pdfin-input-${jobCounter}.pdf`;
  const outputPath = `/pdfin-output-${jobCounter}.pdf`;
  jobCounter += 1;
  module.FS.writeFile(inputPath, inputBytes);
  try {
    module.callMain(["--encrypt", userPassword, ownerPassword, "256", "--", inputPath, outputPath]);
    return module.FS.readFile(outputPath);
  } finally {
    safeUnlink(module.FS, inputPath);
    safeUnlink(module.FS, outputPath);
  }
}
