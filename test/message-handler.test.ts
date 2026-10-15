import { describe, expect, it } from "vitest";
import { handleContentMessage } from "../extension/src/content/message-handler.js";
import { redact } from "../src/redact.ts";
import { Vault } from "../src/vault.ts";

describe("content message handler", () => {
  it("returns vault size without exposing entries", () => {
    const vault = new Vault();
    redact("NIK 3171012501900003", { vault });
    expect(handleContentMessage({ type: "count" }, vault)).toEqual({
      count: 1,
    });
  });

  it("clears the tab vault on clear", () => {
    const vault = new Vault();
    redact("NIK 3171012501900003", { vault });
    expect(handleContentMessage({ type: "clear" }, vault)).toEqual({
      ok: true,
    });
    expect(vault.size()).toBe(0);
  });

  it("ignores unknown messages", () => {
    const vault = new Vault();
    expect(handleContentMessage({ type: "vault" }, vault)).toBeNull();
  });
});
