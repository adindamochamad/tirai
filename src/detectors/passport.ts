import type { Match } from "../types.js";
import { prefixBefore } from "./labels.js";

const PASSPORT_SOURCE = String.raw`(?<![A-Za-z0-9])[A-Za-z]\s?\d{7}(?![A-Za-z0-9])`;

const PASSPORT_LABEL =
  /(?:nomor\s+paspor|no\.?\s*paspor|passport|(?:^|[^a-z])paspor(?![a-z]))[\s\S]{0,20}$/i;

/** Indonesian ordinary passport: one letter and seven digits, labeled only. */
export function detectPassport(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(PASSPORT_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!PASSPORT_LABEL.test(prefixBefore(text, start))) continue;
    matches.push({
      type: "PASPOR",
      start,
      end: start + value.length,
      value,
      normalized: value.replace(/\s+/g, "").toUpperCase(),
    });
  }
  return matches;
}
