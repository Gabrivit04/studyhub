/* ==========================================================================
   views/charts.js — grafici della dashboard (Chart.js, caricato via CDN
   in index.html ed esposto come globale `Chart`)
   ========================================================================== */

import { State } from '../core/state.js';
import { last7Days } from '../core/utils.js';

let chartWeek = null;
let chartDonut = null;

/** Disegna i grafici se i rispettivi canvas sono presenti nel DOM. */
export function initCharts(){

  if(document.getElementById('chart-week')){
    const days = last7Days();
    const minutesByDay = days.map(d =>
      State.data.pomodoroSessions.filter(s => s.date === d.iso).reduce((a, b) => a + b.minutes, 0)
    );
    const labels = days.map(d => d.label);

    if(chartWeek) chartWeek.destroy();
    chartWeek = new Chart(document.getElementById('chart-week'), {
      type: 'bar',
      data: { labels, datasets: [{ data: minutesByDay, backgroundColor: '#E8A33D', borderRadius: 6, maxBarThickness: 34 }] },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 30 }, grid: { color: '#EFEAE0' } }, x: { grid: { display: false } } }
      }
    });
  }

  if(document.getElementById('chart-donut')){
    const done = State.data.tasks.filter(t => t.completed).length;
    const pending = State.data.tasks.length - done;

    if(chartDonut) chartDonut.destroy();
    chartDonut = new Chart(document.getElementById('chart-donut'), {
      type: 'doughnut',
      data: { labels: ['Completate', 'Da fare'], datasets: [{ data: [done, pending || 0], backgroundColor: ['#2F5233', '#E4DFD3'], borderWidth: 0 }] },
      options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }
    });
  }
}
