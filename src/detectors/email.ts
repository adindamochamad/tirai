import type { Match } from "../types.js";

/**
 * Domain labels cannot end in a dot, so a following sentence period stays
 * outside the match. The trailing lookahead also omits `.` for that reason.
 */
const EMAIL_SOURCE = String.raw`(?<![A-Za-z0-9._%+\-])[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,24}(?![A-Za-z0-9_%+\-])`;

/** Local-part @ domain with at least one dot. Case folds on normalize. */
export function detectEmail(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(EMAIL_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    matches.push({
      type: "EMAIL",
      start,
      end: start + value.length,
      value,
      normalized: value.toLowerCase(),
    });
  }
  return matches;
}
