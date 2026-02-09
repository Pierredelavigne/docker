# TP2 : Dockerfile et Construction d'Images


## Contexte

L'équipe de développement a créé une application web simple. Votre mission est de la conteneuriser en créant des Dockerfiles optimisés et en maîtrisant le processus de build.

---

## Exercice 1 : Dockerfile basique 

### 1.1 Application Node.js 

Créez un Dockerfile pour une application Node.js avec les spécifications suivantes :

**Fichier `app.js` à créer :**

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    message: 'Hello from Docker!',
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Fichier `package.json` à créer :**

```json
{
  "name": "docker-eval-app",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  }
}
```

**Exigences du Dockerfile :**
- Image de base : `node:18-alpine`
- Répertoire de travail : `/app`
- Copier les fichiers de l'application
- Exposer le port 3000
- Commande de démarrage : `npm start`
```bash
FROM node:18-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

```
### 1.2 Build et test 

- Construisez l'image avec le tag `eval-app:v1`
- Lancez un conteneur sur le port 3001
- Testez avec `curl http://localhost:3001`
- Notez la taille de l'image
```bash
docker build -t eval-app:v1 .
docker run --rm -p 3001:3000 --name eval-app-v1 eval-app:v1
curl http://localhost:3001
docker images eval-app:v1
#taille de l'image: 127MB
```
**Questions :**
- Combien de layers l'image contient-elle ?
```bash
docker image inspect eval-app:v1 -f '{{len .RootFS.Layers}}'
6
```
- Quelle commande permet de voir l'historique des layers ?
```bash
docker history eval-app:v1
```

---

## Exercice 2 : Optimisation du Dockerfile 

### 2.1 Cache des dépendances 

Modifiez le Dockerfile pour optimiser le cache de build :
- Copiez d'abord `package.json` seul
- Installez les dépendances avec `npm install`
- Puis copiez le reste du code
```bash
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

```
**Question :** Expliquez pourquoi cette approche est plus efficace.
```bash
Docker réutilise le cache de la couche npm install tant que package.json/package-lock.json ne changent pas. Si tu modifies que le app.js, il ne réinstalle pas les dependances.
```

### 2.2 Multi-stage build 

Créez un nouveau Dockerfile utilisant un build multi-stage pour une application avec dépendances de développement :

**Modifiez `package.json` :**

```json
{
  "name": "docker-eval-app",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "echo 'Tests passed'"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

**Exigences :**
- Stage 1 (`builder`) : Installation de toutes les dépendances et tests
- Stage 2 (`production`) : Uniquement les dépendances de production
```bash
# builder 
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm test

# production 
FROM node:18-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/app.js ./app.js

EXPOSE 3000
CMD ["npm", "start"]
```
Construisez avec le tag `eval-app:v2` et comparez la taille avec v1.
```bash
docker build -t eval-app:v2 -f Dockerfile.multi .
docker images
eval-app:v1 => 127MB
eval-app:v2 => 130MB
```
### 2.3 Utilisateur non-root 

Modifiez le Dockerfile pour :
- Créer un utilisateur `appuser` avec UID 1001
- Exécuter l'application avec cet utilisateur
```bash
# builder 
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm test

# production 
FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 appuser \
 && adduser -D -u 1001 -G appuser appuser

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/app.js ./app.js

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 3000
CMD ["npm", "start"]
```
```bash
docker rmi eval-app:v2 #pour pouvoir reconstruire l'image et lancer le conteneur sécurisé.
docker build -t eval-app:v2 -f Dockerfile.multi .
docker run --rm -it --name eval-app-secure eval-app:v2 sh
# dedans faire:
/app $ id
uid=1001(appuser) gid=1001(appuser) groups=1001(appuser),1001(appuser)
/app $ exit
```

**Question :** Pourquoi est-ce important pour la sécurité ?
```bash
Si l’app est compromise, un process root dans le conteneur peut plus facilement impacter le système (droits, fichiers montés, escalade via mauvaises configs). En non-root, on réduit l’impact.
```
---

## Exercice 3 : Arguments et variables 

### 3.1 ARG et ENV 

Créez un Dockerfile paramétrable avec :
- `ARG NODE_VERSION=18` pour la version de Node
- `ENV APP_ENV=production` pour l'environnement
- `ENV PORT=3000` pour le port

```bash
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

