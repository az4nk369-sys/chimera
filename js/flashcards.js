// flashcards.js — Modul Flashcards + spaced repetition sederhana (R4).
import { getAll, getByIndex, put, del } from './db.js';
import { uid, escapeHtml, toast, notifyChanged } from './utils.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function nextSchedule(card, grade) {
  const now = Date.now();
  const interval = card.interval || 0;
  if (grade === 'again') {
    return { interval: 0, due: now + 10 * 60 * 1000, reps: card.reps + 1 };
  }
  const factor = grade === 'hard' ? 1.2 : grade === 'good' ? 2.5 : 3.5;
  const base = grade === 'easy' && interval === 0 ? 2 : Math.max(1, interval * factor);
  return { interval: base, due: now + base * DAY_MS, reps: card.reps + 1 };
}

export function mountFlashcards(section) {
  section.innerHTML = `
    <div class="panel-head">
      <h2>🧬 DNA — Flashcards</h2>
      <p class="muted">Kartu yang jatuh tempo muncul untuk diulang. Nilai dengan jujur.</p>
    </div>
    <div class="flash-layout">
      <div class="deck-col">
        <div class="row">
          <input id="deck-name" placeholder="Nama deck baru…" aria-label="Nama deck">
          <button id="deck-add" class="btn primary">+ Deck</button>
        </div>
        <ul id="deck-list" class="deck-list"></ul>
      </div>
      <div class="cards-col">
        <div id="deck-detail"></div>
        <div id="study-area"></div>
      </div>
    </div>`;

  const $ = (id) => section.querySelector(id);
  const deckListEl = $('#deck-list');
  const deckDetailEl = $('#deck-detail');
  const studyEl = $('#study-area');

  let decks = [];
  let cards = [];
  let selectedDeckId = null;
  let queue = [];
  let current = null;
  let flipped = false;

  function dueCards(deckId) {
    const now = Date.now();
    return cards
      .filter((c) => c.deckId === deckId && c.due <= now)
      .sort((a, b) => a.due - b.due);
  }

  function renderDecks() {
    deckListEl.innerHTML = decks.length
      ? decks
          .map((d) => {
            const total = cards.filter((c) => c.deckId === d.id).length;
            const due = dueCards(d.id).length;
            return `<li data-id="${d.id}" class="${d.id === selectedDeckId ? 'active' : ''}">
              <strong>${escapeHtml(d.name)}</strong>
              <span class="muted small">${total} kartu · ${due} jatuh tempo</span>
              <button class="btn small danger" data-del-deck="${d.id}">Hapus</button>
            </li>`;
          })
          .join('')
      : '<li class="muted">Belum ada deck. Buat satu di atas.</li>';
  }

  function renderDetail() {
    const deck = decks.find((d) => d.id === selectedDeckId);
    if (!deck) {
      deckDetailEl.innerHTML = '<p class="muted">Pilih deck atau buat yang baru.</p>';
      studyEl.innerHTML = '';
      return;
    }
    const deckCards = cards.filter((c) => c.deckId === deck.id);
    const due = dueCards(deck.id);
    deckDetailEl.innerHTML = `
      <h3>${escapeHtml(deck.name)}</h3>
      <p class="muted">${deckCards.length} kartu · ${due.length} jatuh tempo</p>
      <div class="row">
        <input id="card-front" placeholder="Depan kartu (pertanyaan)…" aria-label="Depan kartu">
        <input id="card-back" placeholder="Belakang kartu (jawaban)…" aria-label="Belakang kartu">
        <button id="card-add" class="btn primary">+ Kartu</button>
      </div>
      <ul class="card-list">
        ${deckCards
          .map(
            (c) => `<li>
              <span><strong>${escapeHtml(c.front)}</strong> → ${escapeHtml(c.back)}
              <span class="muted small">${c.due <= Date.now() ? '· jatuh tempo' : '· due ' + new Date(c.due).toLocaleDateString('id-ID')}</span></span>
              <button class="btn small danger" data-del-card="${c.id}">Hapus</button>
            </li>`,
          )
          .join('') || '<li class="muted">Belum ada kartu di deck ini.</li>'}
      </ul>
      <button id="study-start" class="btn primary big" ${due.length ? '' : 'disabled'}>
        ▶ Mulai belajar (${due.length} kartu)
      </button>`;
    studyEl.innerHTML = '';
    $('#card-add').addEventListener('click', addCard);
    $('#study-start').addEventListener('click', startStudy);
  }

  function renderStudy() {
    if (!current) {
      studyEl.innerHTML =
        queue.length === 0
          ? '<p class="muted">🎉 Tidak ada kartu jatuh tempo lagi. Bagus!</p>'
          : '';
      return;
    }
    studyEl.innerHTML = `
      <div class="study-card" id="study-card">
        <div class="study-count">Kartu ${queue.length + 1} tersisa (termasuk ini)</div>
        <div class="study-face">${escapeHtml(flipped ? current.back : current.front)}</div>
        <div class="muted small">${flipped ? 'Jawaban' : 'Pertanyaan'} — klik kartu atau tombol di bawah untuk membalik</div>
      </div>
      ${flipped
        ? `<div class="row center grade-row">
            <button class="btn danger" data-grade="again">Lagi</button>
            <button class="btn" data-grade="hard">Keras</button>
            <button class="btn primary" data-grade="good">Bagus</button>
            <button class="btn" data-grade="easy">Mudah</button>
          </div>`
        : `<div class="row center"><button class="btn primary" id="study-flip">Balik kartu</button></div>`}`;
    $('#study-card').addEventListener('click', () => {
      flipped = !flipped;
      renderStudy();
    });
    const flipBtn = $('#study-flip');
    if (flipBtn) flipBtn.addEventListener('click', () => {
      flipped = true;
      renderStudy();
    });
    studyEl.querySelectorAll('[data-grade]').forEach((b) => {
      b.addEventListener('click', () => gradeCurrent(b.dataset.grade));
    });
  }

  async function addCard() {
    const front = $('#card-front').value.trim();
    const back = $('#card-back').value.trim();
    if (!front || !back) {
      toast('Isi depan dan belakang kartu');
      return;
    }
    const card = {
      id: uid(),
      deckId: selectedDeckId,
      front,
      back,
      due: Date.now(),
      interval: 0,
      reps: 0,
    };
    await put('cards', card);
    cards.push(card);
    renderDecks();
    renderDetail();
    notifyChanged();
    toast('Kartu ditambahkan');
  }

  function startStudy() {
    queue = dueCards(selectedDeckId);
    if (!queue.length) return;
    current = queue.shift();
    flipped = false;
    renderStudy();
  }

  async function gradeCurrent(grade) {
    const sched = nextSchedule(current, grade);
    Object.assign(current, sched);
    await put('cards', current);
    current = queue.shift() || null;
    flipped = false;
    renderDecks();
    renderDetail();
    renderStudy();
    notifyChanged();
  }

  async function addDeck() {
    const name = $('#deck-name').value.trim();
    if (!name) {
      toast('Isi nama deck dulu');
      return;
    }
    const deck = { id: uid(), name, createdAt: Date.now() };
    $('#deck-name').value = '';
    decks.push(deck);
    selectedDeckId = deck.id;
    renderDecks();
    renderDetail();
    await put('decks', deck);
    notifyChanged();
  }

  async function deleteDeck(id) {
    if (!window.confirm('Hapus deck ini beserta semua kartunya?')) return;
    const deckCards = cards.filter((c) => c.deckId === id);
    for (const c of deckCards) await del('cards', c.id);
    await del('decks', id);
    decks = decks.filter((d) => d.id !== id);
    cards = cards.filter((c) => c.deckId !== id);
    if (selectedDeckId === id) selectedDeckId = decks[0]?.id || null;
    current = null;
    queue = [];
    renderDecks();
    renderDetail();
    notifyChanged();
    toast('Deck dihapus');
  }

  async function deleteCard(id) {
    await del('cards', id);
    cards = cards.filter((c) => c.id !== id);
    renderDecks();
    renderDetail();
    notifyChanged();
  }

  async function load() {
    decks = await getAll('decks');
    cards = await getAll('cards');
    decks.sort((a, b) => a.createdAt - b.createdAt);
    if (!selectedDeckId && decks.length) selectedDeckId = decks[0].id;
    renderDecks();
    renderDetail();
  }

  $('#deck-add').addEventListener('click', addDeck);
  $('#deck-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDeck();
  });
  deckListEl.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-del-deck]');
    if (delBtn) {
      deleteDeck(delBtn.dataset.delDeck);
      return;
    }
    const li = e.target.closest('li[data-id]');
    if (li) {
      selectedDeckId = li.dataset.id;
      current = null;
      queue = [];
      renderDecks();
      renderDetail();
    }
  });
  deckDetailEl.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-del-card]');
    if (delBtn) deleteCard(delBtn.dataset.delCard);
  });

  load();
  return { refresh: load };
}
