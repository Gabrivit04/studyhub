/* ==========================================================================
   views/courseDetail.js — dettaglio corso: lezioni, materiali, task,
   membri e chat
   ========================================================================== */

import { State } from '../core/state.js';
import { esc, fmtDate, uid } from '../core/utils.js';
import { openModal, closeModal } from '../core/modal.js';
import { toast } from '../core/toast.js';
import { persist } from '../data/persist.js';
import { render } from './render.js';
import { Planner } from './planner.js';

export function courseDetailHtml(){
  const c = State.data.courses.find(c => c.id === State.currentCourseId);
  if(!c) return `<div class="empty-state">Corso non trovato.</div>`;

  const cTasks = State.data.tasks.filter(t => t.courseId === c.id);

  return `
  <button class="back-link" onclick="Router.go('courses')">← Torna ai corsi</button>
  <div class="course-hero" style="background:${c.color}">
    <div class="left"><span class="icon-lg">${c.icon}</span><div><h2>${esc(c.name)}</h2><div style="color:#fff;opacity:.85;font-size:13px;">${c.lessons.length} lezioni · ${c.materials.length} materiali · ${c.members.length} membri</div></div></div>
    <button class="btn btn-danger" onclick="Courses.remove('${c.id}')">Elimina corso</button>
  </div>

  <div class="tabs">
    <button class="tab-btn ${State.courseTab === 'lessons'   ? 'active' : ''}" onclick="CourseDetail.tab('lessons')">Lezioni</button>
    <button class="tab-btn ${State.courseTab === 'materials' ? 'active' : ''}" onclick="CourseDetail.tab('materials')">Materiali</button>
    <button class="tab-btn ${State.courseTab === 'tasks'     ? 'active' : ''}" onclick="CourseDetail.tab('tasks')">Task (${cTasks.length})</button>
    <button class="tab-btn ${State.courseTab === 'members'   ? 'active' : ''}" onclick="CourseDetail.tab('members')">Membri</button>
    <button class="tab-btn ${State.courseTab === 'chat'      ? 'active' : ''}" onclick="CourseDetail.tab('chat')">Chat</button>
  </div>

  <!-- LEZIONI -->
  <div class="tab-panel ${State.courseTab === 'lessons' ? 'active' : ''}">
    <div class="section-head"><h3>Lezioni</h3><button class="btn btn-sm btn-accent" onclick="CourseDetail.addLesson('${c.id}')">+ Aggiungi lezione</button></div>
    ${c.lessons.length === 0 ? `<div class="empty-state">Nessuna lezione aggiunta.</div>` : c.lessons.map(l => `
      <div class="list-item"><div class="l"><span>📖</span><div><div class="t">${esc(l.title)}</div><div class="m">${l.date ? fmtDate(l.date) : 'senza data'}</div></div></div>
      <button class="btn btn-icon btn-ghost" onclick="CourseDetail.removeLesson('${c.id}','${l.id}')">🗑</button></div>`).join('')}
  </div>

  <!-- MATERIALI -->
  <div class="tab-panel ${State.courseTab === 'materials' ? 'active' : ''}">
    <div class="section-head"><h3>Materiali</h3><button class="btn btn-sm btn-accent" onclick="CourseDetail.addMaterial('${c.id}')">+ Aggiungi materiale</button></div>
    ${c.materials.length === 0 ? `<div class="empty-state">Nessun materiale caricato.</div>` : c.materials.map(m => `
      <div class="list-item"><div class="l"><span>${m.type === 'file' ? '📎' : '🔗'}</span><div><div class="t">${esc(m.title)}</div><div class="m">${m.type === 'file' ? 'file caricato' : esc(m.url || '')}</div></div></div>
      <div style="display:flex;gap:6px;">${m.type === 'link' && m.url ? `<a class="btn btn-sm btn-ghost" href="${esc(m.url)}" target="_blank" rel="noopener">Apri</a>` : ''}<button class="btn btn-icon btn-ghost" onclick="CourseDetail.removeMaterial('${c.id}','${m.id}')">🗑</button></div></div>`).join('')}
  </div>

  <!-- TASK -->
  <div class="tab-panel ${State.courseTab === 'tasks' ? 'active' : ''}">
    <div class="section-head"><h3>Task del corso</h3><button class="btn btn-sm btn-accent" onclick="Planner.openCreate('${c.id}')">+ Nuova task</button></div>
    ${cTasks.length === 0 ? `<div class="empty-state">Nessuna task per questo corso.</div>` : cTasks.map(t => Planner.taskRowHtml(t)).join('')}
  </div>

  <!-- MEMBRI -->
  <div class="tab-panel ${State.courseTab === 'members' ? 'active' : ''}">
    <div class="section-head"><h3>Membri invitati</h3><button class="btn btn-sm btn-accent" onclick="CourseDetail.addMember('${c.id}')">+ Invita membro</button></div>
    ${c.members.length === 0 ? `<div class="empty-state">Nessun membro invitato. Il corso è visibile solo a te.</div>` : c.members.map(m => `
      <div class="list-item"><div class="l"><div class="avatar" style="background:${c.color}22;">${m.name.slice(0, 1).toUpperCase()}</div><div><div class="t">${esc(m.name)}</div><div class="m">${esc(m.email)}</div></div></div>
      <span class="pill" style="background:var(--forest-light);color:var(--forest-dark);">Invitato</span></div>`).join('')}
  </div>

  <!-- CHAT -->
  <div class="tab-panel ${State.courseTab === 'chat' ? 'active' : ''}">
    <div class="card" style="padding:18px;">
      <div class="chat-box" id="chat-box">
        ${c.comments.length === 0 ? `<div class="empty-state" style="padding:20px;">Nessun messaggio ancora. Avvia la conversazione del corso.</div>` : c.comments.map(m => `
          <div class="msg"><div class="avatar" style="width:28px;height:28px;font-size:12px;background:${c.color}22;">${m.author.slice(0, 1).toUpperCase()}</div>
          <div><div class="author">${esc(m.author)}</div><div class="bubble">${esc(m.text)}</div><div class="time">${new Date(m.ts).toLocaleString('it-IT')}</div></div></div>`).join('')}
      </div>
      <div class="chat-input"><input type="text" id="chat-input" placeholder="Scrivi un messaggio al corso…" onkeydown="if(event.key==='Enter'){CourseDetail.sendMsg('${c.id}')}"><button class="btn btn-primary" onclick="CourseDetail.sendMsg('${c.id}')">Invia</button></div>
    </div>
  </div>`;
}

