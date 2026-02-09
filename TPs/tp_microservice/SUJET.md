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
   * order-service
   * frontend
   * gateway

2. Créer le fichier **`docker-compose.yml`** :

   * réseau
   * volumes
   * variables d’environnement
   * dépendances et healthchecks
   
3. Lancer l’application et vérifier son fonctionnement via :

   * `http://localhost:8080/ui/`
   * des requêtes `curl` ou postman

4. Arrêter et nettoyer l’environnement Docker

---

## Résultat attendu

L’application est accessible via :

```
http://localhost:8080/ui/
```

Et l’environnement est **entièrement reproductible** via Docker Compose.
