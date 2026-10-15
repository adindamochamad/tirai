import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const DEMO = join(dirname(fileURLToPath(import.meta.url)), "../demo");
const EXTENSION = join(dirname(fileURLToPath(import.meta.url)), "../extension");
const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".html", ".css", ".json"]);

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

describe("demo safety", () => {
  it("does not use innerHTML, eval, or new Function in the demo or extension", () => {
    const banned = [
      /innerHTML/,
      /outerHTML/,
      /insertAdjacentHTML/,
      /\beval\s*\(/,
      /new\s+Function\s*\(/,
    ];
    const files = [
      ...walk(DEMO),
      ...walk(EXTENSION).filter((file) => TEXT.has(extname(file))),
    ];
    const hits: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of banned) {
        if (pattern.test(source)) hits.push(`${file} matches ${pattern}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("ships a strict content security policy", () => {
    const html = readFileSync(join(DEMO, "index.html"), "utf8");
    expect(html).toContain(
      "default-src 'self'; connect-src 'none'; script-src 'self'; style-src 'self'",
    );
  });
});
