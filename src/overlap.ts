import type { Match, PiiType } from "./types.js";

const PRIORITY: Record<PiiType, number> = {
  NIK: 0,
  TELEPON: 1,
  PLAT: 2,
};

function overlaps(a: Match, b: Match): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Keep non-overlapping spans. A longer span wins. On a tie, NIK beats
 * TELEPON, which beats PLAT.
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
