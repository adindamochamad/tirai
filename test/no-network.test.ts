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
  /EventSource/,
  /sendBeacon/,
  /navigator\.sendBeacon/,
  /import\s*\(\s*["']https?:/,
];

const TEXT = /\.(?:ts|tsx|js|mjs|cjs|html|css|json)$/;
const ALLOWED_HTTPS = new Set(["https://chatgpt.com/*", "https://claude.ai/*"]);

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

  it("does not call network APIs from the extension source or bundle", () => {
    const extension = join(ROOT, "extension");
    expect(statSync(join(extension, "dist")).isDirectory()).toBe(true);
    const hits: string[] = [];
    for (const file of walk(extension)) {
      if (!TEXT.test(file)) continue;
      const source = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        if (pattern.test(source)) hits.push(`${file} matches ${pattern}`);
      }
      if (/console\./.test(source)) hits.push(`${file} matches console.`);
      if (
        /localStorage|sessionStorage|indexedDB|chrome\.storage\.sync/.test(
          source,
        )
      ) {
        hits.push(`${file} persists data`);
      }
      for (const set of source.matchAll(/\.set\(\s*\{[\s\S]*?\}/g)) {
        const keys = [...set[0].matchAll(/([A-Za-z0-9_]+)\s*:/g)].map(
          (item) => item[1] ?? "",
        );
        if (keys.length === 0 || keys.some((key) => key !== "enabled")) {
          hits.push(`${file} writes ${set[0]}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it("allows https only for the two manifest match patterns", () => {
    const hits: string[] = [];
    for (const file of walk(join(ROOT, "extension"))) {
      if (!TEXT.test(file)) continue;
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/https:\/\/[^\s"'`\\)]*/g)) {
        if (!ALLOWED_HTTPS.has(match[0])) hits.push(`${file}: ${match[0]}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
