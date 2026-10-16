import { PII_TYPES, type Match, type PiiType } from "./types.js";

const PRIORITY: Record<PiiType, number> = Object.fromEntries(
  PII_TYPES.map((type, index) => [type, index]),
) as Record<PiiType, number>;

function overlaps(a: Match, b: Match): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Keep non-overlapping spans. A longer span wins. On a tie, the earlier
 * type in `PII_TYPES` wins (KK over NIK over … over PLAT).
 */
export function resolveOverlaps(matches: readonly Match[]): Match[] {
  const ranked = [...matches].sort((a, b) => {
    const lengthDiff = b.end - b.start - (a.end - a.start);
    if (lengthDiff !== 0) return lengthDiff;
    const priorityDiff = PRIORITY[a.type] - PRIORITY[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return a.start - b.start;
  });

  const kept: Match[] = [];
  for (const match of ranked) {
    if (kept.some((chosen) => overlaps(chosen, match))) continue;
    kept.push(match);
  }
  kept.sort((a, b) => a.start - b.start);
  return kept;
}
