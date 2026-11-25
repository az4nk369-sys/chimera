// dashboard.js — Vitals makhluk (R5): agregasi read-only dari keempat modul.
import { getAll, get } from './db.js';
import { todayKey } from './utils.js';
import { calcStreak } from './habits.js';

export function mountDashboard(section) {
  section.innerHTML = `
    <div class="panel-head">
      <h2>🧟 Vitals — Denyut Makhluk</h2>
      <p class="muted">Satu otak, empat anggota tubuh. Angka di bawah dibaca langsung dari database yang sama.</p>
    </div>
    <div class="vitals">
      <div class="vital"><span id="v-notes" class="vital-num">–</span><label>📝 Catatan</label><small>di Otak</small></div>
      <div class="vital"><span id="v-focus" class="vital-num">–</span><label>⏱ Menit fokus hari ini</label><small>di Jantung</small></div>
      <div class="vital"><span id="v-streak" class="vital-num">–</span><label>🔥 Streak aktif</label><small>di Otot</small></div>
      <div class="vital"><span id="v-due" class="vital-num">–</span><label>🧬 Kartu jatuh tempo</label><small>di DNA</small></div>
    </div>
    <div class="lab-note">
      <h3>Cara memakai Chimera</h3>
      <ul>
        <li><strong>Otak (Notes):</strong> tulis ide dalam Markdown, cari, beri tag.</li>
        <li><strong>Jantung (Pomodoro):</strong> 25 menit fokus, 5 menit istirahat. Chime berbunyi saat selesai.</li>
        <li><strong>Otot (Habits):</strong> centang kebiasaan tiap hari, jaga streak tetap hidup.</li>
        <li><strong>DNA (Flashcards):</strong> buat deck, belajar kartu yang jatuh tempo, nilai dengan jujur.</li>
        <li><strong>Backup:</strong> export/import JSON ada di bawah — seluruh data makhluk dalam satu file.</li>
      </ul>
    </div>`;

  async function render() {
    const [notes, habits, cards] = await Promise.all([
      getAll('notes'),
      getAll('habits'),
      getAll('cards'),
    ]);
    const focus = (await get('meta', `focus:${todayKey()}`)) || { minutes: 0 };
    const activeStreaks = habits.filter((h) => calcStreak(h.done || {}) >= 1).length;
    const due = cards.filter((c) => c.due <= Date.now()).length;
    section.querySelector('#v-notes').textContent = notes.length;
    section.querySelector('#v-focus').textContent = focus.minutes;
    section.querySelector('#v-streak').textContent = activeStreaks;
    section.querySelector('#v-due').textContent = due;
  }

  document.addEventListener('chimera:data-changed', render);
  render();
  return { refresh: render };
}
