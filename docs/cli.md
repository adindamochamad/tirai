# CLI dan MCP lokal

Tirai untuk OpenCode, Cursor, Claude Code, dan alat serupa. Proses berjalan di mesin Anda. Tidak ada peladen.

Alat bantu, bukan jaminan. Jangan kirim hasil `restore` ke model jarak jauh.

```bash
npm install -g @adindamochamad/tirai
# atau: npx @adindamochamad/tirai --help
```

## Perintah

Teks masuk lewat stdin.

```bash
echo "SINTETIS. NIK 3171010101010000, HP 0800-0000-0001." | tirai redact --json
echo "Hubungi [TELEPON_1]." | tirai restore --vault vault.json
tirai mcp
```

- `redact` — ganti identitas dengan token.
- `restore` — kembalikan token memakai vault.
- `--vault FILE` — cuplikan vault di berkas lokal yang Anda pilih (bukan akun, bukan cloud).
- `--json` — keluaran mesin. `redact --json` menyertakan `entries` untuk pipa ke `restore`.
- `mcp` — server MCP stdio. Vault hanya di memori proses itu; hilang saat proses berhenti.

## OpenCode

Di `opencode.json`:

```json
{
  "mcp": {
    "tirai": {
      "type": "local",
      "command": ["npx", "-y", "@adindamochamad/tirai", "mcp"]
    }
  }
}
```

Pakai tool `redact` pada teks yang akan dikirim. Setelah balasan kembali, pulihkan di lokal dengan `tirai restore`, bukan dengan mengirim hasil restore ke model.

## Cursor / Claude Code / MCP lain

Perintah lokal:

```json
{
  "mcpServers": {
    "tirai": {
      "command": "npx",
      "args": ["-y", "@adindamochamad/tirai", "mcp"]
    }
  }
}
```

Dari klon repo ini, setelah `npm run build`:

```bash
node dist/cli/tirai.js mcp
```
