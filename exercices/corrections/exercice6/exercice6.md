## 1) Étape 1 — Déploiement initial avec Nginx

### Créer un volume nommé

```bash
docker volume create web_content
docker volume ls
```


### Créer un conteneur Nginx (vide côté site)

```bash
docker run -d --name web-nginx -p 8080:80 -v web_content:/usr/share/nginx/html nginx:alpine
```

### Copier le site dans le volume (via le conteneur)

On utilise **docker cp**.

```bash
docker cp blog/. web-nginx:/usr/share/nginx/html
```


### Vérification

Navigateur :
[http://localhost:8080](http://localhost:8080)

### Supprimer le conteneur Nginx (le volume reste)

```bash
docker rm -f web-nginx
```

## 2) Étape 2 — Migration vers Apache 


### Lancer Apache avec le même volume

Apache sert par défaut depuis `/usr/local/apache2/htdocs`.

```bash
docker run -d --name web-apache -p 8080:80 -v web_content:/usr/local/apache2/htdocs httpd:2.4-alpine
```

### Vérification

Navigateur :
[http://localhost:8080](http://localhost:8080)

### Supprimer le conteneur Apache (le volume reste)

```bash
docker rm -f web-apache
```

## 3) Étape 3 — Migration vers Caddy

### Lancer Caddy avec le même volume

Caddy sert le contenu statique depuis `/usr/share/caddy`.

```bash
docker run -d --name web-caddy -p 8080:80 -v web_content:/usr/share/caddy caddy:alpine
```

###  Vérification

navigateur :
[http://localhost:8080](http://localhost:8080)