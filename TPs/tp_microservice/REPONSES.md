# TP Docker — Application microservices

## Objectif

Dockeriser et orchestrer une application **microservices** à partir d’un **code applicatif entièrement fourni**, en utilisant **Docker** et **Docker Compose**.

L’application comprend :

* 2 microservices backend
* 1 base de données
* 1 gateway (reverse proxy)
* 1 frontend web

---

## Structure fournie

```
tp-microservices-docker/
│
├── gateway/
│   └── nginx.conf
│
├── infra/
│   └── postgres/
│       └── init.sql
│
├── services/
│   ├── catalog-service/
│   │   ├── package.json
│   │   └── server.js
│   │
│   └── order-service/
│       ├── package.json
│       ├── server.js
│       └── db.js
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── api/http.js
│
└── .env.example
```

---

## Contraintes

* **Un seul port exposé sur l’hôte** : `8080` (gateway)
* Les services et la base de données ne sont accessibles **que via Docker**
* Le frontend consomme les APIs **via le gateway**
* Chaque service expose `/health`

---

## Fonctionnel attendu

* `catalog-service`

  * `GET /products`

* `order-service`

  * `POST /orders`
  * `GET /orders`

* Frontend

  * Liste des produits
  * Création de commandes
  * Liste des commandes

---

## Travail demandé


1. Créer les **Dockerfile** :

   * catalog-service
```bash
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund


COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]

```
   * order-service
```bash
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund


COPY . .

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]

```
   * frontend
```bash
# Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund


COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
```
   * gateway
```bash
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080

```

1. Créer le fichier **`docker-compose.yml`** :

   * réseau
   * volumes
   * variables d’environnement
   * dépendances et healthchecks
   
2. Lancer l’application et vérifier son fonctionnement via :

   * `http://localhost:8080/ui/`
   * des requêtes `curl` ou postman
```bash
curl -i http://localhost:8080/health
curl -s http://localhost:8080/catalog/products
curl -s http://localhost:8080/orders/orders
```
3. Arrêter et nettoyer l’environnement Docker

```bash
docker compose down
docker compose down -v --remove-orphans

```

---

## Résultat attendu

L’application est accessible via :

```
http://localhost:8080/ui/
```

Et l’environnement est **entièrement reproductible** via Docker Compose.
