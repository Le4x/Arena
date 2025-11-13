# 🎮 Arena - Plateforme Quiz & Blindtest en Temps Réel

## 📋 Vue d'ensemble

**Arena** (MusicArena Live 1.0) est une plateforme professionnelle de quiz et blindtest musical en temps réel, conçue pour des événements live avec jusqu'à **60 équipes / 250 joueurs**.

### Caractéristiques principales

- ✅ Quiz en temps réel type Kahoot
- 🎵 Blindtest musical avec système de buzzer
- 👥 Gestion multi-équipes et multi-joueurs
- 🎬 Mode Final pour les finales spectaculaires
- 📺 Écran public avec animations impressionnantes
- 🎛️ Interface de régie pour contrôler le show
- 🔐 Système de rôles (Admin, Régie, Animateur, Joueurs)
- 🌐 Déployable en local (LAN) ou sur AWS

---

## 🏗️ Architecture

### Stack technique

**Backend**
- NestJS (TypeScript)
- PostgreSQL + TypeORM
- Socket.io pour le temps réel
- JWT pour l'authentification

**Frontend**
- React 18 + Vite
- TypeScript strict
- TailwindCSS + shadcn/ui
- Socket.io-client

**Infrastructure**
- Docker + Docker Compose
- Nginx reverse proxy
- Support AWS + local

