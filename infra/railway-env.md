# Variables d’environnement Railway (Production)

Ce document liste les variables nécessaires par service pour un déploiement **production** sur Railway.

## Règles

- **Remplis toutes les valeurs** marquées **`[À REMPLIR]`**.
- **`PORT`**: Railway injecte généralement `PORT` automatiquement. Ne le renseigne que si ton service l’exige explicitement.
- **`DATABASE_URL`** et **`REDIS_URL`**: à définir via **variables de référence Railway** (Postgres/Redis), pas en dur.
- **Secrets**: utilise des variables Railway “Sensitive”.

---

## `services/api-gateway`

```env
NODE_ENV=production
SERVICE_NAME=api-gateway

# Auth
AUTH_SECRET=[À REMPLIR]  # min 32 chars

# IMPORTANT: ne jamais activer en prod
ALLOW_DEV_AUTH=false

# Services internes (URLs Railway des services)
AUTH_SERVICE_URL=[À REMPLIR]
USER_SERVICE_URL=[À REMPLIR]
COMMUNITY_SERVICE_URL=[À REMPLIR]
MAP_SERVICE_URL=[À REMPLIR]
PAYMENT_SERVICE_URL=[À REMPLIR]
NOTIFICATION_SERVICE_URL=[À REMPLIR]
MODERATION_SERVICE_URL=[À REMPLIR]
CRM_SERVICE_URL=[À REMPLIR]
AI_SERVICE_URL=[À REMPLIR]

# Infra
MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]
DATABASE_URL=[Référence Railway vers Postgres]

# CORS (origines autorisées)
CORS_ORIGINS=[À REMPLIR]
```

---

## `services/auth-service`

```env
NODE_ENV=production
SERVICE_NAME=auth-service

AUTH_SECRET=[À REMPLIR]  # min 32 chars (doit être cohérent avec l’API gateway si partagé)

MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]
```

---

## `services/user-service`

```env
NODE_ENV=production
SERVICE_NAME=user-service

AUTH_SECRET=[À REMPLIR]  # min 32 chars

MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]
```

---

## `services/community-service`

```env
NODE_ENV=production
SERVICE_NAME=community-service

AUTH_SECRET=[À REMPLIR]  # min 32 chars

MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]
```

---

## `services/payment-service`

```env
NODE_ENV=production
SERVICE_NAME=payment-service

AUTH_SECRET=[À REMPLIR]  # min 32 chars

MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]

# Stripe (requis en prod si paiements actifs)
STRIPE_SECRET_KEY=[À REMPLIR]
STRIPE_WEBHOOK_SECRET=[À REMPLIR]

# Dépendances / URLs
USER_SERVICE_URL=[À REMPLIR]
WEB_URL=[À REMPLIR]

# CORS
CORS_ORIGINS=[À REMPLIR]
```

---

## `services/notification-service`

```env
NODE_ENV=production
SERVICE_NAME=notification-service

AUTH_SECRET=[À REMPLIR]  # min 32 chars

MONGODB_URI=[À REMPLIR]
REDIS_URL=[Référence Railway vers Redis]
```

