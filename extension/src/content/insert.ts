export function readEditorText(editor: HTMLElement): string {
  if (
    editor instanceof HTMLTextAreaElement ||
    editor instanceof HTMLInputElement
  ) {
    return editor.value;
  }
  return editor.textContent ?? "";
}

function tryExecCommand(doc: Document, text: string): boolean {
  if (typeof doc.execCommand !== "function") return false;
  try {
    return doc.execCommand("insertText", false, text);
  } catch {
    return false;
  }
}

function rangeInside(doc: Document, editor: HTMLElement): Range | null {
  const selection = doc.getSelection();
  if (selection && selection.rangeCount > 0) {
    const current = selection.getRangeAt(0);
    if (editor.contains(current.commonAncestorContainer)) return current;
  }
  try {
    const range = doc.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    return range;
  } catch {
    return null;
  }
}

function insertUnformatted(
  doc: Document,
  editor: HTMLElement,
  text: string,
): boolean {
  if (
    editor instanceof HTMLTextAreaElement ||
    editor instanceof HTMLInputElement
  ) {
    if (
      editor instanceof HTMLInputElement &&
      typeof editor.selectionStart !== "number"
    ) {
      return false;
    }
    const start = editor.selectionStart ?? editor.value.length;
    const end = editor.selectionEnd ?? start;
    editor.setRangeText(text, start, end, "end");
    return readEditorText(editor).includes(text);
  }

  const selection = doc.getSelection();
  const range = rangeInside(doc, editor);
  if (!selection || !range) return false;
  range.deleteContents();
  const node = doc.createTextNode(text);
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return readEditorText(editor).includes(text);
}

/**
 * Insert plain text. `execCommand("insertText")` is tried first because it
 * goes through the site's input pipeline. The fallback writes a text node or
 * uses `setRangeText`. It never inserts markup.
 */
export function insertPlainText(
  doc: Document,
  editor: HTMLElement,
  text: string,
): boolean {
  if (doc.activeElement !== editor && !editor.contains(doc.activeElement)) {
    editor.focus();
  }
  const before = readEditorText(editor);
  if (tryExecCommand(doc, text) && readEditorText(editor).includes(text)) {
    return readEditorText(editor) !== before || text.length === 0;
  }
  try {
    return insertUnformatted(doc, editor, text);
  } catch {
    return false;
  }
}

function dispatchInput(editor: HTMLElement): void {
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Replace the whole editor contents with plain text. Never inserts markup. */
export function replaceEditorText(
  doc: Document,
  editor: HTMLElement,
  text: string,
): boolean {
  if (
    editor instanceof HTMLTextAreaElement ||
    editor instanceof HTMLInputElement
  ) {
    editor.value = text;
    dispatchInput(editor);
    return editor.value === text;
  }

  editor.focus();
  const selection = doc.getSelection();
  try {
    const range = doc.createRange();
    range.selectNodeContents(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);
    if (typeof doc.execCommand === "function") {
      try {
        doc.execCommand("delete", false);
        if (doc.execCommand("insertText", false, text)) {
          if (readEditorText(editor) === text) {
            dispatchInput(editor);
            return true;
          }
        }
      } catch {
        // fall through
      }
    }
  } catch {
    return false;
  }

  try {
    while (editor.firstChild) {
      editor.removeChild(editor.firstChild);
    }
    editor.append(doc.createTextNode(text));
    dispatchInput(editor);
    return readEditorText(editor) === text;
  } catch {
    return false;
  }
}
