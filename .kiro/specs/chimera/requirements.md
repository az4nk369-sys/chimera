# Requirements — Chimera (Kiroween 2026, Frankenstein category)

Spec ini ditulis manual mengikuti format Kiro (EARS) karena Kiro CLI
terinstal (v3.6.0) tetapi login membutuhkan konfirmasi manusia di browser
(device flow, kode `MSCW-HFMC`, URL `https://view.awsapps.com/start/`),
yang tidak dapat diselesaikan oleh subagent tanpa browser. Lihat
`KIRO-STATUS.md` di root repo untuk status jujur Kiro.

## Introduction
Chimera adalah satu aplikasi web statis local-first yang menjahit Notes
Markdown, Pomodoro, Habit Tracker, dan Flashcards menjadi satu makhluk
dengan satu database IndexedDB bersama, plus Dashboard "vitals" dan
export/import JSON.

## Glossary
- **Makhluk / creature**: keseluruhan aplikasi.
- **Bagian tubuh / limb**: satu modul (Notes, Pomodoro, Habits, Flashcards).
- **Vitals**: angka agregat di Dashboard yang dibaca dari keempat modul.
- **Kartu jatuh tempo (due)**: kartu flashcard yang `due <= sekarang`.

## Requirements

### Requirement 1 — Notes Markdown
**User Story:** Sebagai pengguna, saya ingin menulis catatan Markdown agar ide
saya tersimpan dan mudah dicari.

#### Acceptance Criteria
1. WHEN pengguna membuat catatan baru, THE SYSTEM SHALL menyimpannya ke
   IndexedDB dengan judul, isi Markdown, tag, dan timestamp.
2. WHEN pengguna membuka catatan, THE SYSTEM SHALL menampilkan live preview
   Markdown (heading, bold, italic, code, list, link) di samping editor.
3. WHEN pengguna mengetik di kotak cari, THE SYSTEM SHALL memfilter daftar
   catatan berdasarkan judul, isi, atau tag.
4. WHEN pengguna mengedit atau menghapus catatan, THE SYSTEM SHALL
   memperbarui/menghapusnya dari IndexedDB dan memperbarui daftar.
5. WHEN pengguna mengklik tag di daftar, THE SYSTEM SHALL memfilter catatan
   berdasarkan tag tersebut.

### Requirement 2 — Pomodoro Timer
**User Story:** Sebagai pengguna, saya ingin timer fokus agar saya bisa
bekerja dalam sesi yang terukur.

#### Acceptance Criteria
1. WHEN pengguna memilih mode Fokus, THE SYSTEM SHALL mengatur timer 25 menit;
   Istirahat 5 menit; Istirahat Panjang 15 menit.
2. WHEN pengguna menekan Mulai, THE SYSTEM SHALL menghitung mundur tiap detik
   dan menampilkan sisa waktu MM:SS.
3. WHEN pengguna menekan Jeda, THE SYSTEM SHALL menghentikan hitung mundur
   tanpa mereset sisa waktu; WHEN menekan Reset, THE SYSTEM SHALL mengembalikan
   timer ke durasi mode.
4. WHEN timer mencapai 00:00, THE SYSTEM SHALL membunyikan chime via Web
   Audio, menambah hitungan sesi selesai, dan menambah menit fokus hari ini
   (hanya untuk sesi Fokus).
5. WHEN pengguna memuat ulang halaman, THE SYSTEM SHALL menampilkan menit
   fokus hari ini dan sesi selesai dari IndexedDB.

### Requirement 3 — Habit Tracker
**User Story:** Sebagai pengguna, saya ingin menandai kebiasaan harian agar
streak saya terlihat.

#### Acceptance Criteria
1. WHEN pengguna menambah habit, THE SYSTEM SHALL menyimpannya dengan nama
   dan tanggal dibuat.
2. WHEN pengguna mencentang habit untuk hari ini, THE SYSTEM SHALL menyimpan
   centang tanggal tersebut; WHEN ditekan lagi, THE SYSTEM SHALL membatalkannya.
