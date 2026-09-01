/* ==========================================================================
   core/utils.js — funzioni di supporto senza dipendenze
   ========================================================================== */

/** Identificatore pseudo-univoco per corsi, task, messaggi… */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Escape dell'HTML: da usare su ogni testo inserito dall'utente. */
export function esc(s){
  return (s || '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/** Data ISO (AAAA-MM-GG) → "5 set" in italiano. */
export function fmtDate(iso){
  if(!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day:'numeric', month:'short' });
}

/** Gli ultimi 7 giorni (oggi incluso) come [{iso, label}]. */
export function last7Days(){
  const out = [];
  for(let i = 6; i >= 0; i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ iso: d.toISOString().slice(0, 10), label: ['D','L','M','M','G','V','S'][d.getDay()] });
  }
  return out;
}

/** Peso numerico della priorità, per l'ordinamento. */
export function prioRank(p){
  return { alta:3, media:2, bassa:1 }[p] || 0;
}
