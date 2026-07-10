import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === "true" ? "/PDFin-Dev/" : "/",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
