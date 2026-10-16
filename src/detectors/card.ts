import type { Match } from "../types.js";
import { hasIdentityLabel } from "./labels.js";

const GROUPED_16_SOURCE = String.raw`(?<!\d)\d{4}(?:[\s-]\d{4}){3}(?!\d)`;
const GROUPED_AMEX_SOURCE = String.raw`(?<!\d)\d{4}[\s-]\d{6}[\s-]\d{5}(?!\d)`;
const LABELED_DIGITS_SOURCE = String.raw`(?<!\d)\d(?:[\s-]?\d){12,18}(?!\d)`;

export function luhn(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits.charAt(i));
    if (Number.isNaN(n)) return false;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function looksLikeCard(digits: string, labeled: boolean): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  if (digits.startsWith("62") && !labeled) return false;
  if (digits.startsWith("4")) {
    return digits.length === 13 || digits.length === 16 || digits.length === 19;
  }
  const two = Number(digits.slice(0, 2));
  if (two >= 51 && two <= 55) return digits.length === 16;
  if (two === 34 || two === 37) return digits.length === 15;
  const four = Number(digits.slice(0, 4));
  if (four >= 2221 && four <= 2720) return digits.length === 16;
  return labeled;
}

function pushCard(
  matches: Match[],
  start: number,
  value: string,
  labeled: boolean,
): void {
  const normalized = value.replace(/\D/g, "");
  if (!luhn(normalized)) return;
  if (!looksLikeCard(normalized, labeled)) return;
  matches.push({
    type: "KARTU",
    start,
    end: start + value.length,
    value,
    normalized,
  });
}

/**
 * Payment cards. Unlabeled matches need grouping (4-4-4-4 or Amex 4-6-5)
 * plus Luhn. A 16-digit run with no separators is never a card.
 */
export function detectCard(text: string): Match[] {
  const matches: Match[] = [];

  for (const source of [GROUPED_16_SOURCE, GROUPED_AMEX_SOURCE]) {
    for (const match of text.matchAll(new RegExp(source, "g"))) {
      const value = match[0];
      const start = match.index;
      if (start === undefined) continue;
      pushCard(matches, start, value, hasIdentityLabel(text, start, "KARTU"));
    }
  }

  for (const match of text.matchAll(new RegExp(LABELED_DIGITS_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasIdentityLabel(text, start, "KARTU")) continue;
    if (matches.some((item) => item.start === start)) continue;
    pushCard(matches, start, value, true);
  }

  return matches;
}
