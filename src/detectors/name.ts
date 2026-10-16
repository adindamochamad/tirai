import type { Match } from "../types.js";

/**
 * Lookbehind keeps the match start on the label itself so `nama pemohon`
 * wins over a bare `nama` at the same index.
 */
const NAME_LABEL =
  /(?:nama\s+lengkap|nama\s+pemohon|nama\s+nasabah|nama\s+pelapor|nama\s+terlapor|nama\s+saksi|(?<![a-z])nama(?![a-z])|a\.n\.|(?<![a-z])an\.(?![a-z])|(?<![a-z])sdr\.?|(?<![a-z])sdri\.?)\s*[:.-]?\s*/gi;

const SKIP_LEADING = new Set([
  "saya",
  "adalah",
  "yaitu",
  "ialah",
  "si",
  "pemohon",
  "pelapor",
  "nasabah",
  "terlapor",
  "saksi",
  "lengkap",
]);

const NON_PERSON = new Set([
  "perusahaan",
  "instansi",
  "lembaga",
  "organisasi",
  "yayasan",
  "bank",
  "toko",
  "kantor",
  "bagian",
  "divisi",
  "tim",
  "kelompok",
  "jalan",
  "rekening",
  "kartu",
  "berkas",
  "file",
  "data",
  "dokumen",
  "lampiran",
  "kolom",
  "jenis",
  "tipe",
  "akun",
  "pengguna",
  "barang",
  "produk",
  "layanan",
  "aplikasi",
  "situs",
  "website",
  "domain",
]);

const STOP = new Set([
  "dari",
  "yang",
  "dengan",
  "di",
  "ke",
  "untuk",
  "tanpa",
  "pada",
  "dan",
  "atau",
  "adalah",
  "sebagai",
  "nomor",
  "nik",
  "ktp",
  "hp",
  "telepon",
  "alamat",
  "tempat",
  "tanggal",
  "jenis",
  "status",
  "umur",
  "usia",
  "pekerjaan",
  "agama",
  "kelurahan",
  "kecamatan",
  "desa",
  "jalan",
  "jl",
  "rt",
  "rw",
  "email",
  "surel",
]);

const CONNECTOR = new Set(["bin", "binti", "van", "de"]);

function isCapitalized(token: string): boolean {
  const first = token.charAt(0);
  return (
    first !== "" &&
    first === first.toUpperCase() &&
    first !== first.toLowerCase()
  );
}

function nameSpan(
  text: string,
  start: number,
): { value: string; start: number; end: number } | undefined {
  let cursor = start;
  while (cursor < text.length && /[ \t]/.test(text.charAt(cursor))) cursor += 1;
  let nameStart = cursor;
  const parts: string[] = [];
  while (cursor < text.length && parts.length < 5) {
    while (cursor < text.length && /[ \t]/.test(text.charAt(cursor)))
      cursor += 1;
    if (parts.length === 0) nameStart = cursor;
    const token = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'.]*/.exec(text.slice(cursor))?.[0];
    if (token === undefined) break;
    const lower = token.toLowerCase();
    if (parts.length === 0 && SKIP_LEADING.has(lower)) {
      cursor += token.length;
      continue;
    }
    if (parts.length === 0 && NON_PERSON.has(lower)) return undefined;
    if (STOP.has(lower)) break;
    if (parts.length > 0 && CONNECTOR.has(lower)) {
      parts.push(token);
      cursor += token.length;
      continue;
    }
    if (!isCapitalized(token)) break;
    if (parts.length === 0 && token.length < 3) break;
    parts.push(token);
    cursor += token.length;
  }
  if (parts.length === 0) return undefined;
  const value = text.slice(nameStart, cursor).trim();
  if (value.length < 3) return undefined;
  return { value, start: nameStart, end: nameStart + value.length };
}

/** Labeled personal names only. Unlabeled names in prose stay visible. */
export function detectName(text: string): Match[] {
  const matches: Match[] = [];
  for (const match of text.matchAll(new RegExp(NAME_LABEL.source, "gi"))) {
    if (match.index === undefined) continue;
    const span = nameSpan(text, match.index + match[0].length);
    if (span === undefined) continue;
    matches.push({
      type: "NAMA",
      start: span.start,
      end: span.end,
      value: span.value,
      normalized: span.value.replace(/\s+/g, " ").trim().toLowerCase(),
    });
  }
  return matches;
}
