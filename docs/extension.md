# Ekstensi Tirai

Dokumen ini menjelaskan perilaku ekstensi Chrome di `extension/`. Pemilih dan metode sisip di bawah **belum dicek** di chatgpt.com dan claude.ai yang hidup. Kalau UI situs berubah, perbaiki hanya [extension/src/content/sites.ts](../extension/src/content/sites.ts).

## Pemilih DOM

Semua pemilih ada di `sites.ts`.

| Peran                   | Pemilih saat ini                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Editor ChatGPT          | `#prompt-textarea`                                                                                          |
| Editor Claude           | `div.ProseMirror[contenteditable='true']`                                                                   |
| Tombol kirim (kandidat) | `button[data-testid="send-button"]`, `button[aria-label="Send prompt"]`, `button[aria-label="Kirim pesan"]` |

**Gagal terbuka:** jika target tempel atau Enter tidak cocok dengan editor, Tirai tidak mengubah tempelan dan tidak mengaitkan Enter. Jika tombol kirim diklik tetapi editor tidak ditemukan lewat `findEditorForSend`, klik tidak ditahan.

## Sisip teks (tempel dan Samarakan)

Urutan di [insert.ts](../extension/src/content/insert.ts):

1. `document.execCommand("insertText")` — dicoba dulu agar masuk pipeline input situs.
2. Untuk `<textarea>` / `<input>`: `setRangeText`.
3. Untuk `contenteditable`: hapus isi range lalu sisip `Text` node.

`replaceEditorText` (tombol **Samarakan** pada peringatan kirim) mengganti seluruh isi editor dengan teks polos, tanpa HTML.

Jika penyisipan gagal setelah `preventDefault` pada tempel, teks asli tidak disisipkan oleh Tirai; catatan jumlah hanya muncul jika sisipan berhasil.

## Peringatan kirim

Hanya aktif saat ekstensi **aktif** dan editor teridentifikasi.

- **Enter** tanpa Shift pada editor yang dikenali.
- **Klik** tombol kirim yang cocok dengan pemilih di atas.

Teks editor dipindai dengan detektor yang sama seperti pustaka, **tanpa** menambah entri vault. Jika masih ada PII mentah, kiriman ditahan sekali dan dialog menampilkan **Samarakan** / **Kirim apa adanya**. Tirai tidak mengirim pesan dan tidak mengklik tombol kirim.

**Kirim apa adanya** mengizinkan percobaan berikutnya dengan teks yang sama. Setelah teks editor berubah, peringatan aktif lagi.

## Tampilan nilai asli

Panel tetap di pojok kanan atas (bukan di dalam balasan). Toggle **Tampilkan data asli** menampilkan pasangan token dan nilai dari vault di memori tab. Text node balasan dan isi editor tidak diubah.

## Popup

- Sakelar **Aktif** → hanya menulis `{ enabled: boolean }` ke `chrome.storage.local`.
- **Data disamarkan** → angka dari `vault.size()` di tab aktif (lewat pesan `count`).
- **Hapus data tab ini** → pesan `clear` mengosongkan vault tab; isi vault tidak dikirim.

## Izin dan jaringan

Lihat [docs/tirai/PROMPT.md](tirai/PROMPT.md) bagian 3. Tidak ada `host_permissions`. Vault tidak disimpan di storage. Janji privasi ada di [PRIVACY.md](../PRIVACY.md).

## Bahan Chrome Web Store

Cantuman belum dikirim. Akun pengembang dan syarat Google diisi sendiri oleh pemelihara. Teks di bawah siap ditempel. Jangan menganggap biaya atau kebijakan toko sebagai fakta dari dokumen ini.

**Tujuan (Indonesia):** Menyamarkan NIK, nomor HP, dan plat sebelum teks ditempel di ChatGPT atau Claude, lalu menampilkan nilai asli di perangkat. Alat bantu, bukan jaminan.

**Tujuan (English):** Masks Indonesian identity numbers (NIK), mobile numbers, and vehicle plates before you paste into ChatGPT or Claude, then shows the originals on the device. A helper, not a guarantee.

**Izin:** `storage` hanya untuk sakelar aktif atau nonaktif. Akses situs hanya lewat `content_scripts.matches`: `https://chatgpt.com/*` dan `https://claude.ai/*`. Tidak ada `host_permissions`.

**Formulir privasi:** tidak ada data yang dikumpulkan, dikirim, atau dijual. Tautan kebijakan: `PRIVACY.md` di repositori (`https://github.com/adindamochamad/tirai/blob/main/PRIVACY.md`).

**Zip:** `npm run zip:ext` menulis `extension/tirai-0.1.0.zip` dari `extension/dist`. Berkas itu tidak masuk git. Ikon 128×128 ada di `extension/icons/icon128.png`. Tangkapan layar harus memakai data sintetis, bukan data orang sungguhan.
