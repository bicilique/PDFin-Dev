import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pdfjsRoot = join(root, "node_modules", "pdfjs-dist");
const outRoot = join(root, "public", "pdfjs");

await mkdir(outRoot, { recursive: true });
await cp(join(pdfjsRoot, "cmaps"), join(outRoot, "cmaps"), { recursive: true });
await cp(join(pdfjsRoot, "standard_fonts"), join(outRoot, "standard_fonts"), { recursive: true });
