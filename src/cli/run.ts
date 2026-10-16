import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { redact, restore } from "../redact.js";
import {
  Vault,
  parseVaultSnapshot,
  snapshotVault,
  type VaultSnapshot,
} from "../vault.js";

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

const HELP = `Tirai — samarkan identitas Indonesia di perangkat ini.
Alat bantu, bukan jaminan.

Penggunaan:
  tirai redact [--json] [--vault FILE] [--no-strict]
  tirai restore [--json] [--vault FILE]
  tirai mcp
  tirai --help
  tirai --version

Teks dibaca dari stdin. Tidak ada panggilan jaringan.

  --json         Keluaran mesin (termasuk entri vault pada redact).
  --vault FILE   Simpan atau baca cuplikan vault di berkas lokal yang Anda pilih.
  --no-strict    Samarkan setiap 16 digit tanpa label (kecuali yang diawali 0).
  mcp            Server MCP lokal lewat stdio. Vault hidup di memori proses ini.

Jangan kirim hasil restore ke model jarak jauh.
`;

export function runCli(argv: string[], stdin: string): CliResult {
  const args = parseArgs(argv);
  if (args.error) return { code: 1, stdout: "", stderr: `${args.error}\n` };
  if (args.help) return { code: 0, stdout: HELP, stderr: "" };
  if (args.version) {
    return { code: 0, stdout: `${readPackageVersion()}\n`, stderr: "" };
  }
  if (args.command === "mcp") {
    return {
      code: 1,
      stdout: "",
      stderr:
        "tirai mcp membaca JSON-RPC dari stdin. Jalankan tanpa pipa teks.\n",
    };
  }
  try {
    if (args.command === "redact") return runRedact(args, stdin);
    if (args.command === "restore") return runRestore(args, stdin);
    return {
      code: 1,
      stdout: "",
      stderr: `Perintah tidak dikenal: ${args.command}\n`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { code: 1, stdout: "", stderr: `${message}\n` };
  }
}

interface ParsedArgs {
  command?: string;
  help?: boolean;
  version?: boolean;
  json?: boolean;
  vaultPath?: string;
  nikStrict?: boolean;
  error?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { nikStrict: true };
  const rest = [...argv];
  while (rest.length > 0) {
    const token = rest.shift();
    if (token === undefined) break;
    if (token === "--help" || token === "-h") {
      parsed.help = true;
      return parsed;
    }
    if (token === "--version" || token === "-v") {
      parsed.version = true;
      return parsed;
    }
    if (token === "--json") {
      parsed.json = true;
      continue;
    }
    if (token === "--no-strict") {
      parsed.nikStrict = false;
      continue;
    }
    if (token === "--vault") {
      const path = rest.shift();
      if (!path) return { error: "--vault membutuhkan path berkas" };
      parsed.vaultPath = path;
      continue;
    }
    if (token.startsWith("-")) {
      return { error: `Opsi tidak dikenal: ${token}` };
    }
    if (parsed.command) return { error: `Argumen tambahan: ${token}` };
    parsed.command = token;
  }
  if (!parsed.command && !parsed.help && !parsed.version) parsed.help = true;
  return parsed;
}

function runRedact(args: ParsedArgs, stdin: string): CliResult {
  const prior = loadVault(args.vaultPath);
  const { redacted, vault, findings } = redact(stdin, {
    vault: prior,
    nikStrict: args.nikStrict,
  });
  const snapshot = snapshotVault(vault);
  if (args.vaultPath) writeVaultFile(args.vaultPath, snapshot);
  if (args.json) {
    return {
      code: 0,
      stdout: `${JSON.stringify({
        redacted,
        findings,
        count: vault.size(),
        entries: snapshot.entries,
      })}\n`,
      stderr: "",
    };
  }
  let stderr = "";
  if (findings.length > 0 && !args.vaultPath) {
    stderr = `${String(findings.length)} data disamarkan. Simpan vault dengan --vault FILE atau --json supaya restore bisa.\n`;
  }
  return { code: 0, stdout: redacted, stderr };
}

function runRestore(args: ParsedArgs, stdin: string): CliResult {
  let text = stdin;
  let vault = loadVault(args.vaultPath);
  const trimmed = stdin.trim();
  if (!args.vaultPath && trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as {
      text?: unknown;
      redacted?: unknown;
      entries?: unknown;
      version?: unknown;
    };
    if (typeof parsed.text === "string") text = parsed.text;
    else if (typeof parsed.redacted === "string") text = parsed.redacted;
    if (Array.isArray(parsed.entries)) {
      vault = Vault.fromEntries(
        parseVaultSnapshot({ version: 1, entries: parsed.entries }).entries,
      );
    } else if (parsed.version === 1) {
      vault = Vault.fromEntries(parseVaultSnapshot(parsed).entries);
    }
  }
  const restored = restore(text, vault);
  if (args.json) {
    return {
      code: 0,
      stdout: `${JSON.stringify({ restored, count: vault.size() })}\n`,
      stderr: "",
    };
  }
  return { code: 0, stdout: restored, stderr: "" };
}

function loadVault(path: string | undefined): Vault {
  if (!path || !existsSync(path)) return new Vault();
  return readVaultFile(path);
}

export function readVaultFile(path: string): Vault {
  const source = readFileSync(path, "utf8");
  const snapshot = parseVaultSnapshot(JSON.parse(source));
  return Vault.fromEntries(snapshot.entries);
}

export function writeVaultFile(path: string, snapshot: VaultSnapshot): void {
  const dir = dirname(path);
  if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
  writeFileSync(path, `${JSON.stringify(snapshot)}\n`, { mode: 0o600 });
  chmodSync(path, 0o600);
}

export function readPackageVersion(): string {
  try {
    const url = new URL("../../package.json", import.meta.url);
    const pkg = JSON.parse(readFileSync(url, "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
