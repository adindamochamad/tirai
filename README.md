# Tirai

Tirai sits between your text and an AI chat. It masks Indonesian identifiers (NIK, KK, NPWP, phone numbers, plates, email, bank details, passport numbers, labeled names, and addresses), then puts the original values back after the reply comes back.

This is a helper tool, not a guarantee. Read the text again before you send it. The library does not know every way a person can write a number, and it can mask something that is not personal data.

There are three ways to use it: the npm library, the static demo page, and a Chrome extension for chatgpt.com and claude.ai. None of them send your text off the device. Promises for the extension are in [PRIVACY.md](PRIVACY.md).

Unlabeled names in prose stay as they are. A name is masked only when a label such as `nama pelapor` precedes it.

## What it is not

- Not a server, account system, or database. The library, the demo, and the extension do not send your text anywhere.
- Not a machine-learning detector. Rules are regular expressions plus a few checks.
- Not a complete list of Indonesian personal data. See [still out of scope](#still-out-of-scope).
- Not a claim about accuracy. This repository does not publish accuracy, precision, or recall figures. The tests describe behavior on synthetic examples only.

## Install

```bash
npm install @adindamochamad/tirai
```

The unscoped name `tirai` is not available. The package has no runtime dependencies. From this repository:

```bash
npm ci
npm test
npm run dev
```

## Usage

```ts
import { redact, restore } from "@adindamochamad/tirai";

const input =
  "Saya Budi, NIK 3171012501900003, HP 0812-3456-7890, motor B 4321 XYZ ditilang.";

const { redacted, vault } = redact(input);
// Saya Budi, NIK [NIK_1], HP [TELEPON_1], motor [PLAT_1] ditilang.

const reply =
  "Terima kasih. Kami akan menghubungi [TELEPON_1] terkait kendaraan [PLAT_1].";
restore(reply, vault);
// Terima kasih. Kami akan menghubungi 0812-3456-7890 terkait kendaraan B 4321 XYZ.
```

`redact(text, options)` returns `{ redacted, vault, findings }`. `findings` has `type`, `token`, and `start` / `end` offsets into the original text. It does not include the original value.

`restore(text, vault)` replaces known tokens. `[ telepon_1 ]` is accepted. Unknown tokens are left unchanged. There is no further fuzzy matching.

Pass `options.vault` to keep the same codes across several pastes. `options.detectors` limits detection to types in `PII_TYPES` (`KK`, `NIK`, `NPWP`, `KARTU`, `TELEPON`, `REKENING`, `PASPOR`, `EMAIL`, `ALAMAT`, `NAMA`, `PLAT`). `options.nikStrict` defaults to `true`. Set it to `false` to mask every unlabeled 16-digit run. Runs that start with `0` are still not treated as NIK. Details and known misses are in [docs/detectors.md](docs/detectors.md).

## Privacy model

- The vault lives in memory for as long as you keep the object. The demo clears it with **Hapus semua** and does not write it to `localStorage`, `sessionStorage`, IndexedDB, cookies, or the URL.
- `JSON.stringify(vault)`, `String(vault)`, and Node's inspect hook return `[Vault: N entries]`. They do not contain the stored values.
- The library does not log input text, matches, or vault contents.
- The demo does not call `fetch`, `XMLHttpRequest`, `WebSocket`, or `sendBeacon`. **Kirim ke AI (simulasi)** is a local function. You copy the masked text yourself if you want to use a real chat tool.
- The demo page sets `Content-Security-Policy` to `default-src 'self'; connect-src 'none'; script-src 'self'; style-src 'self'`.

## Chrome extension

The extension masks the same identifier types as the library when you paste into ChatGPT or Claude. Originals stay in that tab's memory. A one-time warning appears before a send if raw values are still in the editor. The extension does not send the message for you. There is no Chrome Web Store listing yet.

```bash
npm run build:ext
```

In Chrome, open `chrome://extensions`, turn on Developer mode, choose **Load unpacked**, and select `extension/dist`. Details are in [docs/extension.md](docs/extension.md).

## Demo

```bash
npm run dev
npm run build:demo
```

`build:demo` writes a static site to `dist-demo/`. The dev server's live reload wants a network socket, which that policy blocks, so check the built page when you want an empty network log.

Manual check:

1. Paste the Budi example and choose **Samarakan**. The masked text uses `[NIK_1]`, `[TELEPON_1]`, and `[PLAT_1]`. The table shows jenis, kode, and the original on this screen.
2. Choose **Kirim ke AI (simulasi)**. The reply mentions the phone and plate codes. The note says the simulation stays local.
3. Choose **Kembalikan**. **Hasil akhir** shows `0812-3456-7890` and `B 4321 XYZ`.
4. Choose **Hapus semua**. The fields and the table clear.
5. Open DevTools → Network, reload the built page, and confirm no requests after the page loads. Paste again and confirm the log stays empty.

## Inspiration

Tirai is inspired by [Rampart](https://github.com/nationaldesignstudio/rampart). It does not share Rampart's code, and it is not API-compatible with Rampart.

## License

MIT. Copyright (c) 2026 Adinda Panca Mochamad.

## Still out of scope

- A saved vault or an encrypted export
- Any AI or ML detector
