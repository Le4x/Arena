# Arena Live 1.0 - Architecture technique

## Vue d'ensemble
Arena combine une API NestJS (temps réel Socket.io + REST), un frontend React/Vite (régie, TV, clients joueurs) et une app desktop Tauri pour le mode offline. Le code est organisé en trois axes :

- **backend/** : API, WebSocket et logique de régie (NestJS + TypeORM)
- **frontend/** : clients régie/écran/joueurs (React/TypeScript + Tailwind/shadcn/ui)
- **docs/** : guides d'architecture, déploiement et packaging `.ARE`

## Modèle de données clé
- **users** : rôles (admin, host, animator), abonnements.
- **plans & subscriptions** : freemium/premium, limites d'usage.
- **shows / rounds / questions** : catalogue des contenus.
- **games** : instance live avec PIN, état courant, host, limites dynamiques.
- **teams / players / answers / buzzer_attempts** : participants et scoring.
- **marketplace_assets / purchases** : conteneur `.ARE` monétisé.

Chaque entité est gérée via TypeORM (PostgreSQL online ou SQLite offline). L'état de partie est serialisé pour reprise après crash.

## Flux temps réel (Socket.io)
- `question_start`, `question_end` : ouverture/fermeture question.
- `buzzer_first`, `team_answer` : priorité du buzzer + réception réponses.
- `screen_update` : payload consolidé pour l'écran géant.
- `score_update` : synchro du classement.
- `presence_ping` : watchdog pour la régie/screen/clients.

Les messages sont multiplexés par `gameId` et incluent un checksum d'état. Les événements critiques sont persistés afin de permettre la reprise instantanée en cas de crash de la régie ou du screen.

## Monétisation et contrôles d'usage
Le service `MonetizationService` centralise les limites :
- **Freemium** : 10 joueurs, 1 partie/jour, pas d'audio custom, pas de marketplace.
- **Premium** : 60 équipes (250 joueurs), parties illimitées, finale, marketplace, stockage cloud.

Les limites sont appliquées lors de la création de partie (`GameService.assertGameCreationAllowed`) et lors de l'ajout de joueurs (`TeamService.assertPlayerCapacity`). Un plan par défaut est injecté au démarrage pour garantir un comportement offline sans Stripe.

## Fichier `.ARE`
Un package `.ARE` est une archive ZIP contenant :
- `/db/arena.sqlite` : données du show (questions, médias référencés)
- `/media` : mp3/images/jingles
- `/manifest.json` : métadonnées (titre, durée, auteur, checksums)
- `/checksums.json` : hash SHA256 des ressources

L'import/export se fait côté régie (Tauri) en manipulant la base SQLite locale puis en poussant le manifest vers le backend pour la publication marketplace.

## Déploiement AWS (résumé)
- **Docker Compose** sur EC2 (API + frontend + Nginx reverse proxy + PostgreSQL ou RDS)
- **S3** pour les médias et assets marketplace
- **CloudFront/Cloudflare** optionnel en front
- **Certbot** pour HTTPS via Nginx

Pour le mode offline, l'API embarque SQLite et la régie Tauri sert les médias localement ; les websockets restent sur le LAN avec une latence cible < 60 ms.
