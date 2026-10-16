import { Buffer } from "node:buffer";
import type { Readable, Writable } from "node:stream";
import { redact, restore } from "../redact.js";
import { Vault } from "../vault.js";
import { readPackageVersion } from "./run.js";

const PROTOCOL = "2024-11-05";
const SERVER_NAME = "tirai";

export interface McpSession {
  vault: Vault;
}

interface JsonRpcRequest {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

type JsonRpcResponse =
  | { jsonrpc: "2.0"; id: unknown; result: unknown }
  | { jsonrpc: "2.0"; id: unknown; error: { code: number; message: string } };

const TOOLS = [
  {
    name: "redact",
    description:
      "Mask Indonesian identifiers in text on this device. Returns tokens such as [NIK_1]. Originals stay in this process memory and are not included.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text that may contain identifiers.",
        },
        nikStrict: {
          type: "boolean",
          description:
            "When true (default), unlabeled 16-digit runs must pass NIK heuristics.",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "restore",
    description:
      "Replace Tirai tokens with the originals stored in this process. The result contains personal data. Do not send it to a remote model.",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text that may contain [TYPE_N] tokens.",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "clear",
    description: "Forget every original stored in this MCP process.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "count",
    description: "How many originals are currently stored in this process.",
    inputSchema: { type: "object", properties: {} },
  },
];

export function dispatchMcp(
  message: unknown,
  session: McpSession,
): JsonRpcResponse | undefined {
  if (typeof message !== "object" || message === null) {
    return errorResponse(null, -32600, "Invalid Request");
  }
  const req = message as JsonRpcRequest;
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return errorResponse(req.id ?? null, -32600, "Invalid Request");
  }
  if (req.id === undefined) return undefined;

  if (req.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: req.id,
      result: {
        protocolVersion: PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: readPackageVersion() },
      },
    };
  }
  if (req.method === "ping") {
    return { jsonrpc: "2.0", id: req.id, result: {} };
  }
  if (req.method === "tools/list") {
    return { jsonrpc: "2.0", id: req.id, result: { tools: TOOLS } };
  }
  if (req.method === "tools/call") {
    return callTool(req.id, req.params, session);
  }
  return errorResponse(req.id, -32601, `Method not found: ${req.method}`);
}

function callTool(
  id: unknown,
  params: unknown,
  session: McpSession,
): JsonRpcResponse {
  if (typeof params !== "object" || params === null) {
    return errorResponse(id, -32602, "Invalid params");
  }
  const { name, arguments: args } = params as {
    name?: unknown;
    arguments?: unknown;
  };
  const input =
    typeof args === "object" && args !== null
      ? (args as Record<string, unknown>)
      : {};
  try {
    if (name === "redact") {
      if (typeof input.text !== "string") {
        return errorResponse(id, -32602, "redact requires text");
      }
      const result = redact(input.text, {
        vault: session.vault,
        nikStrict: input.nikStrict !== false,
      });
      return toolResult(id, {
        redacted: result.redacted,
        findings: result.findings,
        count: session.vault.size(),
      });
    }
    if (name === "restore") {
      if (typeof input.text !== "string") {
        return errorResponse(id, -32602, "restore requires text");
      }
      return toolResult(id, {
        restored: restore(input.text, session.vault),
        count: session.vault.size(),
        warning:
          "Contains original identifiers. Do not send this payload to a remote model.",
      });
    }
    if (name === "clear") {
      session.vault.clear();
      return toolResult(id, { count: 0 });
    }
    if (name === "count") {
      return toolResult(id, { count: session.vault.size() });
    }
    return errorResponse(id, -32601, `Unknown tool: ${String(name)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(id, -32603, message);
  }
}

function toolResult(id: unknown, payload: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(payload) }],
    },
  };
}

function errorResponse(
  id: unknown,
  code: number,
  message: string,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export function encodeMcpFrame(message: unknown): Buffer {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  const header = Buffer.from(
    `Content-Length: ${String(body.length)}\r\n\r\n`,
    "ascii",
  );
  return Buffer.concat([header, body]);
}

export function extractMcpMessage(
  buffer: Buffer,
): { message: unknown; rest: Buffer } | undefined {
  const crlf = buffer.indexOf("\r\n\r\n");
  const lf = buffer.indexOf("\n\n");
  let headerEnd = -1;
  let sep = 0;
  if (crlf !== -1 && (lf === -1 || crlf <= lf)) {
    headerEnd = crlf;
    sep = 4;
  } else if (lf !== -1) {
    headerEnd = lf;
    sep = 2;
  }
  if (headerEnd === -1) return undefined;
  const header = buffer.subarray(0, headerEnd).toString("ascii");
  const lengthMatch = /Content-Length:\s*(\d+)/i.exec(header);
  if (!lengthMatch?.[1]) return undefined;
  const length = Number(lengthMatch[1]);
  const bodyStart = headerEnd + sep;
  if (buffer.length < bodyStart + length) return undefined;
  const body = buffer.subarray(bodyStart, bodyStart + length).toString("utf8");
  return {
    message: JSON.parse(body) as unknown,
    rest: buffer.subarray(bodyStart + length),
  };
}

export async function serveMcpStdio(
  input: Readable,
  output: Writable,
  session: McpSession = { vault: new Vault() },
): Promise<void> {
  let buffer: Buffer = Buffer.alloc(0);
  for await (const chunk of input) {
    const piece = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    buffer = Buffer.concat([buffer, piece]);
    while (true) {
      const extracted = extractMcpMessage(buffer);
      if (!extracted) break;
      buffer = Buffer.from(extracted.rest);
      const reply = dispatchMcp(extracted.message, session);
      if (reply) output.write(encodeMcpFrame(reply));
    }
  }
}
