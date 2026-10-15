# Tirai — Strategi (revisi 14 Oktober 2026)

Nama produk: Tirai. Paket npm: `@adindamochamad/tirai`. Nama tanpa scope `tirai` ditolak registry karena terlalu mirip paket lain. Folder lokal dan repo GitHub: `tirai`. File ini adalah sumber strategi untuk agen. Spesifikasi detektor yang sudah diuji ada di `docs/detectors.md`, bukan di draf unduhan.

## 0. Hasil pengecekan draf 14 Oktober

Draf `penyamar-data-indonesia-cursor-prompt.md` mengulang M0–M7 dari repo kosong dan menjadikan ekstensi Chrome bagian v1. Pustaka, demo, korpus, dan README di repo ini sudah ada. Mengulang M0–M4 akan menimpa perilaku yang sudah dikunci tes.

Yang diambil dari draf: ekstensi Manifest V3 untuk chatgpt.com dan claude.ai, tanpa jaringan, vault hanya di memori tab, izin seminimal mungkin.

Yang diubah:

1. **Jangan mulai dari M0.** Pekerjaan sisa adalah M5–M7 di bawah. Detektor, vault, dan demo tidak dibuka lagi kecuali ada tes yang gagal.
2. **Jangan menimpa teks balasan AI dengan data asli.** Draf membolehkan `MutationObserver` mengganti text node. Itu menaruh NIK, nomor HP, dan plat kembali ke DOM halaman. Situs bisa membaca DOM itu, dan React sering menimpa perubahan kita lalu memicu loop. Yang dipakai: teks balasan tetap berisi token; nilai asli muncul di lapisan lokal (toggle atau popover) yang bukan bagian editor dan tidak ditulis ke text node.
3. **Gagal terbuka kalau pemilih DOM tidak ketemu.** HTML chatgpt.com dan claude.ai sering berubah. Kalau editor tidak teridentifikasi, ekstensi tidak memasang pengait Enter dan tidak memblokir kirim. Memblokir semua kiriman saat pemilih salah lebih buruk daripada melewatkan satu tempelan.
4. **Tidak ada `host_permissions`.** `content_scripts.matches` cukup untuk menyuntik skrip. `host_permissions` memberi hak `fetch` ke origin itu. Izin yang diizinkan hanya `storage`.
5. **Content script tetap di isolated world.** Draf keliru menyebut content script “berjalan di konteks halaman”. Ia berbagi DOM, bukan JavaScript halaman. Jangan menyuntik `<script>`, jangan `world: "MAIN"`, jangan `eval` / `new Function`. CSP `extension_pages` tidak melindungi content script; tes grep yang melakukannya.
6. **Monetisasi, batas pemakaian, dan kunci lisensi keluar dari rencana.** Semuanya butuh cek yang bentrok dengan janji tanpa jaringan. Bukan “nanti di v2” di repo ini.
7. **Gateway B2B dan server MCP bukan milestone repo ini.** Produk terpisah, kalau ada, nanti.
8. **GitHub Pages bukan pintu untuk mulai ekstensi.** CI sekarang hanya `lint`, `test`, dan `build`. Deploy halaman tetap opsional di daftar rilis.
9. **`jsdom` boleh ditambah sebagai devDependency** untuk tes ekstensi. Bukan dependensi runtime. Jangan menambah dependensi lain tanpa bertanya.
10. **Versi tetap `0.1.0`, changelog bertanggal 2026-10-15.** Ekstensi ikut rilis pertama itu. Jangan naik ke `0.2.0` hanya karena draf menomori ulang milestone.

## 1. Status

Sudah ada dan jangan diubah kecuali tes membuktikan bug:

- `src/`: vault, `detectNik`, `detectPhone`, `detectPlate`, `redact`, `restore`
- `demo/`: halaman Bahasa Indonesia, CSP, stub AI lokal, tanpa `innerHTML`
- Tes: NIK, telepon, plat, vault, redact, korpus, performa, no-network, demo-safety
- `README.md`, `README.id.md`, `docs/detectors.md`, `CHANGELOG.md` (tanggal `2026-10-15`)
- CI: `npm ci && npm run lint && npm test && npm run build`
- Tanpa dependensi runtime. `no-console` hanya pada `src/**/*.ts`

Belum ada:

- Job GitHub Pages (opsional, tidak memblokir)
- Akun pengembang Chrome Web Store, tangkapan layar, dan pengiriman cantuman. Bahan teks ada di `docs/extension.md`. Jangan menyatakan biaya atau kebijakan toko sebagai fakta.

