// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { installSendGuard } from "../extension/src/content/send-guard.js";
import { Vault } from "../src/vault.ts";

const NIK = "3171012501900003";

describe("send guard", () => {
  const uninstalls: Array<() => void> = [];

  afterEach(() => {
    for (const uninstall of uninstalls) uninstall();
    uninstalls.length = 0;
    document.body.replaceChildren();
    document.getElementById("tirai-send-dialog")?.remove();
  });

  function mountEditor(): HTMLTextAreaElement {
    const editor = document.createElement("textarea");
    editor.id = "prompt-textarea";
    document.body.append(editor);
    return editor;
  }

  function install(isEnabled = () => true, vault = new Vault()): Vault {
    uninstalls.push(
      installSendGuard({
        doc: document,
        vault,
        isEnabled,
      }),
    );
    return vault;
  }

  function pressEnter(target: Element): KeyboardEvent {
    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  }

  it("blocks Enter once when raw PII is still in the editor", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install();

    const blocked = pressEnter(editor);
    expect(blocked.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
    expect(editor.value).toContain(NIK);
  });

  it("allows the next Enter after Kirim apa adanya for the same text", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install();

    pressEnter(editor);
    const anyway = document.querySelector(
      "#tirai-send-dialog button:nth-of-type(2)",
    ) as HTMLButtonElement | null;
    anyway?.click();

    const allowed = pressEnter(editor);
    expect(allowed.defaultPrevented).toBe(false);
  });

  it("redacts editor text when Samarakan is chosen", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install();

    pressEnter(editor);
    const redact = document.querySelector(
      "#tirai-send-dialog button:nth-of-type(1)",
    ) as HTMLButtonElement | null;
    redact?.click();

    expect(editor.value).toContain("[NIK_1]");
    expect(editor.value).not.toContain(NIK);
  });

  it("does not hook Enter when disabled", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install(() => false);

    const event = pressEnter(editor);
    expect(event.defaultPrevented).toBe(false);
    expect(document.getElementById("tirai-send-dialog")).toBeNull();
  });

  it("does not hook Enter outside the editor", () => {
    mountEditor();
    const other = document.createElement("input");
    document.body.append(other);
    install();

    const event = pressEnter(other);
    expect(event.defaultPrevented).toBe(false);
  });

  it("redacts the text that is in the editor when Samarakan is clicked", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install();

    pressEnter(editor);
    editor.value = "teks yang sudah diperbaiki";
    const redact = document.querySelector(
      "#tirai-send-dialog button:nth-of-type(1)",
    ) as HTMLButtonElement | null;
    redact?.click();

    expect(editor.value).toBe("teks yang sudah diperbaiki");
    expect(editor.value).not.toContain(NIK);
  });

  it("does not treat an IME composition Enter as a send", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    install();

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    editor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(document.getElementById("tirai-send-dialog")).toBeNull();
  });

  it("blocks Enter in the logged-out ChatGPT composer", () => {
    const editor = document.createElement("textarea");
    editor.id = "mobile-composer-prompt";
    editor.value = `NIK ${NIK}`;
    document.body.append(editor);
    install();

    const event = pressEnter(editor);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("blocks the logged-in ChatGPT send button", () => {
    const editor = document.createElement("div");
    editor.className = "ProseMirror";
    editor.setAttribute("contenteditable", "true");
    editor.textContent = NIK;
    const send = document.createElement("button");
    send.setAttribute("aria-label", "Send");
    const form = document.createElement("form");
    form.append(editor, send);
    document.body.append(form);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("blocks the logged-out ChatGPT send button", () => {
    const editor = document.createElement("textarea");
    editor.id = "mobile-composer-prompt";
    editor.value = `NIK ${NIK}`;
    const send = document.createElement("button");
    send.type = "submit";
    send.setAttribute("aria-label", "Send message");
    const form = document.createElement("form");
    form.append(editor, send);
    document.body.append(form);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("blocks the Claude send control when raw PII is present", () => {
    const editor = document.createElement("div");
    editor.setAttribute("data-cds", "ChatComposerEditor");
    editor.setAttribute("contenteditable", "true");
    editor.textContent = `NIK ${NIK}`;
    const send = document.createElement("button");
    send.setAttribute("data-testid", "chat-input-send");
    send.setAttribute("aria-label", "Send message");
    const composer = document.createElement("div");
    composer.append(editor, send);
    document.body.append(composer);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("blocks a send-button click when raw PII is present", () => {
    const editor = mountEditor();
    editor.value = `NIK ${NIK}`;
    const send = document.createElement("button");
    send.setAttribute("data-testid", "send-button");
    document.body.append(send);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("blocks the composer next to the clicked send button", () => {
    const idle = document.createElement("section");
    const active = document.createElement("section");
    const empty = document.createElement("div");
    empty.className = "ProseMirror";
    empty.setAttribute("contenteditable", "true");
    const dirty = document.createElement("div");
    dirty.className = "ProseMirror";
    dirty.setAttribute("contenteditable", "true");
    dirty.textContent = `NIK ${NIK}`;
    const send = document.createElement("button");
    send.setAttribute("data-testid", "send-button");
    idle.append(empty);
    active.append(dirty, send);
    document.body.append(idle, active);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.getElementById("tirai-send-dialog")).not.toBeNull();
  });

  it("does not block a composer that has no raw PII", () => {
    const idle = document.createElement("section");
    const active = document.createElement("section");
    const dirty = document.createElement("div");
    dirty.className = "ProseMirror";
    dirty.setAttribute("contenteditable", "true");
    dirty.textContent = `NIK ${NIK}`;
    const empty = document.createElement("div");
    empty.className = "ProseMirror";
    empty.setAttribute("contenteditable", "true");
    const send = document.createElement("button");
    send.setAttribute("data-testid", "send-button");
    idle.append(dirty);
    active.append(empty, send);
    document.body.append(idle, active);
    install();

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    send.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(document.getElementById("tirai-send-dialog")).toBeNull();
  });
});
