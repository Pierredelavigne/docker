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

### 1.2 Build et test 

- Construisez l'image avec le tag `eval-app:v1`
- Lancez un conteneur sur le port 3001
- Testez avec `curl http://localhost:3001`
- Notez la taille de l'image

**Questions :**
- Combien de layers l'image contient-elle ?
- Quelle commande permet de voir l'historique des layers ?

---

## Exercice 2 : Optimisation du Dockerfile 

### 2.1 Cache des dépendances 

Modifiez le Dockerfile pour optimiser le cache de build :
- Copiez d'abord `package.json` seul
- Installez les dépendances avec `npm install`
- Puis copiez le reste du code

**Question :** Expliquez pourquoi cette approche est plus efficace.

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

Construisez avec le tag `eval-app:v2` et comparez la taille avec v1.

### 2.3 Utilisateur non-root 

Modifiez le Dockerfile pour :
- Créer un utilisateur `appuser` avec UID 1001
- Exécuter l'application avec cet utilisateur

**Question :** Pourquoi est-ce important pour la sécurité ?

---

## Exercice 3 : Arguments et variables 

### 3.1 ARG et ENV 

Créez un Dockerfile paramétrable avec :
- `ARG NODE_VERSION=18` pour la version de Node
- `ENV APP_ENV=production` pour l'environnement
- `ENV PORT=3000` pour le port

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

**Questions :**
- Quelle est la différence entre ARG et ENV ?
- Comment passer une variable d'environnement au `docker run` ?

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

### 4.2 HEALTHCHECK 

Ajoutez une instruction HEALTHCHECK au Dockerfile :
- Intervalle : 30 secondes
- Timeout : 10 secondes
- Retries : 3
- Endpoint : `/health`

Construisez avec le tag `eval-flask:v1` et vérifiez le healthcheck.

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