Sumber perilaku detektor: `docs/detectors.md` dan tes. Jangan “menyelaraskan” detektor ke rumusan yang lebih longgar di draf 14 Oktober (pemisah, jarak label, `nikStrict`, syarat sufiks plat).

## 2. Tujuan

Tiga bentuk dari satu inti `src/`:

1. Pustaka TypeScript (selesai).
2. Halaman statis untuk mencoba (selesai).
3. Ekstensi Chrome (Manifest V3) di `https://chatgpt.com/*` dan `https://claude.ai/*`: saat menempel, NIK, nomor HP, dan plat diganti token; nilai asli hanya ditampilkan di perangkat pengguna.

Pengguna tetap menekan tombol kirim milik situs. Kode kita tidak mengirim apa pun.

Ini alat bantu, bukan jaminan.

### Bukan tujuan

- Backend, akun, basis data, analitik, kunci lisensi, batas pemakaian.
- Panggilan jaringan apa pun, termasuk AI.
- Deteksi ML, atau detektor baru (NPWP, nama, email, alamat, rekening, telepon rumah, KK, paspor).
- Peramban selain Chrome/Chromium, situs selain chatgpt.com dan claude.ai.
- Menyimpan vault di `chrome.storage`, `localStorage`, IndexedDB, cookie, URL, atribut `data-*`, atau pesan ke service worker.
- Mengganti teks yang akan dikirim ulang dengan nilai asli.
- Angka ketepatan.

## 3. Model ancaman ekstensi

| Ancaman                 | Yang wajib                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vault keluar dari tab   | Vault hanya di memori content script tab itu. Hilang saat tab ditutup atau dimuat ulang.                                                                                                          |
| Pesan membawa data asli | Pesan ke popup/service worker hanya boolean `enabled`, perintah `clear`, dan angka `count`.                                                                                                       |
| Izin berlebih           | `permissions` persis `["storage"]`. Tanpa `host_permissions`. `matches` persis dua situs di atas. Tanpa `<all_urls>`, `tabs`, `webRequest`, `scripting`, `cookies`, `history`, `clipboardRead`.   |
| Telepon ke server       | Tanpa `fetch`, XHR, `WebSocket`, `EventSource`, `sendBeacon`, `import()` jarak jauh, font/gambar/skrip remote. CSP `extension_pages`: `script-src 'self'; object-src 'self'; connect-src 'none'`. |
| XSS                     | Tanpa `innerHTML`, `eval`, `new Function`, `insertAdjacentHTML`.                                                                                                                                  |
| Log                     | Tanpa `console.*` di `src/` dan `extension/src/`. Jangan mencatat teks, temuan, atau isi vault.                                                                                                   |
| Selektor rapuh          | Semua pemilih DOM di `extension/src/content/sites.ts`. Satu berkas untuk diperbaiki saat situs berubah.                                                                                           |
| Terlalu dipercaya       | Popup dan README: “Alat bantu, bukan jaminan.”                                                                                                                                                    |

`storage` hanya untuk `{ enabled: boolean }`. Kunci lain tidak boleh ditulis.

## 4. Perilaku ekstensi

String antarmuka: Bahasa Indonesia.

**Tempel.** Dengarkan `paste` di fase capture pada `document`. Abaikan event yang targetnya di luar editor (pemilih dari `sites.ts`). Baca `clipboardData.getData("text/plain")` dari event. Jalankan `redact` dengan vault tab. `preventDefault`, lalu sisipkan teks tersamar. Coba `document.execCommand("insertText")` dulu karena ia melewati pipeline input situs; catat di `docs/extension.md` metode yang benar-benar bekerja per situs. Kalau penyisipan gagal, jangan menyisipkan HTML. Beri catatan kecil “N data disamarkan”. Tanpa izin `clipboardRead`.

**Sebelum kirim.** Hanya jika editor teridentifikasi. Saat Enter atau tombol kirim, pindai teks editor. Jika masih ada data yang belum disamarkan, tahan **sekali** dan tampilkan “Ada data yang belum disamarkan — Samarakan / Kirim apa adanya”. Jangan mengirim sendiri, jangan mengklik tombol kirim. Kiriman berikutnya dengan data yang sama tidak ditahan lagi sampai teks editor berubah. Jika editor tidak ketemu, jangan menyentuh Enter.

