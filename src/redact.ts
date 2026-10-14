import { detectNik } from "./detectors/nik.js";
import { detectPhone } from "./detectors/phone.js";
import { detectPlate } from "./detectors/plate.js";
import { resolveOverlaps } from "./overlap.js";
import { literalTokens } from "./tokens.js";
import type {
  Finding,
  Match,
  PiiType,
  RedactOptions,
  RedactResult,
} from "./types.js";
import { Vault } from "./vault.js";

const DEFAULT_DETECTORS: readonly PiiType[] = ["NIK", "TELEPON", "PLAT"];

function requireVault(vault: RedactOptions["vault"]): Vault {
  if (vault === undefined) return new Vault();
  if (vault instanceof Vault) return vault;
  throw new TypeError(
    "options.vault must be a Vault instance from tirai",
  );
}

function collect(text: string, options: RedactOptions | undefined): Match[] {
  const enabled = new Set(options?.detectors ?? DEFAULT_DETECTORS);
  const matches: Match[] = [];
  if (enabled.has("NIK")) {
    matches.push(...detectNik(text, { strict: options?.nikStrict !== false }));
  }
  if (enabled.has("TELEPON")) matches.push(...detectPhone(text));
  if (enabled.has("PLAT")) matches.push(...detectPlate(text));
  return matches;
}

export function redact(text: string, options?: RedactOptions): RedactResult {
  const vault = requireVault(options?.vault);
  const chosen = resolveOverlaps(collect(text, options));
  const blocked = literalTokens(text);
  const parts: string[] = [];
  const findings: Finding[] = [];
  let cursor = 0;

  for (const match of chosen) {
    parts.push(text.slice(cursor, match.start));
    const entry = vault.allocate(
      match.type,
      match.value,
      match.normalized,
      blocked,
    );
    parts.push(entry.token);
    findings.push({
      type: match.type,
      token: entry.token,
      start: match.start,
      end: match.end,
    });
    cursor = match.end;
  }
  parts.push(text.slice(cursor));

  return { redacted: parts.join(""), vault, findings };
}

/**
 * Put originals back. Tolerates spaces inside the brackets and a lowercase
 * type (`[ telepon_1 ]`). Any other token shape is left unchanged.
 */
export function restore(text: string, vault: Vault): string {
  return text.replace(
    /\[\s*(nik|telepon|plat)\s*_\s*(\d+)\s*\]/gi,
    (raw, type: string, n: string) => {
      const entry = vault.get(`[${type.toUpperCase()}_${n}]`);
      return entry ? entry.original : raw;
    },
  );
}
