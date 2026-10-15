import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type ContentScript = {
  matches?: string[];
  js?: string[];
  world?: string;
  type?: string;
};

type Manifest = {
  manifest_version?: number;
  version?: string;
  permissions?: string[];
  host_permissions?: unknown;
  optional_permissions?: unknown;
  optional_host_permissions?: unknown;
  background?: { service_worker?: string; type?: string };
  action?: { default_popup?: string };
  icons?: Record<string, string>;
  content_scripts?: ContentScript[];
  content_security_policy?: { extension_pages?: string };
  web_accessible_resources?: unknown;
};

function readManifest(path: string): Manifest {
  return JSON.parse(readFileSync(path, "utf8")) as Manifest;
}

const sourcePath = join(ROOT, "extension/manifest.json");
const distPath = join(ROOT, "extension/dist/manifest.json");

describe("extension manifest", () => {
  const manifest = readManifest(sourcePath);

  it("allows storage only and names the two chat sites", () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.permissions).toEqual(["storage"]);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.optional_permissions).toBeUndefined();
    expect(manifest.optional_host_permissions).toBeUndefined();
    expect(manifest.web_accessible_resources).toBeUndefined();
    expect(JSON.stringify(manifest)).not.toContain("<all_urls>");
    expect(JSON.stringify(manifest)).not.toContain("clipboardRead");

    const scripts = manifest.content_scripts ?? [];
    expect(scripts).toHaveLength(1);
    expect(scripts.flatMap((script) => script.matches ?? [])).toEqual([
      "https://chatgpt.com/*",
      "https://claude.ai/*",
    ]);
    expect(scripts[0]?.js).toEqual(["content.js"]);
    expect(scripts[0]?.world).toBeUndefined();
    expect(scripts[0]?.type).toBeUndefined();
    expect(manifest.background).toEqual({ service_worker: "background.js" });
  });

  it("blocks network connects from extension pages", () => {
    expect(manifest.content_security_policy?.extension_pages).toBe(
      "script-src 'self'; object-src 'self'; connect-src 'none'",
    );
  });

  it("ships a local popup page and local icons", () => {
    expect(manifest.action?.default_popup).toBe("popup.html");
    const popup = readFileSync(join(ROOT, "extension/popup.html"), "utf8");
    expect(popup).toContain("Alat bantu, bukan jaminan.");
    expect(popup).toContain('src="popup.js"');
    expect(popup).not.toMatch(/<script>[^<]+<\/script>/);
    expect(popup).toContain("Hapus data tab ini");
    expect(manifest.icons).toEqual({
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    });

    for (const size of [16, 48, 128]) {
      const bytes = readFileSync(join(ROOT, `extension/icons/icon${size}.png`));
      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(bytes.readUInt32BE(16)).toBe(size);
      expect(bytes.readUInt32BE(20)).toBe(size);
    }
  });

  it("copies the same manifest into the bundle", () => {
    expect(statSync(distPath).isFile()).toBe(true);
    expect(readFileSync(distPath, "utf8")).toBe(
      readFileSync(sourcePath, "utf8"),
    );
    expect(statSync(join(ROOT, "extension/dist/content.js")).isFile()).toBe(
      true,
    );
    expect(statSync(join(ROOT, "extension/dist/background.js")).isFile()).toBe(
      true,
    );
    expect(statSync(join(ROOT, "extension/dist/popup.js")).isFile()).toBe(true);
  });
});
