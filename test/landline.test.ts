import { describe, expect, it } from "vitest";
import { detectLandline, detectPhone, redact, restore } from "../src/index.js";
import { AREA_CODES } from "../src/constants/areaCodes.js";

describe("detectLandline", () => {
  it("contains metro area codes from the Wikipedia check", () => {
    for (const code of [
      "21",
      "22",
      "24",
      "31",
      "61",
      "251",
      "274",
      "361",
      "411",
      "711",
      "778",
      "967",
    ]) {
      expect(AREA_CODES.has(code)).toBe(true);
    }
    expect(AREA_CODES.has("8")).toBe(false);
    expect(AREA_CODES.has("812")).toBe(false);
  });

  it("matches Jakarta with a hyphen", () => {
    expect(detectLandline("021-5551234")[0]?.value).toBe("021-5551234");
    expect(detectLandline("021-5551234")[0]?.type).toBe("TELEPON");
  });

  it("matches parenthesized and international forms", () => {
    expect(detectLandline("(021) 5551234")[0]?.normalized).toBe("62215551234");
    expect(detectLandline("+62 21 79181234")[0]?.normalized).toBe(
      "622179181234",
    );
  });

  it("does not treat mobiles as landlines", () => {
    expect(detectLandline("081234567890")).toEqual([]);
    expect(detectPhone("021-5551234")).toEqual([]);
  });

  it("does not match an unknown area code", () => {
    expect(detectLandline("089-5551234")).toEqual([]);
  });

  it("round-trips through redact", () => {
    const text = "kantor 021-5551234 tutup";
    const { redacted, vault } = redact(text);
    expect(redacted).toBe("kantor [TELEPON_1] tutup");
    expect(restore(redacted, vault)).toBe(text);
  });
});
