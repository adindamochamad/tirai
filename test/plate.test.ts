import { describe, expect, it } from "vitest";
import { detectPlate, redact, restore } from "../src/index.js";

describe("detectPlate", () => {
  it("matches a spaced Jakarta plate", () => {
    const [match] = detectPlate("motor B 1234 ABC lewat");
    expect(match).toMatchObject({
      value: "B 1234 ABC",
      normalized: "B1234ABC",
    });
  });

  it("matches a two-letter region code", () => {
    expect(detectPlate("truk AB 1234 XY")[0]?.normalized).toBe("AB1234XY");
  });

  it("matches a compact plate", () => {
    expect(detectPlate("mobil D1234AB")[0]?.value).toBe("D1234AB");
  });

  it("matches a labeled lowercase plate", () => {
    const [match] = detectPlate("nopol b 1234 abc terpasang");
    expect(match).toMatchObject({
      value: "b 1234 abc",
      normalized: "B1234ABC",
    });
  });

  it("matches other plate labels, including mixed case", () => {
    expect(detectPlate("Plat: b 999 zz")[0]?.normalized).toBe("B999ZZ");
    expect(detectPlate("no. pol f 12 xx")[0]?.normalized).toBe("F12XX");
    expect(detectPlate("nomor polisi L 5 Q")[0]?.normalized).toBe("L5Q");
  });

  it("rejects an unknown region code", () => {
    expect(detectPlate("QQ 1234 ABC")).toEqual([]);
    expect(detectPlate("C 1234 AB")).toEqual([]);
  });

  it("does not match a short unlabeled fragment in prose", () => {
    expect(detectPlate("pilih jawaban A 1 untuk setuju")).toEqual([]);
    expect(detectPlate("antrian loket B 12 sudah panjang")).toEqual([]);
  });

  it("does not match a lowercase plate without a label", () => {
    expect(detectPlate("tertulis b 1234 abc di kertas")).toEqual([]);
  });

  it("matches a plate beside punctuation", () => {
    expect(detectPlate("lihat (B 1234 ABC).")[0]?.value).toBe("B 1234 ABC");
  });

  it("uses one token for a repeated plate and round-trips", () => {
    const text = "B 1234 ABC lalu B 1234 ABC";
    const { redacted, vault, findings } = redact(text);
    expect(findings.map((finding) => finding.token)).toEqual([
      "[PLAT_1]",
      "[PLAT_1]",
    ]);
    expect(redacted).toBe("[PLAT_1] lalu [PLAT_1]");
    expect(restore(redacted, vault)).toBe(text);
  });

  it("lets a label match a plate with no letter suffix", () => {
    expect(detectPlate("nopol B 1234 diparkir")[0]?.normalized).toBe("B1234");
    expect(detectPlate("B 1234 diparkir")).toEqual([]);
  });
});
