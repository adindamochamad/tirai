import { extensionStorage, extensionTabs } from "./chrome.js";
import type { ContentRequest } from "./messages.js";

const storage = extensionStorage();
const tabs = extensionTabs();

const enabledInput = document.getElementById(
  "enabled",
) as HTMLInputElement | null;
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-tab");

function setCount(value: number): void {
  if (countEl) countEl.textContent = String(value);
}

function queryActiveTab(callback: (tabId: number | undefined) => void): void {
  if (!tabs) {
    callback(undefined);
    return;
  }
  tabs.query({ active: true, currentWindow: true }, (found) => {
    callback(found[0]?.id);
  });
}

function sendToActiveTab(message: ContentRequest): void {
  queryActiveTab((tabId) => {
    if (!tabs || tabId === undefined) {
      setCount(0);
      return;
    }
    tabs.sendMessage(tabId, message, (response) => {
      if (!response || typeof response !== "object") {
        setCount(0);
        return;
      }
      if ("count" in response && typeof response.count === "number") {
        setCount(response.count);
      }
      if ("ok" in response) {
        setCount(0);
      }
    });
  });
}

function refreshCount(): void {
  sendToActiveTab({ type: "count" });
}

if (storage && enabledInput) {
  storage.local.get("enabled", (items) => {
    enabledInput.checked = items.enabled !== false;
  });
  storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || changes.enabled === undefined) return;
    enabledInput.checked = changes.enabled.newValue !== false;
  });
  enabledInput.addEventListener("change", () => {
    storage.local.set({ enabled: enabledInput.checked });
  });
}

clearBtn?.addEventListener("click", () => {
  sendToActiveTab({ type: "clear" });
});

refreshCount();
