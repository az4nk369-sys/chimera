# Tech — Chimera

## Stack
- **Vanilla HTML / CSS / JS (ES modules)**. No framework, no build step, no
  bundler. The app must run by opening `index.html` from any static server
  (e.g. `npx serve`) and deploy to GitHub Pages by pushing.
- **IndexedDB** (via a tiny promise wrapper in `js/db.js`) is the only
  persistence. One database, `chimera`, version 1.
- **System font stack only** — no webfont downloads, so the app works offline.
- **Web Audio API** for the Pomodoro chime (no audio files).
- **No external dependencies at runtime.** No CDN scripts, no images fetched
  from the network. The monster mascot is inline SVG.

## Constraints
- Node.js >= 22 for tooling/validation only (the app itself needs no Node).
- All JS must pass `node --check` (see `scripts/validate.sh`).
- All data stays in the browser. Export/import is a local JSON file the user
  downloads/uploads.
- Must work offline after first load; no network requests at runtime.

## Browser support
Any modern browser with IndexedDB + ES modules (Chrome/Edge/Firefox/Safari,
current versions).

## Validation
- `scripts/validate.sh` — `node --check` every `js/*.js` file and a JSON
  syntax check of `.kiro/hooks/*.json`.
- Manual end-to-end check with a headless browser (Playwright Chromium):
  load the page, click every module tab, exercise create/read/update/delete
  in each module, confirm no fatal JS errors.
