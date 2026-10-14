import type { Finding } from "../src/index.js";

/** Local stand-in for an AI reply. It only sees tokens, and it does not use the network. */
export function fakeAiReply(findings: readonly Finding[]): string {
  const phone = findings.find((finding) => finding.type === "TELEPON")?.token;
  const plate = findings.find((finding) => finding.type === "PLAT")?.token;
  const nik = findings.find((finding) => finding.type === "NIK")?.token;

  if (phone && plate) {
    return `Terima kasih. Kami akan menghubungi ${phone} terkait kendaraan ${plate}.`;
  }
  if (phone) return `Terima kasih. Kami akan menghubungi ${phone}.`;
  if (plate)
    return `Terima kasih. Laporan kendaraan ${plate} sudah kami catat.`;
  if (nik) return `Terima kasih. Data ${nik} sudah kami catat.`;
  return "Terima kasih. Laporan sudah kami catat.";
}
