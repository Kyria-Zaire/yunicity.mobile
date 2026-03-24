# Deploiement Railway — Guide etape par etape

## Pre-requis

- Compte Railway (railway.app)
- Repo GitHub connecte a Railway
- Domaines : yunicity.fr, admin.yunicity.fr, api.yunicity.fr
- Comptes : Stripe, Resend, Twilio, Cloudflare R2, OpenAI, Mapbox

---

## Ordre de deploiement

IMPORTANT : deployer dans cet ordre pour respecter les dependances.

### 1. Infrastructure (Railway plugins)

1. Creer un projet Railway
2. Ajouter plugin **PostgreSQL** → copier `DATABASE_URL`
3. Ajouter plugin **Redis** → copier `REDIS_URL`
4. Activer PostGIS sur PostgreSQL :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

### 2. Migration base de donnees

Depuis le terminal local, une fois les plugins crees :

```bash
cd packages/database
DATABASE_URL=<URL Railway PostgreSQL> npx prisma migrate deploy
```

Verifier :

```bash
DATABASE_URL=<URL Railway PostgreSQL> npx prisma studio
```

### 3. Seed initial (optionnel)

```bash
cd infra/scripts
DATABASE_URL=<URL Railway PostgreSQL> pnpm seed
```

### 4. Services backend (dans l'ordre)

Chaque service = un service Railway pointant vers le meme repo GitHub.
Configurer le **Root Directory** et les **Build Args** selon le `railway.json` de chaque service.

| # | Service | Port | Root Directory | Healthcheck |
|---|---------|------|----------------|-------------|
| 1 | auth-service | 3001 | services/auth-service | /health |
| 2 | user-service | 3002 | services/user-service | /health |
| 3 | community-service | 3003 | services/community-service | /health |
| 4 | map-service | 3004 | services/map-service | /health |
| 5 | payment-service | 3005 | services/payment-service | /health |
| 6 | notification-service | 3006 | services/notification-service | /health |
| 7 | moderation-service | 3007 | services/moderation-service | /health |
| 8 | crm-service | 3008 | services/crm-service | /health |
| 9 | ai-service | 3009 | services/ai-service | /health |
| 10 | worker | - | services/worker | aucun |
| 11 | **api-gateway** | 3000 | services/api-gateway | /health |

> **api-gateway EN DERNIER** — il depend de tous les autres services.

Pour chaque service :
1. New Service → GitHub Repo → selectionner le repo
2. Settings → Source → Root Directory = valeur ci-dessus
3. Settings → Build → Dockerfile Path = `../../docker/node-service.Dockerfile`
4. Settings → Build → Docker Context = `/` (racine du repo)
5. Settings → Variables → ajouter les variables du [env-template.md](../railway/env-template.md)
6. Les variables `DATABASE_URL` et `REDIS_URL` sont injectees automatiquement si le plugin est dans le meme projet

**Note sur user-service** : le start command inclut `prisma migrate deploy` avant le demarrage.
Les migrations s'executent automatiquement a chaque deploiement.

### 5. Applications frontend

| # | App | Root Directory | Build Command |
|---|-----|----------------|---------------|
| 12 | web | apps/web | `pnpm build` |
| 13 | admin | apps/admin | `pnpm build` |

Pour les apps Next.js, Railway detecte automatiquement le framework.
Configurer les variables d'environnement depuis `.env.production`.

### 6. DNS

| Sous-domaine | Cible Railway |
|---|---|
| yunicity.fr | Service web → Custom Domain |
| admin.yunicity.fr | Service admin → Custom Domain |
| api.yunicity.fr | Service api-gateway → Custom Domain |

Dans le registrar DNS :
- CNAME yunicity.fr → `<railway-domain>.up.railway.app`
- CNAME admin.yunicity.fr → `<railway-domain>.up.railway.app`
- CNAME api.yunicity.fr → `<railway-domain>.up.railway.app`

Railway gere automatiquement les certificats SSL (Let's Encrypt).

---

## Variables d'environnement

Voir [env-template.md](../railway/env-template.md) pour la liste complete.

Les variables communes a tous les services :
- `NODE_ENV=production`
- `DATABASE_URL` (auto-injecte par Railway PostgreSQL)
- `REDIS_URL` (auto-injecte par Railway Redis)
- `AUTH_SECRET` (genere une fois, partage entre les services)

---

## Verification post-deploiement

```bash
# Health check API Gateway
curl https://api.yunicity.fr/health
# Attendu : { "status": "ok" }

# Health check frontend
curl -I https://yunicity.fr
# Attendu : HTTP/2 200

# Health check admin
curl -I https://admin.yunicity.fr
# Attendu : HTTP/2 200
```

---

## Rollback

Railway garde l'historique des deploiements.
Pour rollback : Dashboard → Service → Deployments → cliquer sur un deploiement precedent → Redeploy.

---

## Monitoring

- Railway Dashboard : metriques CPU/RAM/reseau par service
- Logs : Dashboard → Service → Logs (temps reel)
- Alertes : configurer dans Railway Settings → Notifications

---

## Estimation couts Railway

| Ressource | Estimation/mois |
|---|---|
| PostgreSQL (1GB) | ~5$ |
| Redis (500MB) | ~3$ |
| 11 services backend (idle scaling) | ~25$ |
| 2 apps frontend | ~10$ |
| **Total estime** | **~43$/mois** |

Avec Railway sleep-on-idle, les services inactifs ne consomment pas de ressources.
