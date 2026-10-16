import type { Match } from "../types.js";
import { hasIdentityLabel } from "./labels.js";

/** Classic 15-digit writing: 10.20.0.1-012.000, also with spaces or dashes. */
const FORMATTED_NPWP_SOURCE = String.raw`(?<!\d)\d{2}[.\-\s]\d{3}[.\-\s]\d{3}[.\-\s]\d[.\-\s]\d{3}[.\-\s]\d{3}(?!\d)`;

const PLAIN_15_SOURCE = String.raw`(?<!\d)\d{15}(?!\d)`;
const PLAIN_16_SOURCE = String.raw`(?<!\d)\d{16}(?!\d)`;

function pushNpwp(matches: Match[], start: number, value: string): void {
  const normalized = value.replace(/\D/g, "");
  if (normalized.length !== 15 && normalized.length !== 16) return;
  if (normalized.startsWith("0") && normalized.length === 16) return;
  matches.push({
    type: "NPWP",
    start,
    end: start + value.length,
    value,
    normalized,
  });
}

/** 15-digit formatted NPWP, or a labeled 15/16-digit run. */
export function detectNpwp(text: string): Match[] {
  const matches: Match[] = [];

  for (const match of text.matchAll(new RegExp(FORMATTED_NPWP_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    const identity =
      hasIdentityLabel(text, start, "NIK") ||
      hasIdentityLabel(text, start, "KK");
    if (identity) continue;
    pushNpwp(matches, start, value);
  }

  for (const source of [PLAIN_15_SOURCE, PLAIN_16_SOURCE]) {
    for (const match of text.matchAll(new RegExp(source, "g"))) {
      const value = match[0];
      const start = match.index;
      if (start === undefined) continue;
      if (!hasIdentityLabel(text, start, "NPWP")) continue;
      pushNpwp(matches, start, value);
    }
  }

  return matches;
}
