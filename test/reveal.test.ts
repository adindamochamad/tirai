// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { installRevealPanel } from "../extension/src/content/reveal.js";
import { redact } from "../src/redact.ts";
import { Vault } from "../src/vault.ts";

const NIK = "3171012501900003";

describe("reveal panel", () => {
  const uninstalls: Array<() => void> = [];

  afterEach(() => {
    for (const uninstall of uninstalls) uninstall();
    uninstalls.length = 0;
    document.body.replaceChildren();
    document.getElementById("tirai-reveal-panel")?.remove();
  });

  it("shows originals in the extension panel without changing reply text nodes", () => {
    const vault = new Vault();
    const { redacted } = redact(`NIK ${NIK}`, { vault });
    uninstalls.push(installRevealPanel(document, vault));

    const reply = document.createElement("div");
    reply.className = "reply";
    reply.append(document.createTextNode(redacted));
    document.body.append(reply);

    const panel = document.getElementById("tirai-reveal-panel");
    const checkbox = panel?.querySelector("input[type=checkbox]");
    expect(checkbox).toBeInstanceOf(HTMLInputElement);
    if (!(checkbox instanceof HTMLInputElement)) return;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(reply.textContent).toBe(redacted);
    expect(reply.textContent).not.toContain(NIK);
    expect(panel?.textContent).toContain("[NIK_1]");
    expect(panel?.textContent).toContain(NIK);
    expect(reply.contains(panel)).toBe(false);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    const list = panel?.querySelector("div:last-child");
    expect(list?.textContent).toBe("");
  });
});
