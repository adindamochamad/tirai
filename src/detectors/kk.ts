import type { Match } from "../types.js";
import { hasIdentityLabel } from "./labels.js";

const PLAIN_KK_SOURCE = String.raw`(?<!\d)\d{16}(?!\d)`;
const GROUPED_KK_SOURCE = String.raw`(?<!\d)\d{6}[ .\-/]\d{6}[ .\-/]\d{4}(?!\d)`;

function pushKk(matches: Match[], start: number, value: string): void {
  const normalized = value.replace(/\D/g, "");
  if (normalized.length !== 16) return;
  if (normalized.startsWith("0")) return;
  matches.push({
    type: "KK",
    start,
    end: start + value.length,
    value,
    normalized,
  });
}

/** Kartu Keluarga. Sixteen digits, labeled only. */
export function detectKk(text: string): Match[] {
  const matches: Match[] = [];

  for (const match of text.matchAll(new RegExp(PLAIN_KK_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasIdentityLabel(text, start, "KK")) continue;
    pushKk(matches, start, value);
  }

  for (const match of text.matchAll(new RegExp(GROUPED_KK_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasIdentityLabel(text, start, "KK")) continue;
    pushKk(matches, start, value);
  }

  return matches;
}
