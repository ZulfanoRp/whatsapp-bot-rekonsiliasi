# Scope Sistem

## 1. Gambaran Umum
Sistem yang dikembangkan dalam penelitian ini merupakan WhatsApp Bot
yang digunakan untuk otomasi dan rekonsiliasi data internal.
Sistem dirancang untuk membantu proses pengecekan dan perbandingan data
secara otomatis melalui perintah berbasis pesan WhatsApp.

## 2. Tujuan Sistem
Tujuan pengembangan sistem ini adalah:
1. Mengotomasi proses pengecekan data internal.
2. Melakukan rekonsiliasi data secara lebih cepat dan terkontrol.
3. Meningkatkan efisiensi kerja melalui pemanfaatan WhatsApp Bot.

## 3. Ruang Lingkup Sistem
Ruang lingkup sistem yang ditetapkan pada penelitian ini meliputi:
- WhatsApp Bot dengan perintah:
  - `!askbot`
  - `!cek`
  - `!recon`
- Backend berbasis Node.js.
- Database MySQL sebagai penyimpanan data.
- Website admin berbasis React untuk pengelolaan whitelist nomor.
- Pencatatan aktivitas bot (logging).
- Pemrosesan file Excel untuk kebutuhan rekonsiliasi data.

## 4. Batasan Sistem
Batasan pada sistem ini adalah sebagai berikut:
- Sistem dijalankan pada lingkungan lokal.
- Tidak mencakup sistem pembayaran.
- Tidak mendukung multi-channel selain WhatsApp.
- Tidak menggunakan kecerdasan buatan tingkat lanjut.
- Sistem digunakan untuk kebutuhan internal, bukan publik.

## 5. Alternatif Desain
Sebagai alternatif desain, sistem dianalisis apabila menggunakan
WhatsApp Business Platform sebagai media komunikasi resmi.
Alternatif ini digunakan sebagai pembanding dari sisi arsitektur
dan tahapan pengembangan.
