/* ==========================================================================
   views/render.js — dispatcher: sceglie la vista, la inietta in #content
   e lancia gli aggiornamenti che richiedono il DOM già presente
   ========================================================================== */

import { State } from '../core/state.js';
import { dashboardHtml } from './dashboard.js';
import { coursesHtml } from './courses.js';
import { courseDetailHtml } from './courseDetail.js';
import { plannerHtml } from './planner.js';
import { timerHtml, updateTimerDisplay, updateTimerBtn } from './timer.js';
import { profileHtml } from './profile.js';
import { initCharts } from './charts.js';

const VIEWS = {
  dashboard: dashboardHtml,
  courses:   coursesHtml,
  course:    courseDetailHtml,
  planner:   plannerHtml,
  timer:     timerHtml,
  profile:   profileHtml
};

export function render(){
  const view = VIEWS[State.view];
  if(view) document.getElementById('content').innerHTML = view();
  afterRender();
}

/** Passi che richiedono nodi già inseriti nel DOM (canvas dei grafici, timer). */
export function afterRender(){
  initCharts();
  if(document.getElementById('timer-display')){
    updateTimerDisplay();
    updateTimerBtn();
  }
}
