/* ==========================================================================
   views/planner.js — task, filtri, ordinamento e riga task riutilizzabile
   ========================================================================== */

import { State } from '../core/state.js';
import { esc, fmtDate, uid, prioRank } from '../core/utils.js';
import { openModal, closeModal } from '../core/modal.js';
import { toast } from '../core/toast.js';
import { persist } from '../data/persist.js';
import { render } from './render.js';
import { calendarHtml } from './calendar.js';

export function plannerHtml(){
  const f = State.plannerFilter;
  let tasks = State.data.tasks.slice();

  if(f.course !== 'all')    tasks = tasks.filter(t => t.courseId === f.course);
  if(f.status === 'pending') tasks = tasks.filter(t => !t.completed);
  if(f.status === 'done')    tasks = tasks.filter(t => t.completed);
  tasks.sort((a, b) => f.sort === 'priority' ? prioRank(b.priority) - prioRank(a.priority) : a.dueDate.localeCompare(b.dueDate));

  return `
  <div class="section-head"><h3>Task e scadenze</h3><button class="btn btn-primary" onclick="Planner.openCreate()">+ Nuova task</button></div>

  <div class="planner-toolbar">
    <select onchange="Planner.setFilter('course', this.value)">
      <option value="all">Tutti i corsi</option>
      ${State.data.courses.map(c => `<option value="${c.id}" ${f.course === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
    </select>
    <select onchange="Planner.setFilter('status', this.value)">
      <option value="all" ${f.status === 'all' ? 'selected' : ''}>Tutte</option>
      <option value="pending" ${f.status === 'pending' ? 'selected' : ''}>Da fare</option>
      <option value="done" ${f.status === 'done' ? 'selected' : ''}>Completate</option>
    </select>
    <select onchange="Planner.setFilter('sort', this.value)">
      <option value="due" ${f.sort === 'due' ? 'selected' : ''}>Ordina per scadenza</option>
      <option value="priority" ${f.sort === 'priority' ? 'selected' : ''}>Ordina per priorità</option>
    </select>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;">
    <div>
      ${tasks.length === 0 ? `<div class="card empty-state">Nessuna task trovata.</div>` : tasks.map(t => Planner.taskRowHtml(t)).join('')}
    </div>
    <div class="card" style="padding:18px;">
      ${calendarHtml()}
    </div>
  </div>
  `;
}

export const Planner = {

  setFilter(k, v){
    State.plannerFilter[k] = v;
    render();
  },

  async toggle(id){
    const t = State.data.tasks.find(t => t.id === id);
    t.completed = !t.completed;
    await persist();
    render();
  },

  async remove(id){
    State.data.tasks = State.data.tasks.filter(t => t.id !== id);
    await persist();
    render();
  },

  /** @param {string} [courseId] preseleziona un corso nella modale */
  openCreate(courseId){
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>Nuova task</h3>
      <form onsubmit="return Planner.create(event)">
        <div class="field"><label>Titolo</label><input type="text" id="nt-title" required></div>
        <div class="field"><label>Corso</label><select id="nt-course">${State.data.courses.map(c => `<option value="${c.id}" ${courseId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field-row">
          <div class="field"><label>Priorità</label><select id="nt-priority"><option value="bassa">Bassa</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
          <div class="field"><label>Scadenza</label><input type="date" id="nt-date" required></div>
        </div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Annulla</button><button class="btn btn-primary" type="submit">Crea task</button></div>
      </form>`);

    if(State.data.courses.length === 0){
      document.getElementById('nt-course').innerHTML = '<option value="">Nessun corso — creane uno prima</option>';
    }
  },

  async create(e){
    e.preventDefault();
    const title    = document.getElementById('nt-title').value.trim();
    const courseId = document.getElementById('nt-course').value;
    const priority = document.getElementById('nt-priority').value;
    const dueDate  = document.getElementById('nt-date').value;

    if(!courseId){ toast('Crea prima un corso', 'error'); return false; }

    State.data.tasks.push({ id: uid(), courseId, title, priority, dueDate, completed: false });
    await persist();
    closeModal();
    toast('Task creata', 'success');
    render();
    return false;
  },

  /** Riga task condivisa tra pianificazione e dettaglio corso. */
  taskRowHtml(t){
    const c = State.data.courses.find(c => c.id === t.courseId);
    return `<div class="task-row ${t.completed ? 'done' : ''}">
      <div class="check ${t.completed ? 'on' : ''}" onclick="Planner.toggle('${t.id}')">${t.completed ? '✓' : ''}</div>
      <div class="t">${esc(t.title)}</div>
      <div class="meta">
        <span class="pill" style="background:${c ? c.color + '22' : '#eee'};color:${c ? c.color : '#666'};">${c ? esc(c.name) : '—'}</span>
        <span class="mono muted" style="font-size:12px;">${fmtDate(t.dueDate)}</span>
        <span class="prio ${t.priority}">${t.priority}</span>
        <button class="btn btn-icon btn-ghost" onclick="Planner.remove('${t.id}')">🗑</button>
      </div>
    </div>`;
  }
};
