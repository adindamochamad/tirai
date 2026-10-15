import { detectNik } from "../../../src/detectors/nik.js";
import { detectPhone } from "../../../src/detectors/phone.js";
import { detectPlate } from "../../../src/detectors/plate.js";
import { resolveOverlaps } from "../../../src/overlap.js";
import type { Match } from "../../../src/types.js";

/** Detect raw PII spans without allocating vault tokens. */
export function findRawMatches(text: string): Match[] {
  const matches = [
    ...detectNik(text, { strict: true }),
    ...detectPhone(text),
    ...detectPlate(text),
  ];
  return resolveOverlaps(matches);
}

export function hasRawPii(text: string): boolean {
  return findRawMatches(text).length > 0;
}
