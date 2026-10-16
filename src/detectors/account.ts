import type { Match } from "../types.js";
import { hasIdentityLabel } from "./labels.js";

const ACCOUNT_SOURCE = String.raw`(?<!\d)\d(?:[\s.-]?\d){7,15}(?!\d)`;

/** Bank account numbers. Eight to sixteen digits, labeled only. */
export function detectAccount(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(ACCOUNT_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasIdentityLabel(text, start, "REKENING")) continue;
    const normalized = value.replace(/\D/g, "");
    if (normalized.length < 8 || normalized.length > 16) continue;
    matches.push({
      type: "REKENING",
      start,
      end: start + value.length,
      value,
      normalized,
    });
  }
  return matches;
}
