# TP1 : Manipulation des Conteneurs

## Contexte

Vous venez d'être embauché comme DevOps junior dans une startup. Votre première mission est de démontrer votre maîtrise des commandes Docker de base en manipulant des conteneurs.

---

## Exercice 1 : Premiers pas

### 1.1 Vérification de l'installation 

Affichez la version de Docker installée et notez-la dans votre fichier de réponses.

**Commande attendue :**

```bash
# Votre commande ici
```

### 1.2 Téléchargement d'images 

Téléchargez les images suivantes :
- `nginx:alpine`
- `redis:7-alpine`

**Questions :**

- Quelle est la taille de chaque image ?
- Pourquoi utilise-t-on des images `alpine` ?

### 1.3 Liste des images 

Affichez la liste de toutes les images présentes sur votre système.

**Questions :**

- Quelle commande avez-vous utilisée ?
- Combien d'images sont présentes ?

---

## Exercice 2 : Gestion des conteneurs 

### 2.1 Lancer un conteneur Nginx 

Lancez un conteneur Nginx avec les caractéristiques suivantes :
- Nom : `web-eval`
- Mode détaché
- Port 8080 de l'hôte mappé vers le port 80 du conteneur

**Vérification :** Accédez à `http://localhost:8080` dans votre navigateur.

### 2.2 Inspection du conteneur 

Répondez aux questions suivantes sur le conteneur `web-eval` :
- Quelle est son adresse IP ?
- Quel est son état (status) ?
- Quand a-t-il été créé ?


### 2.3 Logs et processus 

- Affichez les 10 dernières lignes de logs du conteneur
- Affichez les processus en cours d'exécution dans le conteneur

### 2.4 Exécution de commandes 

Exécutez les actions suivantes dans le conteneur `web-eval` :
1. Ouvrez un shell interactif
2. Créez un fichier `/tmp/evaluation.txt` contenant votre nom
3. Vérifiez que le fichier existe
4. Quittez le shell

---

## Exercice 3 : Cycle de vie 

### 3.1 Arrêt et redémarrage 

- Arrêtez le conteneur `web-eval`
- Vérifiez qu'il est bien arrêté
- Redémarrez-le
- Vérifiez que le fichier `/tmp/evaluation.txt` existe toujours

**Question :** Le fichier existe-t-il toujours ? Pourquoi ?

### 3.2 Création d'un conteneur Redis 

Lancez un conteneur Redis avec :
- Nom : `cache-eval`
- Mode détaché
- Pas de mapping de port

Connectez-vous au CLI Redis et exécutez :

```
SET evaluation "reussie"
GET evaluation
```

### 3.3 Gestion multiple 

- Listez tous les conteneurs (actifs et inactifs)
- Arrêtez tous les conteneurs en une seule commande
- Supprimez tous les conteneurs arrêtés en une seule commande

**Questions :**
- Quelles commandes avez-vous utilisées ?
- Quelle est la différence entre `docker stop` et `docker rm` ?

---

## Exercice 4 : Volumes et persistance 

### 4.1 Création d'un volume 
Créez un volume Docker nommé `data-eval`.

### 4.2 Utilisation du volume 

Lancez un conteneur `alpine` qui :
- Monte le volume `data-eval` sur `/data`
- Crée un fichier `/data/persistant.txt` avec du contenu
- Se termine après exécution

### 4.3 Vérification de la persistance 

- Lancez un nouveau conteneur `alpine` montant le même volume
- Vérifiez que le fichier `persistant.txt` existe et contient les données

**Question :** Expliquez pourquoi les données persistent entre les conteneurs.

---

## Nettoyage

À la fin du TP, nettoyez votre environnement :

```bash
# Supprimez tous les conteneurs créés
# Supprimez le volume créé
# Conservez les images pour les TPs suivants
```

