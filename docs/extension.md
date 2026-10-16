# Ekstensi Tirai

Dokumen ini menjelaskan perilaku ekstensi Chrome di `extension/`. Pada 15 Oktober 2026, chatgpt.com yang belum masuk akun memakai `textarea#mobile-composer-prompt` dan tombol `aria-label="Send message"`. Pada 16 Oktober 2026, chatgpt.com yang sudah masuk akun menerima tempel pertama di `textarea#pending-home-input` atau `textarea#pending-conversation-input`, lalu beralih ke editor ProseMirror. Tombol kirimnya `aria-label="Send"`. Pada tanggal yang sama, claude.ai yang sudah masuk akun menampilkan `textarea#static-composer-input` sebelum editornya siap. Tempelan dan Enter yang teramati mendarat di `div.ProseMirror[contenteditable="true"]` dengan `data-cds="Editor"` dan `data-testid="chat-input"`. Enter saat 16 digit mentah masih ada membuka peringatan dan tertahan. Skrip situs juga menyebut `textarea[data-cds="ChatComposerEditor"]` dan `button[data-testid="chat-input-send"]`; keduanya tidak ada pada pengecekan itu. Kalau UI situs berubah, perbaiki hanya [extension/src/content/sites.ts](../extension/src/content/sites.ts).

## Pemilih DOM

Semua pemilih ada di `sites.ts`.

| Peran                   | Pemilih saat ini                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor ChatGPT          | `#prompt-textarea`, `#mobile-composer-prompt`, `#pending-home-input`, `#pending-conversation-input`                                                                                                                                                              |
| Editor Claude           | `div.ProseMirror[contenteditable='true']`, `div.ProseMirror[contenteditable='plaintext-only']`, `textarea[data-cds='ChatComposerEditor']`, `[data-cds='ChatComposerEditor'][contenteditable='true']`, `[data-cds='ChatComposerEditor'] [contenteditable='true']` |
| Tombol kirim (kandidat) | `button[data-testid="send-button"]`, `button[data-testid="chat-input-send"]`, `button[aria-label="Send prompt"]`, `button[aria-label="Send message"]`, `button[aria-label="Send"]`, `button[aria-label="Kirim pesan"]`                                           |

**Gagal terbuka:** jika target tempel atau Enter tidak cocok dengan editor, Tirai tidak mengubah tempelan dan tidak mengaitkan Enter. Jika tombol kirim diklik tetapi editor tidak ditemukan lewat `findEditorForSend`, klik tidak ditahan. Kalau ada lebih dari satu editor, klik kirim memindai editor yang leluhurnya paling dekat dengan tombol itu.

## Sisip teks (tempel dan Samarakan)

Tempel didengar di `window`, fase capture, supaya berjalan sebelum listener halaman. Saat penyamaran terjadi, event dihentikan dengan `stopImmediatePropagation`.

Urutan di [insert.ts](../extension/src/content/insert.ts):

1. `document.execCommand("insertText")` — dicoba dulu agar masuk pipeline input situs.
2. Untuk `<textarea>` / `<input>`: `setRangeText`.
3. Untuk `contenteditable`: hapus isi range lalu sisip `Text` node.

`replaceEditorText` (tombol **Samarakan** pada peringatan kirim) mengganti seluruh isi editor dengan teks polos, tanpa HTML.

Jika penyisipan gagal setelah `preventDefault` pada tempel, teks asli tidak disisipkan oleh Tirai; catatan jumlah hanya muncul jika sisipan berhasil.

## Peringatan kirim

Hanya aktif saat ekstensi **aktif** dan editor teridentifikasi.

- **Enter** tanpa Shift pada editor yang dikenali. Enter saat komposisi IME (`isComposing`) tidak ditahan.
- **Klik** tombol kirim yang cocok dengan pemilih di atas. Pendengar ada di `window`, fase capture.

Teks editor dipindai dengan detektor yang sama seperti pustaka, **tanpa** menambah entri vault. Jika masih ada PII mentah, kiriman ditahan sekali dan dialog menampilkan **Samarakan** / **Kirim apa adanya**. **Samarakan** membaca isi editor pada saat tombol itu diklik. Tirai tidak mengirim pesan dan tidak mengklik tombol kirim.

