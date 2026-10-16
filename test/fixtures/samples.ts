export interface CorpusSample {
  id: string;
  text: string;
  /** Exact surface forms that must disappear from the redacted text. */
  secrets: readonly string[];
}

/** Marker on dummy NIK/phone examples so they are not mistaken for real data. */
export const SYNTHETIC_MARK = "SINTETIS";

/**
 * SINTETIS. NIK/KK numbers use birth 01-01-01 (or day 41 for the female
 * offset) and serial 0000–0009. Mobile numbers use 0800-0000-xxxx. Landlines
 * use 555. They are dummy values, not a person’s data.
 */
export const samples: readonly CorpusSample[] = [
  {
    id: "dishub-budi",
    text: "SINTETIS. Saya Budi, NIK 3171010101010000, HP 0800-0000-0001, motor B 4321 XYZ ditilang.",
    secrets: ["3171010101010000", "0800-0000-0001", "B 4321 XYZ"],
  },
  {
    id: "parkir-telepon",
    text: "SINTETIS. Mohon tindak lanjut parkir liar di depan pasar. Hubungi saya di 080000000002 sore ini.",
    secrets: ["080000000002"],
  },
  {
    id: "bpr-nik",
    text: "SINTETIS. Yth. Bagian Kredit, nasabah dengan NIK 1271010101010001 mengajukan salinan rekening koran.",
    secrets: ["1271010101010001"],
  },
  {
    id: "nik-grouped-space",
    text: "SINTETIS. NIK 317101 010101 0000 sesuai fotokopi yang dilampirkan petugas.",
    secrets: ["317101 010101 0000"],
  },
  {
    id: "nik-female-day",
    text: "SINTETIS. Pemohon perempuan, NIK 3273014101010002, datang ke loket kredit pukul sepuluh.",
    secrets: ["3273014101010002"],
  },
  {
    id: "phone-plus62",
    text: "SINTETIS. Nomor yang bisa dihubungi +62 800-0000-0001 pada siang hari.",
    secrets: ["+62 800-0000-0001"],
  },
  {
    id: "phone-0062",
    text: "SINTETIS. SMS balik ke 006280000000001 sudah kami terima dari pelapor.",
    secrets: ["006280000000001"],
  },
  {
    id: "phone-dots",
    text: "SINTETIS. Hubungi 0800.0000.0001 jika angkot tidak datang dalam tiga puluh menit.",
    secrets: ["0800.0000.0001"],
  },
  {
    id: "plate-compact",
    text: "Mobil dinas D1234AB parkir di badan jalan depan terminal.",
    secrets: ["D1234AB"],
  },
  {
    id: "plate-two-letter",
    text: "Truk AB 1234 XY menutup pintu masuk terminal sejak pagi.",
    secrets: ["AB 1234 XY"],
  },
  {
    id: "two-phones",
    text: "SINTETIS. Dua saksi dapat dihubungi di 080000000003 dan 080000000004.",
    secrets: ["080000000003", "080000000004"],
  },
  {
    id: "two-niks",
    text: "SINTETIS. Pemohon 1471010101010003 dan penjamin 3174010101010004 hadir bersama.",
    secrets: ["1471010101010003", "3174010101010004"],
  },
  {
    id: "nik-glued-colon",
    text: "SINTETIS. Terlampir NIK:3171010101010000 untuk arsip pengaduan.",
    secrets: ["3171010101010000"],
  },
  {
    id: "plate-punctuation",
    text: "Lokasi kejadian dekat (B 1234 ABC), mohon derek ke pinggir.",
    secrets: ["B 1234 ABC"],
  },
  {
    id: "bpr-all-three",
    text: "SINTETIS. Nasabah NIK 6371010101010005, HP 080000000001, jaminan kendaraan DK 1234 AB.",
    secrets: ["6371010101010005", "080000000001", "DK 1234 AB"],
  },
  {
    id: "angkot",
    text: "SINTETIS. Angkot L 8765 Q ngetem di halte. Sopir dapat dihubungi 080000000006.",
    secrets: ["L 8765 Q", "080000000006"],
  },
  {
    id: "plate-labeled-lower",
    text: "nopol b 1234 abc terpasang pada motor yang ditinggal di bahu jalan.",
    secrets: ["b 1234 abc"],
  },
  {
    id: "nik-beside-phone",
    text: "SINTETIS. Identitas 3171010101010000 / telepon 080000000002 dicatat petugas lapangan.",
    secrets: ["3171010101010000", "080000000002"],
  },
  {
    id: "duplicate-plate",
    text: "Plat B 4321 XYZ dan lagi B 4321 XYZ disebut dua kali dalam aduan.",
    secrets: ["B 4321 XYZ"],
  },
  {
    id: "phone-paren",
    text: "SINTETIS. Kontak (+62) 800-0000-0007 milik pemilik kios di halte.",
    secrets: ["(+62) 800-0000-0007"],
  },
  {
    id: "nik-slash",
    text: "SINTETIS. nomor induk kependudukan 317101/010101/0000 sudah diverifikasi loket.",
    secrets: ["317101/010101/0000"],
  },
  {
    id: "nik-dash-ktp",
    text: "SINTETIS. No. KTP 327301-410101-0002 fotokopi terlampir pada berkas kredit.",
    secrets: ["327301-410101-0002"],
  },
  {
    id: "nik-nomor-induk-grouped",
    text: "SINTETIS. Berdasarkan nomor induk kependudukan 510101 410101 0008, pemohon berasal dari Denpasar.",
    secrets: ["510101 410101 0008"],
  },
  {
    id: "duplicate-nik",
    text: "SINTETIS. NIK 1271010101010001 diulang pada lampiran: 1271010101010001.",
    secrets: ["1271010101010001"],
  },
  {
    id: "sulsel-female",
    text: "SINTETIS. Data 7371014101010009 milik nasabah perempuan yang mengajukan keringanan.",
    secrets: ["7371014101010009"],
  },
  {
    id: "bali-plain",
    text: "SINTETIS. Warga 5101010101010006 melapor kemacetan di persimpangan pasar.",
    secrets: ["5101010101010006"],
  },
  {
    id: "dishub-rute",
    text: "SINTETIS. Pengaduan rute bus. Pengemudi dapat dihubungi 080000000010, kendaraan F 88 KK.",
    secrets: ["080000000010", "F 88 KK"],
  },
  {
    id: "bpr-surat",
    text: "SINTETIS. Surat ini merujuk nasabah KTP 1471010101010003 tanpa menyalin nomor ke pihak lain.",
    secrets: ["1471010101010003"],
  },
  {
    id: "no-identifiers",
    text: "Pengaduan tentang lampu jalan di simpang lima mati sejak kemarin malam.",
    secrets: [],
  },
  {
    id: "landline-021",
    text: "SINTETIS. Telepon kantor 021-5551234 tidak diangkat oleh petugas loket.",
    secrets: ["021-5551234"],
  },
  {
    id: "landline-country",
    text: "SINTETIS. Hubungi +62 21 5550100 pada jam kerja jika perlu konfirmasi.",
    secrets: ["+62 21 5550100"],
  },
  {
    id: "list-item-b12",
    text: "Antrian loket B 12 sudah panjang sekali sejak pagi.",
    secrets: [],
  },
  {
    id: "prose-a1",
    text: "Pilih jawaban A 1 bila setuju dengan usulan rute baru.",
    secrets: [],
  },
  {
    id: "name-only",
    text: "Nama pelapor Siti Aminah dari kelurahan Melati, tanpa nomor identitas.",
    secrets: ["Siti Aminah"],
  },
  {
    id: "fifteen-digits",
    text: "SINTETIS. Nomor berkas 317101010101000 tercatat di buku agenda.",
    secrets: [],
  },
  {
    id: "seventeen-digits",
    text: "SINTETIS. Referensi 31710101010100001 bukan nomor yang kami catat.",
    secrets: [],
  },
  {
    id: "short-phone",
    text: "SINTETIS. Nomor 0800000 terlalu pendek untuk dihubungi.",
    secrets: [],
  },
  {
    id: "unknown-plate",
    text: "Tulisan QQ 1234 ABC di dinding bukan plat resmi.",
    secrets: [],
  },
  {
    id: "lowercase-plate",
    text: "Pengendara menulis b 1234 abc di laporan manual tanpa label.",
    secrets: [],
  },
  {
    id: "invalid-nik-date",
    text: "SINTETIS. Kode 3171013213900001 tertulis di amplop, bukan pada kolom NIK.",
    secrets: [],
  },
  {
    id: "order-id",
    text: "Nomor invoice INV-2024-001 belum dibayar oleh pemohon.",
    secrets: [],
  },
  {
    id: "zero-prefixed-16",
    text: "SINTETIS. Tercatat 0171010101010000 pada formulir lama dan tidak dipakai.",
    secrets: [],
  },
  {
    id: "npwp-formatted",
    text: "NPWP 07.654.321.0-012.000 tercatat pada SPT tahunan sintetis.",
    secrets: ["07.654.321.0-012.000"],
  },
  {
    id: "kk-labeled",
    text: "SINTETIS. Kartu Keluarga 3273014101010002 dilampirkan fotokopi.",
    secrets: ["3273014101010002"],
  },
  {
    id: "email-siti",
    text: "Kirim salinan ke siti.aminah@contoh.id sebelum siang.",
    secrets: ["siti.aminah@contoh.id"],
  },
  {
    id: "passport-labeled",
    text: "Paspor C1234567 masih berlaku sampai tahun depan.",
    secrets: ["C1234567"],
  },
  {
    id: "rekening-labeled",
    text: "Transfer ke rekening 1234567890 atas nama pemohon.",
    secrets: ["1234567890"],
  },
  {
    id: "card-grouped",
    text: "Kartu kredit 4111 1111 1111 1111 untuk biaya administrasi uji.",
    secrets: ["4111 1111 1111 1111"],
  },
  {
    id: "street-rtrw",
    text: "Tinggal di Jl. Melati No. 12, RT 03/RW 05 sementara pengurusan.",
    secrets: ["Jl. Melati No. 12, RT 03/RW 05"],
  },
  {
    id: "unlabeled-passport-left",
    text: "Kode berkas C1234567 bukan identitas perjalanan.",
    secrets: [],
  },
  {
    id: "unlabeled-account-left",
    text: "Nomor antrian 1234567890 dipanggil petugas loket.",
    secrets: [],
  },
];
