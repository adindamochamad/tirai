import { redact } from "../../../src/redact.js";
import type { Vault } from "../../../src/vault.js";
import { insertPlainText } from "./insert.js";
import { findEditor } from "./sites.js";

export type PasteRedactorDeps = {
  vault: Vault;
  isEnabled: () => boolean;
  notify: (count: number) => void;
};

function readClipboard(event: Event): string | null {
  const data = (event as Event & { clipboardData?: DataTransfer | null })
    .clipboardData;
  if (!data) return null;
  try {
    return data.getData("text/plain");
  } catch {
    return null;
  }
}

export function installPasteRedactor(
  doc: Document,
  deps: PasteRedactorDeps,
): () => void {
  const onPaste = (event: Event): void => {
    if (!deps.isEnabled()) return;
    const editor = findEditor(event.target);
    if (!editor) return;
    const text = readClipboard(event);
    if (text === null) return;
    const { redacted, findings } = redact(text, { vault: deps.vault });
    if (findings.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (insertPlainText(doc, editor, redacted)) deps.notify(findings.length);
  };

  doc.addEventListener("paste", onPaste, true);
  return () => doc.removeEventListener("paste", onPaste, true);
}
