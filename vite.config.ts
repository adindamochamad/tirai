import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: "./",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    // Vite's modulepreload helper calls fetch(). The demo must not contain that call.
    modulePreload: false,
  },
});
