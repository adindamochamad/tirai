# Tirai

Tirai replaces Indonesian NIK numbers, phone numbers, and vehicle plates with tokens before that text is sent to ChatGPT or Claude, and keeps the originals on the device.

People paste those numbers into a chat box. Tirai is a library, a command-line tool, and a Chrome extension. All three do the replacement locally. This repository does not add a server that receives the page text.

## Install and run

On 11 November 2026, `npm test` was run in this checkout and passed (199 tests). That script also runs `npm run build:ext`, so `extension/dist` was produced. `npm ci`, `npm run dev`, and loading the unpacked extension in Chrome were not. The commands match `package.json`.

```bash
npm ci
npm test
npm run dev
npm run build:ext
```

`npm test` builds the extension and runs Vitest. `npm run dev` serves the local demo. After `npm run build:ext`, load `extension/dist` in Chrome as an unpacked extension (`chrome://extensions`, Developer mode). The published extension is Chrome Web Store item `acpdbejjcecdlfbeemelcmimncdbjifh`, version 0.2.0: https://chromewebstore.google.com/detail/tirai/acpdbejjcecdlfbeemelcmimncdbjifh

The npm package is `@adindamochamad/tirai`. The unscoped name `tirai` is not this package.

```bash
npm install @adindamochamad/tirai
```

```ts
import { redact, restore } from "@adindamochamad/tirai";

const { redacted, vault } = redact(
  "NIK 3171010101010000, HP 0800-0000-0001, motor B 4321 XYZ."
);
restore(redacted, vault);
```

The sample numbers above are synthetic.

## What this does not do

- The extension is limited to `https://chatgpt.com/*` and `https://claude.ai/*`. It watches paste, Enter, and the send button. It is not a network proxy.
- If the editor still holds a raw number, the extension holds the send once. The user can mask the text or send it unchanged.
- `restore()` in the library, the CLI, and the demo puts tokens back into a string. The extension shows the originals in a local panel. It does not write them into the chat reply. That panel is memory for the tab and is discarded when the tab closes.
- Detectors are regular expressions, not a model. This repository does not publish accuracy figures. An unlabeled personal name is left visible.
- It is a helper. It does not guarantee that every identifier is found, and it can mask a number that is not personal data.

## License

MIT. See `LICENSE`.
