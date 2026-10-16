import { describe, expect, it } from "vitest";
import { detectCard, redact } from "../src/index.js";

const VISA = "4111 1111 1111 1111";
const NIK = "3171012501900003";

describe("detectCard", () => {
  it("redacts a grouped Visa test number", () => {
    const [match] = detectCard(`bayar ${VISA} lunas`);
    expect(match).toMatchObject({
      type: "KARTU",
      value: VISA,
      normalized: "4111111111111111",
    });
  });

  it("redacts a labeled compact card", () => {
    expect(detectCard("kartu kredit 4111111111111111")[0]?.normalized).toBe(
      "4111111111111111",
    );
  });

  it("does not treat an unlabeled 16-digit NIK as a card", () => {
    expect(detectCard(NIK)).toEqual([]);
    const { findings } = redact(NIK);
    expect(findings.map((item) => item.type)).toEqual(["NIK"]);
  });

  it("rejects a grouped number that fails Luhn", () => {
    expect(detectCard("4111 1111 1111 1112")).toEqual([]);
  });
});
