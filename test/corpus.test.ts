import { describe, expect, it } from "vitest";
import { redact, restore } from "../src/index.js";
import { SYNTHETIC_MARK, samples } from "./fixtures/samples.js";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function isSyntheticNik(digits: string): boolean {
  return (
    digits.length === 16 &&
    ["010101", "410101"].includes(digits.slice(6, 12)) &&
    /^000\d$/.test(digits.slice(12))
  );
}

function isSyntheticPhone(digits: string): boolean {
  if (digits.includes("555")) return true;
  const national = digits
    .replace(/^0062/, "")
    .replace(/^62/, "")
    .replace(/^0/, "");
  return national.startsWith("8000000");
}

describe("corpus", () => {
  it("has at least 30 synthetic samples", () => {
    expect(samples.length).toBeGreaterThanOrEqual(30);
  });

  it.each(samples)(
    "$id redacts listed secrets and restores exactly",
    (sample) => {
      const { redacted, vault } = redact(sample.text);
      for (const secret of sample.secrets) {
        expect(sample.text).toContain(secret);
        expect(redacted).not.toContain(secret);
      }
      expect(restore(redacted, vault)).toBe(sample.text);
      if (sample.secrets.length === 0) {
        expect(redacted).toBe(sample.text);
      }
    },
  );

  it("uses clearly synthetic NIK and phone values", () => {
    for (const sample of samples) {
      const { findings } = redact(sample.text);
      for (const finding of findings) {
        const digits = digitsOnly(
          sample.text.slice(finding.start, finding.end),
        );
        if (finding.type === "NIK" || finding.type === "KK") {
          expect(isSyntheticNik(digits), sample.id).toBe(true);
        }
        if (finding.type === "TELEPON") {
          expect(isSyntheticPhone(digits), sample.id).toBe(true);
        }
      }
      const needsMark = findings.some(
        (finding) =>
          finding.type === "NIK" ||
          finding.type === "KK" ||
          finding.type === "TELEPON",
      );
      if (needsMark) {
        expect(sample.text, sample.id).toContain(SYNTHETIC_MARK);
      }
    }
  });
});
