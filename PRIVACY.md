# Privasi

Tirai adalah alat bantu, bukan jaminan. Periksa ulang teks sebelum dikirim.

Halaman publik (GitHub Pages): https://adindamochamad.github.io/tirai/privacy.html

## Data yang disamarkan

Tirai mencari pola di teks yang Anda tempel atau ketik, lalu menggantinya dengan token seperti `[NIK_1]`. Jenis yang dikenali:

- NIK / nomor KTP
- Nomor Kartu Keluarga (KK)
- NPWP
- Nomor HP dan telepon rumah
- Alamat surel
- Nomor paspor (jika ada label)
- Nomor rekening (jika ada label)
- Nomor kartu pembayaran
- Nama orang (hanya jika ada label, misalnya `nama pelapor`)
- Alamat (misalnya `Jl.` / RT/RW)
- Plat kendaraan

Tidak semua tulisan akan ketemu. Nama tanpa label dibiarkan terlihat.

## Ekstensi Chrome

- Ekstensi tidak mengumpulkan, tidak mengirim, dan tidak menjual teks atau data pribadi.
- Penyamaran terjadi di perangkat, di dalam tab.
- Nilai asli hanya disimpan di memori tab. Nilai itu hilang saat tab ditutup atau halaman dimuat ulang. Vault tidak ditulis ke `chrome.storage`.
- `chrome.storage.local` hanya menyimpan sakelar aktif atau nonaktif (`enabled`).
- Skrip konten hanya berjalan di `https://chatgpt.com/*` dan `https://claude.ai/*`.
- Tidak ada `host_permissions`. Halaman ekstensi memakai `connect-src 'none'`.

## Pustaka dan halaman demo

Pustaka dan halaman demo tidak mengirim teks ke jaringan. Vault demo hanya hidup di memori halaman itu.

# Privacy

Tirai is a helper, not a guarantee. Read the text again before you send it.

Public page (GitHub Pages): https://adindamochamad.github.io/tirai/privacy.html

## Data that is masked

Tirai looks for patterns in text you paste or type, then replaces them with tokens such as `[NIK_1]`. The kinds it knows:

- NIK / KTP numbers
- Family-card (KK) numbers
- NPWP
- Mobile and landline phone numbers
- Email addresses
- Passport numbers (when labeled)
- Bank account numbers (when labeled)
- Payment card numbers
- Personal names (only when labeled, for example `nama pelapor`)
- Addresses (for example `Jl.` / RT/RW)
- Vehicle plates

It will not catch every writing. Unlabeled names stay visible.

## Chrome extension

- The extension does not collect, send, or sell text or personal data.
- Masking happens on the device, inside the tab.
- Original values stay only in the tab's memory. They disappear when the tab closes or the page reloads. The vault is not written to `chrome.storage`.
- `chrome.storage.local` stores only the on/off switch (`enabled`).
- The content script runs only on `https://chatgpt.com/*` and `https://claude.ai/*`.
- There are no `host_permissions`. Extension pages use `connect-src 'none'`.

## Library and demo page

The library and the demo page do not send text over the network. The demo vault lives only in that page's memory.
