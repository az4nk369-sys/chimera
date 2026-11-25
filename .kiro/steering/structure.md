# Structure — Chimera

```
chimera/
├── index.html                  # Single page: nav tabs + 5 sections (dashboard, notes,
│                               # pomodoro, habits, flashcards) + mascot SVG + import/export
├── css/
│   └── styles.css              # All styling: dark lab theme, stitch borders, responsive
├── js/
│   ├── db.js                   # IndexedDB wrapper + schema (stores, indexes)
│   ├── utils.js                # ids, dates, DOM helpers, toast
│   ├── markdown.js             # Tiny safe Markdown renderer (no deps)
│   ├── notes.js                # Notes module
│   ├── pomodoro.js             # Pomodoro module (timer, chime, focus minutes)
│   ├── habits.js               # Habits module (check-ins, streaks, week view)
│   ├── flashcards.js           # Flashcards module (decks, cards, SM-2-lite review)
│   ├── dashboard.js            # Vitals: aggregates all four modules
│   ├── backup.js               # Export/import whole database as JSON
│   └── app.js                  # Bootstraps DB, wires nav, mounts modules
├── scripts/
│   └── validate.sh             # node --check all JS + JSON-check hooks (used by hook)
├── .kiro/
│   ├── specs/chimera/          # requirements.md, design.md, tasks.md
│   ├── steering/               # product.md, tech.md, structure.md
│   └── hooks/                  # validate-on-save.json
├── LICENSE                     # MIT
└── README.md
```

## Conventions
- ES modules, one module per feature. `app.js` is the only entry point
  referenced from `index.html`.
- `db.js` owns the schema; no other module touches `indexedDB` directly.
- All user-visible strings in Indonesian (UI language), code comments in
  English or Indonesian, short and factual.
- IDs are `crypto.randomUUID()` when available, fallback `Date.now()` +
  random suffix.
- Dates are stored as `YYYY-MM-DD` local-date strings for habit logs and
  focus-minutes keys.
- Never commit `node_modules/` or build output. `.gitignore` excludes them.
- `.kiro/` is committed (never gitignored) — specs, steering and hooks are
  part of the deliverable.
