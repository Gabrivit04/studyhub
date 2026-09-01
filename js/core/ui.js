/* ==========================================================================
   core/ui.js — pezzi di interfaccia che non appartengono a una singola vista:
   tab della schermata di autenticazione e blocco utente nel guscio dell'app
   ========================================================================== */

import { State } from './state.js';

export const UI = {

  /** @param {'login'|'register'|'forgot'|'reset'} which */
  switchAuthTab(which){
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('tab-login-btn').classList.remove('active');
    document.getElementById('tab-register-btn').classList.remove('active');

    if(which === 'login'){
      document.getElementById('form-login').classList.add('active');
      document.getElementById('tab-login-btn').classList.add('active');
    } else if(which === 'register'){
      document.getElementById('form-register').classList.add('active');
      document.getElementById('tab-register-btn').classList.add('active');
    } else if(which === 'forgot'){
      document.getElementById('form-forgot').classList.add('active');
    } else if(which === 'reset'){
      document.getElementById('form-reset').classList.add('active');
    }
  },

  /** Aggiorna avatar, nome ed email in sidebar e topbar. */
  renderShellUser(){
    const u = State.currentUser;
    document.getElementById('sb-avatar').textContent = u.avatarEmoji;
    document.getElementById('sb-avatar').style.background = u.avatarColor + '22';
    document.getElementById('tb-avatar').textContent = u.avatarEmoji;
    document.getElementById('tb-avatar').style.background = u.avatarColor + '22';
    document.getElementById('sb-name').textContent = u.name;
    document.getElementById('sb-email').textContent = u.email;
  }
};
