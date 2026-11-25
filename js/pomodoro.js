// pomodoro.js — Modul Pomodoro (R2).
import { get, put } from './db.js';
import { todayKey, fmtClock, toast, notifyChanged } from './utils.js';

const DURATIONS = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABELS = { focus: 'Fokus', short: 'Istirahat', long: 'Istirahat Panjang' };

export function mountPomodoro(section) {
  section.innerHTML = `
    <div class="panel-head">
      <h2>❤️ Jantung — Pomodoro</h2>
      <p class="muted">Satu sesi fokus = 25 menit. Jantung berdetak tiap detik.</p>
    </div>
    <div class="pomo-wrap">
      <div class="pomo-modes" role="tablist" aria-label="Mode timer">
        <button class="btn mode active" data-mode="focus">Fokus · 25</button>
        <button class="btn mode" data-mode="short">Istirahat · 5</button>
        <button class="btn mode" data-mode="long">Istirahat Panjang · 15</button>
      </div>
      <div id="pomo-clock" class="pomo-clock" aria-live="polite">25:00</div>
      <div id="pomo-state" class="muted">Siap fokus?</div>
      <div class="row center">
        <button id="pomo-toggle" class="btn primary big">▶ Mulai</button>
        <button id="pomo-reset" class="btn">Reset</button>
      </div>
      <div class="pomo-stats">
        <div class="stat"><span id="pomo-today">0</span><label>menit fokus hari ini</label></div>
        <div class="stat"><span id="pomo-sessions">0</span><label>sesi selesai hari ini</label></div>
      </div>
    </div>`;

  const $ = (id) => section.querySelector(id);
  const clockEl = $('#pomo-clock');
  const stateEl = $('#pomo-state');
  const toggleBtn = $('#pomo-toggle');

  let mode = 'focus';
  let remaining = DURATIONS.focus;
  let running = false;
  let timerId = null;
  let audioCtx = null;

  function focusKey() {
    return `focus:${todayKey()}`;
  }

  async function loadStats() {
    const rec = (await get('meta', focusKey())) || { key: focusKey(), minutes: 0, sessions: 0 };
    $('#pomo-today').textContent = rec.minutes;
    $('#pomo-sessions').textContent = rec.sessions;
  }

  async function recordFocus(minutes) {
    const key = focusKey();
    const rec = (await get('meta', key)) || { key, minutes: 0, sessions: 0 };
    rec.minutes += minutes;
    rec.sessions += 1;
    await put('meta', rec);
    await loadStats();
    notifyChanged();
  }

  function chime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [880, 1174.66, 880].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.35 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.32);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + i * 0.35);
        osc.stop(now + i * 0.35 + 0.35);
      });
    } catch {
      // Audio tidak tersedia — lewati diam-diam.
    }
  }

  function render() {
    clockEl.textContent = fmtClock(remaining);
    toggleBtn.textContent = running ? '⏸ Jeda' : '▶ Mulai';
    stateEl.textContent = running
      ? `${LABELS[mode]} berjalan…`
      : remaining === DURATIONS[mode]
        ? `Siap ${LABELS[mode].toLowerCase()}?`
        : `${LABELS[mode]} dijeda di ${fmtClock(remaining)}`;
    section.querySelectorAll('.pomo-modes .mode').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }

  async function finish() {
    stop();
    chime();
    if (mode === 'focus') {
      await recordFocus(DURATIONS.focus / 60);
      toast('Sesi fokus selesai! +25 menit 🎉');
    } else {
      toast(`${LABELS[mode]} selesai.`);
    }
    remaining = DURATIONS[mode];
    render();
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      finish();
      return;
    }
    render();
  }

  function start() {
    if (running) return;
    running = true;
    timerId = setInterval(tick, 1000);
    render();
  }

  function stop() {
    running = false;
    if (timerId) clearInterval(timerId);
    timerId = null;
    render();
  }

  function setMode(m) {
    stop();
    mode = m;
    remaining = DURATIONS[m];
    render();
  }

  toggleBtn.addEventListener('click', () => (running ? stop() : start()));
  $('#pomo-reset').addEventListener('click', () => {
    stop();
    remaining = DURATIONS[mode];
    render();
  });
  section.querySelectorAll('.pomo-modes .mode').forEach((b) => {
    b.addEventListener('click', () => setMode(b.dataset.mode));
  });

  loadStats();
  render();
  return { refresh: loadStats };
}
