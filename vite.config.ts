import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "demo",
  base: "./",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    // Keep the icon as a file. A data: URL would be blocked by connect-safe CSP.
    assetsInlineLimit: 0,
    // Vite's modulepreload helper calls fetch(). The demo must not contain that call.
    modulePreload: false,
    rollupOptions: {
      input: {
        main: resolve(root, "demo/index.html"),
        privacy: resolve(root, "demo/privacy.html"),
      },
    },
  },
});
