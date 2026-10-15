// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { showRedactionNote } from "../extension/src/content/note.ts";
import { installPasteRedactor } from "../extension/src/content/paste.ts";
import { Vault } from "../src/vault.ts";

const NIK = "3171012501900003";
const PHONE = "0812-3456-7890";
const PLATE = "B 4321 XYZ";
const EXAMPLE = `Saya Budi, NIK ${NIK}, HP ${PHONE}, motor ${PLATE} ditilang.`;
const REDACTED =
  "Saya Budi, NIK [NIK_1], HP [TELEPON_1], motor [PLAT_1] ditilang.";

function dispatchPaste(target: Element, text: string): Event {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    configurable: true,
    value: {
      getData(type: string) {
        return type === "text/plain" ? text : "";
      },
    },
  });
  target.dispatchEvent(event);
  return event;
}

describe("paste redaction", () => {
  const uninstalls: Array<() => void> = [];

  afterEach(() => {
    for (const uninstall of uninstalls) uninstall();
    uninstalls.length = 0;
    document.body.replaceChildren();
    document.getElementById("tirai-redaction-note")?.remove();
  });

  function mount(
    tag: "textarea" | "div",
    attributes: Record<string, string> = {},
  ) {
    const editor = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
      editor.setAttribute(name, value);
    }
    document.body.append(editor);
    return editor;
  }

  function install(vault = new Vault(), isEnabled = () => true): Vault {
    uninstalls.push(
      installPasteRedactor(document, {
        vault,
        isEnabled,
        notify: (count) => showRedactionNote(document, count),
      }),
    );
    return vault;
  }

  it("inserts tokens instead of the pasted values", () => {
    const editor = mount("textarea", { id: "prompt-textarea" });
    install();

    const event = dispatchPaste(editor, EXAMPLE);

    expect(event.defaultPrevented).toBe(true);
    expect(editor).toBeInstanceOf(HTMLTextAreaElement);
    if (!(editor instanceof HTMLTextAreaElement)) return;
    expect(editor.value).toBe(REDACTED);
    expect(editor.value).not.toContain(NIK);
    expect(editor.value).not.toContain(PHONE);
    expect(editor.value).not.toContain(PLATE);
    const note = document.getElementById("tirai-redaction-note");
    expect(note?.textContent).toBe("3 data disamarkan");
    expect(note?.textContent).not.toContain(NIK);
    expect(editor.contains(note)).toBe(false);
  });

  it("redacts a paste into the Claude editor", () => {
    const editor = mount("div", {
      class: "ProseMirror",
      contenteditable: "true",
    });
    install();

    dispatchPaste(editor, `HP ${PHONE}`);

    expect(editor.textContent).toContain("[TELEPON_1]");
    expect(editor.textContent).not.toContain(PHONE);
  });

  it("reuses the tab vault for a later paste", () => {
    const editor = mount("textarea", { id: "prompt-textarea" });
    const vault = install();
    dispatchPaste(editor, `NIK ${NIK}`);
    if (!(editor instanceof HTMLTextAreaElement)) return;
    editor.setSelectionRange(editor.value.length, editor.value.length);

    dispatchPaste(editor, ` dan NIK ${NIK}`);

    expect(editor.value).toContain("[NIK_1]");
    expect(editor.value).not.toContain("[NIK_2]");
    expect(editor.value).not.toContain(NIK);
    expect(vault.size()).toBe(1);
  });

  it("leaves a paste outside the editor unchanged", () => {
    const other = mount("textarea");
    install();

    const event = dispatchPaste(other, `NIK ${NIK}`);

    expect(event.defaultPrevented).toBe(false);
    expect(other).toBeInstanceOf(HTMLTextAreaElement);
    if (!(other instanceof HTMLTextAreaElement)) return;
    expect(other.value).toBe("");
  });

  it("does not treat every contenteditable as an editor", () => {
    const loose = mount("div", { contenteditable: "true" });
    install();

    const event = dispatchPaste(loose, `NIK ${NIK}`);

    expect(event.defaultPrevented).toBe(false);
    expect(loose.textContent).toBe("");
  });

  it("does not intercept paste while disabled", () => {
    const editor = mount("textarea", { id: "prompt-textarea" });
    install(new Vault(), () => false);

    const event = dispatchPaste(editor, EXAMPLE);

    expect(event.defaultPrevented).toBe(false);
    if (!(editor instanceof HTMLTextAreaElement)) return;
    expect(editor.value).toBe("");
    expect(document.getElementById("tirai-redaction-note")).toBeNull();
  });

  it("lets an ordinary paste through", () => {
    const editor = mount("textarea", { id: "prompt-textarea" });
    install();

    const event = dispatchPaste(editor, "Saya Budi saja.");

    expect(event.defaultPrevented).toBe(false);
    if (!(editor instanceof HTMLTextAreaElement)) return;
    expect(editor.value).toBe("");
  });
});
