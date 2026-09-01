/* ==========================================================================
   auth/session.js — hashing password e gestione del token di sessione

   ATTENZIONE: simpleHash è una demo, NON è una funzione di hashing sicura.
   In produzione servono bcrypt/argon2 lato server e un vero JWT firmato.
   ========================================================================== */

import { State } from '../core/state.js';
import { Store } from '../core/store.js';

export function simpleHash(str){
  let h = 0;
  for(let i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
  return 'h' + h.toString(16);
}

/** Crea una sessione "JWT-like" valida 24 ore. */
export function makeSession(userId){
  const exp = Date.now() + 1000 * 60 * 60 * 24;
  const payload = { userId, exp, iat: Date.now() };
  return { token: btoa(JSON.stringify(payload)), userId, exp };
}

export function sessionValid(s){
  return s && s.exp > Date.now();
}

/** Rinnovo silenzioso della sessione a ogni attività (refresh token simulato). */
export function refreshSession(){
  if(State.auth.session && sessionValid(State.auth.session)){
    State.auth.session.exp = Date.now() + 1000 * 60 * 60 * 24;
    Store.set('studyhub-auth', State.auth);
  }
}
