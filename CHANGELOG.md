# Changelog

## [0.1.0] - YYYY-MM-DD

First release of Tirai, a client-side helper for Indonesian NIK, mobile numbers, and vehicle plates.

- `redact` replaces those values with `[TYPE_N]` tokens and keeps the originals in an in-memory vault.
- `restore` puts the first-seen text back, including tokens with extra spaces or a lowercase type.
- The demo page runs entirely in the browser and includes a local simulated reply.
- Province codes and plate region codes are allowlists that still need a human check before anyone relies on them.
