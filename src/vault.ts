import type { PiiType, VaultEntry } from "./types.js";
import { canonicalToken } from "./tokens.js";

const inspectCustom = Symbol.for("nodejs.util.inspect.custom");

function normalizedKey(type: PiiType, normalized: string): string {
  return `${type}\u0000${normalized}`;
}

function summary(size: number): string {
  return `[Vault: ${size} entries]`;
}

/**
 * In-memory map from tokens to the first-seen original.
 * `toJSON`, `toString`, and Node's inspect hook return a count only.
 */
export class Vault {
  #byToken = new Map<string, VaultEntry>();
  #byNormalized = new Map<string, VaultEntry>();
  #counters: Record<PiiType, number> = { NIK: 0, TELEPON: 0, PLAT: 0 };

  get(token: string): VaultEntry | undefined {
    const loose = /^\[\s*(nik|telepon|plat)\s*_\s*(\d+)\s*\]$/i.exec(token);
    const key =
      loose?.[1] !== undefined && loose[2] !== undefined
        ? canonicalToken(loose[1], loose[2])
        : token;
    return this.#byToken.get(key);
  }

  findByNormalized(type: PiiType, normalized: string): VaultEntry | undefined {
    return this.#byNormalized.get(normalizedKey(type, normalized));
  }

  size(): number {
    return this.#byToken.size;
  }

  clear(): void {
    this.#byToken.clear();
    this.#byNormalized.clear();
    this.#counters = { NIK: 0, TELEPON: 0, PLAT: 0 };
  }

  toJSON(): string {
    return summary(this.size());
  }

  toString(): string {
    return summary(this.size());
  }

  [inspectCustom](): string {
    return summary(this.size());
  }

  /**
   * Return the existing entry for this normalized value, or create the next
   * free `[TYPE_N]` token. `blocked` tokens (literals already in the input)
   * are skipped so redaction does not collide with them.
   */
  allocate(
    type: PiiType,
    original: string,
    normalized: string,
    blocked: ReadonlySet<string>,
  ): VaultEntry {
    const existing = this.findByNormalized(type, normalized);
    if (existing) return existing;

    let n = this.#counters[type];
    let token = "";
    do {
      n += 1;
      token = `[${type}_${n}]`;
    } while (this.#byToken.has(token) || blocked.has(token));

    this.#counters[type] = n;
    const entry: VaultEntry = { token, type, original, normalized };
    this.#byToken.set(token, entry);
    this.#byNormalized.set(normalizedKey(type, normalized), entry);
    return entry;
  }
}
