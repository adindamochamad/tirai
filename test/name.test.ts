import { describe, expect, it } from "vitest";
import { detectName, redact } from "../src/index.js";

describe("detectName", () => {
  it("redacts a labeled pelapor name", () => {
    const [match] = detectName(
      "Nama pelapor Siti Aminah dari kelurahan Melati",
    );
    expect(match).toMatchObject({
      type: "NAMA",
      value: "Siti Aminah",
    });
  });

  it("leaves an unlabeled given name in prose", () => {
    expect(detectName("Saya Budi, motor ditilang")).toEqual([]);
    const { redacted } = redact("Saya Budi, motor ditilang");
    expect(redacted).toContain("Budi");
  });

  it("accepts a.n. labels", () => {
    expect(detectName("a.n. Budi Santoso")[0]?.value).toBe("Budi Santoso");
  });

  it("does not treat 'nama perusahaan' as a personal name", () => {
    expect(detectName("Nama perusahaan Toko Maju Jaya dari Jakarta")).toEqual(
      [],
    );
  });

  it("stops a sdr name before a following verb", () => {
    expect(detectName("sdr Budi Santoso datang ke loket")[0]?.value).toBe(
      "Budi Santoso",
    );
  });

  it("does not redact the word after 'nama pemohon'", () => {
    const { redacted } = redact("rekening 1234567890 atas nama pemohon");
    expect(redacted).toContain("pemohon");
    expect(redacted).not.toContain("[NAMA_");
  });
});
