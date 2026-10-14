import { PLATE_REGIONS } from "../constants/plateRegions.js";
import type { Match } from "../types.js";

const PLATE_UPPER_SOURCE = String.raw`(?<![A-Za-z0-9])([A-Z]{1,2})\s?(\d{1,4})\s?([A-Z]{1,3})(?![A-Za-z0-9])`;

const PLATE_LABELED_SOURCE = String.raw`(?<![A-Za-z0-9])([A-Za-z]{1,2})\s?(\d{1,4})\s?([A-Za-z]{0,3})(?![A-Za-z0-9])`;

/**
 * Label, then at most 20 characters, immediately before the plate.
 */
const PLATE_LABEL =
  /(?:nomor\s+polisi|no\.?\s*pol|(?:^|[^a-z])nopol(?![a-z])|(?:^|[^a-z])plat(?![a-z])|(?:^|[^a-z])kendaraan(?![a-z]))[\s\S]{0,20}$/i;

function hasPlateLabel(text: string, start: number): boolean {
  const prefix = text.slice(Math.max(0, start - 80), start);
  return PLATE_LABEL.test(prefix);
}

function asPlate(value: string): string | undefined {
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  const parts = /^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/.exec(normalized);
  const region = parts?.[1];
  if (region === undefined || !PLATE_REGIONS.has(region)) return undefined;
  return normalized;
}

function spansOverlap(
  start: number,
  end: number,
  matches: readonly Match[],
): boolean {
  return matches.some((match) => start < match.end && match.start < end);
}

/** Pure plate detector. Unlabeled matches must be uppercase and have a letter suffix. */
export function detectPlate(text: string): Match[] {
  const matches: Match[] = [];

  for (const match of text.matchAll(new RegExp(PLATE_UPPER_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    const normalized = asPlate(value);
    if (normalized === undefined) continue;
    matches.push({
      type: "PLAT",
      start,
      end: start + value.length,
      value,
      normalized,
    });
  }

  for (const match of text.matchAll(new RegExp(PLATE_LABELED_SOURCE, "g"))) {
    const value = match[0];
    const start = match.index;
    if (start === undefined) continue;
    if (!hasPlateLabel(text, start)) continue;
    const normalized = asPlate(value);
    if (normalized === undefined) continue;
    const end = start + value.length;
    if (spansOverlap(start, end, matches)) continue;
    matches.push({
      type: "PLAT",
      start,
      end,
      value,
      normalized,
    });
  }

  return matches;
}
