import { describe, expect, it } from "vitest";
import { detectNik, redact, restore } from "../src/index.js";

const VALID = "3171012501900003";
const FEMALE = "3273014105850002";
const DAY_71 = "5101017107120002";

function tokens(text: string, nikStrict?: boolean): string[] {
  return redact(
    text,
    nikStrict === undefined ? undefined : { nikStrict },
  ).findings.map((finding) => finding.token);
}

describe("detectNik", () => {
  it("redacts a valid unlabeled 16-digit NIK", () => {
    const [match] = detectNik(`berkas ${VALID} selesai`);
    expect(match).toMatchObject({
      type: "NIK",
      value: VALID,
      normalized: VALID,
    });
  });

  it("redacts a labeled grouped NIK with spaces", () => {
    const value = "317101 250190 0003";
    const [match] = detectNik(`NIK ${value} sesuai`);
    expect(match?.value).toBe(value);
    expect(match?.normalized).toBe(VALID);
  });

  it("redacts labeled grouped forms with dot, dash, and slash", () => {
    expect(detectNik("No. KTP 317101.250190.0003")[0]?.normalized).toBe(VALID);
    expect(detectNik("KTP 317101-250190-0003")[0]?.normalized).toBe(VALID);
    expect(
      detectNik("nomor induk kependudukan 317101/250190/0003")[0]?.normalized,
    ).toBe(VALID);
  });

  it("does not match 15 or 17 digit runs", () => {
    expect(detectNik("317101250190000")).toEqual([]);
    expect(detectNik("31710125019000031")).toEqual([]);
    expect(detectNik(`NIK 317101250190000`)).toEqual([]);
    expect(detectNik(`NIK 31710125019000031`)).toEqual([]);
  });

  it("matches a NIK glued to its label", () => {
    expect(detectNik(`NIK:${VALID}`)[0]?.value).toBe(VALID);
    expect(detectNik(`KTP${VALID}`)[0]?.value).toBe(VALID);
  });

  it("skips an unlabeled NIK with an impossible date", () => {
    expect(detectNik("kode 3171013213900001")).toEqual([]);
    expect(detectNik("kode 3171010012900001")).toEqual([]);
    expect(detectNik("kode 3171014001900001")).toEqual([]);
  });

  it("still redacts a labeled NIK when the date heuristic fails", () => {
    expect(detectNik("NIK 3171013213900001")[0]?.normalized).toBe(
      "3171013213900001",
    );
    expect(detectNik("NIK 9901011501900001")[0]?.value).toBe(
      "9901011501900001",
    );
  });

  it("does not match an unlabeled NIK with an unknown province code", () => {
    expect(detectNik("9901011501900001")).toEqual([]);
  });

  it("accepts the female day offset and day 71", () => {
    expect(detectNik(FEMALE)[0]?.normalized).toBe(FEMALE);
    expect(detectNik(DAY_71)[0]?.normalized).toBe(DAY_71);
  });

  it("never treats a run starting with 0 as a NIK", () => {
    expect(detectNik("0171012501900003")).toEqual([]);
    expect(detectNik("NIK 0171012501900003")).toEqual([]);
    expect(detectNik("+6281011508800001")).toEqual([]);
  });

  it("does not redact an unlabeled grouped number", () => {
    expect(detectNik("317101 250190 0003")).toEqual([]);
  });

  it("redacts every unlabeled 16-digit run when nikStrict is false", () => {
    const raw = "9901013201900001";
    expect(detectNik(raw)).toEqual([]);
    expect(detectNik(raw, { strict: false })[0]?.value).toBe(raw);
    expect(detectNik("0171012501900003", { strict: false })).toEqual([]);
  });

  it("gives one token to a repeated NIK and the next token to a new one", () => {
    const text = `${VALID} dan ${VALID} serta ${FEMALE}`;
    const { redacted, vault, findings } = redact(text);
    expect(findings.map((finding) => finding.token)).toEqual([
      "[NIK_1]",
      "[NIK_1]",
      "[NIK_2]",
    ]);
    expect(redacted).not.toContain(VALID);
    expect(redacted).not.toContain(FEMALE);
    expect(restore(redacted, vault)).toBe(text);
  });

  it("round-trips a single NIK exactly", () => {
    const text = `Pemohon ${VALID} datang.`;
    const { redacted, vault } = redact(text);
    expect(redacted).toBe("Pemohon [NIK_1] datang.");
    expect(restore(redacted, vault)).toBe(text);
    expect(tokens(text)).toEqual(["[NIK_1]"]);
  });
});
