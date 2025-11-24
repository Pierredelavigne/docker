# Utilisation de l'image officiel nginx comme image de base
FROM nginx:latest

WORKDIR /usr/share/nginx/html/

# Copier le fichier index.html dans le repertoire par défaut de nginx
COPY index.html .

# Exposer le port 80
EXPOSE 80

# nginx -g daemon off;
CMD ["nginx", "-g", "daemon off;"]

# Construire l'image
# docker build -t testimage .

# test de l'image
# docker run --name container1 -p 5556:80 -d testimage 