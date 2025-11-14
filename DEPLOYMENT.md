# Guide de Déploiement Docker - Arena

## Problèmes Identifiés et Corrigés

### 1. Variables d'environnement Vite non configurées
**Problème:** Le Dockerfile frontend ne passait pas les variables `VITE_API_URL` et `VITE_WS_URL` lors du build, causant des erreurs de connexion au backend.

**Solution:**
- Ajout des arguments ARG dans `frontend/Dockerfile`
- Configuration des build args dans `docker-compose.yml`
- Ces variables doivent pointer vers votre domaine en production

### 2. Fichiers .dockerignore manquants
**Problème:** Les builds incluaient `node_modules` et autres fichiers inutiles, ralentissant considérablement le processus.

**Solution:** Création de `.dockerignore` pour backend et frontend

### 3. Configuration des URLs en production
**Problème:** Les URLs par défaut pointaient vers localhost, ne fonctionnant pas en production.

**Solution:** Utilisation de variables d'environnement configurables

## Instructions de Déploiement

### 1. Configuration Initiale

Copiez le fichier `.env` et configurez vos valeurs:

```bash
cp .env.example .env
```

Éditez `.env` et modifiez au minimum:

```env
# Sécurité - IMPORTANT!
DATABASE_PASSWORD=votre_mot_de_passe_securise
JWT_SECRET=votre_secret_jwt_tres_long_minimum_32_caracteres

# URLs Production (si vous déployez sur un serveur)
VITE_API_URL=https://votre-domaine.com/api
VITE_WS_URL=wss://votre-domaine.com/ws
FRONTEND_URL=https://votre-domaine.com
```

### 2. Développement Local

Pour tester en local:

```bash
# Construire et démarrer tous les services
docker compose up --build

# Ou en mode détaché (background)
docker compose up -d --build
```

L'application sera accessible sur:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- WebSocket: http://localhost:3001
- PostgreSQL: localhost:5432

### 3. Production

#### a. Sur un serveur (VPS, etc.)

1. **Configurez les URLs dans `.env`:**
```env
VITE_API_URL=https://votre-domaine.com/api
VITE_WS_URL=wss://votre-domaine.com/ws
FRONTEND_URL=https://votre-domaine.com
```

2. **Construisez avec les variables:**
```bash
docker compose build
docker compose up -d
```

3. **Configurez un reverse proxy (nginx/traefik)** pour:
   - Rediriger le trafic HTTPS
   - Router `/api/*` vers le backend (port 3000)
   - Router `/ws` vers le WebSocket (port 3001)
   - Router `/*` vers le frontend (port 80)

#### b. Exemple de configuration Nginx

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 4. Migrations de Base de Données

Après le premier démarrage, exécutez les migrations:

```bash
# Entrer dans le conteneur backend
docker compose exec backend sh

# Exécuter les migrations
npm run migration:run

# Créer un compte admin (optionnel)
npm run create-admin

# Quitter
exit
```

### 5. Commandes Utiles

```bash
# Voir les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker compose down -v

# Reconstruire après modification du code
docker compose up -d --build
```

### 6. Surveillance et Maintenance

```bash
# Vérifier l'état des conteneurs
docker compose ps

# Vérifier l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a
```

## Dépannage

### Le frontend ne se connecte pas au backend

1. Vérifiez que `VITE_API_URL` et `VITE_WS_URL` dans `.env` sont corrects
2. Reconstruisez le frontend: `docker compose up -d --build frontend`
3. Vérifiez les logs: `docker compose logs frontend`

### Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL est démarré: `docker compose ps`
2. Vérifiez les credentials dans `.env`
3. Attendez que le healthcheck passe: `docker compose logs postgres`

### Le build échoue

1. Nettoyez les anciennes images: `docker compose down && docker system prune -a`
2. Vérifiez que les fichiers `.dockerignore` existent
3. Essayez de construire service par service:
   ```bash
   docker compose build postgres
   docker compose build backend
   docker compose build frontend
   ```

### Erreurs CORS

Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL publique de votre frontend.

## Sécurité en Production

- [ ] Changez `DATABASE_PASSWORD` avec un mot de passe fort
- [ ] Changez `JWT_SECRET` avec une chaîne aléatoire longue (minimum 32 caractères)
- [ ] Utilisez HTTPS (certificat SSL/TLS)
- [ ] Configurez un firewall
- [ ] Activez les backups automatiques de PostgreSQL
- [ ] Limitez l'accès SSH au serveur
- [ ] Mettez à jour régulièrement les images Docker

## Support

Pour plus d'informations, consultez:
- Documentation NestJS: https://docs.nestjs.com/
- Documentation Vite: https://vitejs.dev/
- Documentation Docker Compose: https://docs.docker.com/compose/
