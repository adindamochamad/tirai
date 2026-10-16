import type { Vault } from "../../../src/vault.js";
import type { ContentResponse } from "../messages.js";
import { handleContentMessage } from "./message-handler.js";
import { syncRevealPanel } from "./reveal.js";

export function deliverContentMessage(
  message: unknown,
  vault: Vault,
  doc: Document,
): ContentResponse | null {
  const response = handleContentMessage(message, vault);
  if (response && "ok" in response) syncRevealPanel(doc);
  return response;
}
