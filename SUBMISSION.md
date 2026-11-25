# Chimera — a local-first productivity monster

**Kiroween 2026 · Frankenstein category**
**Live app:** https://az4nk369-sys.github.io/chimera/
**Source:** https://github.com/az4nk369-sys/chimera
**Demo video:** `chimera-demo.mp4` (90 seconds, no audio)

## The problem

Productivity tools keep multiplying. Notes live in one app, the focus timer in
another, habit streaks in a third, flashcards in a fourth — each with its own
account, its own cloud, its own subscription, and its own copy of your data.
You end up managing the tools instead of doing the work, and your private
notes, habits, and learning progress sit on someone else's server.

## The solution

**Chimera** stitches four productivity tools that "should never have been
sewn together" into a single creature with one shared brain: one IndexedDB
database on your own device.

- 🧠 **Brain — Notes:** Markdown notes with live preview, search, and tags.
- ❤️ **Heart — Pomodoro:** a 25 / 5 / 15 focus timer with a Web Audio chime;
  focus minutes and completed sessions for today are saved.
- 💪 **Muscle — Habits:** daily check-ins, streaks, and a 7-day grid.
- 🧬 **DNA — Flashcards:** decks and cards, flip-to-study mode, and spaced
  repetition (Again / Hard / Good / Easy).
- 🧟 **Vitals — Dashboard:** one screen that reads all four modules from the
  same database — note count, focus minutes today, active streaks, due cards.
- 🧪 **Backup:** export / import the whole creature as a single JSON file.

Because the four modules share one database, the dashboard is never a
separate sync job — it is just a read over data that is already there.

## How to use it

Open the live link — no install, no account, no sign-up. Everything runs in
the browser and works offline after the first load.

1. **Notes:** click **+ New**, write a title, tags, and Markdown in the left
   editor — the preview renders live on the right. Notes autosave. Search by
   title, content, or tag, or click a `#tag` chip.
2. **Pomodoro:** pick **Focus 25**, **Break 5**, or **Long break 15**, press
   **Start**. Pause any time without losing the session; **Reset** restores
   the mode duration. When a focus session ends, the chime sounds and 25
   minutes are recorded for today.
3. **Habits:** type a habit name, press **+ Add**, then **Check in today**
   (or click a day cell in the 7-day grid). The streak counts consecutive
   days up to today.
4. **Flashcards:** create a deck, add cards (front = question, back =
   answer). New cards are due immediately. Press **Start studying**, click
   the card to flip it, then grade it — Again (+10 min), Hard (×1.2),
   Good (×2.5), Easy (×3.5).
5. **Backup:** **Export JSON** downloads the entire database; **Import
   JSON** restores it (an invalid file is rejected and your old data is
   kept).

## Technology

- **Vanilla HTML / CSS / JS (ES modules)** — no framework, no build step,
  no bundler. Deploying to GitHub Pages is just a push.
- **IndexedDB** is the only persistence — one database, `chimera`, version 1,
  accessed through a single small wrapper (`js/db.js`). No server, no
  network requests at runtime.
- **System font stack only** — no webfont downloads, so the app works fully
  offline. The monster mascot is hand-drawn inline SVG; there are no
  licensed images and no external assets.
- **Web Audio API** for the Pomodoro chime (no audio files).
- **MIT licensed.**

## Built with Kiro (spec-driven)

The project was built following Kiro's spec-driven workflow: EARS
requirements, a design document, and an implementation task list live in
`.kiro/specs/chimera/`; product, tech, and structure guidance live in
`.kiro/steering/`; and a `PostFileSave` / `PostFileCreate` hook
(`.kiro/hooks/validate-on-save.json`, official Kiro hooks v1 format) runs
`scripts/validate.sh` (`node --check` on every JS file plus a JSON check of
the hook files) whenever a file is saved or created. See the Kiro write-up
(`kiro-writeup.md`) for the full, honest account of how Kiro was used —
including the fact that the Kiro CLI agent login was never completed and the
`.kiro/` artifacts and code were written manually following Kiro's official
documentation format.

## Verification

- **44/44 end-to-end assertions pass** in headless Chromium (Playwright):
  every module tab exercised — create/read/update/delete in each module,
  timer start/pause/reset, habit check-in and streak, flashcard study and
  grading, export/import round-trip, and persistence across reload — with
  zero JavaScript errors.
- **All JS passes `node --check`** via `scripts/validate.sh`.

## Known limitations

- The Pomodoro timer counts down while the page is open; closing the tab
  mid-session means that session is not recorded.
- Data lives only in this browser — moving to another browser or device
  requires a manual export/import.

## What's next

A calendar limb (schedule focus sessions), weekly focus statistics, and
optional cross-device sync via export/import are the natural next stitches
for the monster.

---

# How Kiro was used — Chimera (Kiroween 2026)

An honest account of Kiro usage on this project. The short version: **Kiro
CLI 3.6.0 was installed and works, but the Kiro agent login was never
completed, so no Kiro agent ever ran.** All `.kiro/` artifacts and all
application code were written manually, following Kiro's official
documentation format, and verified with Kiro's own recommended validation
approach (`node --check` + headless-browser end-to-end tests). No MCP
servers, no Kiro Crew, and no other Kiro powers were used — nothing of the
kind is claimed here.

