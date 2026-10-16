import type { Vault } from "../../../src/vault.js";

const PANEL_ID = "tirai-reveal-panel";

type PanelState = {
  vault: Vault;
  checkbox: HTMLInputElement;
  list: HTMLDivElement;
};

const panels = new WeakMap<Document, PanelState>();

function paint(state: PanelState): void {
  state.list.replaceChildren();
  if (!state.checkbox.checked) {
    state.list.style.display = "none";
    return;
  }
  state.list.style.display = "block";
  for (const entry of state.vault.entries()) {
    const row = state.list.ownerDocument.createElement("div");
    row.style.marginBottom = "6px";
    const token = state.list.ownerDocument.createElement("div");
    token.style.fontWeight = "600";
    token.textContent = entry.token;
    const value = state.list.ownerDocument.createElement("div");
    value.textContent = entry.original;
    row.append(token, value);
    state.list.append(row);
  }
}

/** Re-read the vault. Used after the tab vault is cleared. */
export function syncRevealPanel(doc: Document): void {
  const state = panels.get(doc);
  if (!state) return;
  paint(state);
}

export function setRevealOpen(doc: Document, open: boolean): void {
  const state = panels.get(doc);
  if (!state) return;
  state.checkbox.checked = open;
  paint(state);
}

/** Text inside the closed shadow tree. The host's light DOM stays empty. */
export function renderedRevealText(doc: Document): string {
  return panels.get(doc)?.list.textContent ?? "";
}

export function installRevealPanel(doc: Document, vault: Vault): () => void {
  const host = doc.createElement("div");
  host.id = PANEL_ID;
  host.style.position = "fixed";
  host.style.right = "16px";
  host.style.top = "16px";
  host.style.zIndex = "2147483646";
  host.style.maxWidth = "280px";

  const shadow = host.attachShadow({ mode: "closed" });
  const panel = doc.createElement("div");
  panel.style.padding = "12px";
  panel.style.borderRadius = "10px";
  panel.style.background = "#fafaf9";
  panel.style.color = "#1c1917";
  panel.style.border = "1px solid #d6d3d1";
  panel.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
  panel.style.font = "13px/1.4 system-ui, sans-serif";

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

  const state: PanelState = { vault, checkbox, list };
  checkbox.addEventListener("change", () => {
    paint(state);
  });

  toggle.append(checkbox, toggleText);
  panel.append(toggle, list);
  shadow.append(panel);
  panels.set(doc, state);
  doc.documentElement.append(host);

  return () => {
    if (panels.get(doc) === state) panels.delete(doc);
    host.remove();
  };
}
