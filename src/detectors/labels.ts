import type { PiiType } from "../types.js";

const DEFAULT_GAP = 20;
/** NPWP is often written with extra words: "NPWP orang pribadi sekarang …". */
const NPWP_GAP = 60;
const PREFIX_CHARS = 120;

/** Identity-number labels that compete for the same digit span. */
const IDENTITY_LABELS: readonly {
  type: PiiType;
  source: string;
  maxGap: number;
}[] = [
  {
    type: "NIK",
    source: String.raw`nomor\s+induk\s+kependudukan|no\.?\s*ktp|(?:^|[^a-z])nik(?![a-z])|(?:^|[^a-z])ktp(?![a-z])`,
    maxGap: DEFAULT_GAP,
  },
  {
    type: "KK",
    source: String.raw`kartu\s+keluarga|no\.?\s*kk|(?:^|[^a-z])nokk(?![a-z])|(?:^|[^a-z])kk(?![a-z])`,
    maxGap: DEFAULT_GAP,
  },
  {
    type: "NPWP",
    source: String.raw`nomor\s+pokok\s+wajib\s+pajak|(?:^|[^a-z])npwpd(?![a-z])|(?:^|[^a-z])npwp(?![a-z])`,
    maxGap: NPWP_GAP,
  },
  {
    type: "REKENING",
    source: String.raw`nomor\s+rekening|no\.?\s*rek(?:ening)?|(?:^|[^a-z])norek(?![a-z])|(?:^|[^a-z])rekening(?![a-z])`,
    maxGap: DEFAULT_GAP,
  },
  {
    type: "KARTU",
    source: String.raw`kartu\s+kredit|kartu\s+debit|kartu\s+atm|nomor\s+kartu|no\.?\s*kartu`,
    maxGap: DEFAULT_GAP,
  },
];

/**
 * Closest identity label before `start`. Most types allow 20 non-digit
 * characters after the label. NPWP allows 60 so wording like
 * "orang pribadi sekarang" still counts.
 */
export function closestIdentityLabel(
  text: string,
  start: number,
): PiiType | undefined {
  const prefix = text.slice(Math.max(0, start - PREFIX_CHARS), start);
  let best: { type: PiiType; end: number } | undefined;
  for (const { type, source, maxGap } of IDENTITY_LABELS) {
    const pattern = new RegExp(source, "gi");
    const gap = new RegExp(`^[^\\d]{0,${maxGap}}$`);
    for (const match of prefix.matchAll(pattern)) {
      if (match.index === undefined) continue;
      const end = match.index + match[0].length;
      if (!gap.test(prefix.slice(end))) continue;
      if (!best || end > best.end) best = { type, end };
    }
  }
  return best?.type;
}

export function hasIdentityLabel(
  text: string,
  start: number,
  type: PiiType,
): boolean {
  return closestIdentityLabel(text, start) === type;
}

export function prefixBefore(text: string, start: number, max = 80): string {
  return text.slice(Math.max(0, start - max), start);
}
