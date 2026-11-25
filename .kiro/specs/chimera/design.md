# Design — Chimera

## Overview
Satu halaman statis (`index.html`), vanilla ES modules, tanpa build step.
Satu database IndexedDB `chimera` v1 menjadi "otak bersama". Navigasi tab
menampilkan satu dari lima section: Dashboard, Notes, Pomodoro, Habits,
Flashcards. Setiap modul adalah satu file JS yang mount ke section-nya
sendiri dan berkomunikasi dengan modul lain hanya lewat `db.js` + event
`chimera:data-changed` (untuk refresh vitals).

## Architecture

```
index.html ──> js/app.js ──> js/db.js (IndexedDB, satu-satunya akses DB)
              ├── js/utils.js, js/markdown.js (shared)
              ├── js/notes.js, js/pomodoro.js, js/habits.js,
              │   js/flashcards.js (modul, masing-masing mount(sectionEl))
              ├── js/dashboard.js (agregasi read-only)
              └── js/backup.js (export/import)
```

## Data Model (IndexedDB `chimera`, v1)

| Store | keyPath | Fields |
|---|---|---|
| `notes` | `id` | `id, title, body, tags[], createdAt, updatedAt` |
| `habits` | `id` | `id, name, createdAt, done: { "YYYY-MM-DD": true }` |
| `decks` | `id` | `id, name, createdAt` |
| `cards` | `id` | `id, deckId, front, back, due (ms), interval (days, float), reps` |
| `meta` | `key` | `key, value` — dipakai Pomodoro: `focus:YYYY-MM-DD` → `{minutes, sessions}` |

Index: `cards` by `deckId`; `notes` by `updatedAt`.

## Components

### db.js
`openDB()` (singleton promise), `getAll(store)`, `put(store, value)`,
`del(store, key)`, `clear(store)`, `get(store, key)`. Semua operasi
mengembalikan Promise. Tidak ada modul lain yang memanggil `indexedDB`
langsung.

### markdown.js
Renderer aman tanpa dependensi: escape HTML dulu, lalu terapkan aturan
berurutan: code block (```), inline code, heading (#–###), bold, italic,
link, unordered/ordered list, paragraf. Output dimasukkan via `innerHTML`
hanya dari hasil renderer ini (input sudah di-escape).

### notes.js
State: daftar notes (diurutkan `updatedAt` desc), `selectedId`, `query`,
`activeTag`. Editor di kiri, preview di kanan (update on input). Tombol:
Baru, Simpan (auto-save debounce 500 ms juga aktif), Hapus. Cari memfilter
judul/isi/tag. Tag dirender sebagai chip yang bisa diklik.

### pomodoro.js
State lokal: `mode` (focus/short/long), `remaining` (detik), `running`,
`intervalId`. Durasi: focus 25×60, short 5×60, long 15×60. Saat selesai:
chime Web Audio (oscillator 880 Hz, 3 nada), jika mode focus → tambah
menit ke `meta` key `focus:YYYY-MM-DD` + `sessions`. Timer tidak berjalan
saat tab ditinggal? `setInterval` 1 detik cukup; jeda saat `document.hidden`
tidak diperlukan untuk v1 (timer berbasis hitung mundur detik, bukan
timestamp absolut — dicatat sebagai keterbatasan di README).

### habits.js
Streak: hitung mundur dari hari ini; jika hari ini belum dicentang, mulai
dari kemarin. Grid 7 hari: 7 kolom tanggal (label hari, mis. Sen–Min),
centang hijau bila `done[date]`. Klik sel tanggal juga bisa toggle.

### flashcards.js
Deck list di kiri, kartu deck terpilih di kanan. Mode belajar: queue kartu
`due <= now` (diurutkan `due` asc); tampil depan, tombol Balik → tampil
belakang + 4 tombol nilai (Lagi/Keras/Bagus/Mudah). Penjadwalan:
- Lagi: interval = 0 (tetap), due = now + 10 menit.
- Keras: interval = max(1, interval × 1.2) hari.
- Bagus: interval = max(1, interval × 2.5) hari (kartu baru: 1 hari).
- Mudah: interval = max(1, interval × 3.5) hari (kartu baru: 2 hari).
`reps` bertambah tiap penilaian.

### dashboard.js
`renderVitals()` membaca keempat store: `notes.length`, menit fokus hari
ini dari `meta`, habit dengan streak ≥ 1, kartu dengan `due <= now`.
Dipanggil saat tab Dashboard dibuka dan setelah event
`chimera:data-changed`.

### backup.js
Export: baca semua store → JSON `{version: 1, exportedAt, data: {...}}` →
download `chimera-backup-YYYY-MM-DD.json`. Import: parse file, validasi
bentuk dasar (object + kunci store), clear semua store lalu put semua
record, dispatch `chimera:data-changed`, refresh semua modul.

## Error Handling
- IndexedDB gagal dibuka → tampilkan banner error di halaman, modul
  tetap menampilkan pesan "penyimpanan tidak tersedia".
- Import JSON tidak valid → toast error, data lama dipertahankan.
- Timer: jika Web Audio tidak tersedia, chime dilewati diam-diam.

## Testing Strategy
- `node --check` untuk semua `js/*.js` (otomatis via `scripts/validate.sh`
  dan hook `.kiro/hooks/validate-on-save.json`).
- Playwright headless Chromium: load halaman, assert tidak ada error JS
  fatal, klik tiap tab, buat 1 note + cari, jalankan timer 3 detik (mode
  test), tambah habit + centang, buat deck + kartu + nilai, cek vitals
  berubah, export menghasilkan JSON valid.