3. WHEN pengguna melihat habit, THE SYSTEM SHALL menampilkan streak
   beruntun (hari berturut-turut sampai hari ini/kemarin) dan grid 7 hari
   terakhir.
4. WHEN pengguna menghapus habit, THE SYSTEM SHALL menghapus habit beserta
   seluruh centangnya.

### Requirement 4 — Flashcards & Spaced Repetition
**User Story:** Sebagai pengguna, saya ingin belajar dengan kartu agar
hafalan saya dijadwalkan ulang secara otomatis.

#### Acceptance Criteria
1. WHEN pengguna membuat deck, THE SYSTEM SHALL menyimpannya; WHEN pengguna
   menambah kartu ke deck, THE SYSTEM SHALL menyimpan depan/belakang kartu
   dengan `due` = sekarang.
2. WHEN pengguna memulai mode belajar, THE SYSTEM SHALL menampilkan kartu
   jatuh tempo satu per satu dengan tombol Balik.
3. WHEN pengguna menilai kartu (Lagi/Keras/Bagus/Mudah), THE SYSTEM SHALL
   menjadwalkan ulang `due` sesuai aturan: Lagi = +10 menit, Keras =
   interval × 1.2 (min 1 hari), Bagus = interval × 2.5 (min 1 hari),
   Mudah = interval × 3.5 (min 1 hari), dan menyimpan interval baru.
4. WHEN tidak ada kartu jatuh tempo, THE SYSTEM SHALL menampilkan pesan
   "tidak ada kartu jatuh tempo" beserta jumlah kartu di deck.
5. WHEN pengguna menghapus deck, THE SYSTEM SHALL menghapus deck beserta
   semua kartunya.

### Requirement 5 — Dashboard Vitals
**User Story:** Sebagai pengguna, saya ingin melihat "denyut" makhluk saya
agar saya tahu kondisi keempat modul sekaligus.

#### Acceptance Criteria
1. WHEN Dashboard dibuka, THE SYSTEM SHALL menampilkan jumlah catatan,
   menit fokus hari ini, jumlah habit dengan streak aktif, dan jumlah kartu
   jatuh tempo — semuanya dibaca dari IndexedDB yang sama.
2. WHEN data di modul mana pun berubah, THE SYSTEM SHALL memperbarui vitals
   saat Dashboard dibuka kembali.

### Requirement 6 — Export / Import JSON
**User Story:** Sebagai pengguna, saya ingin mencadangkan seluruh data agar
tidak hilang.

#### Acceptance Criteria
1. WHEN pengguna menekan Export, THE SYSTEM SHALL mengunduh file JSON berisi
   seluruh isi database (notes, habits, decks, cards, pomodoro stats).
2. WHEN pengguna memilih file JSON hasil export dan menekan Import,
   THE SYSTEM SHALL mengganti seluruh isi database dengan isi file tersebut
   dan me-refresh tampilan; WHEN file tidak valid, THE SYSTEM SHALL
   menampilkan pesan error dan tidak mengubah data.

### Requirement 7 — Local-first & Offline
**User Story:** Sebagai pengguna, saya ingin aplikasi bekerja tanpa akun dan
tanpa internet setelah load pertama.

#### Acceptance Criteria
1. WHEN aplikasi dimuat, THE SYSTEM SHALL tidak meminta akun, login, atau
   kredensial apa pun.
2. WHEN aplikasi dimuat, THE SYSTEM SHALL tidak melakukan request jaringan
   apa pun (tanpa CDN, tanpa font eksternal, tanpa analytics).

### Requirement 8 — Tampilan "Laboratorium Monster"
**User Story:** Sebagai pengguna, saya ingin tampilan yang terasa seperti
monster yang dijahit agar sesuai tema Frankenstein.

#### Acceptance Criteria
1. WHEN aplikasi dimuat, THE SYSTEM SHALL menampilkan tema gelap dengan aksen
   hijau elektrik dan elemen jahitan (garis putus-putus) pada kartu modul.
2. WHEN aplikasi dimuat, THE SYSTEM SHALL menampilkan maskot monster SVG
   (buatan sendiri, tanpa gambar berlisensi) di header/dashboard.