---

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **Docker** et **Docker Compose** (pour déploiement)
- **PostgreSQL** 15+ (si vous n'utilisez pas Docker)

### Installation locale (développement)

#### Étape 1 : Cloner et installer les dépendances

```bash
# Cloner le dépôt
cd Arena

# Installer les dépendances backend
cd backend
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

#### Étape 2 : Configuration de la base de données

**Option A : Avec Docker (recommandé)**

```bash
# Depuis la racine du projet
docker-compose up -d postgres
```

**Option B : PostgreSQL local**

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE arena_db;
\q
```

#### Étape 3 : Configuration des variables d'environnement

**Backend** : Copier `.env.example` vers `.env`

```bash
cd backend
cp .env.example .env
```

Éditer `backend/.env` :

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=arena_db

# JWT
JWT_SECRET=votre_secret_super_securise_changez_moi
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# WebSocket
WS_PORT=3001

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

**Frontend** : Copier `.env.example` vers `.env`

```bash
cd ../frontend
cp .env.example .env
```

Éditer `frontend/.env` :

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3001
```

#### Étape 4 : Initialiser la base de données

```bash
cd backend

# Exécuter les migrations
npm run migration:run

# (Optionnel) Créer des données de test
npm run seed
```

#### Étape 5 : Lancer l'application

**Terminal 1 - Backend**

```bash
cd backend
npm run start:dev
```

Le backend démarre sur `http://localhost:3000`

**Terminal 2 - Frontend**

```bash
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

---

## 🐳 Installation avec Docker (Production)

### Étape 1 : Configuration

Copier `.env.example` vers `.env` à la racine :

```bash
cp .env.example .env
```

Éditer les variables pour la production.

### Étape 2 : Build et lancement

```bash
# Build et démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

L'application sera accessible sur `http://localhost` (port 80).

### Étape 3 : Initialiser la base de données

```bash
# Exécuter les migrations
docker-compose exec backend npm run migration:run

# Créer un admin
docker-compose exec backend npm run create-admin
```

---

## 👥 Rôles et Accès

### 1. Admin
- URL : `http://localhost:5173/admin`
- Gestion complète : shows, questions, médias, utilisateurs
- Création de comptes Régie/Animateur

### 2. Régie (Host/Contrôleur de show)
- URL : `http://localhost:5173/regie`
- Contrôle du déroulement du show
- Validation des réponses
- Ajustement des scores

### 3. Animateur
- URL : `http://localhost:5173/animator`
- Vue lecture seule du show en cours
- Affichage des infos pour commenter

### 4. Écran Public
- URL : `http://localhost:5173/screen?gameId=XXX`
- Affichage sur projecteur/TV
- Plein écran automatique

### 5. Joueurs
- URL : `http://localhost:5173/play`
- Rejoindre avec code PIN
- Répondre aux questions depuis mobile

---

## 🎮 Utilisation - Guide rapide

### Créer et lancer un show

1. **Se connecter en Admin**
   - Créer un Show (événement)
   - Ajouter des Rounds
   - Ajouter des Questions (Quiz ou Blindtest)
   - Uploader les fichiers audio pour les blindtests

2. **Créer une Game (session)**
   - En Régie : créer une nouvelle Game depuis un Show
   - Un code PIN est généré automatiquement

3. **Afficher l'écran public**
   - Ouvrir `/screen?gameId=XXX` sur l'écran de projection
   - Le QR code et le PIN s'affichent

4. **Les joueurs rejoignent**
   - Aller sur `/play`
   - Entrer le code PIN
   - Choisir ou créer une équipe

5. **Lancer le show**
   - Depuis la Régie : cliquer "Démarrer le show"
   - Lancer chaque question une par une
   - Valider les réponses des équipes
   - Les scores se mettent à jour en temps réel

### Modes de questions

**Quiz (QCM)**
- Les joueurs voient les options A/B/C/D
- Timer compte à rebours
- Validation automatique ou manuelle

**Blindtest avec Buzzer**
- Lecture audio lancée par la Régie
- Premier joueur/équipe à buzzer est mis en avant
- Régie valide si correct/incorrect
- Animation sur l'écran public

**Mode Final**
- Sélection des N meilleures équipes
- Questions spéciales avec animations podium

---

## 📁 Structure du projet

```
Arena/
├── backend/              # Backend NestJS
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── auth/         # Authentification & rôles
│   │   ├── game/         # Moteur de jeu
│   │   ├── websocket/    # Gateway temps réel
│   │   ├── database/     # Entities & migrations
│   │   └── common/       # Utils, guards, decorators
│   ├── test/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── apps/
│   │   │   ├── admin/    # Interface admin
│   │   │   ├── regie/    # Interface régie
│   │   │   ├── animator/ # Interface animateur
│   │   │   ├── player/   # Interface joueur (mobile)
│   │   │   └── screen/   # Écran public
│   │   ├── components/   # Composants partagés
│   │   ├── hooks/        # Hooks React
│   │   ├── services/     # API & WebSocket clients
│   │   └── types/        # Types TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml    # Orchestration Docker
├── nginx.conf            # Config reverse proxy
├── .env.example          # Template variables d'env
└── README.md             # Ce fichier
```

---

## 🔧 Commandes utiles

### Backend

```bash
# Développement
npm run start:dev

# Build production
npm run build
npm run start:prod

# Migrations
npm run migration:generate -- NomMigration
npm run migration:run
npm run migration:revert

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Créer un admin
npm run create-admin
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview production
npm run preview

# Lint & format
npm run lint
npm run format
```

### Docker

```bash
# Tout démarrer
docker-compose up -d

# Rebuild après changements
docker-compose up -d --build

# Voir les logs
docker-compose logs -f [service]

# Redémarrer un service
docker-compose restart [service]

# Arrêter tout
docker-compose down

# Arrêter et supprimer volumes
docker-compose down -v
```

---

## 🌐 Déploiement sur AWS

### Prérequis AWS

- Instance EC2 (Ubuntu 22.04 recommandé)
- RDS PostgreSQL (ou utiliser Docker Postgres)
- Security groups configurés (ports 80, 443, 22)
- Nom de domaine (optionnel)

### Étapes de déploiement

1. **Se connecter au serveur**

```bash
ssh ubuntu@votre-ip-aws
```

2. **Installer Docker**

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

3. **Cloner le projet**

```bash
git clone https://github.com/votre-repo/Arena.git
cd Arena
```

4. **Configurer les variables d'environnement**

```bash
cp .env.example .env
nano .env
```

Modifier :
- `DATABASE_HOST` : adresse RDS ou laisser `postgres` pour Docker
- `JWT_SECRET` : générer un secret sécurisé
- `FRONTEND_URL` : votre domaine ou IP publique
- etc.

5. **Lancer avec Docker**

```bash
docker-compose up -d --build
```

6. **Initialiser la DB**

```bash
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run create-admin
```

7. **Configurer Nginx avec SSL (optionnel)**

Installer Certbot pour Let's Encrypt :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 🧪 Tests

### Tests unitaires

```bash
cd backend
npm run test
```

### Tests d'intégration

```bash
cd backend
npm run test:e2e
```

### Tests frontend

```bash
cd frontend
npm run test
```

---

## 🐛 Dépannage

### Problème de connexion WebSocket

- Vérifier que `WS_PORT` est ouvert dans le firewall
- Vérifier `VITE_WS_URL` dans `frontend/.env`
- Regarder les logs : `docker-compose logs -f backend`

### Base de données ne démarre pas

- Vérifier que le port 5432 n'est pas déjà utilisé
- Supprimer les volumes : `docker-compose down -v`
- Relancer : `docker-compose up -d postgres`

### Erreur CORS

- Vérifier `FRONTEND_URL` dans `backend/.env`
- Doit correspondre à l'URL réelle du frontend

### Upload audio ne fonctionne pas

- Vérifier les permissions du dossier `backend/uploads`
- `chmod 755 backend/uploads`
- Vérifier `MAX_FILE_SIZE` dans `.env`

---

## 📚 Fonctionnalités à venir (roadmap)

### Phase 2
- [ ] Mode Final avancé avec élimination
- [ ] Admin CRUD complet avec drag & drop
- [ ] Système de thèmes visuels personnalisables
- [ ] Animations et transitions spectaculaires
- [ ] Gestion avancée des médias (preview, trim audio)

### Phase 3
- [ ] Règles de scoring complexes (multiplicateurs, bonus)
- [ ] Logs et replay de games
- [ ] Statistiques et analytics
- [ ] Support multi-langues
- [ ] Mode hybride (équipes sur site + en ligne)

### Phase 4
- [ ] App desktop Régie avec Tauri
- [ ] Export PDF des résultats
- [ ] Intégration streaming (OBS, etc.)
- [ ] API publique pour intégrations tierces

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 🤝 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contact : votre-email@example.com

---

**Bon show ! 🎉🎵**
