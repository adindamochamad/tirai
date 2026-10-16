import { PII_TYPES, type PiiType } from "./types.js";

export const TOKEN_TYPE_PATTERN = PII_TYPES.map((type) =>
  type.toLowerCase(),
).join("|");

export function canonicalToken(type: string, n: string): string {
  return `[${type.toUpperCase()}_${n}]`;
}

export function tokenPattern(flags = "gi"): RegExp {
  return new RegExp(
    `\\[\\s*(${TOKEN_TYPE_PATTERN})\\s*_\\s*(\\d+)\\s*\\]`,
    flags,
  );
}

export function parseToken(
  token: string,
): { type: string; n: string } | undefined {
  const match = new RegExp(
    `^\\[\\s*(${TOKEN_TYPE_PATTERN})\\s*_\\s*(\\d+)\\s*\\]$`,
    "i",
  ).exec(token);
  if (match?.[1] === undefined || match[2] === undefined) return undefined;
  return { type: match[1], n: match[2] };
}

/** Tokens already written in the text. New assignments must not reuse them. */
export function literalTokens(text: string): Set<string> {
  const taken = new Set<string>();
  for (const match of text.matchAll(tokenPattern())) {
    const type = match[1];
    const n = match[2];
    if (type === undefined || n === undefined) continue;
    taken.add(canonicalToken(type, n));
  }
  return taken;
}

const PII_TYPE_SET: ReadonlySet<string> = new Set(PII_TYPES);

export function isPiiType(value: string): value is PiiType {
  return PII_TYPE_SET.has(value);
}
