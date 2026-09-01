/* ==========================================================================
   auth/auth.js — registrazione, login, account demo, recupero password, logout
   ========================================================================== */

import { State } from '../core/state.js';
import { Store } from '../core/store.js';
import { uid } from '../core/utils.js';
import { AVATARS, COURSE_COLORS } from '../core/constants.js';
import { toast } from '../core/toast.js';
import { UI } from '../core/ui.js';
import { simpleHash, makeSession, refreshSession } from './session.js';
import { Boot } from '../data/boot.js';

export const Auth = {

  async register(e){
    e.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass  = document.getElementById('reg-password').value;
    const errEl = document.getElementById('register-err');
    errEl.textContent = '';

    if(State.auth.users.find(u => u.email === email)){
      errEl.textContent = 'Esiste già un account con questa email.';
      return false;
    }

    const user = {
      id: uid(), name, email,
      passwordHash: simpleHash(pass),
      avatarEmoji: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      avatarColor: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)],
      createdAt: Date.now()
    };
    State.auth.users.push(user);
    State.auth.session = makeSession(user.id);
    await Store.set('studyhub-auth', State.auth);
    await Boot.loginAs(user);
    toast('Account creato — benvenuto su StudyHub!', 'success');
    return false;
  },

  async login(e){
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass  = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-err');
    errEl.textContent = '';

    const user = State.auth.users.find(u => u.email === email);
    if(!user || user.passwordHash !== simpleHash(pass)){
      errEl.textContent = 'Email o password non corrette.';
      return false;
    }

    State.auth.session = makeSession(user.id);
    await Store.set('studyhub-auth', State.auth);
    await Boot.loginAs(user);
    toast('Accesso effettuato', 'success');
    return false;
  },

  async demoLogin(){
    let user = State.auth.users.find(u => u.email === 'demo@studyhub.it');
    if(!user){
      user = {
        id: uid(), name: 'Utente Demo', email: 'demo@studyhub.it',
        passwordHash: simpleHash('demo123'), avatarEmoji: '🦉',
        avatarColor: '#2F5233', createdAt: Date.now()
      };
      State.auth.users.push(user);
      await Store.set('studyhub-auth', State.auth);
    }
    State.auth.session = makeSession(user.id);
    await Store.set('studyhub-auth', State.auth);
    await Boot.loginAs(user, true);
    toast('Accesso demo effettuato', 'success');
  },

  async forgot(e){
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim().toLowerCase();
    const errEl = document.getElementById('forgot-err');
    const user = State.auth.users.find(u => u.email === email);
    if(!user){ errEl.textContent = 'Nessun account trovato con questa email.'; return false; }

    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    user.resetCode = code;
    user.resetExpires = Date.now() + 1000 * 60 * 15;
    await Store.set('studyhub-auth', State.auth);

    document.getElementById('reset-sub').innerHTML =
      `Codice generato per <b>${email}</b> (demo — in produzione arriverebbe via email): ` +
      `<span class="mono" style="background:#FCEFD9;padding:2px 8px;border-radius:6px;">${code}</span>`;
    UI.switchAuthTab('reset');
    State._resetEmail = email;
    return false;
  },

  async resetPassword(e){
    e.preventDefault();
    const code  = document.getElementById('reset-code').value.trim().toUpperCase();
    const pass  = document.getElementById('reset-password').value;
    const errEl = document.getElementById('reset-err');
    const user  = State.auth.users.find(u => u.email === State._resetEmail);

    if(!user || user.resetCode !== code || Date.now() > user.resetExpires){
      errEl.textContent = 'Codice non valido o scaduto.';
      return false;
    }

    user.passwordHash = simpleHash(pass);
    delete user.resetCode;
    delete user.resetExpires;
    await Store.set('studyhub-auth', State.auth);
    toast('Password aggiornata, effettua il login', 'success');
    UI.switchAuthTab('login');
    return false;
  },

  async logout(){
    State.auth.session = null;
    await Store.set('studyhub-auth', State.auth);
    State.currentUser = null;
    if(State.timer.interval) clearInterval(State.timer.interval);
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('auth-view').classList.remove('hidden');
    UI.switchAuthTab('login');
  },

  refresh(){
    refreshSession();
  }
};