**Balasan.** Jangan mengganti text node balasan. Toggle “Tampilkan data asli” (atau popover pada token) membaca vault di memori dan menampilkan nilai di UI ekstensi. Jangan mengubah isi editor. Jangan menulis nilai asli ke DOM yang bisa ikut terkirim.

**Popup.** Sakelar aktif/nonaktif, jumlah item yang disamarkan di tab aktif (angka saja), tombol “Hapus data tab ini” (mengosongkan vault tab, bukan mengirim isinya), spanduk “Alat bantu, bukan jaminan.”

**Mati.** `enabled: false` melepas pengait tempel dan pengait kirim. Default saat kunci belum ada: aktif.

**Build.** Vite membundel `src/` ke `extension/dist/`. Skrip: `build:ext` dan `zip:ext`. Ikon berkas lokal.

## 5. Milestone sisa

Kerjakan satu milestone. Berhenti dengan diff, hasil tes, dan pertanyaan terbuka.

### M5 — Kerangka + samarkan saat tempel

- `extension/manifest.json` sesuai §3. Versi `0.1.0`. Popup placeholder. Ikon lokal.
- `sites.ts`, vault per tab, pengait tempel, catatan “N data disamarkan”.
- `test/manifest.test.ts`: izin persis `["storage"]`, tanpa `host_permissions`, matches persis dua URL, CSP memuat `connect-src 'none'`, tanpa `<all_urls>`.
- Tes jsdom: event tempel sintetis menghasilkan token, bukan nilai asli.
- Perluas `test/no-network.test.ts` ke `extension/` (sumber dan, setelah build, `extension/dist/`) dengan pola yang sudah ada ditambah `EventSource`. Jangan memindai README. String `https://` yang boleh di kode ekstensi hanya dua pola match di manifes.
- `no-console` untuk `extension/src/**/*.ts`. Larangan `innerHTML` di tes demo-safety mencakup `extension/`.
- DevDependency baru yang diizinkan: `jsdom` (dan `@types/jsdom` jika perlu).

Penerimaan: `npm test` hijau; cara memuat unpacked dan apa yang dicek di DevTools (halaman, popup, service worker) tertulis di jawaban, bukan hanya di kode.

### M6 — Peringatan kirim, tampilan lokal, popup

- Peringatan sekali sesuai §4. Jangan kirim otomatis.
- Toggle tampilan nilai asli tanpa mengubah text node balasan atau editor.
- Popup sesuai §4. Tes: saat nonaktif, tempel tidak dicegat; yang ditulis ke storage hanya kunci `enabled`.
- `docs/extension.md`: pemilih, metode sisip per situs, dan apa yang terjadi jika pemilih gagal.

### M7 — Dokumen rilis

- `PRIVACY.md` (Indonesia dan Inggris) dari janji yang sama: tidak mengumpulkan, tidak mengirim, tidak menjual; proses di perangkat; vault hilang saat tab ditutup atau dimuat ulang; storage hanya aktif/nonaktif; hanya chatgpt.com dan claude.ai; alat bantu, bukan jaminan.
- Perbarui `README.md` dan `README.id.md`: tiga bentuk produk. Ekstensi keluar dari daftar calon v2. Jangan menaruh tautan Chrome Web Store sebelum listing ada.
- Jangan menulis ulang `docs/detectors.md` kecuali perilaku benar-benar berubah.
- Daftar rilis dan daftar Chrome Web Store di bawah. Jangan menyatakan biaya atau kebijakan toko sebagai fakta; maintainer yang memeriksa syarat yang berlaku.
- Tanggal `0.1.0` di changelog diisi maintainer: 2026-10-15. Jangan membuat tag git kecuali diminta.

### Daftar rilis

- [x] `0.1.0` di `package.json` dan `extension/manifest.json`; tanggal changelog `2026-10-15` (ekstensi tercatat di bagian Unreleased, belum di tag `v0.1.0`)
- [ ] CI hijau pada commit yang memuat ekstensi
- [x] Tag `v0.1.0` dan GitHub Release (pustaka; tag tidak dipindah)
- [x] Halaman demo dicek luring pada hasil `npm run build:demo` (deploy Pages tetap opsional)
- [x] Daftar kode provinsi dan wilayah plat diperiksa manusia, atau catatan rilis menyatakan belum diperiksa

### Daftar Chrome Web Store

