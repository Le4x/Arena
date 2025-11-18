# Monétisation Arena

## Plans
- **Freemium** (par défaut) :
  - 10 joueurs / 10 équipes max
  - 1 partie / jour
  - Pas d'audio custom ni mode Finale
  - Publicités activables
- **Premium Arena** :
  - Parties illimitées, jusqu'à 60 équipes / 250 joueurs
  - Audio & médias personnalisés, mode Finale et stockage cloud
  - Vente sur le marketplace Arena Files
  - Support prioritaire

## Intégration Stripe
Les clés Stripe sont injectées via variables d'environnement :
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PREMIUM` (price_id du plan premium)

Le backend expose les endpoints nécessaires à la création de session de checkout et à l'écoute du webhook `customer.subscription.updated` (à implémenter dans un module `billing-listener`). Les entités `Plan` et `Subscription` permettent de stocker l'état d'abonnement.

## Marketplace Arena Files
Les fichiers `.ARE` peuvent être publiés via l'endpoint `POST /api/monetization/marketplace` (authentifié). Le plan Premium est requis pour publier. Chaque asset inclut : titre, description, `fileKey` (S3 ou stockage local), checksum et manifest. Les achats sont enregistrés dans `purchases` avec statut (`pending`, `completed`, `refunded`, `failed`).

## Application des limites en live
- **Création de partie** : `MonetizationService.assertGameCreationAllowed` limite à 1 partie/jour en Freemium.
- **Capacité joueurs** : `MonetizationService.assertPlayerCapacity` bloque l'ajout de joueurs au-delà du quota.
- **Audio custom** : le front régie peut masquer l'upload si `entitlements.canUseCustomAudio` est faux.

## Publicités (mode gratuit uniquement)
Le flag d'affichage pub est piloté côté front par le plan courant. En Freemium, le canal screen peut injecter des breaks sponsorisés pré-chargés dans le manifest du show.
