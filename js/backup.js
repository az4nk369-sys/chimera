// backup.js — Export / import seluruh database sebagai JSON (R6).
import { getAllStores, clear, put, STORE_NAMES } from './db.js';
import { toast, notifyChanged } from './utils.js';

export function mountBackup(section) {
  section.innerHTML = `
    <div class="backup-box">
      <h3>🧪 Backup Makhluk</h3>
      <p class="muted">Satu file JSON berisi seluruh data: notes, habits, decks, cards, dan statistik Pomodoro.</p>
      <div class="row">
        <button id="backup-export" class="btn primary">⬇ Export JSON</button>
        <label class="btn" for="backup-import-file">⬆ Import JSON</label>
        <input id="backup-import-file" type="file" accept="application/json,.json" hidden>
      </div>
    </div>`;

  section.querySelector('#backup-export').addEventListener('click', async () => {
    const data = await getAllStores();
    const payload = { app: 'chimera', version: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `chimera-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Backup diunduh');
  });

  section.querySelector('#backup-import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') {
        throw new Error('format tidak dikenali');
      }
      for (const store of STORE_NAMES) {
        if (!Array.isArray(payload.data[store])) {
          throw new Error(`store "${store}" hilang atau bukan array`);
        }
      }
      for (const store of STORE_NAMES) {
        await clear(store);
        for (const rec of payload.data[store]) {
          await put(store, rec);
        }
      }
      notifyChanged();
      document.dispatchEvent(new CustomEvent('chimera:reload-all'));
      toast('Import berhasil — data dipulihkan');
    } catch (err) {
      toast(`Import gagal: ${err.message}. Data lama tidak diubah.`);
    } finally {
      e.target.value = '';
    }
  });
}