ENV APP_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

Modifiez `app.js` pour afficher l'environnement :

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    message: 'Hello from Docker!',
    environment: process.env.APP_ENV,
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.APP_ENV} mode`);
});
```

### 3.2 Build avec arguments 

- Construisez l'image avec `NODE_VERSION=20` : tag `eval-app:v3-node20`
- Lancez un conteneur en surchargeant `APP_ENV=development`
- Vérifiez que la variable est bien prise en compte
```bash
docker build --build-arg NODE_VERSION=20 -t eval-app:v3-node20 .
docker run --rm -p 3001:3000 -e APP_ENV=development --name eval-app-v3 eval-app:v3-node20
curl http://localhost:3001
```
**Questions :**
- Quelle est la différence entre ARG et ENV ?
```bash
ARG : variable disponible uniquement au build.

ENV : variable disponible au runtime dans le conteneur
```
- Comment passer une variable d'environnement au `docker run` ?
```bash
docker run -e APP_ENV=development eval-app:v3-node20
```

---

## Exercice 4 : Application Python 

### 4.1 Dockerfile Python 

Créez un Dockerfile pour l'application Flask suivante :

**Fichier `app.py` :**

```python
from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from Python Docker!',
        'hostname': socket.gethostname(),
        'environment': os.getenv('FLASK_ENV', 'production')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**Fichier `requirements.txt` :**

```
flask==3.0.0
gunicorn==21.2.0
```

**Exigences :**

- Image de base : `python:3.11-slim`
- Utiliser gunicorn en production : `gunicorn --bind 0.0.0.0:5000 app:app`
- Optimisation du cache pip
```bash
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```
### 4.2 HEALTHCHECK 

Ajoutez une instruction HEALTHCHECK au Dockerfile :
- Intervalle : 30 secondes
- Timeout : 10 secondes
- Retries : 3
- Endpoint : `/health`

Construisez avec le tag `eval-flask:v1` et vérifiez le healthcheck.
```bash
docker build -t eval-flask:v1 .
docker run -d -p 5000:5000 --name eval-flask eval-flask:v1

curl http://localhost:5000/
{"environment":"production","hostname":"0bc05b6f6090","message":"Hello from Python Docker!"}

curl http://localhost:5000/health
{"status":"healthy"}

docker ps
0bc05b6f6090   eval-flask:v1   "gunicorn --bind 0.0…"   27 seconds ago   Up 26 seconds (health: starting)   0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp   eval-flask

docker inspect -f='{{json .State.Health}}' eval-flask
{"Status":"healthy","FailingStreak":0,"Log":[{"Start":"2026-02-09T14:19:09.660300349+01:00","End":"2026-02-09T14:19:09.70063274+01:00","ExitCode":0,"Output":"{\"status\":\"healthy\"}\n"},{"Start":"2026-02-09T14:19:39.701624401+01:00","End":"2026-02-09T14:19:39.784560988+01:00","ExitCode":0,"Output":"{\"status\":\"healthy\"}\n"},{"Start":"2026-02-09T14:20:09.785790585+01:00","End":"2026-02-09T14:20:10.321622742+01:00","ExitCode":0,"Output":"{\"status\":\"healthy\"}\n"},{"Start":"2026-02-09T14:20:40.323262276+01:00","End":"2026-02-09T14:20:40.402557739+01:00","ExitCode":0,"Output":"{\"status\":\"healthy\"}\n"},{"Start":"2026-02-09T14:21:10.403566375+01:00","End":"2026-02-09T14:21:10.446938946+01:00","ExitCode":0,"Output":"{\"status\":\"healthy\"}\n"}]}
```
---

## Livrables attendus

```
tp2/
├── node-app/
│   ├── Dockerfile
│   ├── Dockerfile.multistage
│   ├── app.js
│   └── package.json
├── python-app/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
└── reponses.md
```

