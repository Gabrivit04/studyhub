/* ==========================================================================
   core/store.js — livello di persistenza

   Usa window.storage se l'ambiente lo espone; altrimenti ricade su una
   copia in memoria (i dati vivono solo per la durata della pagina).
   ========================================================================== */

export const Store = {
  mem: {},

  async get(key){
    try{
      const r = await window.storage.get(key, false);
      return r ? JSON.parse(r.value) : null;
    }catch(e){
      return this.mem[key] ?? null;
    }
  },

  async set(key, value){
    this.mem[key] = value;
    try{
      await window.storage.set(key, JSON.stringify(value), false);
    }catch(e){
      console.warn('storage set failed, kept in memory only', e);
    }
  }
};
