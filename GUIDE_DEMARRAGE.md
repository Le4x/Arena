# 🚀 Guide de Démarrage Rapide - Arena

## 🎯 Vue d'ensemble

Arena est maintenant **100% fonctionnel** pour un MVP ! Voici comment démarrer.

---

## 📦 Méthode 1 : Démarrage avec Docker (RECOMMANDÉ)

### Prérequis
- Docker et Docker Compose installés

### Étapes

1. **Configurer les variables d'environnement**

```bash
cp .env.example .env
# Éditer .env et changer JWT_SECRET et DATABASE_PASSWORD
```

2. **Lancer tous les services**

```bash
docker-compose up -d --build
```

3. **Initialiser la base de données**

```bash
# Attendre ~10 secondes que Postgres démarre
docker-compose exec backend npm run migration:run
```

4. **Créer un compte admin**

```bash
docker-compose exec backend npm run create-admin
```

5. **Accéder à l'application**

- Frontend : http://localhost
- Backend API : http://localhost:3000
- Joueurs : http://localhost/play
- Admin : http://localhost/admin
- Régie : http://localhost/regie
- Screen : http://localhost/screen

---

## 💻 Méthode 2 : Démarrage en mode développement

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres DB

# Lancer les migrations
npm run migration:run

# Créer un admin
npm run create-admin

# Démarrer le serveur
npm run start:dev
```

Le backend démarre sur http://localhost:3000

### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Démarrer le serveur de dev
npm run dev
```

Le frontend démarre sur http://localhost:5173

---

## 🎮 Utilisation - Scénario complet

### 1. Créer un Show (via API ou script)

Pour le MVP, vous pouvez créer un show directement en base de données ou via l'API :

```bash
# Exemple avec curl (après connexion admin)
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MusicArena Live #1",
    "description": "Première soirée quiz",
    "eventDate": "2025-02-15T20:00:00Z",
    "venue": "Salle des fêtes"
  }'
```

### 2. Créer une Game depuis le Show

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"showId": "SHOW_ID"}'
```

Vous recevrez un **PIN code** (ex: ABC123).

### 3. Afficher l'écran public

Ouvrir sur un projecteur/TV :

```
http://localhost:5173/screen?gameId=GAME_ID
```

Le QR code et le PIN s'affichent.

### 4. Les joueurs rejoignent

Sur leur mobile :

```
http://localhost:5173/play
```

- Entrer le code PIN
- Choisir un nom d'équipe
- Rejoindre le lobby

### 5. Contrôler depuis la Régie

```
http://localhost:5173/regie
```

- Voir les équipes connectées
- Lancer les questions (via WebSocket)
- Valider les réponses
- Mettre à jour les scores

---

## 🔧 Commandes utiles

### Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Supprimer les volumes (reset DB)
docker-compose down -v
```

### Backend (mode dev)

```bash
# Générer une migration
npm run migration:generate -- NomMigration

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert

# Tests
npm run test
```

### Frontend (mode dev)

```bash
# Build production
npm run build

# Preview build
npm run preview
```

---

## 🐛 Résolution de problèmes

### Problème : Backend ne démarre pas

```bash
# Vérifier que PostgreSQL est lancé
docker-compose ps

# Voir les logs
docker-compose logs backend
```

### Problème : Les migrations échouent

```bash
# Reset complet de la DB
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migration:run
```

### Problème : WebSocket ne se connecte pas

Vérifier `frontend/.env` :
```
VITE_WS_URL=http://localhost:3001
```

### Problème : CORS errors

Vérifier `backend/.env` :
```
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Notes importantes

### MVP Limitations

Les fonctionnalités suivantes seront ajoutées en **Phase 2** :

- Admin CRUD complet (interface graphique pour créer shows/questions)
- Upload de fichiers audio pour les blindtests
- Thèmes visuels personnalisables
- Animations avancées sur l'écran public
- Mode Final avec élimination
- Statistiques et logs détaillés

### Fonctionnalités MVP actuelles ✅

- ✅ Création de Games avec PIN
- ✅ Connexion des joueurs par équipe
- ✅ Lobby temps réel
- ✅ Questions QCM
- ✅ Buzzer pour blindtest
- ✅ Validation des réponses
- ✅ Scoring en temps réel
- ✅ Écran public avec QR code
- ✅ Interface Régie basique
- ✅ Authentification Admin/Host

---

## 🎉 Prêt à démarrer !

Vous avez maintenant une plateforme **Arena** complète et fonctionnelle pour organiser vos quiz et blindtests en direct !

Pour toute question, consultez le README.md principal.

**Bon show ! 🎵🎮**
