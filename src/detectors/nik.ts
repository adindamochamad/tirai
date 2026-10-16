import { passesNikSanity } from "../constants/provinces.js";
import type { Match } from "../types.js";
import { closestIdentityLabel } from "./labels.js";

const PLAIN_NIK_SOURCE = String.raw`(?<!\d)\d{16}(?!\d)`;
const GROUPED_NIK_SOURCE = String.raw`(?<!\d)\d{6}[ .\-/]\d{6}[ .\-/]\d{4}(?!\d)`;

export interface NikDetectOptions {
  /** Default true. See `RedactOptions.nikStrict`. */
  strict?: boolean;
}

function nikContext(
  text: string,
  start: number,
): { labeled: boolean; skip: boolean } {
  const identity = closestIdentityLabel(text, start);
  if (identity !== undefined && identity !== "NIK") {
    return { labeled: false, skip: true };
  }
  return { labeled: identity === "NIK", skip: false };
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
    const { labeled, skip } = nikContext(text, start);
    if (skip) continue;
    pushNik(matches, text, start, value, labeled, strict);
  }

  for (const match of text.matchAll(new RegExp(GROUPED_NIK_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    const { labeled, skip } = nikContext(text, start);
    if (skip || !labeled) continue;
    pushNik(matches, text, start, value, true, strict);
  }

  return matches;
}
