/* ==========================================================================
   data/boot.js — avvio dell'app: ripristino sessione e caricamento dati
   ========================================================================== */

import { State } from '../core/state.js';
import { Store } from '../core/store.js';
import { UI } from '../core/ui.js';
import { Router } from '../core/router.js';
import { sessionValid } from '../auth/session.js';
import { seedDemoData } from './seed.js';
import { resetTimerFromSettings } from '../views/timer.js';

const DEFAULT_POMODORO = { work: 25, short: 5, long: 15, cycle: 4 };

export const Boot = {

  /** Punto d'ingresso: sessione valida → app, altrimenti schermata di login. */
  async init(){
    State.auth = (await Store.get('studyhub-auth')) || { users: [], session: null };

    if(State.auth.session && sessionValid(State.auth.session)){
      const user = State.auth.users.find(u => u.id === State.auth.session.userId);
      if(user){
        await this.loginAs(user);
        document.getElementById('loading').classList.add('hidden');
        return;
      }
    }

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('auth-view').classList.remove('hidden');
  },

  /**
   * Carica i dati dell'utente e mostra il guscio dell'app.
   * @param {object} user
   * @param {boolean} [seedDemo] popola dati di esempio al primo accesso demo
   */
  async loginAs(user, seedDemo){
    State.currentUser = user;

    let data = await Store.get('studyhub-data:' + user.id);
    if(!data){
      data = seedDemo
        ? seedDemoData()
        : { courses: [], tasks: [], pomodoroSessions: [], pomodoroSettings: { ...DEFAULT_POMODORO } };
      await Store.set('studyhub-data:' + user.id, data);
    }
    if(!data.pomodoroSettings) data.pomodoroSettings = { ...DEFAULT_POMODORO };

    State.data = data;
    resetTimerFromSettings();

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');

    UI.renderShellUser();
    Router.go('dashboard');
  }
};
