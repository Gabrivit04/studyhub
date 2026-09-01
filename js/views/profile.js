/* ==========================================================================
   views/profile.js — dati personali, avatar e ripristino dei dati
   ========================================================================== */

import { State } from '../core/state.js';
import { Store } from '../core/store.js';
import { esc } from '../core/utils.js';
import { AVATARS, COURSE_COLORS } from '../core/constants.js';
import { UI } from '../core/ui.js';
import { Router } from '../core/router.js';
import { toast } from '../core/toast.js';
import { persist } from '../data/persist.js';
import { render } from './render.js';
import { resetTimerFromSettings } from './timer.js';

export function profileHtml(){
  const u = State.currentUser;

  return `
  <div class="profile-grid">
    <div class="card" style="padding:24px;">
      <h3 style="margin-top:0;">Il tuo profilo</h3>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div class="avatar" style="width:56px;height:56px;font-size:26px;background:${u.avatarColor}22;">${u.avatarEmoji}</div>
        <div><b>${esc(u.name)}</b><div class="muted" style="font-size:13px;">${esc(u.email)}</div></div>
      </div>
      <div class="field"><label>Emoji avatar</label><div class="avatar-picker">${AVATARS.map(a => `<div class="avatar-opt ${u.avatarEmoji === a ? 'sel' : ''}" onclick="Profile.pickAvatar('${a}')">${a}</div>`).join('')}</div></div>
      <div class="field"><label>Colore avatar</label><div class="color-picker">${COURSE_COLORS.map(c => `<div class="color-opt ${u.avatarColor === c ? 'sel' : ''}" style="background:${c}" onclick="Profile.pickColor('${c}')"></div>`).join('')}</div></div>
    </div>

    <div class="card" style="padding:24px;">
      <h3 style="margin-top:0;">Dati personali</h3>
      <form onsubmit="return Profile.save(event)">
        <div class="field"><label>Nome e cognome</label><input type="text" id="pf-name" value="${esc(u.name)}" required></div>
        <div class="field"><label>Email</label><input type="email" id="pf-email" value="${esc(u.email)}" required></div>
        <button class="btn btn-primary" type="submit">Salva modifiche</button>
      </form>

      <div class="divider"></div>
      <h4>Sicurezza sessione</h4>
      <p class="muted" style="font-size:13px;">Sessione autenticata tramite token con scadenza 24h, rinnovato automaticamente ad ogni attività (refresh token simulato).</p>
      <p class="mono muted" style="font-size:11.5px;word-break:break-all;">Token: ${State.auth.session.token.slice(0, 60)}…</p>

      <div class="divider"></div>
      <button class="btn btn-danger" onclick="Profile.resetData()">Ripristina dati demo</button>
    </div>
  </div>`;
}

/** Riscrive l'utente corrente dentro l'elenco utenti e salva. */
async function syncCurrentUser(){
  const u = State.currentUser;
  const idx = State.auth.users.findIndex(x => x.id === u.id);
  State.auth.users[idx] = u;
  await Store.set('studyhub-auth', State.auth);
}

export const Profile = {

  async pickAvatar(a){
    State.currentUser.avatarEmoji = a;
    await syncCurrentUser();
    UI.renderShellUser();
    render();
  },

  async pickColor(c){
    State.currentUser.avatarColor = c;
    await syncCurrentUser();
    UI.renderShellUser();
    render();
  },

  async save(e){
    e.preventDefault();
    State.currentUser.name  = document.getElementById('pf-name').value.trim();
    State.currentUser.email = document.getElementById('pf-email').value.trim().toLowerCase();
    await syncCurrentUser();
    UI.renderShellUser();
    toast('Profilo aggiornato', 'success');
    return false;
  },

  async resetData(){
    if(!confirm('Questo cancellerà corsi, task e statistiche del tuo account. Continuare?')) return;
    State.data = { courses: [], tasks: [], pomodoroSessions: [], pomodoroSettings: { work: 25, short: 5, long: 15, cycle: 4 } };
    await persist();
    resetTimerFromSettings();
    toast('Dati ripristinati');
    Router.go('dashboard');
  }
};
