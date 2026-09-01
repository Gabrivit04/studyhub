/* ==========================================================================
   data/persist.js — salvataggio dei dati dell'utente corrente
   ========================================================================== */

import { State } from '../core/state.js';
import { Store } from '../core/store.js';
import { refreshSession } from '../auth/session.js';

export async function persist(){
  if(!State.currentUser) return;
  await Store.set('studyhub-data:' + State.currentUser.id, State.data);
  refreshSession();
}
