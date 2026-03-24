# Variables d'environnement Railway — Yunicity

Toutes les variables a configurer par service dans Railway.
Ne JAMAIS committer de valeurs reelles.

---

## Variables partagees (tous les services backend)

```env
NODE_ENV=production
DATABASE_URL=<fourni automatiquement par Railway PostgreSQL plugin>
REDIS_URL=<fourni automatiquement par Railway Redis plugin>
AUTH_SECRET=<generer : openssl rand -hex 32>
```

---

## API Gateway (port 3000)

```env
PORT=3000
CORS_ORIGINS=https://yunicity.fr,https://www.yunicity.fr,https://app.yunicity.fr,https://admin.yunicity.fr

AUTH_SERVICE_URL=http://auth-service.railway.internal:3001
USER_SERVICE_URL=http://user-service.railway.internal:3002
COMMUNITY_SERVICE_URL=http://community-service.railway.internal:3003
MAP_SERVICE_URL=http://map-service.railway.internal:3004
PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3005
NOTIFICATION_SERVICE_URL=http://notification-service.railway.internal:3006
MODERATION_SERVICE_URL=http://moderation-service.railway.internal:3007
CRM_SERVICE_URL=http://crm-service.railway.internal:3008
AI_SERVICE_URL=http://ai-service.railway.internal:3009
```

## Auth Service (port 3001)

```env
PORT=3001
BETTER_AUTH_URL=https://api.yunicity.fr
```

## User Service (port 3002)

```env
PORT=3002
ADMIN_API_KEY=<generer : openssl rand -hex 32>
INTERNAL_SERVICE_KEY=<generer : openssl rand -hex 32>
CLAMAV_HOST=<IP ou hostname ClamAV si disponible>
CLAMAV_PORT=3310
```

## Community Service (port 3003)

```env
PORT=3003
```

## Map Service (port 3004)

```env
PORT=3004
MAPBOX_ACCESS_TOKEN=<depuis mapbox.com>
```

## Payment Service (port 3005)

```env
PORT=3005
STRIPE_SECRET_KEY=<depuis dashboard.stripe.com — cle sk_live_...>
STRIPE_WEBHOOK_SECRET=<depuis dashboard.stripe.com — whsec_...>
USER_SERVICE_URL=http://user-service.railway.internal:3002
```

## Notification Service (port 3006)

```env
PORT=3006
RESEND_API_KEY=<depuis resend.com dashboard>
EMAIL_FROM=noreply@yunicity.fr
TWILIO_ACCOUNT_SID=<depuis console.twilio.com>
TWILIO_AUTH_TOKEN=<depuis console.twilio.com>
TWILIO_VERIFY_SERVICE_SID=<depuis console.twilio.com>
VAPID_PUBLIC_KEY=<generer : npx web-push generate-vapid-keys>
VAPID_PRIVATE_KEY=<generer : npx web-push generate-vapid-keys>
VAPID_EMAIL=push@yunicity.fr
```

## Moderation Service (port 3007)

```env
PORT=3007
OPENAI_API_KEY=<depuis platform.openai.com>
```

## CRM Service (port 3008)

```env
PORT=3008
```

## AI Service (port 3009)

```env
PORT=3009
OPENAI_API_KEY=<depuis platform.openai.com>
```

## Worker (pas de port public)

```env
INTERNAL_SERVICE_KEY=<meme valeur que user-service>
USER_SERVICE_URL=http://user-service.railway.internal:3002
NOTIFICATION_SERVICE_URL=http://notification-service.railway.internal:3006
```

---

## Cloudflare R2 (KYC documents — user-service)

```env
R2_ACCOUNT_ID=<depuis dashboard Cloudflare>
R2_ACCESS_KEY_ID=<depuis Cloudflare R2 API tokens>
R2_SECRET_ACCESS_KEY=<depuis Cloudflare R2 API tokens>
R2_BUCKET_NAME=yunicity-kyc-docs
```

---

## Applications frontend

### apps/web

```env
NEXT_PUBLIC_API_URL=https://api.yunicity.fr
```

### apps/admin

```env
NEXT_PUBLIC_API_URL=https://api.yunicity.fr
NEXT_PUBLIC_ADMIN_KEY=<meme valeur que ADMIN_API_KEY backend>
```

---

## URLs publiques (DNS)

| Sous-domaine | Cible |
|---|---|
| yunicity.fr | apps/web |
| admin.yunicity.fr | apps/admin |
| api.yunicity.fr | api-gateway |