- [ ] Akun pengembang dan syarat Google dicek sendiri
- [x] Zip dari `npm run zip:ext` (`extension/tirai-0.1.0.zip`, tidak masuk git); tanpa kode remote; tanpa source map
- [x] Deskripsi satu tujuan (ID + EN) tertulis di `docs/extension.md`
- [x] Alasan izin tertulis di `docs/extension.md`: `storage` = sakelar aktif saja; akses situs = hanya dua host itu
- [x] Jawaban formulir privasi tertulis di `docs/extension.md` dan `PRIVACY.md` (formulir Google belum dikirim)
- [ ] Tangkapan layar memakai data sintetis; ikon 128×128 ada di `extension/icons/`
- [x] “Alat bantu, bukan jaminan” ada di deskripsi draf

## 6. Di luar cakupan

NPWP, alamat, nama, email, rekening, telepon rumah, KK, paspor, vault yang disimpan, ekspor terenkripsi, deteksi ML, situs AI lain, Firefox/Edge, gateway, MCP, pembayaran, dan kunci lisensi.

## 7. Aturan agen

1. Jangan mengarang angka ketepatan.
2. Jangan memanggil jaringan. Tanpa kunci API, telemetri, atau aset remote.
3. Data tes sintetis.
4. Detektor tetap fungsi murni. Jangan mengubah perilakunya di M5–M7.
5. Jangan mencatat, menyimpan, atau mengirim isi vault.
6. Jangan `innerHTML`, `eval`, atau `new Function` di `demo/`, `src/`, atau `extension/`.
7. Tanpa dependensi runtime. DevDependency baru hanya `jsdom` / `@types/jsdom`.
8. Bahasa Indonesia untuk UI dan dokumen pengguna. Pengenal kode dalam bahasa Inggris.
9. Rampart hanya ilham. Tanpa klaim kompatibilitas API.
10. Jika ragu, samarkan lebih sedikit pada teks tanpa label, dan gagal terbuka pada UI situs. Catat di `docs/extension.md`.
11. Satu milestone sekali. Jangan mulai milestone berikutnya tanpa konfirmasi.
12. Jangan menambah izin atau host tanpa bertanya.
13. Ekstensi tidak mengirim prompt, tidak menaruh nilai asli ke teks yang akan dikirim ulang, dan tidak memindahkan vault keluar dari memori content script.

### Prompt M5

```
Lanjutkan M5 dari docs/tirai/PROMPT.md. Pustaka dan demo sudah selesai: jangan ubah detektor. Buat ekstensi Manifest V3 sesuai bagian 3 dan 4: matches hanya chatgpt.com dan claude.ai, permissions persis ["storage"], tanpa host_permissions, CSP extension_pages dengan connect-src 'none', ikon lokal. Bundel src/ dengan Vite (build:ext, zip:ext). Semua pemilih di extension/src/content/sites.ts. Samarkan saat tempel dengan vault di memori tab. Content script di isolated world. Tanpa jaringan. Tambah test/manifest.test.ts, tes jsdom untuk tempel, perluas no-network ke extension/ dan extension/dist/, dan no-console untuk extension/src. jsdom boleh sebagai devDependency. Jelaskan cara memuat unpacked dan apa yang dicek di DevTools.
Berhenti. Tunjukkan diff, hasil tes, dan pertanyaan terbuka.
```

### Prompt M6

```
Lanjutkan M6 dari docs/tirai/PROMPT.md. Tambah peringatan sekali sebelum kirim (jangan kirim otomatis; jika editor tidak ketemu, jangan sentuh Enter), toggle tampilan nilai asli tanpa mengubah text node balasan atau editor, dan popup (boolean enabled, jumlah saja, Hapus data tab ini, spanduk). Tes: nonaktif berarti tempel tidak dicegat; storage hanya menulis kunci enabled. Catat pemilih dan metode sisip di docs/extension.md.
Berhenti. Tunjukkan diff, hasil tes, dan pertanyaan terbuka.
```

### Prompt M7

```
Lanjutkan M7 dari docs/tirai/PROMPT.md. Tulis PRIVACY.md, perbarui README.md dan README.id.md agar ekstensi bukan lagi calon v2, dan cetak daftar rilis serta daftar Chrome Web Store. Jangan menyatakan biaya atau kebijakan toko sebagai fakta. Jangan mengubah detektor. Jangan membuat tag git. Tanggal changelog tetap placeholder.
Berhenti. Tunjukkan diff, hasil tes, dan pertanyaan terbuka.
```
