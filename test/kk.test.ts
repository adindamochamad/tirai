import { describe, expect, it } from "vitest";
import { detectKk, detectNik, redact } from "../src/index.js";

const VALUE = "3273014105850002";

describe("detectKk", () => {
  it("redacts a labeled 16-digit KK", () => {
    const [match] = detectKk(`Kartu Keluarga ${VALUE} fotokopi`);
    expect(match).toMatchObject({
      type: "KK",
      value: VALUE,
      normalized: VALUE,
    });
  });

  it("redacts no. kk grouped forms", () => {
    expect(detectKk("No. KK 327301 410585 0002")[0]?.normalized).toBe(VALUE);
  });

  it("does not redact an unlabeled 16-digit run", () => {
    expect(detectKk(`berkas ${VALUE} selesai`)).toEqual([]);
  });

  it("wins over NIK when the KK label is closer", () => {
    expect(detectNik(`KK ${VALUE}`)).toEqual([]);
    const { findings } = redact(`Kartu Keluarga ${VALUE}`);
    expect(findings.map((item) => item.type)).toEqual(["KK"]);
  });
});
