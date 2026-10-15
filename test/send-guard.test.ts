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
});
