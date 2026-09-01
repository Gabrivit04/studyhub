/* ==========================================================================
   views/calendar.js — calendario mensile con le scadenze, dentro la
   vista di pianificazione (settimana che inizia di lunedì)
   ========================================================================== */

import { State } from '../core/state.js';
import { esc } from '../core/utils.js';
import { render } from './render.js';

export function calendarHtml(){
  const y = State.calYear, m = State.calMonth;
  const first = new Date(y, m, 1);
  const startOffset = (first.getDay() + 6) % 7;      // lunedì = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrev  = new Date(y, m, 0).getDate();
  const monthName = first.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const todayIso = new Date().toISOString().slice(0, 10);

  const cells = [];
  for(let i = startOffset - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, other: true });
  for(let d = 1; d <= daysInMonth; d++){
    cells.push({ d, other: false, iso: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  while(cells.length % 7 !== 0) cells.push({ d: cells.length, other: true });

  return `
  <div class="cal-nav">
    <button class="btn btn-icon btn-ghost" onclick="CalendarUI.nav(-1)">←</button>
    <h3 style="text-transform:capitalize;">${monthName}</h3>
    <button class="btn btn-icon btn-ghost" onclick="CalendarUI.nav(1)">→</button>
  </div>
  <div id="calendar">
    ${['L','M','M','G','V','S','D'].map(d => `<div class="cal-head">${d}</div>`).join('')}
    ${cells.map(c => {
      if(c.other) return `<div class="cal-cell other"><div class="dnum">${c.d}</div></div>`;
      const dayTasks = State.data.tasks.filter(t => t.dueDate === c.iso);
      return `<div class="cal-cell ${c.iso === todayIso ? 'today' : ''}">
        <div class="dnum">${c.d}</div>
        ${dayTasks.slice(0, 3).map(t => `<span class="cal-tag" title="${esc(t.title)}" onclick="Planner.toggle('${t.id}')">${esc(t.title)}</span>`).join('')}
        ${dayTasks.length > 3 ? `<span class="muted" style="font-size:10px;">+${dayTasks.length - 3} altro</span>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

export const CalendarUI = {
  /** @param {-1|1} dir mese precedente / successivo */
  nav(dir){
    let m = State.calMonth + dir, y = State.calYear;
    if(m < 0){ m = 11; y--; }
    if(m > 11){ m = 0; y++; }
    State.calMonth = m;
    State.calYear = y;
    render();
  }
};
