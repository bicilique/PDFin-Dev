import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    globals: true,
    // The workspace render tests are heavy under jsdom and intermittently blow
    // through the 5s default when the suite runs in parallel on a loaded
    // machine. The assertions themselves finish in well under a second.
    testTimeout: 20000,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
