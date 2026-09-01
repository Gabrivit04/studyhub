/* ==========================================================================
   core/router.js — navigazione tra le viste e aggiornamento della topbar
   ========================================================================== */

import { State } from './state.js';
import { render } from '../views/render.js';

const TITLES = {
  dashboard: ['Dashboard', 'Il tuo riepilogo di studio'],
  courses:   ['Corsi', 'Gestisci corsi, lezioni e materiali'],
  planner:   ['Pianificazione', 'Task, priorità e calendario'],
  timer:     ['Timer di studio', 'Metodo Pomodoro'],
  profile:   ['Profilo', 'Gestisci il tuo account'],
  course:    ['', '']
};

export const Router = {
  /**
   * @param {'dashboard'|'courses'|'course'|'planner'|'timer'|'profile'} view
   * @param {string} [param] id del corso quando view === 'course'
   */
  go(view, param){
    State.view = view;
    if(view === 'course') State.currentCourseId = param;

    document.querySelectorAll('.nav-item').forEach(n =>
      n.classList.toggle('active', n.dataset.view === view || (view === 'course' && n.dataset.view === 'courses'))
    );

    if(view !== 'course'){
      document.getElementById('tb-title').textContent = TITLES[view][0];
      document.getElementById('tb-sub').textContent = TITLES[view][1];
    }

    render();
  }
};

/** Collega i pulsanti della sidebar al router. Da chiamare una volta all'avvio. */
export function initNav(){
  document.querySelectorAll('.nav-item').forEach(n =>
    n.addEventListener('click', () => Router.go(n.dataset.view))
  );
}
