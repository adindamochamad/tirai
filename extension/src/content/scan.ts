import { detectAll } from "../../../src/detect.js";
import type { Match } from "../../../src/types.js";

/** Detect raw PII spans without allocating vault tokens. */
export function findRawMatches(text: string): Match[] {
  return detectAll(text, { nikStrict: true });
}

export function hasRawPii(text: string): boolean {
  return findRawMatches(text).length > 0;
}
