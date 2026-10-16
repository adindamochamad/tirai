# Changelog

## [Unreleased]

- Demo and privacy pages on GitHub Pages: product layout, local icon, and a synthetic sample button. Same CSP and in-page vault.
- Local `tirai` CLI (`redact` / `restore`) and stdio MCP for OpenCode and similar tools. No new runtime dependencies. Vault stays in process memory unless `--vault FILE` is set.

## [0.2.0] - 2026-10-16

- Chrome extension for chatgpt.com and claude.ai: paste masking, a one-time send warning, and a local reveal that does not write originals into the page. Promises are in `PRIVACY.md`. The extension is not in the npm package.
- Broader pattern detectors on the same in-memory vault: KK, NPWP, landline numbers (still `[TELEPON_N]`), email, passport, bank account, payment card, labeled names, and addresses (`Jl.` / RT/RW). Unlabeled names stay visible. No ML and no saved vault.
- Name, email, and NPWP tightening: skip `nama perusahaan`, stop `sdr` names before a verb, keep sentence punctuation off emails, and treat `NPWP orang pribadi sekarang` + 16 digits as NPWP rather than NIK.

## [0.1.0] - 2026-10-15

First release of Tirai, a client-side helper for Indonesian NIK, mobile numbers, and vehicle plates.

- `redact` replaces those values with `[TYPE_N]` tokens and keeps the originals in an in-memory vault.
- `restore` puts the first-seen text back, including tokens with extra spaces or a lowercase type.
- The demo page runs entirely in the browser and includes a local simulated reply.
- Province codes match the recap in Kepmendagri Nomor 300.2.2-2138 Tahun 2025. Membership is unchanged.
- Plate region codes follow Lampiran A of Perpol Nomor 7 Tahun 2021, including DP and DW. PY, PS, and PT are documented gaps, not matches.
- Published to npm as `@adindamochamad/tirai`. The unscoped name `tirai` is blocked because it is too similar to an existing package.
