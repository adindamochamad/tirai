import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { redact } from "../src/index.js";
import { Vault, snapshotVault } from "../src/vault.js";

const NIK = "3171012501900003";

describe("Vault", () => {
  it("hides originals from JSON, string conversion, and inspect", () => {
    const { vault } = redact(`NIK ${NIK}`);
    expect(vault.toJSON()).toBe("[Vault: 1 entries]");
    expect(String(vault)).toBe("[Vault: 1 entries]");
    expect(`${vault}`).toBe("[Vault: 1 entries]");
    expect(JSON.stringify(vault)).toBe('"[Vault: 1 entries]"');
    expect(inspect(vault)).toBe("[Vault: 1 entries]");
    for (const view of [
      vault.toJSON(),
      String(vault),
      JSON.stringify(vault),
      inspect(vault),
    ]) {
      expect(view).not.toContain(NIK);
    }
  });

  it("looks up by token and by normalized value, then clears", () => {
    const vault = new Vault();
    const entry = vault.allocate("NIK", NIK, NIK, new Set());
    expect(vault.get("[NIK_1]")).toEqual(entry);
    expect(vault.get("[ nik_1 ]")?.original).toBe(NIK);
    expect(vault.findByNormalized("NIK", NIK)?.token).toBe("[NIK_1]");
    expect(vault.size()).toBe(1);
    vault.clear();
    expect(vault.size()).toBe(0);
    expect(vault.get("[NIK_1]")).toBeUndefined();
    expect(vault.toJSON()).toBe("[Vault: 0 entries]");
  });

  it("round-trips a snapshot without changing JSON hiding", () => {
    const { vault } = redact(`NIK ${NIK}`);
    const snapshot = snapshotVault(vault);
    const restored = Vault.fromEntries(snapshot.entries);
    expect(restored.get("[NIK_1]")?.original).toBe(NIK);
    expect(JSON.stringify(restored)).toBe('"[Vault: 1 entries]"');
    expect(JSON.stringify(restored)).not.toContain(NIK);
  });
});
