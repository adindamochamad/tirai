import type { Vault } from "../../../src/vault.js";

const PANEL_ID = "tirai-reveal-panel";

export function installRevealPanel(
  doc: Document,
  vault: Vault,
): () => void {
  const host = doc.createElement("div");
  host.id = PANEL_ID;
  host.style.position = "fixed";
  host.style.right = "16px";
  host.style.top = "16px";
  host.style.zIndex = "2147483646";
  host.style.maxWidth = "280px";
  host.style.padding = "12px";
  host.style.borderRadius = "10px";
  host.style.background = "#fafaf9";
  host.style.color = "#1c1917";
  host.style.border = "1px solid #d6d3d1";
  host.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
  host.style.font = "13px/1.4 system-ui, sans-serif";

  const toggle = doc.createElement("label");
  toggle.style.display = "flex";
  toggle.style.alignItems = "center";
  toggle.style.gap = "8px";
  toggle.style.cursor = "pointer";
  toggle.style.margin = "0";

  const checkbox = doc.createElement("input");
  checkbox.type = "checkbox";

  const toggleText = doc.createElement("span");
  toggleText.textContent = "Tampilkan data asli";

  const list = doc.createElement("div");
  list.style.marginTop = "10px";
  list.style.display = "none";
  list.style.maxHeight = "240px";
  list.style.overflow = "auto";

  function renderList(): void {
    list.replaceChildren();
    for (const entry of vault.entries()) {
      const row = doc.createElement("div");
      row.style.marginBottom = "6px";
      const token = doc.createElement("div");
      token.style.fontWeight = "600";
      token.textContent = entry.token;
      const value = doc.createElement("div");
      value.textContent = entry.original;
      row.append(token, value);
      list.append(row);
    }
  }

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      renderList();
      list.style.display = "block";
    } else {
      list.replaceChildren();
      list.style.display = "none";
    }
  });

  toggle.append(checkbox, toggleText);
  host.append(toggle, list);
  doc.documentElement.append(host);

  return () => {
    host.remove();
  };
}
