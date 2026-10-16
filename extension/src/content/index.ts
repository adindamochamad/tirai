import { Vault } from "../../../src/vault.js";
import { extensionRuntime, extensionStorage } from "../chrome.js";
import { deliverContentMessage } from "./deliver.js";
import { installPasteRedactor } from "./paste.js";
import { showRedactionNote } from "./note.js";
import { installRevealPanel } from "./reveal.js";
import { installSendGuard } from "./send-guard.js";

const vault = new Vault();
let enabled = true;

const storage = extensionStorage();
const runtime = extensionRuntime();

if (storage) {
  storage.local.get("enabled", (items) => {
    enabled = items.enabled !== false;
  });
  storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || changes.enabled === undefined) return;
    enabled = changes.enabled.newValue !== false;
  });
}

if (runtime) {
  runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const response = deliverContentMessage(message, vault, document);
    if (!response) return false;
    sendResponse(response);
    return true;
  });
}

installPasteRedactor(document, {
  vault,
  isEnabled: () => enabled,
  notify: (count) => {
    showRedactionNote(document, count);
  },
});

installSendGuard({
  doc: document,
  vault,
  isEnabled: () => enabled,
});

installRevealPanel(document, vault);
