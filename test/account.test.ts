import { describe, expect, it } from "vitest";
import { detectAccount, redact } from "../src/index.js";

describe("detectAccount", () => {
  it("redacts a labeled account number", () => {
    const [match] = detectAccount("rekening 1234567890 atas nama");
    expect(match).toMatchObject({
      type: "REKENING",
      value: "1234567890",
      normalized: "1234567890",
    });
  });

  it("accepts norek with separators", () => {
    expect(detectAccount("norek 123-456-789012")[0]?.normalized).toBe(
      "123456789012",
    );
  });

  it("leaves unlabeled 10-digit runs", () => {
    expect(detectAccount("antrian 1234567890 dipanggil")).toEqual([]);
    const { redacted } = redact("antrian 1234567890 dipanggil", {
      detectors: ["REKENING"],
    });
    expect(redacted).toBe("antrian 1234567890 dipanggil");
  });
});
