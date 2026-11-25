// app.js — entry point: bootstrap DB, wiring nav, mount semua modul.
import { openDB } from './db.js';
import { mountDashboard } from './dashboard.js';
import { mountNotes } from './notes.js';
import { mountPomodoro } from './pomodoro.js';
import { mountHabits } from './habits.js';
import { mountFlashcards } from './flashcards.js';
import { mountBackup } from './backup.js';

const modules = {};

function showTab(name) {
  document.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === name);
  });
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.toggle('active', v.id === `view-${name}`);
  });
  if (modules[name] && modules[name].refresh) modules[name].refresh();
}

async function boot() {
  try {
    await openDB();
  } catch (err) {
    document.getElementById('db-error').hidden = false;
    document.getElementById('db-error').textContent =
      'Penyimpanan lokal (IndexedDB) tidak tersedia di browser ini. Data tidak bisa disimpan.';
    console.error(err);
    return;
  }

  modules.dashboard = mountDashboard(document.getElementById('view-dashboard'));
  modules.notes = mountNotes(document.getElementById('view-notes'));
  modules.pomodoro = mountPomodoro(document.getElementById('view-pomodoro'));
  modules.habits = mountHabits(document.getElementById('view-habits'));
  modules.flashcards = mountFlashcards(document.getElementById('view-flashcards'));
  mountBackup(document.getElementById('backup'));

  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => showTab(b.dataset.tab));
  });

  // Setelah import backup, muat ulang semua modul.
  document.addEventListener('chimera:reload-all', () => {
    Object.values(modules).forEach((m) => m.refresh && m.refresh());
  });

  showTab('dashboard');
}

document.addEventListener('DOMContentLoaded', boot);
