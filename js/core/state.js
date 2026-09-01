/* ==========================================================================
   core/state.js — stato applicativo condiviso (singleton)

   auth   : utenti registrati + sessione corrente
   data   : dati dell'utente loggato {courses, tasks, pomodoroSessions, pomodoroSettings}
   ========================================================================== */

export const State = {
  auth: { users: [], session: null },
  data: null,
  currentUser: null,
  view: 'dashboard',
  currentCourseId: null,
  courseTab: 'lessons',
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  plannerFilter: { course: 'all', status: 'all', sort: 'due' },
  timer: { phase: 'work', remaining: 25 * 60, total: 25 * 60, running: false, interval: null, sessionsDone: 0, linkedCourse: '' }
};
