import { describe, expect, it } from "vitest";
import { detectNpwp, redact, restore } from "../src/index.js";

const FORMATTED = "07.654.321.0-012.000";
const PLAIN15 = "076543210012000";

describe("detectNpwp", () => {
  it("redacts a formatted 15-digit NPWP without a label", () => {
    const [match] = detectNpwp(`SPT ${FORMATTED} selesai`);
    expect(match).toMatchObject({
      type: "NPWP",
      value: FORMATTED,
      normalized: PLAIN15,
    });
  });

  it("redacts a labeled unformatted 15-digit run", () => {
    expect(detectNpwp(`NPWP ${PLAIN15}`)[0]?.normalized).toBe(PLAIN15);
  });

  it("redacts a labeled 16-digit NPWP", () => {
    const value = "3171012501900003";
    expect(detectNpwp(`NPWP ${value}`)[0]?.type).toBe("NPWP");
    const { findings } = redact(`NPWP ${value}`);
    expect(findings.map((item) => item.type)).toEqual(["NPWP"]);
  });

  it("types a 16-digit NPWP when words sit between the label and the number", () => {
    const value = "3171012501900003";
    const text = `NPWP orang pribadi sekarang ${value}`;
    expect(detectNpwp(text)[0]?.type).toBe("NPWP");
    const { redacted, findings } = redact(text);
    expect(findings.map((item) => item.type)).toEqual(["NPWP"]);
    expect(redacted).toBe("NPWP orang pribadi sekarang [NPWP_1]");
  });

  it("does not redact unlabeled consecutive 15 digits", () => {
    expect(detectNpwp(`berkas ${PLAIN15} agenda`)).toEqual([]);
  });

  it("round-trips a formatted NPWP", () => {
    const text = `pajak ${FORMATTED} tercatat`;
    const { redacted, vault } = redact(text);
    expect(redacted).toBe("pajak [NPWP_1] tercatat");
    expect(restore(redacted, vault)).toBe(text);
  });
});
