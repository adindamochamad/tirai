import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) {
      files.push(...walk(path));
      continue;
    }
    files.push(path);
  }
  return files;
}

const BANNED = [
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /sendBeacon/,
  /navigator\.sendBeacon/,
  /import\s*\(\s*["']https?:/,
];

describe("no network", () => {
  it("does not call network APIs from src or demo", () => {
    const files = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "demo"))];
    const hits: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        if (pattern.test(source)) hits.push(`${file} matches ${pattern}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("has no runtime dependencies and no console calls in src", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    expect(pkg.dependencies ?? {}).toEqual({});

    const hits: string[] = [];
    for (const file of walk(join(ROOT, "src"))) {
      if (!file.endsWith(".ts")) continue;
      const source = readFileSync(file, "utf8");
      if (/console\./.test(source)) hits.push(file);
    }
    expect(hits).toEqual([]);
  });
});
