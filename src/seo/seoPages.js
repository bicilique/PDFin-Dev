import { PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";
import { RELEASE_CONFIG } from "../app/releaseConfig.js";

export const SITE_ORIGIN = "https://www.pdfin.fun";
export const SITE_BASE_PATH = "/";
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH.replace(/\/$/, "")}`;

const toolSeoCopy = {
  merge: {
    title: "Gabung PDF online privat | PDFin",
    h1: "Gabung PDF di browser",
    description: "Gabungkan beberapa file PDF menjadi satu langsung di browser. File diproses di perangkat Anda tanpa unggah.",
    intro: "Satukan kontrak, formulir, atau dokumen kerja menjadi satu file PDF rapi tanpa memindahkan file dari perangkat Anda.",
    howItWorks: ["Pilih beberapa file PDF.", "Atur urutan dokumen sebelum diproses.", "Unduh satu file PDF hasil gabungan."],
    faq: [
      ["Apakah file saya diunggah?", "Tidak. PDFin memproses alat inti langsung di browser."],
      ["Berapa banyak file yang bisa digabung?", "Mulai dari dua file PDF. Batas praktis bergantung pada memori browser dan ukuran file."],
    ],
  },
  split: {
    title: "Pisah PDF online privat | PDFin",
    h1: "Pisah PDF di browser",
    description: "Pisahkan PDF berdasarkan rentang, setiap beberapa halaman, atau pilihan halaman langsung dari browser.",
    intro: "Ambil halaman yang dibutuhkan dari dokumen panjang tanpa mengunggah PDF ke server.",
    howItWorks: ["Tambahkan satu file PDF.", "Pilih mode pemisahan halaman.", "Unduh hasil sebagai file PDF baru."],
    faq: [
      ["Mode pisah apa yang tersedia?", "Anda dapat memisahkan berdasarkan rentang, interval halaman, atau halaman pilihan."],
      ["Apakah hasilnya tetap PDF?", "Ya. Hasil unduhan tetap berupa file PDF."],
    ],
  },
  organize: {
    title: "Atur halaman PDF online | PDFin",
    h1: "Atur halaman PDF",
    description: "Susun ulang, putar, duplikat, dan hapus halaman PDF langsung di browser.",
    intro: "Rapikan struktur dokumen PDF sebelum dibagikan atau diarsipkan.",
    howItWorks: ["Tambahkan satu PDF.", "Susun, putar, duplikat, atau hapus halaman.", "Proses dan unduh PDF yang sudah dirapikan."],
    faq: [
      ["Bisakah saya menghapus halaman tertentu?", "Ya. Pilih halaman yang tidak diperlukan lalu hapus sebelum memproses file."],
      ["Apakah urutan halaman bisa diubah?", "Ya. Halaman dapat disusun ulang dari ruang kerja PDFin."],
    ],
  },
  rotate: {
    title: "Putar PDF online privat | PDFin",
    h1: "Putar halaman PDF",
    description: "Putar halaman PDF tertentu atau seluruh dokumen langsung di browser.",
    intro: "Perbaiki orientasi halaman hasil pindai atau dokumen campuran dengan cepat.",
    howItWorks: ["Tambahkan file PDF.", "Pilih halaman atau semua halaman.", "Putar dan unduh hasilnya."],
    faq: [
      ["Bisakah hanya satu halaman diputar?", "Ya. Anda dapat memilih halaman tertentu sebelum memproses."],
      ["Apakah file asli berubah?", "Tidak. PDFin membuat file hasil baru untuk diunduh."],
    ],
  },
  compress: {
    title: "Kompres PDF online privat | PDFin",
    h1: "Kompres PDF di browser",
    description: "Kecilkan ukuran file PDF dengan pilihan kompresi langsung di browser.",
    intro: "Buat PDF lebih ringan untuk dikirim atau diunggah ke layanan lain, sambil menjaga proses tetap lokal di perangkat.",
    howItWorks: ["Tambahkan satu PDF.", "Pilih tingkat kompresi.", "Unduh file PDF yang lebih ringan."],
    faq: [
      ["Apakah kualitas bisa berubah?", "Ya. Kompresi dapat menurunkan detail visual tergantung tingkat yang dipilih."],
      ["Apakah cocok untuk dokumen besar?", "Cocok, selama browser dan perangkat Anda memiliki memori yang cukup."],
    ],
  },
  watermark: {
    title: "Tambah watermark PDF online | PDFin",
    h1: "Tambahkan watermark PDF",
    description: "Tambahkan watermark teks atau gambar ke PDF langsung di browser.",
    intro: "Beri tanda dokumen dengan label draft, rahasia, atau identitas brand sebelum dibagikan.",
    howItWorks: ["Tambahkan file PDF.", "Atur teks atau gambar watermark.", "Proses dan unduh PDF dengan watermark."],
    faq: [
      ["Watermark bisa berupa gambar?", "Ya. Ruang kerja mendukung watermark teks atau gambar."],
      ["Apakah watermark diterapkan ke semua halaman?", "Pengaturan watermark tersedia di ruang kerja sebelum file diproses."],
    ],
  },
  img2pdf: {
    title: "Ubah gambar ke PDF online | PDFin",
    h1: "Ubah gambar ke PDF",
    description: "Konversi JPG atau PNG menjadi dokumen PDF langsung di browser.",
    intro: "Gabungkan gambar hasil scan, foto dokumen, atau materi visual menjadi satu PDF.",
    howItWorks: ["Tambahkan satu atau beberapa JPG/PNG.", "Atur urutan gambar.", "Unduh dokumen PDF hasil konversi."],
    faq: [
      ["Format gambar apa yang didukung?", "PDFin mendukung JPG dan PNG untuk alat ini."],
      ["Bisakah beberapa gambar menjadi satu PDF?", "Ya. Tambahkan beberapa gambar lalu atur urutannya."],
    ],
  },
  pdf2img: {
    title: "Ubah PDF ke gambar online | PDFin",
    h1: "Ekspor PDF ke gambar",
    description: "Ekspor halaman PDF menjadi gambar langsung dari browser.",
    intro: "Ambil halaman PDF sebagai gambar untuk pratinjau, presentasi, atau kebutuhan berbagi cepat.",
    howItWorks: ["Tambahkan satu PDF.", "Pilih halaman yang akan diekspor.", "Unduh gambar hasil ekspor."],
    faq: [
      ["Apakah setiap halaman menjadi gambar?", "Anda dapat mengekspor halaman PDF sesuai kebutuhan dari ruang kerja."],
      ["Apakah prosesnya lokal?", "Ya. File diproses di browser untuk alat inti PDFin."],
    ],
  },
  md2pdf: {
    title: "Markdown ke PDF online privat | PDFin",
    h1: "Ubah Markdown ke PDF di browser",
    description: "Tulis atau tempel Markdown dengan pratinjau langsung, lalu unduh sebagai PDF. Teks diproses di perangkat Anda tanpa unggah.",
    intro: "Ubah catatan, dokumentasi, atau README Markdown menjadi PDF rapi dengan pratinjau langsung, tanpa memindahkan teks dari perangkat Anda.",
    howItWorks: ["Tulis, tempel, atau buka file Markdown.", "Periksa hasilnya lewat pratinjau langsung.", "Atur ukuran halaman lalu unduh PDF."],
    faq: [
      ["Apakah teks saya diunggah?", "Tidak. Markdown diubah menjadi PDF langsung di browser Anda."],
      ["Sintaks Markdown apa yang didukung?", "Judul, teks tebal dan miring, daftar, tabel, kutipan, blok kode, tautan, dan garis pemisah."],
    ],
  },
  pagenum: {
    title: "Tambah nomor halaman PDF online | PDFin",
    h1: "Tambahkan nomor halaman PDF",
    description: "Tambahkan nomor halaman dengan posisi dan gaya pilihan langsung di browser.",
    intro: "Siapkan dokumen yang lebih mudah dirujuk dengan nomor halaman yang konsisten.",
    howItWorks: ["Tambahkan satu PDF.", "Pilih posisi dan gaya nomor halaman.", "Unduh PDF bernomor halaman."],
    faq: [
      ["Bisakah posisi nomor diatur?", "Ya. Posisi dan gaya nomor halaman dapat dipilih sebelum memproses."],
      ["Apakah cocok untuk dokumen kerja?", "Ya. Nomor halaman membantu review, arsip, dan kolaborasi dokumen."],
    ],
  },
  flatten: {
    title: "Ratakan PDF online privat | PDFin",
    h1: "Ratakan PDF",
    description: "Ratakan anotasi dan isian formulir menjadi konten permanen langsung di browser.",
    intro: "Buat formulir dan anotasi lebih stabil saat dibuka di perangkat atau aplikasi PDF lain.",
    howItWorks: ["Tambahkan file PDF.", "Tinjau dokumen di ruang kerja.", "Proses dan unduh PDF yang sudah diratakan."],
    faq: [
      ["Apa arti meratakan PDF?", "Konten interaktif seperti anotasi atau isian formulir dibuat menjadi bagian permanen dokumen."],
      ["Apakah file asli ditimpa?", "Tidak. PDFin menghasilkan file baru untuk diunduh."],
    ],
  },
  protect: {
    title: "Kunci PDF online | PDFin",
    h1: "Kunci PDF",
    description: "Tambahkan password untuk membuka PDF langsung di browser dengan pemrosesan lokal.",
    intro: "Kunci PDF membantu menambahkan password pembuka dokumen tanpa mengunggah file ke server PDFin.",
    howItWorks: ["Tambahkan satu file PDF.", "Masukkan dan konfirmasi password.", "Unduh PDF terkunci hasil pemrosesan lokal."],
    faq: [
      ["Apakah PDF diproses di server?", "Tidak. Proteksi PDF dijalankan di browser menggunakan qpdf WASM."],
      ["Apakah password bisa dipulihkan?", "Tidak. Simpan password dengan aman karena PDFin tidak dapat memulihkannya."],
    ],
  },
  unlock: {
    title: "Buka kunci PDF online | PDFin",
    h1: "Buka kunci PDF",
    description: "Buka PDF terkunci masih dalam pengembangan di PDFin dan belum tersedia untuk kebutuhan produksi.",
    intro: "Alur buka PDF terkunci masih disiapkan agar tidak menjanjikan fungsi yang belum final.",
    howItWorks: ["Tambahkan PDF untuk mencoba alur.", "Lihat pengaturan prototipe.", "Jangan gunakan untuk kebutuhan produksi."],
    faq: [
      ["Apakah PDF terkunci benar-benar dibuka?", "Belum. Fitur ini masih prototipe."],
      ["Mengapa halaman ini noindex?", "Agar hasil Google tidak menjanjikan fitur yang belum final."],
    ],
  },
  metadata: {
    title: "Edit metadata PDF online | PDFin",
    h1: "Lihat dan edit metadata PDF",
    description: "Lihat dan ubah judul, penulis, dan kata kunci PDF langsung di browser.",
    intro: "Rapikan informasi dokumen sebelum dikirim, diarsipkan, atau dipublikasikan.",
    howItWorks: ["Tambahkan satu PDF.", "Tinjau metadata dokumen.", "Edit dan unduh PDF hasilnya."],
    faq: [
      ["Metadata apa yang bisa dilihat?", "Judul, penulis, kata kunci, dan informasi dokumen lain dapat ditinjau sesuai isi PDF."],
      ["Apakah perubahan diproses lokal?", "Ya. Alat inti PDFin diproses langsung di browser."],
    ],
  },
  sign: {
    title: "Paraf PDF online | PDFin",
    h1: "Tambahkan paraf dokumen PDF",
    description: "Bubuhkan paraf visual pada halaman PDF langsung dari browser.",
    intro: "Tempatkan paraf visual pada dokumen tanpa mengirim file ke server PDFin.",
    howItWorks: ["Tambahkan satu PDF.", "Buat atau pilih paraf.", "Letakkan di halaman dan unduh hasilnya."],
    faq: [
      ["Apakah ini tanda tangan elektronik atau digital tersertifikasi?", "Bukan. Alat ini hanya untuk membubuhkan paraf visual pada PDF."],
      ["Apakah bisa memilih halaman?", "Ya. Paraf dapat ditempatkan di halaman yang dipilih."],
    ],
  },
  ocr: {
    title: "OCR PDF online | PDFin",
    h1: "OCR PDF",
    description: "Buat PDF hasil pindaian menjadi PDF yang dapat dicari dengan OCR lokal di browser.",
    intro: "OCR PDF mengenali teks pada halaman hasil pindaian dan menambahkan lapisan teks tak terlihat agar dokumen dapat dicari dan dipilih.",
    howItWorks: ["Tambahkan satu PDF hasil pindaian.", "Pilih bahasa dokumen dan halaman yang diproses.", "Unduh PDF dengan teks hasil OCR yang dapat dicari."],
    faq: [
      ["Apakah file diunggah untuk OCR?", "Tidak. OCR berjalan di browser dengan Tesseract.js dan aset bahasa lokal."],
      ["Apakah hasil OCR selalu akurat?", "Tidak. Teks buram, tulisan tangan, atau pindaian berkualitas rendah tetap dapat menghasilkan kesalahan."],
    ],
  },
  pdf2docx: {
    title: "PDF ke Word online | PDFin",
    h1: "PDF ke Word",
    description: "Ubah PDF menjadi DOCX yang dapat diedit dengan deteksi OCR otomatis dan pemrosesan lokal di browser.",
    intro: "PDF ke Word mempertahankan teks, paragraf, tabel sederhana, dan halaman pindaian tanpa mengunggah dokumen.",
    howItWorks: ["Tambahkan satu file PDF.", "Pilih mode OCR dan bahasa dokumen.", "Unduh dokumen Word yang dapat diedit."],
    faq: [
      ["Apakah PDF diunggah?", "Tidak. Konversi dan OCR berjalan lokal di browser."],
      ["Apakah halaman pindaian didukung?", "Ya. PDFin mendeteksi halaman tanpa teks dan menjalankan OCR otomatis."],
    ],
  },
};

const seoSlugs = {
  sign: "paraf",
};

export const seoPages = WORKSPACE_TOOL_IDS.map((toolId) => ({
  slug: seoSlugs[toolId] || toolId,
  toolId,
  indexable: RELEASE_CONFIG.enablePublicIndexing && !PROTOTYPE_TOOL_IDS.has(toolId),
  ...toolSeoCopy[toolId],
}));

export const homeSeoPage = {
  slug: "",
  title: "PDFin | Kelola PDF langsung di browser",
  h1: "Kelola PDF langsung di browser",
  description: "PDFin Browser Tools membantu mengelola PDF tanpa akun. Untuk alat yang mendukung pemrosesan lokal, dokumen diproses di perangkat Anda.",
  intro: "Pilih alat PDF untuk pekerjaan browser, atau gunakan PDFin Self-hosted saat aplikasi internal membutuhkan API di infrastruktur sendiri.",
  indexable: true,
};

export const selfHostedSeoPage = {
  slug: "self-hosted",
  title: "PDFin Self-hosted | API pemrosesan PDF di local network",
  h1: "Pemrosesan PDF di local network Anda",
  description: "Jalankan PDFin Self-hosted di server, private cloud, atau local network Anda dan integrasikan pemrosesan PDF melalui API.",
  intro: "PDFin Self-hosted menjalankan processing service dan API di infrastruktur yang Anda kelola. API bukan layanan cloud PDFin dan dokumen tidak dikirim ke hosted processing PDFin untuk processing normal.",
  indexable: true,
};

export function getSeoPageByToolId(toolId) {
  return seoPages.find((page) => page.toolId === toolId) || null;
}

export function getIndexableSeoPages() {
  return seoPages.filter((page) => page.indexable);
}
