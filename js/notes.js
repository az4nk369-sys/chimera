// notes.js — Modul Notes Markdown (R1).
import { getAll, put, del } from './db.js';
import { uid, fmtDate, escapeHtml, toast, notifyChanged } from './utils.js';
import { renderMarkdown } from './markdown.js';

export function mountNotes(section) {
  section.innerHTML = `
    <div class="panel-head">
      <h2>🧠 Otak — Notes</h2>
      <p class="muted">Tulis dalam Markdown. Tersimpan otomatis di perangkatmu.</p>
    </div>
    <div class="notes-layout">
      <div class="notes-list-col">
        <div class="row">
          <input id="note-search" type="search" placeholder="Cari judul, isi, tag…" aria-label="Cari catatan">
          <button id="note-new" class="btn primary">+ Baru</button>
        </div>
        <div id="note-tags" class="chips"></div>
        <ul id="note-list" class="note-list"></ul>
      </div>
      <div class="notes-editor-col">
        <input id="note-title" placeholder="Judul catatan…" aria-label="Judul catatan">
        <input id="note-tag-input" placeholder="Tag, pisahkan dengan koma" aria-label="Tag catatan">
        <div class="editor-split">
          <textarea id="note-body" placeholder="# Tulis Markdown di sini…&#10;&#10;**tebal**, *miring*, \`kode\`, [tautan](https://example.com)" aria-label="Isi catatan"></textarea>
          <div id="note-preview" class="md-preview"></div>
        </div>
        <div class="row end">
          <span id="note-saved" class="muted small"></span>
          <button id="note-delete" class="btn danger">Hapus</button>
          <button id="note-save" class="btn primary">Simpan</button>
        </div>
      </div>
    </div>`;

  const $ = (id) => section.querySelector(id);
  const searchEl = $('#note-search');
  const tagsEl = $('#note-tags');
  const listEl = $('#note-list');
  const titleEl = $('#note-title');
  const tagInputEl = $('#note-tag-input');
  const bodyEl = $('#note-body');
  const previewEl = $('#note-preview');
  const savedEl = $('#note-saved');

  let notes = [];
  let selectedId = null;
  let query = '';
  let activeTag = null;
  let saveTimer = null;

  function parseTags(str) {
    return str
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .filter((t, i, a) => a.indexOf(t) === i);
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (activeTag && !n.tags.includes(activeTag)) return false;
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function renderList() {
    const items = filtered();
    listEl.innerHTML = items.length
      ? items
          .map(
            (n) => `<li data-id="${n.id}" class="${n.id === selectedId ? 'active' : ''}">
              <strong>${escapeHtml(n.title || '(Tanpa judul)')}</strong>
              <span class="muted small">${fmtDate(n.updatedAt)}${n.tags.length ? ' · ' + n.tags.map(escapeHtml).join(', ') : ''}</span>
            </li>`,
          )
          .join('')
      : '<li class="muted">Belum ada catatan yang cocok.</li>';
    const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();
    tagsEl.innerHTML =
      (activeTag
        ? `<button class="chip active" data-tag="">✕ ${escapeHtml(activeTag)}</button>`
        : '') +
      allTags
        .map(
          (t) =>
            `<button class="chip${t === activeTag ? ' active' : ''}" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`,
        )
        .join('');
  }

  function renderEditor() {
    const n = notes.find((x) => x.id === selectedId);
    if (!n) {
      titleEl.value = '';
      tagInputEl.value = '';
      bodyEl.value = '';
      previewEl.innerHTML = '<p class="muted">Pilih catatan atau buat yang baru.</p>';
      savedEl.textContent = '';
      return;
    }
    titleEl.value = n.title;
    tagInputEl.value = n.tags.join(', ');
    bodyEl.value = n.body;
    previewEl.innerHTML = renderMarkdown(n.body);
    savedEl.textContent = `Terakhir diubah ${fmtDate(n.updatedAt)}`;
  }

  function render() {
    renderList();
    renderEditor();
  }

  async function load() {
    notes = await getAll('notes');
    if (!selectedId && notes.length) {
      selectedId = [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
    }
    render();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveNote(true), 600);
  }

  async function saveNote(silent = false) {
    if (!selectedId) return;
    const n = notes.find((x) => x.id === selectedId);
    if (!n) return;
    n.title = titleEl.value.trim();
    n.body = bodyEl.value;
    n.tags = parseTags(tagInputEl.value);
    n.updatedAt = Date.now();
    await put('notes', n);
    previewEl.innerHTML = renderMarkdown(n.body);
    savedEl.textContent = 'Tersimpan ✓';
    renderList();
    notifyChanged();
    if (!silent) toast('Catatan disimpan');
  }

  async function newNote() {
    const n = {
      id: uid(),
      title: '',
      body: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Render dulu, simpan kemudian: supaya ketikan pengguna tidak tertimpa
    // renderEditor() saat promise IndexedDB selesai (race condition).
    notes.push(n);
    selectedId = n.id;
    render();
    titleEl.focus();
    await put('notes', n);
    notifyChanged();
  }

  async function deleteNote() {
    if (!selectedId) return;
    if (!window.confirm('Hapus catatan ini?')) return;
    await del('notes', selectedId);
    notes = notes.filter((n) => n.id !== selectedId);
    selectedId = notes.length
      ? [...notes].sort((a, b) => b.updatedAt - a.updatedAt)[0].id
      : null;
    render();
    notifyChanged();
    toast('Catatan dihapus');
  }

  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    selectedId = li.dataset.id;
    render();
  });
  tagsEl.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-tag]');
    if (!chip) return;
    activeTag = chip.dataset.tag || null;
    renderList();
  });
  searchEl.addEventListener('input', () => {
    query = searchEl.value;
    renderList();
  });
  titleEl.addEventListener('input', scheduleSave);
  tagInputEl.addEventListener('input', scheduleSave);
  bodyEl.addEventListener('input', () => {
    previewEl.innerHTML = renderMarkdown(bodyEl.value);
    scheduleSave();
  });
  $('#note-new').addEventListener('click', newNote);
  $('#note-save').addEventListener('click', () => saveNote(false));
  $('#note-delete').addEventListener('click', deleteNote);

  load();
  return { refresh: load };
}
