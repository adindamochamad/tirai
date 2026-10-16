import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../src/cli/run.js";

const SAMPLE =
  "SINTETIS. NIK 3171010101010000, HP 0800-0000-0001, plat B 4321 XYZ.";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

function tempVault(): string {
  const dir = mkdtempSync(join(tmpdir(), "tirai-cli-"));
  tempDirs.push(dir);
  return join(dir, "vault.json");
}

describe("cli", () => {
  it("prints help", () => {
    const result = runCli(["--help"], "");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("tirai redact");
    expect(result.stdout).toContain("tirai mcp");
  });

  it("redacts stdin to tokens", () => {
    const result = runCli(["redact"], SAMPLE);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("[NIK_1]");
    expect(result.stdout).toContain("[TELEPON_1]");
    expect(result.stdout).toContain("[PLAT_1]");
    expect(result.stdout).not.toContain("3171010101010000");
    expect(result.stdout).not.toContain("0800-0000-0001");
    expect(result.stderr).toContain("--vault FILE");
  });

  it("round-trips through --json", () => {
    const redacted = runCli(["redact", "--json"], SAMPLE);
    expect(redacted.code).toBe(0);
    const payload = JSON.parse(redacted.stdout) as {
      redacted: string;
      entries: unknown[];
    };
    const restored = runCli(
      ["restore", "--json"],
      JSON.stringify({
        text: "Hubungi [TELEPON_1] soal [PLAT_1].",
        entries: payload.entries,
      }),
    );
    expect(restored.code).toBe(0);
    const body = JSON.parse(restored.stdout) as { restored: string };
    expect(body.restored).toBe("Hubungi 0800-0000-0001 soal B 4321 XYZ.");
  });

  it("round-trips through a local vault file", () => {
    const vaultPath = tempVault();
    const redacted = runCli(["redact", "--vault", vaultPath], SAMPLE);
    expect(redacted.code).toBe(0);
    expect(redacted.stdout).toContain("[NIK_1]");
    const snapshot = JSON.parse(readFileSync(vaultPath, "utf8")) as {
      version: number;
    };
    expect(snapshot.version).toBe(1);
    const restored = runCli(
      ["restore", "--vault", vaultPath],
      "Nomor [TELEPON_1] aman.",
    );
    expect(restored.stdout).toBe("Nomor 0800-0000-0001 aman.");
  });
});
