import { describe, expect, it } from "vitest";
import { redact } from "../src/index.js";

describe("performance", () => {
  it("redacts 100 KB in under 500 ms", () => {
    const unit =
      "Laporan parkir. NIK 3171012501900003, HP 081234567890, plat B 4321 XYZ. " +
      "Telepon kantor 021-5551234 tidak ikut. Antrian loket B 12 biasa. ";
    let text = "";
    while (text.length < 100_000) text += unit;

    const started = performance.now();
    const { redacted } = redact(text);
    const elapsed = performance.now() - started;

    expect(text.length).toBeGreaterThanOrEqual(100_000);
    expect(elapsed).toBeLessThan(500);
    expect(redacted).not.toContain("3171012501900003");
    expect(redacted).not.toContain("081234567890");
    expect(redacted).not.toContain("B 4321 XYZ");
    expect(redacted).not.toContain("021-5551234");
    expect(redacted).toContain("B 12");
  });
});
