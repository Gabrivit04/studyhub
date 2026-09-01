/* ==========================================================================
   views/dashboard.js — riepilogo: KPI, grafici, prossime scadenze, costanza
   ========================================================================== */

import { State } from '../core/state.js';
import { esc, fmtDate, last7Days } from '../core/utils.js';

export function dashboardHtml(){
  const tasks = State.data.tasks;
  const done = tasks.filter(t => t.completed).length;
  const pct  = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  const totalMin = State.data.pomodoroSessions.reduce((s, x) => s + x.minutes, 0);
  const hrs = Math.floor(totalMin / 60), mins = totalMin % 60;

  const upcoming = tasks.filter(t => !t.completed)
                        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                        .slice(0, 5);
  const courseById = id => State.data.courses.find(c => c.id === id);

  return `
  <div class="kpi-grid">
    <div class="card kpi"><div class="lbl">Completamento task</div><div class="val">${pct}%</div><div class="delta">${done}/${tasks.length} completati</div></div>
    <div class="card kpi"><div class="lbl">Tempo totale studio</div><div class="val">${hrs}h ${mins}m</div><div class="delta">${State.data.pomodoroSessions.length} sessioni</div></div>
    <div class="card kpi"><div class="lbl">Corsi attivi</div><div class="val">${State.data.courses.length}</div><div class="delta">in corso</div></div>
    <div class="card kpi"><div class="lbl">Prossima scadenza</div><div class="val" style="font-size:16px;">${upcoming[0] ? fmtDate(upcoming[0].dueDate) : '—'}</div><div class="delta">${upcoming[0] ? upcoming[0].title : 'nessuna task'}</div></div>
  </div>

  <div class="dash-grid">
    <div class="card chart-card">
      <h4>Tempo di studio — ultimi 7 giorni</h4>
      <canvas id="chart-week" height="150"></canvas>
    </div>
    <div class="card chart-card">
      <h4>Completamento task</h4>
      <canvas id="chart-donut" height="150"></canvas>
    </div>
  </div>

  <div class="dash-grid">
    <div class="card chart-card">
      <h4>Prossime scadenze</h4>
      ${upcoming.length ? upcoming.map(t => {
        const c = courseById(t.courseId);
        return `
        <div class="deadline-row">
          <div class="info"><span class="dot" style="background:${c ? c.color : '#999'}"></span><div><div class="title">${esc(t.title)}</div><div class="meta">${c ? esc(c.name) : '—'}</div></div></div>
          <span class="prio ${t.priority}">${t.priority}</span>
        </div>`;
      }).join('') : `<div class="empty-state">Nessuna scadenza imminente 🎉</div>`}
    </div>
    <div class="card chart-card">
      <h4>Costanza — ultimi 7 giorni</h4>
      <div class="streak-strip">${last7Days().map(d => {
        const studied = State.data.pomodoroSessions.some(s => s.date === d.iso);
        return `<div class="streak-day ${studied ? 'active' : ''}" title="${d.iso}">${d.label}</div>`;
      }).join('')}</div>
      <p class="muted" style="font-size:12.5px;margin-top:14px;">Le celle evidenziate indicano un giorno in cui hai completato almeno una sessione Pomodoro.</p>
    </div>
  </div>`;
}
