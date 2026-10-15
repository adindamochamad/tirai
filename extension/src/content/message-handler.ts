import type { Vault } from "../../../src/vault.js";
import {
  isContentRequest,
  type ContentResponse,
} from "../messages.js";

export function handleContentMessage(
  message: unknown,
  vault: Vault,
): ContentResponse | null {
  if (!isContentRequest(message)) return null;
  if (message.type === "count") return { count: vault.size() };
  vault.clear();
  return { ok: true };
}
