import { canonicalToken, isPiiType, parseToken } from "./tokens.js";
import { PII_TYPES, type PiiType, type VaultEntry } from "./types.js";

const inspectCustom = Symbol.for("nodejs.util.inspect.custom");

function normalizedKey(type: PiiType, normalized: string): string {
  return `${type}\u0000${normalized}`;
}

function summary(size: number): string {
  return `[Vault: ${size} entries]`;
}

function emptyCounters(): Record<PiiType, number> {
  const counters = {} as Record<PiiType, number>;
  for (const type of PII_TYPES) counters[type] = 0;
  return counters;
}

/**
 * In-memory map from tokens to the first-seen original.
 * `toJSON`, `toString`, and Node's inspect hook return a count only.
 */
export class Vault {
  #byToken = new Map<string, VaultEntry>();
  #byNormalized = new Map<string, VaultEntry>();
  #counters: Record<PiiType, number> = emptyCounters();

  get(token: string): VaultEntry | undefined {
    const loose = parseToken(token);
    const key = loose ? canonicalToken(loose.type, loose.n) : token;
    return this.#byToken.get(key);
  }

  findByNormalized(type: PiiType, normalized: string): VaultEntry | undefined {
    return this.#byNormalized.get(normalizedKey(type, normalized));
  }

  size(): number {
    return this.#byToken.size;
  }

  /** Entries for on-device display only. Do not log or persist. */
  entries(): readonly VaultEntry[] {
    return [...this.#byToken.values()];
  }

  clear(): void {
    this.#byToken.clear();
    this.#byNormalized.clear();
    this.#counters = emptyCounters();
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
   * Rebuild a vault from a snapshot produced by `snapshotVault`.
   * `JSON.stringify(vault)` still returns a count only.
   */
  static fromEntries(entries: readonly VaultEntry[]): Vault {
    const vault = new Vault();
    const seenToken = new Set<string>();
    const seenNormalized = new Set<string>();
    for (const raw of entries) {
      const entry = normalizeEntry(raw);
      if (seenToken.has(entry.token)) {
        throw new TypeError(`duplicate vault token ${entry.token}`);
      }
      const normKey = normalizedKey(entry.type, entry.normalized);
      if (seenNormalized.has(normKey)) {
        throw new TypeError(`duplicate vault value for ${entry.type}`);
      }
      seenToken.add(entry.token);
      seenNormalized.add(normKey);
      const parsed = parseToken(entry.token);
      const n = Number(parsed?.n);
      vault.#byToken.set(entry.token, entry);
      vault.#byNormalized.set(normKey, entry);
      if (Number.isInteger(n) && n > vault.#counters[entry.type]) {
        vault.#counters[entry.type] = n;
      }
    }
    return vault;
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

/** Local snapshot for CLI restore. Not written unless the caller asks. */
export interface VaultSnapshot {
  version: 1;
  entries: VaultEntry[];
}

export function snapshotVault(vault: Vault): VaultSnapshot {
  return {
    version: 1,
    entries: vault.entries().map((entry) => ({
      token: entry.token,
      type: entry.type,
      original: entry.original,
      normalized: entry.normalized,
    })),
  };
}

export function parseVaultSnapshot(data: unknown): VaultSnapshot {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("vault snapshot must be an object");
  }
  const record = data as { version?: unknown; entries?: unknown };
  if (record.version !== 1) {
    throw new TypeError("vault snapshot version must be 1");
  }
  if (!Array.isArray(record.entries)) {
    throw new TypeError("vault snapshot entries must be an array");
  }
  return {
    version: 1,
    entries: record.entries.map(normalizeEntry),
  };
}

function normalizeEntry(raw: unknown): VaultEntry {
  if (typeof raw !== "object" || raw === null) {
    throw new TypeError("vault entry must be an object");
  }
  const record = raw as {
    token?: unknown;
    type?: unknown;
    original?: unknown;
    normalized?: unknown;
  };
  if (typeof record.token !== "string" || typeof record.type !== "string") {
    throw new TypeError("vault entry needs token and type");
  }
  if (
    typeof record.original !== "string" ||
    typeof record.normalized !== "string"
  ) {
    throw new TypeError("vault entry needs original and normalized");
  }
  const type = record.type.toUpperCase();
  if (!isPiiType(type)) {
    throw new TypeError(`unknown vault type ${record.type}`);
  }
  const parsed = parseToken(record.token);
  if (!parsed || parsed.type.toUpperCase() !== type) {
    throw new TypeError(`invalid vault token ${record.token}`);
  }
  return {
    token: canonicalToken(type, parsed.n),
    type,
    original: record.original,
    normalized: record.normalized,
  };
}
