import { describe, expect, it } from "vitest";
import { detectPassport, redact } from "../src/index.js";

describe("detectPassport", () => {
  it("redacts a labeled ordinary passport", () => {
    const [match] = detectPassport("Paspor C1234567 masih berlaku");
    expect(match).toMatchObject({
      type: "PASPOR",
      value: "C1234567",
      normalized: "C1234567",
    });
  });

  it("accepts a space after the letter when labeled", () => {
    expect(detectPassport("no. paspor A 7654321")[0]?.normalized).toBe(
      "A7654321",
    );
  });

  it("leaves an unlabeled letter-plus-seven-digits code", () => {
    expect(detectPassport("kode berkas C1234567")).toEqual([]);
    const { redacted } = redact("kode berkas C1234567");
    expect(redacted).toBe("kode berkas C1234567");
  });
});
