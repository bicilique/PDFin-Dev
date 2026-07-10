import { PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";

export const SITE_ORIGIN = "https://bicilique.github.io";
export const SITE_BASE_PATH = "/PDFin-Dev/";
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
    description: "Halaman prototipe untuk proteksi PDF di PDFin. Fitur ini masih berupa simulasi.",
    intro: "Proteksi PDF masih dalam status prototipe dan belum menghasilkan enkripsi final.",
    howItWorks: ["Tambahkan PDF untuk melihat alur.", "Coba pengaturan prototipe.", "Gunakan hasil hanya untuk evaluasi UI."],
    faq: [
      ["Apakah hasilnya benar-benar terenkripsi?", "Belum. Fitur ini masih prototipe dan diberi noindex."],
      ["Kapan bisa digunakan penuh?", "Fitur akan diindeks setelah proteksi PDF benar-benar tersedia."],
    ],
  },
  unlock: {
    title: "Buka kunci PDF online | PDFin",
    h1: "Buka kunci PDF",
    description: "Halaman prototipe untuk membuka PDF terkunci di PDFin. Fitur ini masih berupa simulasi.",
    intro: "Alur buka kunci PDF tersedia sebagai prototipe untuk evaluasi pengalaman pengguna.",
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
    title: "Tanda tangan PDF online | PDFin",
    h1: "Tambahkan tanda tangan PDF",
    description: "Bubuhkan tanda tangan pada halaman PDF langsung dari browser.",
    intro: "Tempatkan tanda tangan pada dokumen tanpa mengirim file ke server PDFin.",
    howItWorks: ["Tambahkan satu PDF.", "Buat atau pilih tanda tangan.", "Letakkan di halaman dan unduh hasilnya."],
    faq: [
      ["Apakah ini tanda tangan digital tersertifikasi?", "Tidak. Alat ini untuk membubuhkan tanda tangan visual pada PDF."],
      ["Apakah bisa memilih halaman?", "Ya. Tanda tangan dapat ditempatkan di halaman yang dipilih."],
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
};

export const seoPages = WORKSPACE_TOOL_IDS.map((toolId) => ({
  slug: toolId,
  toolId,
  indexable: !PROTOTYPE_TOOL_IDS.has(toolId),
  ...toolSeoCopy[toolId],
}));

export const homeSeoPage = {
  slug: "",
  title: "PDFin | Alat PDF privat di browser",
  h1: "Alat PDF mudah, cepat, dan privat",
  description: "PDFin adalah kumpulan alat PDF berbasis browser. File diproses di perangkat Anda tanpa unggah untuk alat inti.",
  intro: "Gabung, pisah, kompres, atur halaman, dan olah PDF langsung dari browser dengan pengalaman yang ringan dan fokus privasi.",
  indexable: true,
};

export function getSeoPageByToolId(toolId) {
  return seoPages.find((page) => page.toolId === toolId) || null;
}

export function getIndexableSeoPages() {
  return seoPages.filter((page) => page.indexable);
}
