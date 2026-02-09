# TP3 : Architecture Multi-Services

## Contexte

Vous devez déployer une application web complète avec plusieurs services interconnectés : une API, une base de données, un cache Redis et un reverse proxy. Ce TP évalue votre capacité à orchestrer des conteneurs avec Docker Compose.

---

## Exercice 1 : Compose basique 

### 1.1 Premier docker-compose.yml 

Créez un fichier `docker-compose.yml` qui déploie :

**Service 1 - Base de données PostgreSQL :**

- Image : `postgres:15-alpine`
- Nom du conteneur : `eval-db`
- Variables d'environnement :
  - `POSTGRES_USER=evaluser`
  - `POSTGRES_PASSWORD=evalpass`
  - `POSTGRES_DB=evaldb`
- Volume nommé `db-data` monté sur `/var/lib/postgresql/data`

**Service 2 - Adminer (interface DB) :**

- Image : `adminer:latest`
- Nom du conteneur : `eval-adminer`
- Port 8080 exposé
- Dépend de la base de données

### 1.2 Validation 

- Lancez la stack avec `docker compose up -d`
- Vérifiez que les deux services sont running
- Connectez-vous à Adminer (http://localhost:8080)
- Créez une table `users` avec les colonnes `id`, `name`, `email`

**Questions :**

- Comment voir les logs des deux services en temps réel ?
- Comment accéder au CLI PostgreSQL depuis l'extérieur ?

---

## Exercice 2 : Application multi-tiers 

### 2.1 Architecture complète 

Étendez le `docker-compose.yml` pour ajouter :

**Service 3 - API Node.js :**

Créez le fichier `api/app.js` :

```javascript
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'evaluser',
  password: process.env.DB_PASSWORD || 'evalpass',
  database: process.env.DB_NAME || 'evaldb',
  port: 5432
});

// Configuration Redis
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`
});
redisClient.connect();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api' });
});

app.get('/api/stats', async (req, res) => {
  // Vérifier le cache
  const cached = await redisClient.get('stats');
  if (cached) {
    return res.json({ ...JSON.parse(cached), source: 'cache' });
  }

  // Sinon, requête DB
  const result = await pool.query('SELECT COUNT(*) FROM users');
  const stats = { userCount: result.rows[0].count, timestamp: new Date() };

  // Mettre en cache 60 secondes
  await redisClient.setEx('stats', 60, JSON.stringify(stats));
  res.json({ ...stats, source: 'database' });
});

app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [name, email]
  );
  await redisClient.del('stats'); // Invalider le cache
  res.status(201).json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
```

Créez `api/package.json` :

```json
{
  "name": "eval-api",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10"
  }
}
```

**Spécifications du service API :**
- Build depuis `./api`
- Variables d'environnement pour la connexion DB et Redis
- Port 3000 exposé
- Dépend de `db` et `redis`
- Healthcheck sur `/health`

**Service 4 - Redis :**
- Image : `redis:7-alpine`
- Volume nommé pour la persistance

### 2.2 Réseau personnalisé 

Configurez un réseau personnalisé `eval-network` de type bridge et assignez tous les services à ce réseau.

**Question :** Quel est l'avantage d'un réseau personnalisé par rapport au réseau par défaut ?

### 2.3 Script d'initialisation DB

Créez un script SQL `db/init.sql` qui sera exécuté au premier démarrage :

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com'),
    ('Charlie', 'charlie@example.com');
```

Montez ce fichier dans le conteneur PostgreSQL pour qu'il soit exécuté automatiquement.


---

## Exercice 3 : Reverse Proxy Nginx 

### 3.1 Configuration Nginx 

Ajoutez un service Nginx comme reverse proxy :

Créez `nginx/nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html;
        }

        location /api {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /health {
            proxy_pass http://api/health;
        }
    }
}
```

Créez `nginx/index.html` :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Evaluation Docker</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        #result { background: #f5f5f5; padding: 20px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Docker Evaluation App</h1>
        <button onclick="getStats()">Get Stats</button>
        <button onclick="getUsers()">Get Users</button>
        <button onclick="checkHealth()">Health Check</button>
        <div id="result"></div>
    </div>
    <script>
        async function getStats() {
            const res = await fetch('/api/stats');
            document.getElementById('result').innerHTML =
                '<pre>' + JSON.stringify(await res.json(), null, 2) + '</pre>';
        }
        async function getUsers() {
            const res = await fetch('/api/users');
            document.getElementById('result').innerHTML =
                '<pre>' + JSON.stringify(await res.json(), null, 2) + '</pre>';
        }
        async function checkHealth() {
            const res = await fetch('/health');
            document.getElementById('result').innerHTML =
                '<pre>' + JSON.stringify(await res.json(), null, 2) + '</pre>';
        }
    </script>
</body>
</html>
```

**Spécifications du service Nginx :**
- Image : `nginx:alpine`
- Port 80 exposé sur le port 80 de l'hôte
- Monte la configuration et le fichier HTML
- Dépend de l'API

### 3.2 Test complet 

- Relancez toute la stack
- Accédez à http://localhost
- Testez les boutons de l'interface
- Vérifiez que le cache Redis fonctionne (appels répétés à Stats)

**Questions :**

- Comment vérifier que Redis met bien en cache les données ?
- Que se passe-t-il si vous arrêtez le service Redis ?

---

## Exercice 4 : Environnements 

### 4.1 Fichier .env 

Créez un fichier `.env` pour externaliser la configuration :

```env
POSTGRES_USER=evaluser
POSTGRES_PASSWORD=evalpass
POSTGRES_DB=evaldb
API_PORT=3000
```

Modifiez le `docker-compose.yml` pour utiliser ces variables.

### 4.2 Override pour développement

Créez un fichier `docker-compose.override.yml` pour le développement :
- Montez le code source de l'API en volume (hot reload)
- Exposez le port PostgreSQL (5432)
- Ajoutez des labels pour identifier l'environnement

---

## Structure finale attendue

```
tp3/
├── docker-compose.yml
├── docker-compose.override.yml
├── .env
├── api/
│   ├── Dockerfile
│   ├── app.js
│   └── package.json
├── db/
│   └── init.sql
├── nginx/
│   ├── nginx.conf
│   └── index.html
└── reponses.md
```

