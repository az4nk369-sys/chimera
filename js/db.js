// db.js — satu-satunya akses ke IndexedDB ("otak bersama" Chimera).
// Modul lain TIDAK BOLEH memanggil indexedDB langsung.

const DB_NAME = 'chimera';
const DB_VERSION = 1;

const STORES = ['notes', 'habits', 'decks', 'cards', 'meta'];

let dbPromise = null;

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('notes')) {
        const notes = db.createObjectStore('notes', { keyPath: 'id' });
        notes.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('decks')) {
        db.createObjectStore('decks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cards')) {
        const cards = db.createObjectStore('cards', { keyPath: 'id' });
        cards.createIndex('deckId', 'deckId');
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(store, mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const req = fn(s);
        // fn may return a request or a plain value
        if (req && typeof req.onsuccess !== 'undefined') {
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        } else {
          resolve(req);
        }
        t.onerror = () => reject(t.error);
      }),
  );
}

export function getAll(store) {
  return tx(store, 'readonly', (s) => s.getAll());
}

export function get(store, key) {
  return tx(store, 'readonly', (s) => s.get(key));
}

export function put(store, value) {
  return tx(store, 'readwrite', (s) => s.put(value));
}

export function del(store, key) {
  return tx(store, 'readwrite', (s) => s.delete(key));
}

export function clear(store) {
  return tx(store, 'readwrite', (s) => s.clear());
}

export function getByIndex(store, index, key) {
  return tx(store, 'readonly', (s) => s.index(index).getAll(key));
}

export function getAllStores() {
  return Promise.all(STORES.map((s) => getAll(s))).then((results) => {
    const out = {};
    STORES.forEach((name, i) => {
      out[name] = results[i];
    });
    return out;
  });
}

export const STORE_NAMES = STORES;
