import { redact } from "../../../src/redact.js";
import type { Vault } from "../../../src/vault.js";
import { readEditorText, replaceEditorText } from "./insert.js";
import { hasRawPii } from "./scan.js";
import { hideSendDialog, showSendDialog } from "./send-dialog.js";
import {
  findEditor,
  findEditorForSend,
  findSendButton,
} from "./sites.js";

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
    event.stopPropagation();

    showSendDialog(deps.doc, {
      onRedact: () => {
        const { redacted } = redact(text, { vault: deps.vault });
        replaceEditorText(deps.doc, editor, redacted);
        bypassForText = null;
      },
      onSendAnyway: () => {
        bypassForText = text;
      },
    });
  }

  const onKeyDown = (event: Event): void => {
    if (!deps.isEnabled()) return;
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key !== "Enter" || event.shiftKey) return;
    const editor = findEditor(event.target);
    if (!editor) return;
    maybeBlock(editor, event);
  };

  const onClick = (event: Event): void => {
    if (!deps.isEnabled()) return;
    if (!findSendButton(event.target)) return;
    const editor = findEditorForSend(deps.doc);
    if (!editor) return;
    maybeBlock(editor, event);
  };

  deps.doc.addEventListener("keydown", onKeyDown, true);
  deps.doc.addEventListener("click", onClick, true);

  return () => {
    hideSendDialog(deps.doc);
    deps.doc.removeEventListener("keydown", onKeyDown, true);
    deps.doc.removeEventListener("click", onClick, true);
  };
}
