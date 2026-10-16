import { redact } from "../../../src/redact.js";
import type { Vault } from "../../../src/vault.js";
import { readEditorText, replaceEditorText } from "./insert.js";
import { hasRawPii } from "./scan.js";
import { hideSendDialog, showSendDialog } from "./send-dialog.js";
import { findEditor, findEditorForSend, findSendButton } from "./sites.js";

export type SendGuardDeps = {
  doc: Document;
  vault: Vault;
  isEnabled: () => boolean;
};

export function installSendGuard(deps: SendGuardDeps): () => void {
  let bypassForText: string | null = null;

  function maybeBlock(editor: HTMLElement, event: Event): void {
    const text = readEditorText(editor);
    if (!hasRawPii(text)) {
      bypassForText = null;
      return;
    }
    if (bypassForText === text) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showSendDialog(deps.doc, {
      onRedact: () => {
        const current = readEditorText(editor);
        const { redacted } = redact(current, { vault: deps.vault });
        replaceEditorText(deps.doc, editor, redacted);
        bypassForText = null;
      },
      onSendAnyway: () => {
        bypassForText = readEditorText(editor);
      },
    });
  }

  const onKeyDown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) return;
    const isEnter =
      event.key === "Enter" ||
      event.code === "Enter" ||
      event.code === "NumpadEnter";
    if (!isEnter) return;
    const editor = findEditor(event.target);
    if (!deps.isEnabled() || event.isComposing || event.shiftKey || !editor) {
      return;
    }
    maybeBlock(editor, event);
  };

  const onClick = (event: Event): void => {
    const button = findSendButton(event.target);
    if (!button) return;
    const editor = findEditorForSend(deps.doc, event.target);
    if (!deps.isEnabled() || !editor) return;
    maybeBlock(editor, event);
  };

  const root = deps.doc.defaultView ?? deps.doc;
  root.addEventListener("keydown", onKeyDown, true);
  root.addEventListener("click", onClick, true);

  return () => {
    hideSendDialog(deps.doc);
    root.removeEventListener("keydown", onKeyDown, true);
    root.removeEventListener("click", onClick, true);
  };
}
