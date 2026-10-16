import { detectAccount } from "./detectors/account.js";
import { detectAddress } from "./detectors/address.js";
import { detectCard } from "./detectors/card.js";
import { detectEmail } from "./detectors/email.js";
import { detectKk } from "./detectors/kk.js";
import { detectLandline } from "./detectors/landline.js";
import { detectName } from "./detectors/name.js";
import { detectNik } from "./detectors/nik.js";
import { detectNpwp } from "./detectors/npwp.js";
import { detectPassport } from "./detectors/passport.js";
import { detectPhone } from "./detectors/phone.js";
import { detectPlate } from "./detectors/plate.js";
import { resolveOverlaps } from "./overlap.js";
import { PII_TYPES, type Match, type RedactOptions } from "./types.js";

export function collectMatches(text: string, options?: RedactOptions): Match[] {
  const enabled = new Set(options?.detectors ?? PII_TYPES);
  const matches: Match[] = [];
  if (enabled.has("NIK")) {
    matches.push(...detectNik(text, { strict: options?.nikStrict !== false }));
  }
  if (enabled.has("KK")) matches.push(...detectKk(text));
  if (enabled.has("NPWP")) matches.push(...detectNpwp(text));
  if (enabled.has("TELEPON")) {
    matches.push(...detectPhone(text), ...detectLandline(text));
  }
  if (enabled.has("REKENING")) matches.push(...detectAccount(text));
  if (enabled.has("KARTU")) matches.push(...detectCard(text));
  if (enabled.has("PASPOR")) matches.push(...detectPassport(text));
  if (enabled.has("EMAIL")) matches.push(...detectEmail(text));
  if (enabled.has("ALAMAT")) matches.push(...detectAddress(text));
  if (enabled.has("NAMA")) matches.push(...detectName(text));
  if (enabled.has("PLAT")) matches.push(...detectPlate(text));
  return matches;
}

/** Run enabled detectors and drop overlapping spans. */
export function detectAll(text: string, options?: RedactOptions): Match[] {
  return resolveOverlaps(collectMatches(text, options));
}
