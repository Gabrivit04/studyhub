/* ==========================================================================
   core/toast.js — notifiche temporanee in alto a destra
   ========================================================================== */

/**
 * @param {string} msg  testo della notifica
 * @param {''|'success'|'error'} type
 */
export function toast(msg, type = ''){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
