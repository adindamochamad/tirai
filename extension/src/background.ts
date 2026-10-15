import { extensionRuntime, extensionStorage } from "./chrome.js";

const storage = extensionStorage();
const runtime = extensionRuntime();

if (storage && runtime) {
  runtime.onInstalled.addListener(() => {
    storage.local.get("enabled", (items) => {
      if (typeof items.enabled !== "boolean") {
        storage.local.set({ enabled: true });
      }
    });
  });
}
