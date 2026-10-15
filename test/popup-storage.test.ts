import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const POPUP = join(
  dirname(fileURLToPath(import.meta.url)),
  "../extension/src/popup.ts",
);

describe("popup storage", () => {
  it("writes only the enabled flag to chrome.storage.local", () => {
    const source = readFileSync(POPUP, "utf8");
    expect(source).toMatch(/local\.set\(\{\s*enabled:/);
    expect(source).not.toMatch(/local\.set\(\{[^}]*count/);
    expect(source).not.toMatch(/local\.set\(\{[^}]*vault/);
  });
});
