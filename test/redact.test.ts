import { describe, expect, it } from "vitest";
import {
  redact,
  resolveOverlaps,
  restore,
  Vault,
  type Match,
} from "../src/index.js";

const NIK = "3171012501900003";
const PHONE = "0812-3456-7890";
const PLATE = "B 4321 XYZ";
const EXAMPLE = `Saya Budi, NIK ${NIK}, HP ${PHONE}, motor ${PLATE} ditilang.`;

function match(partial: Pick<Match, "type" | "start" | "end">): Match {
  return {
    ...partial,
    value: "x",
    normalized: partial.type,
  };
}

describe("redact and restore", () => {
  it("matches the documented before and after example", () => {
    const { redacted, vault } = redact(EXAMPLE);
    expect(redacted).toBe(
      "Saya Budi, NIK [NIK_1], HP [TELEPON_1], motor [PLAT_1] ditilang.",
    );
    expect(redacted).toContain("Budi");
    expect(restore(redacted, vault)).toBe(EXAMPLE);
  });

  it("records original offsets and omits the original value from findings", () => {
    const { findings } = redact(EXAMPLE);
    expect(findings.map((finding) => Object.keys(finding).sort())).toEqual([
      ["end", "start", "token", "type"],
      ["end", "start", "token", "type"],
      ["end", "start", "token", "type"],
    ]);
    expect(EXAMPLE.slice(findings[0]!.start, findings[0]!.end)).toBe(NIK);
    expect(EXAMPLE.slice(findings[1]!.start, findings[1]!.end)).toBe(PHONE);
    expect(EXAMPLE.slice(findings[2]!.start, findings[2]!.end)).toBe(PLATE);
    expect(JSON.stringify(findings)).not.toContain(NIK);
  });

  it("skips token numbers already present in the input", () => {
    const text = `lihat [NIK_1] lalu NIK ${NIK} dan [NIK_3]`;
    const { redacted, findings } = redact(text);
    expect(findings.map((finding) => finding.token)).toEqual(["[NIK_2]"]);
    expect(redacted).toContain("[NIK_1]");
    expect(redacted).toContain("[NIK_2]");
    expect(redacted).toContain("[NIK_3]");
    expect(redacted).not.toContain(NIK);
  });

  it("reuses a vault across calls", () => {
    const vault = new Vault();
    const first = redact(`HP 081234567890`, { vault });
    const second = redact("hubungi +62 812-3456-7890", { vault });
    const third = redact("lainnya 081298765432", { vault });
    expect(first.findings[0]?.token).toBe("[TELEPON_1]");
    expect(second.findings[0]?.token).toBe("[TELEPON_1]");
    expect(third.findings[0]?.token).toBe("[TELEPON_2]");
  });

  it("restores loose tokens and leaves unknown tokens alone", () => {
    const { vault } = redact(EXAMPLE);
    expect(restore("hubungi [ telepon_1 ] beres", vault)).toBe(
      `hubungi ${PHONE} beres`,
    );
    expect(restore("kode [NIK_9] tetap", vault)).toBe("kode [NIK_9] tetap");
    expect(restore("bukan [PLAT-1]", vault)).toBe("bukan [PLAT-1]");
  });

  it("can disable detectors", () => {
    const { redacted } = redact(EXAMPLE, { detectors: ["NIK"] });
    expect(redacted).toContain("[NIK_1]");
    expect(redacted).toContain(PHONE);
    expect(redacted).toContain(PLATE);
  });

  it("rejects a vault that is not a Vault instance", () => {
    const fake = {
      get: () => undefined,
      findByNormalized: () => undefined,
      size: () => 0,
      clear: () => undefined,
      toJSON: () => "[Vault: 0 entries]",
    };
    expect(() => redact("teks", { vault: fake as never })).toThrow(TypeError);
  });

  it("keeps the longer span, and on a tie prefers KK over NIK over phone over plate", () => {
    const longer = resolveOverlaps([
      match({ type: "NIK", start: 0, end: 4 }),
      match({ type: "TELEPON", start: 2, end: 10 }),
    ]);
    expect(longer.map((item) => item.type)).toEqual(["TELEPON"]);

    const tie = resolveOverlaps([
      match({ type: "PLAT", start: 0, end: 5 }),
      match({ type: "TELEPON", start: 0, end: 5 }),
      match({ type: "NIK", start: 0, end: 5 }),
    ]);
    expect(tie.map((item) => item.type)).toEqual(["NIK"]);

    const kkOverNik = resolveOverlaps([
      match({ type: "NIK", start: 0, end: 16 }),
      match({ type: "KK", start: 0, end: 16 }),
    ]);
    expect(kkOverNik.map((item) => item.type)).toEqual(["KK"]);
  });
});
