/* ==========================================================================
   core/modal.js — finestra modale generica
   ========================================================================== */

export function openModal(html){
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

export function closeModal(){
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

/** Chiude la modale al click sullo sfondo. Da chiamare una volta all'avvio. */
export function initModal(){
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if(e.target.id === 'modal-overlay') closeModal();
  });
}
