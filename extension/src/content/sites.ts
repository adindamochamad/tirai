/**
 * Every DOM selector the extension uses lives in this file.
 * A miss fails open: paste is left alone and Enter is not hooked.
 * These selectors are not yet checked against the live sites.
 */
const EDITOR_SELECTORS = [
  "#prompt-textarea",
  "div.ProseMirror[contenteditable='true']",
] as const;

const SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[aria-label="Send prompt"]',
  'button[aria-label="Kirim pesan"]',
] as const;

const EDITOR_QUERY = EDITOR_SELECTORS.join(", ");
const SEND_QUERY = SEND_BUTTON_SELECTORS.join(", ");

function elementFromTarget(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target;
  if (target instanceof Text) return target.parentElement;
  return null;
}

export function findEditor(target: EventTarget | null): HTMLElement | null {
  const start = elementFromTarget(target);
  if (!start) return null;
  let match: Element | null;
  try {
    match = start.closest(EDITOR_SELECTORS.join(", "));
  } catch {
    return null;
  }
  return match instanceof HTMLElement ? match : null;
}

export function findSendButton(target: EventTarget | null): HTMLElement | null {
  const start = elementFromTarget(target);
  if (!start) return null;
  let match: Element | null;
  try {
    match = start.closest(SEND_QUERY);
  } catch {
    return null;
  }
  return match instanceof HTMLElement ? match : null;
}

/** Editor used when a send button is clicked. Fails open if none is found. */
export function findEditorForSend(doc: Document): HTMLElement | null {
  const active = doc.activeElement;
  if (active) {
    const fromActive = findEditor(active);
    if (fromActive) return fromActive;
  }
  try {
    const match = doc.querySelector(EDITOR_QUERY);
    return match instanceof HTMLElement ? match : null;
  } catch {
    return null;
  }
}