## What was actually done with Kiro

### 1. Kiro CLI installed from the official source

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

Result: `kiro-cli 3.6.0` installed at `~/.local/bin/kiro-cli`.
`kiro-cli --version` → `kiro-cli 3.6.0`; `kiro-cli --help` works.

### 2. The `.kiro/` artifact formats were verified against Kiro's official docs

- Hooks: `kiro.dev/docs/hooks/` (updated 15 Nov 2026) — hooks v1 JSON
  format (`{"version": "v1", "hooks": [...]}` with PascalCase triggers such
  as `PostFileSave`).
- Specs and steering: the official three-file spec layout
  (`requirements.md`, `design.md`, `tasks.md`) and three-file steering
  layout (`product.md`, `tech.md`, `structure.md`).

### 3. Spec-driven development, in Kiro's format

The project was developed following the spec artifacts in
`.kiro/specs/chimera/` as the source of truth, in order:

| Artifact | Contents |
|---|---|
| `requirements.md` (132 lines) | EARS-format requirements (R1–R8) with user stories and acceptance criteria, plus a glossary |
| `design.md` (102 lines) | Architecture: one IndexedDB database, module-per-file ES modules, dashboard as read-only aggregation |
| `tasks.md` (61 lines) | Implementation checklist, every task referencing its requirement, checked off as verified |

### 4. Steering

`.kiro/steering/` holds the standing guidance the build followed:

| File | Contents |
|---|---|
| `product.md` | What Chimera is, the four limbs, the shared brain, users, non-goals (no accounts, no sync, no server, no analytics, no identity verification), the "monster laboratory" aesthetic |
| `tech.md` | Vanilla HTML/CSS/JS, IndexedDB as the only persistence, system fonts only, Web Audio chime, no runtime dependencies, validation rules |
| `structure.md` | Folder layout and module responsibilities |

### 5. Hooks

`.kiro/hooks/validate-on-save.json` (official Kiro hooks v1 format) defines
two enabled hooks:

- **"Validate JS on save"** — trigger `PostFileSave`, matcher `\.(js|json)$`
- **"Validate JS on create"** — trigger `PostFileCreate`, same matcher

Both run `bash scripts/validate.sh`, which runs `node --check` on every
`js/*.js` file and validates the JSON syntax of the hook files. Command
actions receive the event as JSON on STDIN; the script validates the whole
`js/` tree, which is fast and deterministic.

### 6. Verification done the way the spec demands

- `scripts/validate.sh`: `node --check` on all JS + JSON check of hooks —
  passes.
- **End-to-end test, headless Chromium (Playwright): 44/44 assertions pass.**
  Every module tab exercised — Notes CRUD + Markdown rendering + search,
  Pomodoro start/pause/reset, habit check-in + streak, flashcard deck/card
  creation + study flip + grading, dashboard vitals, export/import
  round-trip, persistence across reload — with zero JavaScript errors.

## What was NOT done by Kiro (manual fallback, stated plainly)

- **Kiro agent login never completed.** `kiro-cli whoami` → `Not logged in`.
  `kiro-cli login --license free --use-device-flow` issued a device-flow
  code (`MSCW-HFMC`, URL `https://view.awsapps.com/start/#/device?user_code=MSCW-HFMC`)
  and waited for a human to confirm it in a browser. The process was stopped
  after a 25-second timeout with no confirmation — the build ran as a
  headless subagent with no browser available to complete that step, and no
  connected email to read a code from. The device code has almost certainly
  expired by now.
- **Consequently, no `kiro-cli chat` / agent command ever ran.** Every
  `.kiro/` artifact — specs, steering, and the hook — was written manually
  following the verified official Kiro formats above, not generated by Kiro.
- **The application code was also written manually** (not by a Kiro agent)
  and then verified with `node --check` and the Playwright end-to-end suite
  (44/44 pass, no JS errors).
- **No MCP servers, no Kiro Crew, no other Kiro powers were used.** None are
  claimed.
- **No identity verification / KYC was requested or performed at any point.**
  The free 4,000 Kiro credits were never requested, per the project's rules.

The full status, including the device-flow code and URL, is recorded in
`KIRO-STATUS.md` at the repository root.

## What a human can still do later

If the account owner completes the device-flow login in a browser (open the
URL above, enter the code — a fresh code will be needed, as the old one has
expired), the Kiro CLI becomes authenticated and can continue developing
this repo — for example by running `kiro-cli chat` in the repo folder with
the existing steering and spec already in place.

## Summary

| Kiro element | Status |
|---|---|
| CLI installed (3.6.0, official installer) | ✅ Done |
| Specs (requirements / design / tasks, EARS) | ✅ Written manually in Kiro format |
| Steering (product / tech / structure) | ✅ Written manually in Kiro format |
| Hooks (validate-on-save, v1 format) | ✅ Written manually in Kiro format |
| Kiro agent login / `kiro-cli chat` | ❌ Never completed (device flow needs a human in a browser) |
| MCP / Kiro Crew / other Kiro powers | ❌ Not used |
| Identity verification / KYC | ❌ None requested or performed |
| Free 4,000 Kiro credits | ❌ Never requested |
