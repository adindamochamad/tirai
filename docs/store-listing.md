# Chrome Web Store listing (Tirai 0.2.0)

Paste-ready copy for the next upload. **Do not upload while a review of 0.1.0 is still in progress.** Ship this text with version **0.2.0**.

This is not a statement of Chrome Web Store fees or policies. Check the dashboard for the rules that apply.

Public privacy URL (must open in a browser without logging in):

https://adindamochamad.github.io/tirai/privacy.html

Source text: [PRIVACY.md](../PRIVACY.md).

## Single purpose

**Indonesia:** Menyamarkan identitas Indonesia sebelum teks ditempel di ChatGPT atau Claude, lalu menampilkan nilai asli di perangkat. Alat bantu, bukan jaminan.

**English:** Masks Indonesian identifiers before you paste into ChatGPT or Claude, then shows the originals on the device. A helper, not a guarantee.

Longer store description (optional, same purpose):

Tirai masks Indonesian identifiers in the tab: NIK, family-card (KK) numbers, NPWP, mobile and landline phones, email, labeled passport and bank-account numbers, payment cards, labeled personal names, addresses, and vehicle plates. Originals stay in that tab’s memory and disappear when the tab closes. A helper, not a guarantee. Only chatgpt.com and claude.ai.

## Permission justifications

**`storage`:** Saves one boolean key `enabled` in `chrome.storage.local` so the on/off switch survives sessions. It does not store text, tokens, or original values.

**Site access (two sites):** There are no `host_permissions`. `https://chatgpt.com/*` and `https://claude.ai/*` appear only in `content_scripts.matches`, so paste masking and the send warning run on those two hosts. They are not used for `fetch` or other network access.

## Privacy form (“does not collect data”)

- **Single purpose:** the Indonesia or English sentence above.
- **Remote code:** No.
- **Data use:** collect **no** user data. Do not check any data type. Check all three certifications (does not sell, does not use data outside the single purpose, does not use data for creditworthiness).
- **Privacy policy URL:** `https://adindamochamad.github.io/tirai/privacy.html`

Zip: `npm run zip:ext` writes `extension/tirai-0.2.0.zip` from `extension/dist`. That zip is not committed. Screenshots must use synthetic data.
