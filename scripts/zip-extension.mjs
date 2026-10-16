import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "extension/dist");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const out = resolve(root, `extension/tirai-${pkg.version}.zip`);

if (!existsSync(resolve(dist, "manifest.json"))) {
  throw new Error("extension/dist is missing. Run npm run build:ext first.");
}

rmSync(out, { force: true });
execFileSync("zip", ["-r", "-X", out, ".", "-x", ".DS_Store", "-x", "*.map"], {
  cwd: dist,
  stdio: "inherit",
});
