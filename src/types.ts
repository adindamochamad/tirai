import type { Vault } from "./vault.js";

export type PiiType = "NIK" | "TELEPON" | "PLAT";

/** A span found by a detector. Detectors are pure: text in, matches out. */
export interface Match {
  type: PiiType;
  /** Inclusive offset in the input. */
  start: number;
  /** Exclusive offset in the input. */
  end: number;
  /** Exact substring from the input. */
  value: string;
  /** Canonical form used to deduplicate within one vault. */
  normalized: string;
}

export interface Detector {
  type: PiiType;
  detect(text: string): Match[];
}

export interface VaultEntry {
  /** Canonical token, for example `[NIK_1]`. */
  token: string;
  type: PiiType;
  /** First-seen surface form. Restore always returns this. */
  original: string;
  normalized: string;
}

/** A detection shown to the caller. The original value is intentionally absent. */
export interface Finding {
  type: PiiType;
  token: string;
  /** Inclusive offset in the original text. */
  start: number;
  /** Exclusive offset in the original text. */
  end: number;
}

export interface RedactResult {
  redacted: string;
  vault: Vault;
  findings: Finding[];
}

export interface RedactOptions {
  /** Reuse tokens across calls. Must be a `Vault` instance from this package. */
  vault?: Vault;
  /** Defaults to all three detectors. */
  detectors?: PiiType[];
  /**
   * When true (default), an unlabeled 16-digit run is redacted only if it
   * passes the province and date heuristics. When false, every unlabeled
   * 16-digit run is redacted. Runs that start with 0 are never treated as NIK.
   * Labeled NIKs are redacted either way, including when the heuristics fail.
   */
  nikStrict?: boolean;
}
