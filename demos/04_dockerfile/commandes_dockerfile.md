# Commandes dockerfile

## FROM

- **Usage:** `FROM <image>[:<tag>] [AS <name>]`
- **Description:** Spécifie l'image de base à partir de laquelle construire l'image Docker.
- **Example:** `FROM python:3.9-slim`

## LABEL

- **Usage:** `LABEL <key>=<value> [<key>=<value> ...]`
- **Description:** Ajoute des métadonnées à l'image.
- **Example:** `LABEL maintainer="you@example.com"`

## ENV

- **Usage:** `ENV <key>=<value> ...`
- **Description:** Définit des variables d'environnement.
- **Example:** `ENV APP_HOME=/app`

## RUN

- **Usage:** `RUN <command>`
- **Description:** Exécute une commande pendant la construction de l'image.
- **Example:** `RUN apt-get update && apt-get install -y curl`

## COPY

- **Usage:** `COPY <src> <dest>`
- **Description:** Copie des fichiers/directoires du système hôte dans le système de fichiers du conteneur.
- **Example:** `COPY . /app`

## ADD

- **Usage:** `ADD <src> <dest>`
- **Description:** Similaire à `COPY`, mais peut aussi extraire des fichiers compressés et télécharger des fichiers à partir d'URL.
- **Example:** `ADD myapp.tar.gz /app`

## CMD

- **Usage:** `CMD ["executable","param1","param2"]`
- **Description:** Spécifie la commande par défaut à exécuter quand un conteneur est lancé.
- **Example:** `CMD ["python", "app.py"]`

```bash
# La commande python script.py va écraser la commande par défaut du CMD (python app.py)
docker run -d -p 8080:8080 python python script.py
```

## ENTRYPOINT

- **Usage:** `ENTRYPOINT ["executable", "param1", "param2"]`
- **Description:** Configure une application qui sera toujours exécutée dans le conteneur.
- **Example:** `ENTRYPOINT ["nginx", "-g", "daemon off;"]`

```bash
docker run -d -p 8080:8080 python --entrypoint python script.py
```

## WORKDIR

- **Usage:** `WORKDIR <path>`
- **Description:** Définit le répertoire de travail pour toute commande suivante dans le Dockerfile.
- **Example:** `WORKDIR /app`

## EXPOSE

- **Usage:** `EXPOSE <port> [<port>/<protocol>...]`
- **Description:** Indique les ports sur lesquels l'application écoute.
- **Example:** `EXPOSE 80`

## VOLUME

- **Usage:** `VOLUME ["/data"]`
- **Description:** Crée un point de montage pour accéder et stocker des données.
- **Example:** `VOLUME ["/data"]`

## USER

- **Usage:** `USER <username>[:<group>]`
- **Description:** Spécifie l'utilisateur qui exécutera les commandes suivantes.
- **Example:** `USER appuser`

## ARG

- **Usage:** `ARG <name>[=<default value>]`
- **Description:** Définit une variable qui peut être passée au moment de la construction avec `docker build`.
- **Example:** `ARG build_version=1.0`

## ONBUILD

- **Usage:** `ONBUILD <command>`
- **Description:** Déclenche une commande lorsqu'une image construite à partir du Dockerfile est utilisée comme base pour une autre image.
- **Example:** `ONBUILD COPY . /app/src`

## STOPSIGNAL

- **Usage:** `STOPSIGNAL signal`
- **Description:** Définit le signal système qui sera utilisé pour arrêter le conteneur.
- **Example:** `STOPSIGNAL SIGTERM`

## HEALTHCHECK

- **Usage:** `HEALTHCHECK [options] CMD <command>`
- **Description:** Vérifie l'état de l'application dans le conteneur.
- **Example:** `HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost/ || exit 1`

## SHELL

- **Usage:** `SHELL ["executable", "parameters"]`
- **Description:** Modifie l'interpréteur de commandes par défaut.
- **Example:** `SHELL ["/bin/bash", "-c"]`

# commande CLI

## docker build

- **Usage:** `docker build [OPTIONS] PATH | URL | -`
- **Description:** Construit une image Docker à partir d'un Dockerfile.
- **Example:** `docker build -t my-image .`
