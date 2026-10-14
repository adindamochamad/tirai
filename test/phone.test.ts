import { describe, expect, it } from "vitest";
import { detectPhone, normalizePhone, redact, restore } from "../src/index.js";

const LOCAL = "081234567890";
const PLUS = "+62 812-3456-7890";
const NIK = "3171012501900003";

describe("detectPhone", () => {
  it("normalizes domestic and international forms to the same 62 number", () => {
    const expected = "6281234567890";
    for (const value of [
      LOCAL,
      PLUS,
      "6281234567890",
      "(+62)81234567890",
      "0812.3456.7890",
      "006281234567890",
    ]) {
      expect(normalizePhone(value)).toBe(expected);
    }
  });

  it("matches 0812 numbers", () => {
    expect(detectPhone(`HP ${LOCAL}`)[0]?.value).toBe(LOCAL);
  });

  it("matches +62 with dashes", () => {
    expect(detectPhone(PLUS)[0]?.value).toBe(PLUS);
    expect(detectPhone(PLUS)[0]?.normalized).toBe("6281234567890");
  });

  it("matches 62812, parenthesized +62, and dot separators", () => {
    expect(detectPhone("6281234567890")[0]?.normalized).toBe("6281234567890");
    expect(detectPhone("(+62) 812-3456-7890")[0]?.normalized).toBe(
      "6281234567890",
    );
    expect(detectPhone("0812.3456.7890")[0]?.value).toBe("0812.3456.7890");
  });

  it("matches the 0062 prefix", () => {
    expect(detectPhone("0062 812-3456-7890")[0]?.normalized).toBe(
      "6281234567890",
    );
  });

  it("accepts the short and long national lengths and rejects the neighbors", () => {
    expect(detectPhone("0812345678")).toHaveLength(1);
    expect(detectPhone("0812345678901")).toHaveLength(1);
    expect(detectPhone("081234567")).toEqual([]);
    expect(detectPhone("08123456789012")).toEqual([]);
  });

  it("does not match landlines", () => {
    expect(detectPhone("021-5551234")).toEqual([]);
    expect(detectPhone("(021) 5551234")).toEqual([]);
    expect(detectPhone("+62 21 79181234")).toEqual([]);
    expect(detectPhone("02138451234")).toEqual([]);
  });

  it("uses one token when the same number appears in two formats", () => {
    const text = `${LOCAL} sama dengan ${PLUS}`;
    const { redacted, vault, findings } = redact(text);
    expect(findings.map((finding) => finding.token)).toEqual([
      "[TELEPON_1]",
      "[TELEPON_1]",
    ]);
    expect(redacted).not.toContain(LOCAL);
    expect(redacted).not.toContain(PLUS);
    expect(restore(redacted, vault)).toBe(`${LOCAL} sama dengan ${LOCAL}`);
    expect(vault.get("[TELEPON_1]")?.original).toBe(LOCAL);
  });

  it("keeps a phone next to a NIK as two findings and round-trips", () => {
    const text = `NIK ${NIK} HP ${LOCAL}`;
    const { redacted, vault, findings } = redact(text);
    expect(findings.map((finding) => finding.type)).toEqual(["NIK", "TELEPON"]);
    expect(redacted).toBe("NIK [NIK_1] HP [TELEPON_1]");
    expect(restore(redacted, vault)).toBe(text);
  });

  it("does not let a 16-digit NIK that begins with 62 become a phone", () => {
    const nik = "6281011508800001";
    const { redacted, findings } = redact(nik);
    expect(findings.map((finding) => finding.type)).toEqual(["NIK"]);
    expect(redacted).toBe("[NIK_1]");
  });

  it("round-trips one phone exactly", () => {
    const text = `hubungi ${PLUS} ya`;
    const { redacted, vault } = redact(text);
    expect(restore(redacted, vault)).toBe(text);
    expect(redacted).not.toContain("812-3456-7890");
  });
});
