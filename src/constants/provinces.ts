function inclusiveRange(from: number, to: number): string[] {
  const codes: string[] = [];
  for (let code = from; code <= to; code += 1) {
    codes.push(String(code));
  }
  return codes;
}

/**
 * Two-digit province codes treated as plausible for a NIK.
 * Checked on 15 October 2026 against the province-code recap in
 * Keputusan Menteri Dalam Negeri Nomor 300.2.2-2138 Tahun 2025.
 * Kepmendagri Nomor 300.2.2-2430 Tahun 2025 amends island data for Aceh
 * and Sumatera Utara only; it does not change these codes.
 * Code 99 is a NIT prefix, not a province code, and is not included.
 * The ranges are 11–19, 21, 31–36, 51–53, 61–65, 71–76, 81–82, and 91–96.
 */
export const PROVINCE_CODES: ReadonlySet<string> = new Set([
  ...inclusiveRange(11, 19),
  "21",
  ...inclusiveRange(31, 36),
  ...inclusiveRange(51, 53),
  ...inclusiveRange(61, 65),
  ...inclusiveRange(71, 76),
  ...inclusiveRange(81, 82),
  ...inclusiveRange(91, 96),
]);

/**
 * Heuristic only. Digits 7–8 are a day (01–31, or 41–71 for the +40 female
 * offset). Digits 9–10 are a month (01–12). This is not a proof of validity.
 */
export function passesNikSanity(digits: string): boolean {
  if (!/^\d{16}$/.test(digits)) return false;
  if (!PROVINCE_CODES.has(digits.slice(0, 2))) return false;
  const day = Number(digits.slice(6, 8));
  const month = Number(digits.slice(8, 10));
  const dayOk = (day >= 1 && day <= 31) || (day >= 41 && day <= 71);
  const monthOk = month >= 1 && month <= 12;
  return dayOk && monthOk;
}
