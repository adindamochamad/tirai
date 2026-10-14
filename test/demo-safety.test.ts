import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const DEMO = join(dirname(fileURLToPath(import.meta.url)), "../demo");

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
  it("does not use innerHTML, eval, or new Function", () => {
    const banned = [
      /innerHTML/,
      /outerHTML/,
      /insertAdjacentHTML/,
      /\beval\s*\(/,
      /new\s+Function\s*\(/,
    ];
    const hits: string[] = [];
    for (const file of walk(DEMO)) {
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
