# StudyHub

Applicazione web per organizzare corsi, materiali, scadenze e sessioni di studio
con il metodo Pomodoro. Nessuna dipendenza da installare, nessun passo di build:
solo HTML, CSS e moduli ES.

## Avvio in locale

I moduli ES non funzionano aprendo `index.html` con doppio click (`file://`):
serve un piccolo server statico.

```bash
# Python (già presente su macOS e Linux)
python3 -m http.server 8000

# oppure Node
npx serve .
```

Poi apri <http://localhost:8000>.

Nella schermata di accesso il pulsante **"Prova l'account demo"** crea un utente
con corsi, task e statistiche di esempio.

## Pubblicazione su GitHub Pages

1. Carica il progetto su un repository GitHub.
2. *Settings → Pages → Build and deployment → Source: Deploy from a branch*.
3. Scegli il branch `main` e la cartella `/ (root)`, poi **Save**.

## Struttura del progetto

```
studyhub/
├── index.html              # solo markup: guscio dell'app, form, modale
├── css/
│   ├── base.css            # variabili di tema, reset, tipografia, utility
│   ├── components.css      # bottoni, card, form, avatar, toast, modale
│   ├── layout.css          # sidebar, topbar, area contenuto
│   ├── auth.css            # schermata di accesso
│   └── views/
│       ├── dashboard.css
│       ├── courses.css     # griglia corsi + dettaglio corso
│       ├── planner.css     # task e calendario
│       ├── timer.css
│       └── profile.css
└── js/
    ├── main.js             # entry point: espone i globali, avvia l'app
    ├── core/
    │   ├── constants.js    # avatar, colori e icone disponibili
    │   ├── state.js        # stato applicativo condiviso
    │   ├── store.js        # livello di persistenza
    │   ├── utils.js        # uid, esc, formattazione date…
    │   ├── toast.js        # notifiche temporanee
    │   ├── modal.js        # finestra modale generica
    │   ├── ui.js           # tab di autenticazione, blocco utente
    │   └── router.js       # navigazione tra le viste
    ├── auth/
    │   ├── session.js      # hashing, token, refresh
    │   └── auth.js         # login, registrazione, reset, logout
    ├── data/
    │   ├── boot.js         # avvio e caricamento dati utente
    │   ├── persist.js      # salvataggio
    │   └── seed.js         # dati demo
    └── views/
        ├── render.js       # dispatcher delle viste
        ├── dashboard.js
        ├── charts.js       # grafici Chart.js
        ├── courses.js
        ├── courseDetail.js
        ├── planner.js
        ├── calendar.js
        ├── timer.js
        └── profile.js
```

## Come sono collegati i pezzi

- **`index.html`** contiene solo il markup statico. Il contenuto delle pagine
  viene generato da `js/views/render.js` dentro `#content`.
- **`core/state.js`** è l'unica fonte di verità: ogni modulo lo importa e lo
  modifica; le viste si limitano a leggerlo e a ridisegnare.
- Gli **handler inline** (`onclick="Router.go('courses')"`) sono rimasti come
  nella versione originale. Poiché i moduli ES hanno uno scope proprio,
  `js/main.js` espone esplicitamente su `window` gli oggetti che servono
  (`Router`, `Auth`, `Courses`, `CourseDetail`, `Planner`, `CalendarUI`,
  `Timer`, `Profile`, `UI`, `openModal`, `closeModal`).
- **Chart.js** arriva da CDN e resta un globale (`Chart`), usato solo da
  `js/views/charts.js`.

## Note sui limiti attuali

Questa è una demo interamente lato client:

- `core/store.js` usa `window.storage` se l'ambiente lo espone; altrove i dati
  restano solo in memoria e si perdono al ricaricamento della pagina. Per
  renderli persistenti basta aggiungere un fallback su `localStorage`.
- `auth/session.js` usa un hash giocattolo e un token non firmato: va bene per
  una demo, non per un'applicazione reale. In produzione servono autenticazione
  lato server, hashing con bcrypt/argon2 e JWT firmati.
- Chat e membri dei corsi sono locali al singolo browser: non c'è backend né
  sincronizzazione tra utenti.
