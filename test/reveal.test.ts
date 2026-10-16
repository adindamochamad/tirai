// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { deliverContentMessage } from "../extension/src/content/deliver.ts";
import {
  installRevealPanel,
  renderedRevealText,
  setRevealOpen,
} from "../extension/src/content/reveal.ts";
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
    expect(panel).toBeInstanceOf(HTMLElement);
    if (!(panel instanceof HTMLElement)) return;

    setRevealOpen(document, true);

    expect(reply.textContent).toBe(redacted);
    expect(reply.textContent).not.toContain(NIK);
    expect(panel.textContent ?? "").not.toContain(NIK);
    expect(panel.innerHTML).not.toContain(NIK);
    expect(panel.shadowRoot).toBeNull();
    expect(renderedRevealText(document)).toContain("[NIK_1]");
    expect(renderedRevealText(document)).toContain(NIK);
    expect(reply.contains(panel)).toBe(false);

    setRevealOpen(document, false);
    expect(renderedRevealText(document)).toBe("");
  });

  it("drops originals from the panel when the tab vault is cleared", () => {
    const vault = new Vault();
    redact(`NIK ${NIK}`, { vault });
    uninstalls.push(installRevealPanel(document, vault));
    setRevealOpen(document, true);
    expect(renderedRevealText(document)).toContain(NIK);

    expect(deliverContentMessage({ type: "clear" }, vault, document)).toEqual({
      ok: true,
    });

    expect(vault.size()).toBe(0);
    expect(renderedRevealText(document)).not.toContain(NIK);
    expect(
      document.getElementById("tirai-reveal-panel")?.textContent ?? "",
    ).not.toContain(NIK);
  });
});
