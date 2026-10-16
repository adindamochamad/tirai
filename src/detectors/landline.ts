import { AREA_CODES, splitLandline } from "../constants/areaCodes.js";
import type { Match } from "../types.js";

const AREA_ALTERNATION = [...AREA_CODES]
  .sort((a, b) => b.length - a.length || a.localeCompare(b))
  .join("|");

/**
 * Trunk or country prefix, optional parens around the area code, then
 * 5–8 subscriber digits with optional separators.
 */
const LANDLINE_SOURCE = String.raw`(?<!\d)(?:\(\+62\)|\+62|0062|62|\(?0)[\s.-]?\(?(?:${AREA_ALTERNATION})\)?(?:[\s.-]?\d){5,8}(?!\d)`;

export function normalizeLandline(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0062")) digits = digits.slice(4);
  else if (digits.startsWith("62")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return `62${digits}`;
}

function isPlausibleLandline(normalized: string): boolean {
  if (!normalized.startsWith("62")) return false;
  const national = normalized.slice(2);
  const split = splitLandline(national);
  if (split === undefined) return false;
  return split.subscriber.length >= 5 && split.subscriber.length <= 8;
}

/** Indonesian geographic (PSTN) numbers. Emits `TELEPON` tokens. */
export function detectLandline(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(LANDLINE_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    const normalized = normalizeLandline(value);
    if (!isPlausibleLandline(normalized)) continue;
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
