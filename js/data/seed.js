/* ==========================================================================
   data/seed.js — dati di esempio per l'account demo
   ========================================================================== */

import { uid } from '../core/utils.js';

export function seedDemoData(){
  const c1 = {
    id: uid(), name: 'Analisi Matematica 1', color: '#1B2A4A', icon: '🧮',
    lessons: [
      { id: uid(), title: 'Limiti e continuità', date: '2026-09-02' },
      { id: uid(), title: 'Derivate', date: '2026-09-09' }
    ],
    materials: [{ id: uid(), title: 'Slide - Limiti', type: 'link', url: 'https://example.com/limiti.pdf' }],
    members: [{ id: uid(), name: 'Giulia Bianchi', email: 'giulia@studenti.it' }],
    comments: [{ id: uid(), author: 'Giulia Bianchi', text: 'Qualcuno ha gli appunti della lezione di giovedì?', ts: Date.now() - 86400000 }]
  };

  const c2 = {
    id: uid(), name: 'Basi di Dati', color: '#2F5233', icon: '💻',
    lessons: [{ id: uid(), title: 'Modello relazionale', date: '2026-09-05' }],
    materials: [], members: [], comments: []
  };

  const iso = (d) => d.toISOString().slice(0, 10);
  /** Data a N giorni da oggi, in formato ISO. */
  const t = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return iso(d); };

  return {
    courses: [c1, c2],
    tasks: [
      { id: uid(), courseId: c1.id, title: 'Esercizi su limiti notevoli', priority: 'alta',  dueDate: t(1),  completed: false },
      { id: uid(), courseId: c1.id, title: 'Ripasso teoria derivate',     priority: 'media', dueDate: t(4),  completed: false },
      { id: uid(), courseId: c2.id, title: 'Schema ER progetto',          priority: 'alta',  dueDate: t(2),  completed: false },
      { id: uid(), courseId: c2.id, title: 'Lettura capitolo 3',          priority: 'bassa', dueDate: t(-2), completed: true  }
    ],
    pomodoroSessions: [
      { id: uid(), date: t(-1), minutes: 75, courseId: c1.id },
      { id: uid(), date: t(-2), minutes: 50, courseId: c2.id },
      { id: uid(), date: t(-3), minutes: 25, courseId: c1.id },
      { id: uid(), date: t(0),  minutes: 25, courseId: c1.id }
    ],
    pomodoroSettings: { work: 25, short: 5, long: 15, cycle: 4 }
  };
}
