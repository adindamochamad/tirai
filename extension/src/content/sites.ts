/**
 * Every DOM selector the extension uses lives in this file.
 * A miss fails open: paste is left alone and Enter is not hooked.
 *
 * The logged-out ChatGPT page was checked on 15 October 2026 at a 1440px
 * window. The composer was textarea#mobile-composer-prompt and the submit
 * control was button[aria-label="Send message"]. The logged-in page was
 * checked on 16 October 2026. The first paste landed in
 * textarea#pending-home-input, before a ProseMirror editor existed. A
 * conversation page exposed textarea#pending-conversation-input the same
 * way. The submit control was button[aria-label="Send"]. A signed-in
 * Claude page was checked on 16 October 2026. Before the editor hydrated,
 * the page showed textarea#static-composer-input. The paste and Enter that
 * followed landed on div.ProseMirror[contenteditable="true"] with
 * data-cds="Editor" and data-testid="chat-input". Enter on 16 raw digits
 * opened the warning and was cancelled. The shipped script also refers to
 * textarea[data-cds="ChatComposerEditor"] and
 * button[data-testid="chat-input-send"]; those nodes were absent in that
 * check.
 */
const EDITOR_SELECTORS = [
  "#prompt-textarea",
  "#mobile-composer-prompt",
  "#pending-home-input",
  "#pending-conversation-input",
  "div.ProseMirror[contenteditable='true']",
  "div.ProseMirror[contenteditable='plaintext-only']",
  "textarea[data-cds='ChatComposerEditor']",
  "[data-cds='ChatComposerEditor'][contenteditable='true']",
  "[data-cds='ChatComposerEditor'] [contenteditable='true']",
] as const;

const SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[data-testid="chat-input-send"]',
  'button[aria-label="Send prompt"]',
  'button[aria-label="Send message"]',
  'button[aria-label="Send"]',
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

function matchingEditors(doc: Document): HTMLElement[] {
  try {
    return Array.from(doc.querySelectorAll(EDITOR_QUERY)).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
  } catch {
    return [];
  }
}

function ancestorChain(element: Element): Element[] {
  const chain: Element[] = [];
  for (
    let current: Element | null = element;
    current;
    current = current.parentElement
  ) {
    chain.push(current);
  }
  return chain;
}

/**
 * Higher when the shared ancestor is closer to both nodes. A send button
 * beside one composer must not scan a different composer higher in the page.
 */
function sharedAncestorScore(origin: Element, editor: Element): number {
  const originNodes = ancestorChain(origin);
  const editorNodes = new Set(ancestorChain(editor));
  for (let index = 0; index < originNodes.length; index += 1) {
    const node = originNodes[index];
    if (node !== undefined && editorNodes.has(node)) {
      return originNodes.length - index;
    }
  }
  return 0;
}

/** Editor used when a send button is clicked. Fails open if none is found. */
export function findEditorForSend(
  doc: Document,
  origin: EventTarget | null = null,
): HTMLElement | null {
  const start = elementFromTarget(origin);
  if (start) {
    let best: HTMLElement | null = null;
    let bestScore = 0;
    for (const editor of matchingEditors(doc)) {
      const score = sharedAncestorScore(start, editor);
      if (score > bestScore) {
        bestScore = score;
        best = editor;
      }
    }
    if (best) return best;
  }

  const active = doc.activeElement;
  if (active) {
    const fromActive = findEditor(active);
    if (fromActive) return fromActive;
  }
  return matchingEditors(doc)[0] ?? null;
}
