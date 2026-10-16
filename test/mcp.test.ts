import { describe, expect, it } from "vitest";
import {
  dispatchMcp,
  encodeMcpFrame,
  extractMcpMessage,
} from "../src/cli/mcp.js";
import { Vault } from "../src/vault.js";

const SAMPLE =
  "SINTETIS. NIK 3171010101010000, HP 0800-0000-0001, plat B 4321 XYZ.";

function session(): { vault: Vault } {
  return { vault: new Vault() };
}

function toolPayload(response: unknown): Record<string, unknown> {
  const body = response as {
    result?: { content?: { text?: string }[] };
  };
  const text = body.result?.content?.[0]?.text;
  if (!text) throw new Error("missing tool payload");
  return JSON.parse(text) as Record<string, unknown>;
}

describe("mcp stdio", () => {
  it("frames JSON-RPC with Content-Length bytes", () => {
    const message = { jsonrpc: "2.0", id: 1, result: { ok: "tést" } };
    const frame = encodeMcpFrame(message);
    const extracted = extractMcpMessage(frame);
    expect(extracted?.message).toEqual(message);
    expect(extracted?.rest.length).toBe(0);
  });

  it("lists tools and keeps originals out of redact", () => {
    const state = session();
    const listed = dispatchMcp(
      { jsonrpc: "2.0", id: 1, method: "tools/list" },
      state,
    );
    const tools = (
      listed as { result: { tools: { name: string }[] } }
    ).result.tools.map((tool) => tool.name);
    expect(tools).toEqual(["redact", "restore", "clear", "count"]);

    const redacted = dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "redact", arguments: { text: SAMPLE } },
      },
      state,
    );
    const payload = toolPayload(redacted);
    expect(String(payload.redacted)).toContain("[NIK_1]");
    expect(JSON.stringify(payload)).not.toContain("3171010101010000");
    expect(JSON.stringify(payload)).not.toContain("0800-0000-0001");
    expect(payload.count).toBe(3);
  });

  it("restores from process memory then clears", () => {
    const state = session();
    dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "redact", arguments: { text: SAMPLE } },
      },
      state,
    );
    const restored = dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "restore",
          arguments: { text: "Hubungi [TELEPON_1]." },
        },
      },
      state,
    );
    const payload = toolPayload(restored);
    expect(payload.restored).toBe("Hubungi 0800-0000-0001.");
    expect(String(payload.warning)).toContain("remote model");

    dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "clear", arguments: {} },
      },
      state,
    );
    const counted = dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "count", arguments: {} },
      },
      state,
    );
    expect(toolPayload(counted).count).toBe(0);
  });
});