**Kirim apa adanya** mengizinkan percobaan berikutnya dengan teks yang sama. Setelah teks editor berubah, peringatan aktif lagi.

## Tampilan nilai asli

Panel tetap di pojok kanan atas (bukan di dalam balasan), di dalam shadow DOM tertutup supaya skrip halaman tidak membaca nilainya lewat DOM. Toggle **Tampilkan data asli** menampilkan pasangan token dan nilai dari vault di memori tab. Text node balasan dan isi editor tidak diubah. **Hapus data tab ini** mengosongkan vault dan isi panel.

## Popup

- Sakelar **Aktif** → hanya menulis `{ enabled: boolean }` ke `chrome.storage.local`.
- **Data disamarkan** → angka dari `vault.size()` di tab aktif (lewat pesan `count`).
- **Hapus data tab ini** → pesan `clear` mengosongkan vault tab; isi vault tidak dikirim.

## Izin dan jaringan

Lihat [docs/tirai/PROMPT.md](tirai/PROMPT.md) bagian 3. Tidak ada `host_permissions`. Vault tidak disimpan di storage. Janji privasi ada di [PRIVACY.md](../PRIVACY.md).

## Bahan Chrome Web Store

Cantuman dikirim lewat dasbor dan sedang ditinjau. Akun pengembang dan syarat Google diisi sendiri oleh pemelihara. Form pendaftaran muncul saat pertama kali membuka [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). Langkah resminya ada di [Register your developer account](https://developer.chrome.com/docs/webstore/register). Teks di bawah siap ditempel. Jangan menganggap biaya atau kebijakan toko sebagai fakta dari dokumen ini.

**Tujuan (Indonesia):** Menyamarkan identitas Indonesia (NIK, HP, plat, NPWP, surel, dan sejenisnya) sebelum teks ditempel di ChatGPT atau Claude, lalu menampilkan nilai asli di perangkat. Alat bantu, bukan jaminan.

**Tujuan (English):** Masks Indonesian identifiers (NIK, phone numbers, plates, NPWP, email, and similar) before you paste into ChatGPT or Claude, then shows the originals on the device. A helper, not a guarantee.

**Izin:** `storage` hanya untuk sakelar aktif atau nonaktif. Akses situs hanya lewat `content_scripts.matches`: `https://chatgpt.com/*` dan `https://claude.ai/*`. Tidak ada `host_permissions`.

**Formulir privasi Chrome Web Store:** tidak ada data yang dikumpulkan, dikirim, atau dijual. Tautan kebijakan: `https://github.com/adindamochamad/tirai/blob/main/PRIVACY.md`.

Teks yang siap ditempel ke tab Privasi:

- **Satu tujuan:** Menyamarkan identitas Indonesia (NIK, HP, plat, NPWP, surel, dan sejenisnya) sebelum teks ditempel di ChatGPT atau Claude, lalu menampilkan nilai asli di perangkat. Alat bantu, bukan jaminan.
- **Justifikasi storage:** Menyimpan satu kunci boolean `enabled` di `chrome.storage.local` agar sakelar aktif atau nonaktif tetap ada antar sesi. Tidak menyimpan teks, token, atau nilai asli.
- **Justifikasi izin host:** Tidak ada `host_permissions`. Pola `https://chatgpt.com/*` dan `https://claude.ai/*` hanya ada di `content_scripts.matches` supaya skrip tempel dan peringatan kirim berjalan di dua situs itu. Tidak dipakai untuk `fetch` atau akses jaringan.
- **Kode jarak jauh:** Tidak.
- **Penggunaan data:** tidak mencentang jenis data apa pun. Centang ketiga pernyataan (tidak menjual, tidak memakai di luar tujuan, tidak untuk kredit).

**Zip:** `npm run zip:ext` menulis `extension/tirai-0.1.0.zip` dari `extension/dist`. Berkas itu tidak masuk git. Ikon 128×128 ada di `extension/icons/icon128.png`. Tangkapan layar harus memakai data sintetis, bukan data orang sungguhan.
