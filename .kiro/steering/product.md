# Product — Chimera

## What it is
Chimera is a local-first productivity monster for the Kiroween 2026 hackathon
(Devpost, **Frankenstein** category). One static web app stitches four tools
that "should never have been sewn together" into a single creature sharing one
brain: a single IndexedDB database.

## The four stitched limbs
1. **Notes** — Markdown notes (create/edit/delete, live preview, search, tags).
2. **Pomodoro** — focus timer (25/5/15), session counting, Web Audio chime,
   focus minutes for today persisted.
3. **Habits** — daily check-ins, streaks, 7-day week view.
4. **Flashcards** — decks + cards, flip-to-study mode, simple spaced
   repetition (Again / Hard / Good / Easy), due-card counting.

## The shared brain
A **Dashboard ("vitals")** reads all four modules from the same database:
note count, focus minutes today, active streaks, due cards. Export/import
(JSON backup) covers the whole creature at once.

## Users
Anyone who wants a private productivity tool with no account, no server, no
tracking. Works offline after the first load.

## Non-goals
- No accounts, no sync, no server, no analytics.
- No paid features, no identity verification of any kind.
- No framework, no build step, no external assets (system fonts only).

## Aesthetic
"Monster laboratory": dark, tidy, electric-green accents, visible stitches.
Modules are presented as body parts sewn onto one creature. The mascot is a
hand-drawn SVG/CSS monster — never a licensed image.