export const CourseDetail = {

  tab(name){
    State.courseTab = name;
    render();
  },

  /* ---------- lezioni ---------- */
  async addLesson(courseId){
    const title = prompt('Titolo della lezione:');
    if(!title) return;
    const date = prompt('Data (AAAA-MM-GG), lascia vuoto se non nota:') || '';
    const c = State.data.courses.find(c => c.id === courseId);
    c.lessons.push({ id: uid(), title, date });
    await persist();
    render();
  },

  async removeLesson(courseId, lessonId){
    const c = State.data.courses.find(c => c.id === courseId);
    c.lessons = c.lessons.filter(l => l.id !== lessonId);
    await persist();
    render();
  },

  /* ---------- materiali ---------- */
  addMaterial(courseId){
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>Aggiungi materiale</h3>
      <form onsubmit="return CourseDetail.saveMaterial(event,'${courseId}')">
        <div class="field"><label>Titolo</label><input type="text" id="mat-title" required placeholder="Es. Slide - Lezione 3"></div>
        <div class="field"><label>Link (URL)</label><input type="text" id="mat-url" placeholder="https://…"></div>
        <div class="field"><label>Oppure carica un file (PDF/immagine, max 500KB)</label><input type="file" id="mat-file" accept=".pdf,image/*"></div>
        <div class="err" id="mat-err"></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Annulla</button><button class="btn btn-primary" type="submit">Salva</button></div>
      </form>`);
  },

  async saveMaterial(e, courseId){
    e.preventDefault();
    const title = document.getElementById('mat-title').value.trim();
    const url   = document.getElementById('mat-url').value.trim();
    const fileInput = document.getElementById('mat-file');
    const c = State.data.courses.find(c => c.id === courseId);

    if(fileInput.files[0]){
      const file = fileInput.files[0];
      if(file.size > 500 * 1024){
        document.getElementById('mat-err').textContent = 'File troppo grande (max 500KB in questa demo). Usa un link.';
        return false;
      }
      const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
      c.materials.push({ id: uid(), title, type: 'file', dataUrl });
    } else if(url){
      c.materials.push({ id: uid(), title, type: 'link', url });
    } else {
      document.getElementById('mat-err').textContent = 'Inserisci un link o carica un file.';
      return false;
    }

    await persist();
    closeModal();
    render();
    toast('Materiale aggiunto', 'success');
    return false;
  },

  async removeMaterial(courseId, matId){
    const c = State.data.courses.find(c => c.id === courseId);
    c.materials = c.materials.filter(m => m.id !== matId);
    await persist();
    render();
  },

  /* ---------- membri ---------- */
  addMember(courseId){
    openModal(`
      <button class="modal-close" onclick="closeModal()">✕</button>
      <h3>Invita membro al corso</h3>
      <form onsubmit="return CourseDetail.saveMember(event,'${courseId}')">
        <div class="field"><label>Nome</label><input type="text" id="mem-name" required></div>
        <div class="field"><label>Email</label><input type="email" id="mem-email" required></div>
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Annulla</button><button class="btn btn-primary" type="submit">Invita</button></div>
      </form>`);
  },

  async saveMember(e, courseId){
    e.preventDefault();
    const name  = document.getElementById('mem-name').value.trim();
    const email = document.getElementById('mem-email').value.trim();
    const c = State.data.courses.find(c => c.id === courseId);
    c.members.push({ id: uid(), name, email });
    await persist();
    closeModal();
    render();
    toast('Membro invitato', 'success');
    return false;
  },

  /* ---------- chat ---------- */
  async sendMsg(courseId){
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;

    const c = State.data.courses.find(c => c.id === courseId);
    c.comments.push({ id: uid(), author: State.currentUser.name, text, ts: Date.now() });
    await persist();
    render();
    setTimeout(() => { const box = document.getElementById('chat-box'); if(box) box.scrollTop = box.scrollHeight; }, 0);
  }
};
