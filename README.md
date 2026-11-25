# 🧟 Chimera — Monster Produktivitas Local-First

**Kiroween 2026 · Kategori Frankenstein**

Satu aplikasi web statis yang menjahit empat alat produktivitas yang
"seharusnya tidak pernah disatukan" menjadi satu makhluk dengan satu otak
bersama: satu database IndexedDB.

| Anggota tubuh | Modul | Yang bisa dilakukan |
|---|---|---|
| 🧠 Otak | **Notes** | Catatan Markdown: buat/edit/hapus, live preview, cari, tag |
| ❤️ Jantung | **Pomodoro** | Timer 25/5/15, start/pause/reset, chime Web Audio, menit fokus hari ini tersimpan |
| 💪 Otot | **Habits** | Tambah habit, centang harian, streak, grid 7 hari terakhir |
| 🧬 DNA | **Flashcards** | Deck + kartu, mode belajar flip, spaced repetition (Lagi/Keras/Bagus/Mudah), kartu jatuh tempo |

**Dashboard "Vitals"** membaca keempat modul dari database yang sama:
jumlah catatan, menit fokus hari ini, streak aktif, kartu jatuh tempo.
**Export/import JSON** mencadangkan seluruh makhluk dalam satu file.

## Prinsip

- **Local-first:** semua data di IndexedDB di perangkatmu. Tanpa akun,
  tanpa server, tanpa tracking.
- **Offline:** setelah load pertama, aplikasi jalan tanpa internet. Tanpa
  CDN, tanpa font eksternal, tanpa analytics.
- **Tanpa build step:** vanilla HTML/CSS/JS (ES modules). Deploy ke GitHub
  Pages tinggal push.

## Cara menjalankan lokal

```bash
# cara 1 — server statis apa saja, mis. Python:
python3 -m http.server 8000
# lalu buka http://localhost:8000

# cara 2 — npx serve:
npx serve .
```

Lalu buka di browser. Tidak perlu install apa pun.

> Catatan: membuka `index.html` langsung via `file://` tidak disarankan —
> ES modules dan IndexedDB paling andal lewat server statis lokal.

## Struktur folder

```
chimera/
├── index.html                  # Satu halaman: 5 tab + maskot SVG + backup
├── css/styles.css              # Tema gelap lab monster, aksen hijau, jahitan
├── js/
│   ├── db.js                   # IndexedDB wrapper + skema (satu-satunya akses DB)
│   ├── utils.js                # id, tanggal, toast
│   ├── markdown.js             # Renderer Markdown mini tanpa dependensi
│   ├── notes.js                # Modul Notes
│   ├── pomodoro.js             # Modul Pomodoro
│   ├── habits.js               # Modul Habits
│   ├── flashcards.js           # Modul Flashcards + spaced repetition
│   ├── dashboard.js            # Vitals (agregasi read-only)
│   ├── backup.js               # Export/import JSON
│   └── app.js                  # Bootstrap + wiring nav
├── scripts/validate.sh         # node --check semua JS + cek JSON hook
├── .kiro/
│   ├── specs/chimera/          # requirements.md, design.md, tasks.md (EARS)
│   ├── steering/               # product.md, tech.md, structure.md
│   └── hooks/                  # validate-on-save.json (format v1 resmi Kiro)
├── LICENSE                     # MIT
└── README.md
```

## Cara memakai tiap modul

### 🧠 Notes
Klik **+ Baru**, tulis judul, tag (pisahkan koma), dan isi Markdown di
editor kiri — preview live di kanan. Tersimpan otomatis (debounce) dan saat
menekan **Simpan**. Cari lewat kotak pencarian (judul/isi/tag) atau klik chip
`#tag`. Klik catatan di daftar untuk membukanya; **Hapus** untuk menghapus.

Markdown yang didukung: heading `#`–`###`, **tebal**, *miring*, `kode`,
blok kode \`\`\`, list `-`/`1.`, dan [tautan](https://example.com).

### ❤️ Pomodoro
Pilih mode **Fokus 25** / **Istirahat 5** / **Istirahat Panjang 15**, tekan
**Mulai**. Saat timer habis, chime berbunyi (Web Audio) dan — untuk sesi
Fokus — 25 menit + 1 sesi tercatat untuk hari ini. **Jeda** menghentikan
tanpa reset; **Reset** mengembalikan durasi mode.

### 💪 Habits
Ketik nama habit, tekan **+ Tambah**. Tekan **Centang hari ini** (atau klik
sel tanggal di grid 7 hari) untuk menandai. Streak = hari berturut-turut
sampai hari ini (atau kemarin bila hari ini belum dicentang).

### 🧬 Flashcards
Buat deck, pilih deck, tambah kartu (depan = pertanyaan, belakang =
jawaban). Kartu baru langsung jatuh tempo. Tekan **Mulai belajar**,
klik kartu (atau **Balik kartu**) untuk melihat jawaban, lalu nilai:

| Nilai | Jadwal berikutnya |
|---|---|
| Lagi | +10 menit |
| Keras | interval × 1,2 (min 1 hari) |
| Bagus | interval × 2,5 (min 1 hari) |
| Mudah | interval × 3,5 (min 1 hari) |

### 🧪 Backup
**Export JSON** mengunduh seluruh database. **Import JSON** mengganti
seluruh isi database dengan file hasil export (file tidak valid ditolak
dan data lama dipertahankan).

## Keterbatasan yang diketahui

- Timer Pomodoro menghitung mundur per detik saat halaman terbuka; bila
  tab ditutup di tengah sesi, sesi itu tidak tercatat.
- Data hanya ada di browser ini — pindah browser/perangkat butuh
  export/import manual.

## Dibangun dengan Kiro

Dibangun spec-driven mengikuti format Kiro: requirements (EARS), design,
dan tasks di `.kiro/specs/chimera/`; steering di `.kiro/steering/`; hook
validasi di `.kiro/hooks/`. Status jujur pemakaian Kiro CLI ada di
[`KIRO-STATUS.md`](KIRO-STATUS.md).

## Lisensi

MIT — lihat [LICENSE](LICENSE).
