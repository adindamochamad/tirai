import type { Match } from "../types.js";

const STREET_SOURCE = String.raw`(?<![A-Za-z])(?:Jl\.|Jln\.|Jalan)\s+[A-Z][A-Za-z0-9.'/\-]*(?:\s+[A-Z0-9][A-Za-z0-9.'/\-]*){0,6}(?:\s+(?:No\.?|Nomor)\s*\d{1,5}[A-Za-z]?)?`;

const RT_RW_SOURCE = String.raw`(?<![A-Za-z0-9])RT\.?\s*\d{1,3}\s*/\s*RW\.?\s*\d{1,3}(?![A-Za-z0-9])`;

const ADDRESS_LABEL =
  /(?:beralamat|domisili|(?:^|[^a-z])alamat(?![a-z]))(?!\s+(?:email|surel|e-mail))\s*[:.-]?\s*/gi;

const EXTENSION =
  /^(?:,\s*|\s+)(?:RT\.?\s*\d{1,3}\s*\/\s*RW\.?\s*\d{1,3}|(?:Kelurahan|Kel\.|Desa|Ds\.|Kecamatan|Kec\.|Kabupaten|Kab\.|Kota)\s+[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){0,3}|\d{5})/;

function extendAddress(text: string, start: number, end: number): number {
  let cursor = end;
  while (cursor - start <= 160) {
    const extra = EXTENSION.exec(text.slice(cursor));
    if (extra === null) break;
    cursor += extra[0].length;
  }
  return cursor;
}

function spansOverlap(
  start: number,
  end: number,
  matches: readonly Match[],
): boolean {
  return matches.some((match) => start < match.end && match.start < end);
}

function pushAddress(
  matches: Match[],
  start: number,
  end: number,
  text: string,
): void {
  if (end - start < 8) return;
  if (spansOverlap(start, end, matches)) return;
  const value = text.slice(start, end);
  matches.push({
    type: "ALAMAT",
    start,
    end,
    value,
    normalized: value.replace(/\s+/g, " ").trim().toLowerCase(),
  });
}

function labeledEnd(text: string, start: number): number {
  const max = Math.min(text.length, start + 120);
  let i = start;
  while (i < max) {
    if (text.charAt(i) === "\n") break;
    i += 1;
  }
  while (i > start && /[\s,;]/.test(text.charAt(i - 1))) i -= 1;
  return i;
}

/** Streets (Jl./Jalan + proper noun), RT/RW, and labeled alamat clauses. */
export function detectAddress(text: string): Match[] {
  const matches: Match[] = [];

  for (const match of text.matchAll(new RegExp(STREET_SOURCE, "g"))) {
    const start = match.index;
    if (start === undefined) continue;
    const end = extendAddress(text, start, start + match[0].length);
    pushAddress(matches, start, end, text);
  }

  for (const match of text.matchAll(new RegExp(RT_RW_SOURCE, "g"))) {
    const start = match.index;
    if (start === undefined) continue;
    const end = extendAddress(text, start, start + match[0].length);
    pushAddress(matches, start, end, text);
  }

  for (const match of text.matchAll(new RegExp(ADDRESS_LABEL.source, "gi"))) {
    if (match.index === undefined) continue;
    const start = match.index + match[0].length;
    const end = labeledEnd(text, start);
    pushAddress(matches, start, end, text);
  }

  return matches;
}
