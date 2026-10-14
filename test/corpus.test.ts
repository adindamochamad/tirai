import { describe, expect, it } from "vitest";
import { redact, restore } from "../src/index.js";
import { samples } from "./fixtures/samples.js";

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
});
