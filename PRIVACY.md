# Privasi

Tirai adalah alat bantu, bukan jaminan. Periksa ulang teks sebelum dikirim.

## Ekstensi Chrome

- Ekstensi tidak mengumpulkan, tidak mengirim, dan tidak menjual teks atau data pribadi.
- Penyamaran terjadi di perangkat, di dalam tab.
- Nilai asli disimpan di memori tab. Nilai itu hilang saat tab ditutup atau halaman dimuat ulang. Vault tidak ditulis ke `chrome.storage`.
- `chrome.storage.local` hanya menyimpan sakelar aktif atau nonaktif (`enabled`).
- Skrip konten hanya berjalan di `https://chatgpt.com/*` dan `https://claude.ai/*`.
- Tidak ada `host_permissions`. Halaman ekstensi memakai `connect-src 'none'`.

## Pustaka dan halaman demo

Pustaka dan halaman demo tidak mengirim teks ke jaringan. Vault demo hanya hidup di memori halaman itu.

# Privacy

Tirai is a helper, not a guarantee. Read the text again before you send it.

## Chrome extension

- The extension does not collect, send, or sell text or personal data.
- Masking happens on the device, inside the tab.
- Original values stay in the tab's memory. They disappear when the tab closes or the page reloads. The vault is not written to `chrome.storage`.
- `chrome.storage.local` stores only the on/off switch (`enabled`).
- The content script runs only on `https://chatgpt.com/*` and `https://claude.ai/*`.
- There are no `host_permissions`. Extension pages use `connect-src 'none'`.

## Library and demo page

The library and the demo page do not send text over the network. The demo vault lives only in that page's memory.
