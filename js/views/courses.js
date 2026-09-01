/* ==========================================================================
   views/courses.js — elenco dei corsi e creazione/eliminazione corso
   ========================================================================== */

import { State } from '../core/state.js';
import { esc, uid } from '../core/utils.js';
import { COURSE_COLORS, COURSE_ICONS } from '../core/constants.js';
import { openModal, closeModal } from '../core/modal.js';
import { toast } from '../core/toast.js';
import { Router } from '../core/router.js';
import { persist } from '../data/persist.js';

export function coursesHtml(){
  const cs = State.data.courses;

  return `
  <div class="section-head"><h3>I tuoi corsi</h3><button class="btn btn-primary" onclick="Courses.openCreate()">+ Nuovo corso</button></div>
  ${cs.length === 0 ? `<div class="card empty-state"><div class="big">🎓</div>Non hai ancora nessun corso.<br>Crea il primo per iniziare a organizzare lezioni e materiali.</div>` : `
  <div class="course-grid">${cs.map(c => {
    const cTasks = State.data.tasks.filter(t => t.courseId === c.id);
    const doneP = cTasks.length ? Math.round(cTasks.filter(t => t.completed).length / cTasks.length * 100) : 0;
    return `
    <div class="card course-card" onclick="Router.go('course','${c.id}')">
      <div class="top" style="background:${c.color}"><span class="icon">${c.icon}</span><span class="name">${esc(c.name)}</span></div>
      <div class="body">
        <div class="row"><span>${c.lessons.length} lezioni</span><span>${cTasks.length} task</span></div>
        <div class="row"><span>Completamento</span><span>${doneP}%</span></div>
        ${c.members.length ? `<div class="members">${c.members.slice(0, 4).map(m => `<div class="m" title="${esc(m.name)}">${m.name.slice(0, 1).toUpperCase()}</div>`).join('')}</div>` : ''}
      </div>
    </div>`;
  }).join('')}</div>`}`;
}

export const Courses = {

  openCreate(){
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>Nuovo corso</h3>
      <form onsubmit="return Courses.create(event)">
        <div class="field"><label>Nome corso</label><input type="text" id="nc-name" required placeholder="Es. Fisica Generale"></div>
        <div class="field"><label>Icona</label><div class="avatar-picker">${COURSE_ICONS.map(i => `<div class="avatar-opt" data-icon="${i}" onclick="Courses.pickIcon(this)">${i}</div>`).join('')}</div></div>
        <div class="field"><label>Colore</label><div class="color-picker">${COURSE_COLORS.map(col => `<div class="color-opt" data-color="${col}" style="background:${col}" onclick="Courses.pickColor(this)"></div>`).join('')}</div></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Annulla</button><button class="btn btn-primary" type="submit">Crea corso</button></div>
      </form>`);

    Courses.pickIcon(document.querySelector('.avatar-opt'));
    Courses.pickColor(document.querySelector('.color-opt'));
  },

  pickIcon(el){
    document.querySelectorAll('.avatar-picker .avatar-opt').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel');
  },

  pickColor(el){
    document.querySelectorAll('.color-picker .color-opt').forEach(e => e.classList.remove('sel'));
    el.classList.add('sel');
  },

  async create(e){
    e.preventDefault();
    const name  = document.getElementById('nc-name').value.trim();
    const icon  = document.querySelector('.avatar-picker .sel')?.dataset.icon || '📘';
    const color = document.querySelector('.color-picker .sel')?.dataset.color || COURSE_COLORS[0];

    State.data.courses.push({ id: uid(), name, icon, color, lessons: [], materials: [], members: [], comments: [] });
    await persist();
    closeModal();
    toast('Corso creato', 'success');
    Router.go('courses');
    return false;
  },

  async remove(id){
    if(!confirm('Eliminare questo corso e tutte le sue task?')) return;
    State.data.courses = State.data.courses.filter(c => c.id !== id);
    State.data.tasks   = State.data.tasks.filter(t => t.courseId !== id);
    await persist();
    toast('Corso eliminato');
    Router.go('courses');
  }
};
