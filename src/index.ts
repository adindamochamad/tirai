export { detectNik } from "./detectors/nik.js";
export { detectPhone, normalizePhone } from "./detectors/phone.js";
export { detectPlate } from "./detectors/plate.js";
export { resolveOverlaps } from "./overlap.js";
export { redact, restore } from "./redact.js";
export type {
  Detector,
  Finding,
  Match,
  PiiType,
  RedactOptions,
  RedactResult,
  VaultEntry,
} from "./types.js";
export { Vault } from "./vault.js";
