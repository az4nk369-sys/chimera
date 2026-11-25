// habits.js — Modul Habit Tracker (R3).
import { getAll, put, del } from './db.js';
import { uid, dateKeyOffset, todayKey, escapeHtml, toast, notifyChanged } from './utils.js';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function calcStreak(done) {
  let streak = 0;
  let day = new Date();
  // Jika hari ini belum dicentang, streak dihitung dari kemarin.
  if (!done[todayKey(day)]) day.setDate(day.getDate() - 1);
  while (done[todayKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function mountHabits(section) {
  section.innerHTML = `
    <div class="panel-head">
      <h2>💪 Otot — Habits</h2>
      <p class="muted">Centang tiap hari. Otot tumbuh dari streak.</p>
    </div>
    <div class="row">
      <input id="habit-name" placeholder="Habit baru, mis. Baca 10 halaman…" aria-label="Nama habit">
      <button id="habit-add" class="btn primary">+ Tambah</button>
    </div>
    <ul id="habit-list" class="habit-list"></ul>`;

  const $ = (id) => section.querySelector(id);
  const listEl = $('#habit-list');
  const nameEl = $('#habit-name');

  let habits = [];

  function weekCells(h) {
    let cells = '';
    for (let ago = 6; ago >= 0; ago--) {
      const key = dateKeyOffset(ago);
      const d = new Date();
      d.setDate(d.getDate() - ago);
      const done = !!h.done[key];
      cells += `<button class="day-cell${done ? ' done' : ''}${ago === 0 ? ' today' : ''}"
        data-habit="${h.id}" data-date="${key}"
        title="${key}${done ? ' — selesai' : ''}" aria-label="${escapeHtml(h.name)} ${key}">
        ${DAY_NAMES[d.getDay()]}<span>${d.getDate()}</span></button>`;
    }
    return cells;
  }

  function render() {
    listEl.innerHTML = habits.length
      ? habits
          .map((h) => {
            const streak = calcStreak(h.done || {});
            return `<li class="habit-card">
              <div class="habit-top">
                <strong>${escapeHtml(h.name)}</strong>
                <span class="streak">🔥 ${streak} hari</span>
                <button class="btn small danger" data-del="${h.id}">Hapus</button>
              </div>
              <div class="habit-week">${weekCells(h)}</div>
              <button class="btn ${h.done && h.done[todayKey()] ? 'primary' : ''}" data-toggle="${h.id}">
                ${h.done && h.done[todayKey()] ? '✓ Sudah hari ini' : 'Centang hari ini'}
              </button>
            </li>`;
          })
          .join('')
      : '<li class="muted">Belum ada habit. Tambah satu di atas.</li>';
  }

  async function load() {
    habits = await getAll('habits');
    habits.sort((a, b) => a.createdAt - b.createdAt);
    render();
  }

  async function addHabit() {
    const name = nameEl.value.trim();
    if (!name) {
      toast('Isi nama habit dulu');
      return;
    }
    const h = { id: uid(), name, createdAt: Date.now(), done: {} };
    nameEl.value = '';
    habits.push(h);
    render();
    await put('habits', h);
    notifyChanged();
    toast('Habit ditambahkan');
  }

  async function toggleHabit(id, dateKey) {
    const h = habits.find((x) => x.id === id);
    if (!h) return;
    h.done = h.done || {};
    if (h.done[dateKey]) delete h.done[dateKey];
    else h.done[dateKey] = true;
    await put('habits', h);
    render();
    notifyChanged();
  }

  async function deleteHabit(id) {
    if (!window.confirm('Hapus habit ini beserta semua centangnya?')) return;
    await del('habits', id);
    habits = habits.filter((h) => h.id !== id);
    render();
    notifyChanged();
    toast('Habit dihapus');
  }

  $('#habit-add').addEventListener('click', addHabit);
  nameEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addHabit();
  });
  listEl.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      toggleHabit(toggle.dataset.toggle, todayKey());
      return;
    }
    const cell = e.target.closest('[data-date]');
    if (cell) {
      toggleHabit(cell.dataset.habit, cell.dataset.date);
      return;
    }
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) deleteHabit(delBtn.dataset.del);
  });

  load();
  return { refresh: load };
}
