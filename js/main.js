/* ==========================================================================
   main.js — punto di ingresso dell'applicazione

   I moduli ES hanno uno scope proprio, mentre gli handler inline nell'HTML
   (onclick="Router.go(…)") cercano i simboli su window: qui li esponiamo
   esplicitamente, poi colleghiamo gli eventi globali e avviamo l'app.
   ========================================================================== */

import { State } from './core/state.js';
import { UI } from './core/ui.js';
import { openModal, closeModal, initModal } from './core/modal.js';
import { Router, initNav } from './core/router.js';
import { Auth } from './auth/auth.js';
import { Boot } from './data/boot.js';
import { Courses } from './views/courses.js';
import { CourseDetail } from './views/courseDetail.js';
import { Planner } from './views/planner.js';
import { CalendarUI } from './views/calendar.js';
import { Timer } from './views/timer.js';
import { Profile } from './views/profile.js';

Object.assign(window, {
  State, UI, Router, Auth, Boot,
  Courses, CourseDetail, Planner, CalendarUI, Timer, Profile,
  openModal, closeModal
});

initModal();
initNav();
Boot.init();
