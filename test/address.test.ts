import { describe, expect, it } from "vitest";
import { detectAddress, redact } from "../src/index.js";

describe("detectAddress", () => {
  it("redacts a street with house number and RT/RW", () => {
    const value = "Jl. Melati No. 12, RT 03/RW 05";
    const [match] = detectAddress(`tinggal di ${value} sementara`);
    expect(match?.value).toBe(value);
    expect(match?.type).toBe("ALAMAT");
  });

  it("does not eat 'Jalan yang' in ordinary prose", () => {
    expect(detectAddress("Jalan yang benar adalah menunggu giliran")).toEqual(
      [],
    );
  });

  it("does not redact a bare kelurahan mention", () => {
    const { redacted } = redact(
      "Warga dari kelurahan Melati datang tanpa alamat jalan.",
      { detectors: ["ALAMAT"] },
    );
    expect(redacted).toContain("kelurahan Melati");
  });

  it("redacts a labeled alamat clause", () => {
    const [match] = detectAddress("Alamat: Gang Kenanga 4, Kelurahan Menteng");
    expect(match?.value).toBe("Gang Kenanga 4, Kelurahan Menteng");
  });
});
