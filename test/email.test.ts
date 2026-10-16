import { describe, expect, it } from "vitest";
import { detectEmail, redact, restore } from "../src/index.js";

const EMAIL = "siti.aminah@contoh.id";

describe("detectEmail", () => {
  it("redacts a typical address", () => {
    const [match] = detectEmail(`kirim ke ${EMAIL} ya`);
    expect(match).toMatchObject({
      type: "EMAIL",
      value: EMAIL,
      normalized: EMAIL,
    });
  });

  it("normalizes case", () => {
    expect(detectEmail("Hubungi Siti.Aminah@Contoh.ID")[0]?.normalized).toBe(
      EMAIL,
    );
  });

  it("rejects a local-only host", () => {
    expect(detectEmail("user@localhost")).toEqual([]);
  });

  it("keeps a trailing sentence period outside the match", () => {
    const [match] = detectEmail("hubungi budi@contoh.id.");
    expect(match?.value).toBe("budi@contoh.id");
  });

  it("keeps a trailing comma outside the match", () => {
    expect(detectEmail("kirim ke budi@contoh.id, ya")[0]?.value).toBe(
      "budi@contoh.id",
    );
  });

  it("round-trips", () => {
    const text = `surel ${EMAIL} aktif`;
    const { redacted, vault } = redact(text);
    expect(redacted).toBe("surel [EMAIL_1] aktif");
    expect(restore(redacted, vault)).toBe(text);
  });
});
