export interface CorpusSample {
  id: string;
  text: string;
  /** Exact surface forms that must disappear from the redacted text. */
  secrets: readonly string[];
}

export const samples: readonly CorpusSample[] = [
  {
    id: "dishub-budi",
    text: "Saya Budi, NIK 3171012501900003, HP 0812-3456-7890, motor B 4321 XYZ ditilang.",
    secrets: ["3171012501900003", "0812-3456-7890", "B 4321 XYZ"],
  },
  {
    id: "parkir-telepon",
    text: "Mohon tindak lanjut parkir liar di depan pasar. Hubungi saya di 081298765432 sore ini.",
    secrets: ["081298765432"],
  },
  {
    id: "bpr-nik",
    text: "Yth. Bagian Kredit, nasabah dengan NIK 1271011508800001 mengajukan salinan rekening koran.",
    secrets: ["1271011508800001"],
  },
  {
    id: "nik-grouped-space",
    text: "NIK 317101 250190 0003 sesuai fotokopi yang dilampirkan petugas.",
    secrets: ["317101 250190 0003"],
  },
  {
    id: "nik-female-day",
    text: "Pemohon perempuan, NIK 3273014105850002, datang ke loket kredit pukul sepuluh.",
    secrets: ["3273014105850002"],
  },
  {
    id: "phone-plus62",
    text: "Nomor yang bisa dihubungi +62 812-3456-7890 pada siang hari.",
    secrets: ["+62 812-3456-7890"],
  },
  {
    id: "phone-0062",
    text: "SMS balik ke 006281377788899 sudah kami terima dari pelapor.",
    secrets: ["006281377788899"],
  },
  {
    id: "phone-dots",
    text: "Hubungi 0812.3456.7890 jika angkot tidak datang dalam tiga puluh menit.",
    secrets: ["0812.3456.7890"],
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
    text: "Dua saksi dapat dihubungi di 081377788899 dan 085612341234.",
    secrets: ["081377788899", "085612341234"],
  },
  {
    id: "two-niks",
    text: "Pemohon 1471012006900004 dan penjamin 3174013108850011 hadir bersama.",
    secrets: ["1471012006900004", "3174013108850011"],
  },
  {
    id: "nik-glued-colon",
    text: "Terlampir NIK:3171012501900003 untuk arsip pengaduan.",
    secrets: ["3171012501900003"],
  },
  {
    id: "plate-punctuation",
    text: "Lokasi kejadian dekat (B 1234 ABC), mohon derek ke pinggir.",
    secrets: ["B 1234 ABC"],
  },
  {
    id: "bpr-all-three",
    text: "Nasabah NIK 6371010101000005, HP 081234567890, jaminan kendaraan DK 1234 AB.",
    secrets: ["6371010101000005", "081234567890", "DK 1234 AB"],
  },
  {
    id: "angkot",
    text: "Angkot L 8765 Q ngetem di halte. Sopir dapat dihubungi 081387654321.",
    secrets: ["L 8765 Q", "081387654321"],
  },
  {
    id: "plate-labeled-lower",
    text: "nopol b 1234 abc terpasang pada motor yang ditinggal di bahu jalan.",
    secrets: ["b 1234 abc"],
  },
  {
    id: "nik-beside-phone",
    text: "Identitas 3171012501900003 / telepon 081298765432 dicatat petugas lapangan.",
    secrets: ["3171012501900003", "081298765432"],
  },
  {
    id: "duplicate-plate",
    text: "Plat B 4321 XYZ dan lagi B 4321 XYZ disebut dua kali dalam aduan.",
    secrets: ["B 4321 XYZ"],
  },
  {
    id: "phone-paren",
    text: "Kontak (+62) 812-9999-0000 milik pemilik kios di halte.",
    secrets: ["(+62) 812-9999-0000"],
  },
  {
    id: "nik-slash",
    text: "nomor induk kependudukan 317101/250190/0003 sudah diverifikasi loket.",
    secrets: ["317101/250190/0003"],
  },
  {
    id: "nik-dash-ktp",
    text: "No. KTP 327301-410585-0002 fotokopi terlampir pada berkas kredit.",
    secrets: ["327301-410585-0002"],
  },
  {
    id: "nik-nomor-induk-grouped",
    text: "Berdasarkan nomor induk kependudukan 510101 710712 0002, pemohon berasal dari Denpasar.",
    secrets: ["510101 710712 0002"],
  },
  {
    id: "duplicate-nik",
    text: "NIK 1271011508800001 diulang pada lampiran: 1271011508800001.",
    secrets: ["1271011508800001"],
  },
  {
    id: "sulsel-female",
    text: "Data 7371014512000008 milik nasabah perempuan yang mengajukan keringanan.",
    secrets: ["7371014512000008"],
  },
  {
    id: "bali-plain",
    text: "Warga 5101017107120003 melapor kemacetan di persimpangan pasar.",
    secrets: ["5101017107120003"],
  },
  {
    id: "dishub-rute",
    text: "Pengaduan rute bus. Pengemudi dapat dihubungi 085277766655, kendaraan F 88 KK.",
    secrets: ["085277766655", "F 88 KK"],
  },
  {
    id: "bpr-surat",
    text: "Surat ini merujuk nasabah KTP 1471012006900004 tanpa menyalin nomor ke pihak lain.",
    secrets: ["1471012006900004"],
  },
  {
    id: "no-identifiers",
    text: "Pengaduan tentang lampu jalan di simpang lima mati sejak kemarin malam.",
    secrets: [],
  },
  {
    id: "landline-021",
    text: "Telepon kantor 021-5551234 tidak diangkat oleh petugas loket.",
    secrets: [],
  },
  {
    id: "landline-country",
    text: "Hubungi +62 21 79181234 pada jam kerja jika perlu konfirmasi.",
    secrets: [],
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
    secrets: [],
  },
  {
    id: "fifteen-digits",
    text: "Nomor berkas 317101250190000 tercatat di buku agenda.",
    secrets: [],
  },
  {
    id: "seventeen-digits",
    text: "Referensi 31710125019000031 bukan nomor yang kami catat.",
    secrets: [],
  },
  {
    id: "short-phone",
    text: "Nomor 0812345 terlalu pendek untuk dihubungi.",
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
    text: "Kode 3171013213900001 tertulis di amplop, bukan pada kolom NIK.",
    secrets: [],
  },
  {
    id: "order-id",
    text: "Nomor invoice INV-2024-001 belum dibayar oleh pemohon.",
    secrets: [],
  },
  {
    id: "zero-prefixed-16",
    text: "Tercatat 0171012501900003 pada formulir lama dan tidak dipakai.",
    secrets: [],
  },
];
