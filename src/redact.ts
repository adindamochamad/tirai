import { detectAll } from "./detect.js";
import { literalTokens, tokenPattern } from "./tokens.js";
import type { Finding, RedactOptions, RedactResult } from "./types.js";
import { Vault } from "./vault.js";

function requireVault(vault: RedactOptions["vault"]): Vault {
  if (vault === undefined) return new Vault();
  if (vault instanceof Vault) return vault;
  throw new TypeError("options.vault must be a Vault instance from tirai");
}

export function redact(text: string, options?: RedactOptions): RedactResult {
  const vault = requireVault(options?.vault);
  const chosen = detectAll(text, options);
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
  return text.replace(tokenPattern(), (raw, type: string, n: string) => {
    const entry = vault.get(`[${type.toUpperCase()}_${n}]`);
    return entry ? entry.original : raw;
  });
}
