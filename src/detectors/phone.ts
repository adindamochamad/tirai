import type { Match } from "../types.js";

/**
 * One optional separator before the mobile 8, then one optional separator
 * before each following digit. No nested quantifiers.
 *
 * National `08` numbers are 10–13 digits, which is 9–12 digits in the `8…`
 * form (8 plus 8–11 more digits).
 */
const PHONE_SOURCE = String.raw`(?<!\d)(?:\(\+62\)|\+62|0062|62|0)[\s.-]?8(?:[\s.-]?\d){8,11}(?!\d)`;

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0062")) digits = digits.slice(4);
  else if (digits.startsWith("62")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return `62${digits}`;
}

/** Pure Indonesian mobile detector. Landlines are out of scope. */
export function detectPhone(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(PHONE_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    const normalized = normalizePhone(value);
    if (!/^628\d{8,11}$/.test(normalized)) continue;
    matches.push({
      type: "TELEPON",
      start,
      end: start + value.length,
      value,
      normalized,
    });
  }
  return matches;
}
