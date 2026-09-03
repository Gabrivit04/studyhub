/* ==========================================================================
   core/store.js — livello di persistenza

   Usa window.storage se l'ambiente lo espone; in un browser normale ricade
   su localStorage, così i dati sopravvivono al ricaricamento della pagina.
   ========================================================================== */

export const Store = {
  mem: {},

  async get(key){
    try{
      const r = await window.storage.get(key, false);
      return r ? JSON.parse(r.value) : null;
    }catch(e){
      try{
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }catch(e2){
        return this.mem[key] ?? null;
      }
    }
  },

  async set(key, value){
    this.mem[key] = value;
    try{
      await window.storage.set(key, JSON.stringify(value), false);
    }catch(e){
      try{
        localStorage.setItem(key, JSON.stringify(value));
      }catch(e2){
        console.warn('storage non disponibile, dati solo in memoria', e2);
      }
    }
  }
};
