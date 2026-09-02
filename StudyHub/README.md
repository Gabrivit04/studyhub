# StudyHub

Web app per la gestione intelligente dello studio (corsi, task, calendario,
timer Pomodoro, dashboard analitica). Vedi `StudyHub_Relazione_Tecnica.docx`
per l'analisi dei requisiti (FURPS+), i diagrammi UML e le scelte
architetturali.

## Struttura del repository

```
.
├── studyhub.html                    # applicazione (HTML/CSS/JS, nessuna build richiesta)
├── Dockerfile                       # containerizzazione dell'app
├── docker-compose.yml               # avvio rapido del container
├── nginx.conf                       # configurazione del web server nel container
├── .dockerignore
├── .gitignore
└── StudyHub_Relazione_Tecnica.docx  # relazione tecnica di progetto
```

## Esecuzione senza Docker

Basta aprire `studyhub.html` in un browser: è un'app statica, non richiede
un server né un'installazione.

## Esecuzione con Docker

Build e avvio con Docker Compose (metodo consigliato):

```bash
docker compose up --build
```

L'app sarà disponibile su <http://localhost:8080>.

In alternativa, senza Compose:

```bash
docker build -t studyhub .
docker run -p 8080:80 studyhub
```

Per fermare il container (versione Compose):

```bash
docker compose down
```

## Versionamento con Git

Il progetto è versionato con Git. Per clonare e contribuire:

```bash
git clone <url-del-repository>
cd studyhub
git checkout -b nome-feature
# ... modifiche ...
git add .
git commit -m "Descrizione sintetica della modifica"
git push origin nome-feature
```

Convenzioni adottate nel repository:
- commit atomici e descrittivi, uno per ogni modifica logica (non un unico
  commit finale);
- branch dedicati per funzionalità rilevanti, uniti su `main` tramite merge
  o pull request;
- il file `.gitignore` esclude file generati e specifici dell'editor/SO,
  non versionati.

## Note sulla containerizzazione

StudyHub è un'applicazione interamente front-end (HTML/CSS/JavaScript in un
unico file, senza backend né build step): per questo la containerizzazione
si limita a impacchettare il file statico dietro un web server minimale
(Nginx), che restituisce l'app a chi la richiede via HTTP. Questo approccio
rende l'esecuzione riproducibile su qualsiasi macchina dotata di Docker,
indipendentemente dal sistema operativo o dalle dipendenze installate
localmente.
