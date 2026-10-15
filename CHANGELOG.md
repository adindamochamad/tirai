# Changelog

## [0.1.0] - 2026-10-15

First release of Tirai, a client-side helper for Indonesian NIK, mobile numbers, and vehicle plates.

- `redact` replaces those values with `[TYPE_N]` tokens and keeps the originals in an in-memory vault.
- `restore` puts the first-seen text back, including tokens with extra spaces or a lowercase type.
- The demo page runs entirely in the browser and includes a local simulated reply.
- Province codes match the recap in Kepmendagri Nomor 300.2.2-2138 Tahun 2025. Membership is unchanged.
- Plate region codes follow Lampiran A of Perpol Nomor 7 Tahun 2021, including DP and DW. PY, PS, and PT are documented gaps, not matches.
