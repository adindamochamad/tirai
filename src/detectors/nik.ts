import { passesNikSanity } from "../constants/provinces.js";
import type { Match } from "../types.js";

const PLAIN_NIK_SOURCE = String.raw`(?<!\d)\d{16}(?!\d)`;
const GROUPED_NIK_SOURCE = String.raw`(?<!\d)\d{6}[ .\-/]\d{6}[ .\-/]\d{4}(?!\d)`;

/**
 * Label, then at most 20 non-digit characters, immediately before the number.
 * The label itself may be longer than 20 characters.
 */
const NIK_LABEL =
  /(?:nomor\s+induk\s+kependudukan|no\.?\s*ktp|(?:^|[^a-z])nik(?![a-z])|(?:^|[^a-z])ktp(?![a-z]))[^\d]{0,20}$/i;

export interface NikDetectOptions {
  /** Default true. See `RedactOptions.nikStrict`. */
  strict?: boolean;
}

function hasNikLabel(text: string, start: number): boolean {
  const prefix = text.slice(Math.max(0, start - 80), start);
  return NIK_LABEL.test(prefix);
}

function isPhoneTerritory(
  text: string,
  start: number,
  digits: string,
): boolean {
  if (digits.startsWith("0")) return true;
  return start > 0 && text.charAt(start - 1) === "+";
}

function pushNik(
  matches: Match[],
  text: string,
  start: number,
  value: string,
  labeled: boolean,
  strict: boolean,
): void {
  const normalized = value.replace(/\D/g, "");
  if (normalized.length !== 16) return;
  if (isPhoneTerritory(text, start, normalized)) return;
  const accepted = labeled || !strict || passesNikSanity(normalized);
  if (!accepted) return;
  matches.push({
    type: "NIK",
    start,
    end: start + value.length,
    value,
    normalized,
  });
}

/** Pure NIK detector. Grouped forms match only when a label precedes them. */
export function detectNik(text: string, options?: NikDetectOptions): Match[] {
  const strict = options?.strict !== false;
  const matches: Match[] = [];

  for (const match of text.matchAll(new RegExp(PLAIN_NIK_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    pushNik(matches, text, start, value, hasNikLabel(text, start), strict);
  }

  for (const match of text.matchAll(new RegExp(GROUPED_NIK_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasNikLabel(text, start)) continue;
    pushNik(matches, text, start, value, true, strict);
  }

  return matches;
}
