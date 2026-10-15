import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "extension/dist");
const out = resolve(root, "extension/tirai-0.1.0.zip");

if (!existsSync(resolve(dist, "manifest.json"))) {
  throw new Error("extension/dist is missing. Run npm run build:ext first.");
}

rmSync(out, { force: true });
execFileSync("zip", ["-r", "-X", out, ".", "-x", ".DS_Store", "-x", "*.map"], {
  cwd: dist,
  stdio: "inherit",
});
