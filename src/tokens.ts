import type { PiiType } from "./types.js";

export function canonicalToken(type: string, n: string): string {
  return `[${type.toUpperCase()}_${n}]`;
}

/** Tokens already written in the text. New assignments must not reuse them. */
export function literalTokens(text: string): Set<string> {
  const taken = new Set<string>();
  const pattern = /\[\s*(nik|telepon|plat)\s*_\s*(\d+)\s*\]/gi;
  for (const match of text.matchAll(pattern)) {
    const type = match[1];
    const n = match[2];
    if (type === undefined || n === undefined) continue;
    taken.add(canonicalToken(type, n));
  }
  return taken;
}

export function isPiiType(value: string): value is PiiType {
  return value === "NIK" || value === "TELEPON" || value === "PLAT";
}
