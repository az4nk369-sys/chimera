# Tasks — Chimera

Checklist implementasi. Setiap tugas merujuk ke Requirement (R#) di
`requirements.md`. Tandai `[x]` saat selesai dan terverifikasi.

- [x] 1. Struktur proyek + steering (R7, R8)
  - [x] 1.1 Buat folder `css/`, `js/`, `scripts/`, `.kiro/{specs,steering,hooks}/`
  - [x] 1.2 Tulis `.kiro/steering/{product,tech,structure}.md`
  - [x] 1.3 Tulis `.kiro/specs/chimera/{requirements,design,tasks}.md`
  - [x] 1.4 Tulis hook `.kiro/hooks/validate-on-save.json` (format v1 resmi Kiro)
  - [x] 1.5 Tulis `scripts/validate.sh` + `LICENSE` (MIT) + `.gitignore`

- [x] 2. Fondasi data (R7)
  - [x] 2.1 `js/db.js`: wrapper IndexedDB, schema v1 (notes, habits, decks,
    cards, meta) — R7
  - [x] 2.2 `js/utils.js`: id, tanggal lokal, toast, escapeHtml
  - [x] 2.3 `js/markdown.js`: renderer Markdown aman tanpa dependensi — R1.2

- [x] 3. Kerangka halaman (R8)
  - [x] 3.1 `index.html`: header + maskot SVG + nav 5 tab + 5 section +
    area export/import
  - [x] 3.2 `css/styles.css`: tema gelap lab monster, aksen hijau elektrik,
    jahitan (dashed border), responsif
  - [x] 3.3 `js/app.js`: bootstrap DB, wiring nav, mount semua modul

- [x] 4. Modul Notes (R1)
  - [x] 4.1 CRUD notes + daftar terurut updatedAt desc
  - [x] 4.2 Live preview Markdown + auto-save debounce
  - [x] 4.3 Cari (judul/isi/tag) + filter chip tag

- [x] 5. Modul Pomodoro (R2)
  - [x] 5.1 Timer 25/5/15, start/pause/reset, tampil MM:SS
  - [x] 5.2 Chime Web Audio saat selesai + simpan menit fokus & sesi ke `meta`
  - [x] 5.3 Tampilkan menit fokus hari ini & sesi selesai saat load

- [x] 6. Modul Habits (R3)
  - [x] 6.1 Tambah/hapus habit
  - [x] 6.2 Centang harian (toggle) tersimpan per tanggal
  - [x] 6.3 Streak + grid 7 hari terakhir

- [x] 7. Modul Flashcards (R4)
  - [x] 7.1 Deck CRUD + kartu CRUD per deck
  - [x] 7.2 Mode belajar: tampil kartu due, flip depan/belakang
  - [x] 7.3 Penilaian Lagi/Keras/Bagus/Mudah + penjadwalan ulang

- [x] 8. Dashboard vitals (R5)
  - [x] 8.1 Agregasi: jumlah notes, menit fokus hari ini, streak aktif,
    kartu jatuh tempo
  - [x] 8.2 Refresh vitals saat data berubah / tab dibuka

- [x] 9. Export/Import JSON (R6)
  - [x] 9.1 Export seluruh DB ke file JSON (download)
  - [x] 9.2 Import JSON dengan validasi, ganti isi DB, refresh UI

- [x] 10. Verifikasi & rilis
  - [x] 10.1 `scripts/validate.sh` lolos (node --check semua JS)
  - [x] 10.2 Uji headless Chromium (Playwright): load tanpa error fatal,
    klik tiap tab, uji tiap modul end-to-end
  - [x] 10.3 `README.md` lengkap
  - [x] 10.4 Repo GitHub publik `az4nk369-sys/chimera`, push
  - [x] 10.5 GitHub Pages aktif + URL live terverifikasi
