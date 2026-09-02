# ---------------------------------------------------------------
# StudyHub — Dockerfile
# Containerizza l'app come sito statico servito da Nginx.
# StudyHub è un'app front-end (HTML/CSS/JS in un unico file):
# non richiede un runtime applicativo, quindi basta un web server
# minimale a servire il file. Immagine finale molto leggera (~25 MB).
# ---------------------------------------------------------------

FROM nginx:1.27-alpine

# Rimuove la pagina di benvenuto di default di Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia l'app come index.html della webroot di Nginx
COPY studyhub.html /usr/share/nginx/html/index.html

# Configurazione Nginx minimale (cache-control, compressione)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
