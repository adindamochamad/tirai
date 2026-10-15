# Tirai

Tirai berdiri di antara teks Anda dan obrolan AI. Alat ini menyamarkan NIK, nomor HP, dan plat nomor kendaraan. Setelah balasan kembali, nilai aslinya dikembalikan.

Ini alat bantu, bukan jaminan. Baca ulang teks sebelum dikirim. Pustaka ini tidak mengenali semua cara orang menuliskan nomor, dan bisa saja menyamarkan sesuatu yang bukan data pribadi.

Nama orang di luar cakupan versi pertama, jadi nama pada teks tetap tertulis.

## Yang bukan cakupan

- Bukan peladen, akun, atau basis data. Pustaka dan demo tidak mengirim teks ke mana pun.
- Bukan pendeteksi pembelajaran mesin. Aturannya ekspresi reguler ditambah beberapa pemeriksaan.
- Bukan daftar lengkap data pribadi Indonesia. Lihat [calon versi 2](#calon-versi-2).
- Bukan klaim ketepatan. Repositori ini tidak menerbitkan angka ketepatan. Pengujian hanya menggambarkan perilaku pada contoh sintetis.

## Pemasangan

```bash
npm install tirai
```

Rilis ini ada di repositori GitHub. Nama npm belum terbit, jadi perintah itu belum bisa dipakai. Tidak ada dependensi runtime. Dari repositori ini:

```bash
npm ci
npm test
npm run dev
```

## Cara pakai

```ts
import { redact, restore } from "tirai";

const input =
  "Saya Budi, NIK 3171012501900003, HP 0812-3456-7890, motor B 4321 XYZ ditilang.";

const { redacted, vault } = redact(input);
// Saya Budi, NIK [NIK_1], HP [TELEPON_1], motor [PLAT_1] ditilang.

const reply =
  "Terima kasih. Kami akan menghubungi [TELEPON_1] terkait kendaraan [PLAT_1].";
restore(reply, vault);
// Terima kasih. Kami akan menghubungi 0812-3456-7890 terkait kendaraan B 4321 XYZ.
```

`redact(text, options)` mengembalikan `{ redacted, vault, findings }`. `findings` berisi `type`, `token`, serta offset `start` / `end` pada teks asli. Nilai asli tidak ikut di sana.

`restore(text, vault)` mengembalikan token yang dikenal. `[ telepon_1 ]` diterima. Token yang tidak dikenal dibiarkan. Tidak ada pencocokan samar selain itu.

Lewatkan `options.vault` agar kode yang sama dipakai pada beberapa tempelan. `options.detectors` membatasi deteksi ke `"NIK"`, `"TELEPON"`, dan/atau `"PLAT"`. `options.nikStrict` bawaan `true`. Isi `false` untuk menyamarkan setiap deretan 16 digit tanpa label. Deretan yang diawali `0` tetap tidak dianggap NIK. Rincian dan kelalaian yang diketahui ada di [docs/detectors.md](docs/detectors.md).

## Model privasi

- Vault hanya hidup di memori selama objek itu Anda simpan. Demo mengosongkannya lewat **Hapus semua**, dan tidak menulisnya ke `localStorage`, `sessionStorage`, IndexedDB, cookie, atau URL.
- `JSON.stringify(vault)`, `String(vault)`, dan inspect Node mengembalikan `[Vault: N entries]`. Isinya tidak memuat nilai yang disimpan.
- Pustaka tidak mencatat teks masukan, temuan, atau isi vault.
- Demo tidak memanggil `fetch`, `XMLHttpRequest`, `WebSocket`, atau `sendBeacon`. **Kirim ke AI (simulasi)** adalah fungsi lokal. Jika Anda memakai alat obrolan sungguhan, Anda sendiri yang menyalin teks tersamar.
- Halaman demo memasang `Content-Security-Policy`: `default-src 'self'; connect-src 'none'; script-src 'self'; style-src 'self'`.

## Demo

```bash
npm run dev
npm run build:demo
```

`build:demo` menulis situs statis ke `dist-demo/`. Muat ulang langsung pada server pengembangan ingin membuka soket, dan kebijakan di atas melarangnya. Periksa halaman hasil bangun bila Anda ingin log jaringan kosong.

Pemeriksaan manual:

1. Tempel contoh Budi, lalu pilih **Samarakan**. Teks tersamar memakai `[NIK_1]`, `[TELEPON_1]`, dan `[PLAT_1]`. Tabel menampilkan jenis, kode, dan nilai asli di layar ini.
2. Pilih **Kirim ke AI (simulasi)**. Balasan menyebut kode telepon dan plat. Catatan menyatakan simulasi tetap lokal.
3. Pilih **Kembalikan**. **Hasil akhir** menampilkan `0812-3456-7890` dan `B 4321 XYZ`.
4. Pilih **Hapus semua**. Isian dan tabel kosong.
5. Buka DevTools → Network, muat ulang halaman hasil bangun, dan pastikan tidak ada permintaan setelah halaman termuat. Tempel lagi dan pastikan log tetap kosong.

## Ilham

Tirai terilham dari [Rampart](https://github.com/nationaldesignstudio/rampart). Kode Rampart tidak dipakai di sini, dan API-nya tidak sama.

## Lisensi

MIT. Hak cipta (c) 2026 Adinda Panca Mochamad.

## Calon versi 2

- NPWP (15/16 digit)
- Alamat lengkap (Jalan, RT/RW, kelurahan)
- Nama orang
- Alamat surel
- Nomor rekening dan kartu bank
- Telepon rumah, nomor KK (Kartu Keluarga), nomor paspor
- Ekstensi peramban, vault yang disimpan, atau ekspor terenkripsi
- Detektor AI atau pembelajaran mesin
