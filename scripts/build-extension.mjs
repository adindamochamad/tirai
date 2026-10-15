import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "extension/dist");

/**
 * @param {string} entry
 * @param {string} fileName
 * @param {string} name
 * @param {boolean} emptyOutDir
 */
async function bundle(entry, fileName, name, emptyOutDir) {
  await build({
    root,
    configFile: false,
    publicDir: false,
    clearScreen: false,
    esbuild: { legalComments: "none" },
    build: {
      emptyOutDir,
      outDir,
      sourcemap: false,
      target: "es2022",
      minify: false,
      modulePreload: false,
      lib: {
        entry: resolve(root, entry),
        name,
        formats: ["iife"],
        fileName: () => fileName,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  });
  settleEmittedName(fileName);
}

/**
 * @param {string} fileName
 */
function settleEmittedName(fileName) {
  const wanted = resolve(outDir, fileName);
  if (existsSync(wanted)) return;
  const stem = fileName.replace(/\.js$/, "");
  const found = readdirSync(outDir).find(
    (name) => name.startsWith(stem) && name.endsWith(".js"),
  );
  if (!found) throw new Error(`Missing extension bundle ${fileName}`);
  renameSync(resolve(outDir, found), wanted);
}

await bundle(
  "extension/src/content/index.ts",
  "content.js",
  "TiraiContent",
  true,
);
await bundle(
  "extension/src/background.ts",
  "background.js",
  "TiraiBackground",
  false,
);
await bundle("extension/src/popup.ts", "popup.js", "TiraiPopup", false);

cpSync(
  resolve(root, "extension/manifest.json"),
  resolve(outDir, "manifest.json"),
);
cpSync(resolve(root, "extension/popup.html"), resolve(outDir, "popup.html"));
cpSync(resolve(root, "extension/popup.css"), resolve(outDir, "popup.css"));
mkdirSync(resolve(outDir, "icons"), { recursive: true });
cpSync(resolve(root, "extension/icons"), resolve(outDir, "icons"), {
  recursive: true,
});
