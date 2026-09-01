/* ==========================================================================
   views/timer.js — timer Pomodoro: vista, logica delle fasi e impostazioni
   ========================================================================== */

import { State } from '../core/state.js';
import { esc, uid } from '../core/utils.js';
import { toast } from '../core/toast.js';
import { persist } from '../data/persist.js';
import { render } from './render.js';

const RING_RADIUS = 112;

export function timerHtml(){
  const s = State.data.pomodoroSettings;
  const todayIso = new Date().toISOString().slice(0, 10);
  const todayMin = State.data.pomodoroSessions.filter(x => x.date === todayIso).reduce((a, b) => a + b.minutes, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekMin = State.data.pomodoroSessions
    .filter(x => new Date(x.date) >= new Date(weekStart.toISOString().slice(0, 10)))
    .reduce((a, b) => a + b.minutes, 0);

  return `
  <div class="timer-wrap">
    <div class="card timer-card">
      <div class="ring-wrap">
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle class="ring-track" cx="130" cy="130" r="${RING_RADIUS}"></circle>
          <circle class="ring-prog" id="ring-prog" cx="130" cy="130" r="${RING_RADIUS}" stroke-dasharray="703.7" stroke-dashoffset="0"></circle>
        </svg>
        <div class="ring-center">
          <div class="time mono" id="timer-display">25:00</div>
          <div class="phase" id="timer-phase">Focus</div>
        </div>
      </div>

      <div class="field" style="width:100%;max-width:260px;margin-top:20px;">
        <label>Corso collegato (opzionale)</label>
        <select id="timer-course" onchange="Timer.setCourse(this.value)">
          <option value="">Nessuno</option>
          ${State.data.courses.map(c => `<option value="${c.id}" ${State.timer.linkedCourse === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>

      <div class="timer-controls">
        <button class="btn btn-primary" id="timer-toggle" onclick="Timer.toggle()">▶ Avvia</button>
        <button class="btn btn-ghost" onclick="Timer.reset()">↺ Reset</button>
        <button class="btn btn-ghost" onclick="Timer.skip()">⏭ Salta fase</button>
      </div>
    </div>

    <div class="card timer-settings">
      <h4>Impostazioni sessione</h4>
      <div class="field-row">
        <div class="field"><label>Focus (min)</label><input type="number" id="set-work" value="${s.work}" min="5" max="90"></div>
        <div class="field"><label>Pausa breve (min)</label><input type="number" id="set-short" value="${s.short}" min="1" max="30"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Pausa lunga (min)</label><input type="number" id="set-long" value="${s.long}" min="5" max="60"></div>
        <div class="field"><label>Cicli prima di pausa lunga</label><input type="number" id="set-cycle" value="${s.cycle}" min="2" max="8"></div>
      </div>
      <button class="btn btn-accent" style="width:100%" onclick="Timer.saveSettings()">Salva impostazioni</button>

      <div class="divider"></div>
      <h4>Statistiche</h4>
      <div class="stat-mini"><span>Oggi</span><b>${todayMin} min</b></div>
      <div class="stat-mini"><span>Ultimi 7 giorni</span><b>${weekMin} min</b></div>
      <div class="stat-mini"><span>Sessioni completate (totale)</span><b>${State.data.pomodoroSessions.length}</b></div>
      <div class="stat-mini"><span>Cicli focus completati oggi</span><b>${State.timer.sessionsDone}</b></div>
    </div>
  </div>`;
}

/** Riporta il timer alla fase di focus con la durata da impostazioni. */
export function resetTimerFromSettings(){
  const s = State.data.pomodoroSettings;
  State.timer.phase = 'work';
  State.timer.total = s.work * 60;
  State.timer.remaining = s.work * 60;
  State.timer.running = false;
  if(State.timer.interval){ clearInterval(State.timer.interval); State.timer.interval = null; }
}

export function updateTimerDisplay(){
  const disp = document.getElementById('timer-display');
  const phaseEl = document.getElementById('timer-phase');
  const ring = document.getElementById('ring-prog');
  if(!disp) return;

  const m = Math.floor(State.timer.remaining / 60), s = State.timer.remaining % 60;
  disp.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  phaseEl.textContent = { work: 'Focus', short: 'Pausa breve', long: 'Pausa lunga' }[State.timer.phase];

  const circumference = 2 * Math.PI * RING_RADIUS;
  const frac = 1 - (State.timer.remaining / State.timer.total);
  if(ring) ring.style.strokeDashoffset = circumference * frac;
}

export function updateTimerBtn(){
  const btn = document.getElementById('timer-toggle');
  if(btn) btn.innerHTML = State.timer.running ? '⏸ Pausa' : '▶ Avvia';
}

export const Timer = {

  setCourse(v){ State.timer.linkedCourse = v; },

  toggle(){
    if(State.timer.running) this.pause();
    else this.start();
  },

  start(){
    State.timer.running = true;
    updateTimerBtn();
    State.timer.interval = setInterval(() => {
      State.timer.remaining--;
      if(State.timer.remaining <= 0){ Timer.completePhase(); return; }
      updateTimerDisplay();
    }, 1000);
  },

  pause(){
    State.timer.running = false;
    if(State.timer.interval) clearInterval(State.timer.interval);
    updateTimerBtn();
  },

  reset(){
    this.pause();
    resetTimerFromSettings();
    updateTimerDisplay();
    updateTimerBtn();
  },

  skip(){ this.completePhase(true); },

  /**
   * Chiude la fase corrente e passa alla successiva.
   * @param {boolean} [skip] se true non registra la sessione di focus
   */
  async completePhase(skip){
    const s = State.data.pomodoroSettings;

    if(State.timer.phase === 'work'){
      if(!skip){
        const todayIso = new Date().toISOString().slice(0, 10);
        State.data.pomodoroSessions.push({ id: uid(), date: todayIso, minutes: s.work, courseId: State.timer.linkedCourse || null });
        await persist();
        State.timer.sessionsDone++;
        toast('Sessione di focus completata! 🎉', 'success');
      }
      const isLong = State.timer.sessionsDone > 0 && State.timer.sessionsDone % s.cycle === 0;
      State.timer.phase = isLong ? 'long' : 'short';
      State.timer.total = (isLong ? s.long : s.short) * 60;
    } else {
      State.timer.phase = 'work';
      State.timer.total = s.work * 60;
    }

    State.timer.remaining = State.timer.total;
    updateTimerDisplay();
    render();
    updateTimerBtn();
  },

  saveSettings(){
    const work  = +document.getElementById('set-work').value  || 25;
    const short = +document.getElementById('set-short').value || 5;
    const long  = +document.getElementById('set-long').value  || 15;
    const cycle = +document.getElementById('set-cycle').value || 4;

    State.data.pomodoroSettings = { work, short, long, cycle };
    persist();
    resetTimerFromSettings();
    render();
    toast('Impostazioni salvate', 'success');
  }
};
