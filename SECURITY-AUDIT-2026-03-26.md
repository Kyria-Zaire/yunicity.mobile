# AUDIT DE SECURITE COMPLET — Yunicity
**Date** : 2026-03-26
**Auditeur** : Claude Opus 4.6 (automated)
**Scope** : Monorepo complet (11 services, 3 apps, infra)

---

## RESUME EXECUTIF

| Severite | Nombre |
|----------|--------|
| CRITIQUE | 12 |
| HAUTE | 16 |
| MOYENNE | 17 |
| BASSE | 5 |
| **TOTAL** | **50** |

**Etat global** : Le projet a de bonnes fondations securitaires (Argon2id, Better Auth avec cookies httpOnly, Helmet, rate limiting, Zod validation, ClamAV, signed URLs). Cependant, plusieurs failles critiques existent, principalement autour de **secrets hardcodes**, **features de securite manquantes** (chiffrement KYC, GDPR export, purge cron), **WebSocket sans authentification**, et **infrastructure Docker non durcie**.

---

## CRITIQUE (5)

### C1 — Cle admin hardcodee et exposee au navigateur
**Fichiers** :
- `apps/admin/src/lib/config.ts:2`
- `services/worker/src/config/env.ts:21`
- `services/user-service/src/config/env.ts:38`
- `services/crm-service/src/config/env.ts:28`

**Probleme** : La cle admin `dev_admin_key_yunicity_2026` est :
1. Hardcodee comme valeur par defaut dans les schemas Zod des services
2. Exposee dans le frontend admin via `NEXT_PUBLIC_ADMIN_KEY` (variable prefixee `NEXT_PUBLIC_` = visible dans le bundle JS client)

**Impact** : En production, si l'env var n'est pas definie, n'importe qui peut acceder aux endpoints admin. Meme si elle est definie, le prefix `NEXT_PUBLIC_` expose la cle dans le bundle JavaScript du navigateur.

**Fix** :
```typescript
// services/*/config/env.ts — SUPPRIMER le default
ADMIN_API_KEY: z.string().min(32, 'ADMIN_API_KEY requis en production'),

// apps/admin — utiliser un proxy API server-side, JAMAIS NEXT_PUBLIC_
// Creer une route /api/admin/proxy qui injecte la cle cote serveur
```

---

### C2 — Aucun chiffrement des documents KYC at rest
**Fichiers** : `services/user-service/src/providers/r2.provider.ts`

**Probleme** : Le CLAUDE.md exige `AES-256-GCM` pour les documents KYC au repos. Le code actuel upload les fichiers en clair vers R2. Les documents KYC contiennent des KBIS, RNA, SIRET, URSSAF — des donnees personnelles sensibles.

**Impact** : Si le bucket R2 est compromis, toutes les pieces d'identite sont lisibles en clair.

**Fix** : Implementer un module `crypto.service.ts` qui chiffre avant upload et dechiffre apres download :
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
// Cle de chiffrement dans env (KMS ou Cloudflare KV), jamais en clair
```

---

### C3 — WebSocket sans authentification
**Fichier** : `services/notification-service/src/realtime/socket.ts:48-66`

**Probleme** : Le serveur Socket.io accepte toute connexion sans verifier l'identite. N'importe qui peut :
- Se connecter sans session
- Rejoindre n'importe quelle room (ville, tribu)
- Espionner les evenements temps reel (nouveaux posts, membres, etc.)

**Impact** : Fuite de donnees en temps reel, spam de rooms, potentiel DoS.

**Fix** :
```typescript
io.use(async (socket, next) => {
  const cookie = socket.handshake.headers.cookie;
  const session = await verifySessionFromCookie(cookie);
  if (!session) return next(new Error('AUTH_REQUIRED'));
  socket.data.userId = session.userId;
  next();
});
```

---

### C4 — Aucun endpoint GDPR export
**Probleme** : Le CLAUDE.md exige un endpoint `/api/gdpr/export` pour l'export des donnees utilisateur. Ce endpoint n'existe nulle part dans le code.

**Impact** : Non-conformite RGPD. En cas de demande d'un utilisateur ou de controle CNIL, impossibilite de fournir les donnees.

**Fix** : Implementer dans `user-service` un endpoint qui exporte toutes les donnees de l'utilisateur (profil, posts, reactions, tribus, KYC metadata) en JSON.

---

### C5 — Defaults Zod avec credentials en production
**Fichiers** (7 services) :
- `services/api-gateway/src/config/env.ts:28`
- `services/auth-service/src/config/env.ts:19`
- `services/user-service/src/config/env.ts:14`
- `services/community-service/src/config/env.ts:14`
- `services/crm-service/src/config/env.ts:15`
- `services/moderation-service/src/config/env.ts:15`
- `services/notification-service/src/config/env.ts:9`
- `services/worker/src/config/env.ts:11`

**Probleme** : `REDIS_URL` a un default `redis://:changeme_local@redis:6379` dans le schema Zod. Si l'env var est absente en production, le service demarre silencieusement avec les credentials dev.

**Impact** : Connection a un Redis non securise en production, ou echec silencieux de connexion.

**Fix** :
```typescript
// En production, PAS de default — fail fast
REDIS_URL: z.string().min(10, 'REDIS_URL requis'),
// Ou conditionnel :
REDIS_URL: env.NODE_ENV === 'production'
  ? z.string().min(10)
  : z.string().default('redis://localhost:6379'),
```

---

## HAUTE (7)

### H1 — Authentification inter-services par header spoofable
**Fichier** : `services/auth-service/src/utils/internal-service.ts`

**Probleme** : La verification inter-services repose sur un header `X-Internal-Service` contenant un nom de service (ex: `user-service`). Aucun secret partage, aucun HMAC, aucune signature. Tout container sur le reseau Docker peut forger ce header.

**Fix** : Utiliser un secret partage (`INTERNAL_SERVICE_SECRET`) verifie avec HMAC-SHA256 ou mTLS.

---

### H2 — Rate limiter auth en memoire (non distribue)
**Fichier** : `services/api-gateway/src/middleware/auth-sensitive-rate-limit.ts`

**Probleme** : Le rate limiter des endpoints sensibles (login, register, OTP) utilise un `Map()` en memoire. Il se reset a chaque redemarrage et ne fonctionne pas en multi-instance.

**Fix** : Utiliser le rate limiter Redis de `@fastify/rate-limit` avec le store Redis deja disponible.

---

### H3 — .env.production tracke dans Git
**Fichiers** :
- `apps/web/.env.production` (contient `NEXT_PUBLIC_API_URL=https://api.yunicity.fr`)
- `apps/admin/.env.production` (idem)

**Probleme** : Ces fichiers sont dans le `.gitignore` mais deja trackes par Git (ajoutes avant le gitignore). Actuellement ils ne contiennent que l'URL API, mais si quelqu'un ajoute un secret, il sera commite.

**Fix** :
```bash
git rm --cached apps/web/.env.production apps/admin/.env.production
```

---

### H4 — CSP desactive sur tous les microservices sauf api-gateway
**Fichiers** : `services/*/src/app.ts` (8 services)

**Probleme** : Tous les microservices utilisent `contentSecurityPolicy: false` dans Helmet. Seul l'api-gateway a un CSP conditionnel en prod. Les services internes ne devraient pas servir de contenu HTML, mais si un endpoint renvoie du HTML par erreur, il n'y a aucune protection XSS.

**Fix** : Activer un CSP par defaut strict sur tous les services :
```typescript
contentSecurityPolicy: { directives: { defaultSrc: ["'none'"] } }
```

---

### H5 — Aucune purge RGPD des donnees soft-deleted
**Probleme** : Le CLAUDE.md exige une purge physique apres 30 jours. Le schema Prisma a bien `deletedAt`, mais aucun cron job ou worker n'effectue la purge.

**Impact** : Les donnees "supprimees" restent indefiniment en base, non-conformite RGPD.

**Fix** : Ajouter un BullMQ cron job dans le worker :
```typescript
// Tous les jours a 3h du matin
await prisma.user.deleteMany({
  where: { deletedAt: { lt: subDays(new Date(), 30) } }
});
```

---

### H6 — Fastify vulnerable (protocol/host spoofing)
**Package** : `fastify <=5.8.2`

**Probleme** : `request.protocol` et `request.host` spoofables via `X-Forwarded-Proto/Host` depuis des connexions non fiables.

**Fix** : `pnpm update fastify@^5.8.3` dans tous les services.

---

### H7 — Audit log minimal, pas immutable
**Fichier** : `services/api-gateway/src/middleware/audit-log.ts`

**Probleme** : L'audit log ne trace que les 401/403 via le logger Fastify. Le CLAUDE.md exige un log immuable pour auth, KYC, paiement, moderation. Le log actuel :
- N'est pas persistant (juste stdout)
- Ne couvre pas les actions sensibles (creation compte, changement MDP, upload KYC, paiement)
- N'est pas immutable (pas de table dediee)

**Fix** : Creer un modele Prisma `AuditLog` avec insertion append-only (pas de UPDATE/DELETE) et logger toutes les actions sensibles.

---

## MOYENNE (8)

### M1 — Middleware Next.js verifie la presence du cookie, pas sa validite
**Fichier** : `apps/web/src/middleware.ts:30-33`

**Probleme** : Le middleware verifie `request.cookies.get('yunicity.session_token')` mais ne valide pas le JWT. Un cookie expire ou forge passe le middleware. La validation se fait cote API, mais l'UX est degradee (pages app visibles puis 401).

---

### M2 — console.log au lieu du logger Fastify
**Fichiers** :
- `services/user-service/src/providers/clamav.provider.ts:10`
- `services/user-service/src/providers/r2.provider.ts:40`
- `services/notification-service/src/realtime/socket.ts:49,64`

**Probleme** : `console.log` en service = logs non structures, pas de correlation request ID, pas de niveaux.

---

### M3 — Pas de caractere special requis dans le mot de passe
**Fichier** : `services/auth-service/src/auth/password.ts:24-35`

**Probleme** : La validation exige majuscule + minuscule + chiffre mais pas de caractere special. La politique minimum de 12 caracteres compense partiellement.

---

### M4 — picomatch vulnerabilites ReDoS
**Packages** : `picomatch <2.3.2` et `>=4.0.0 <4.0.4` (via tailwindcss)

**Impact** : Denial of Service par patterns glob malicieux (impact dev/build seulement).

**Fix** : Mettre a jour tailwindcss ou overrider picomatch dans `pnpm.overrides`.

---

### M5 — Pas de validation des inputs Socket.io
**Fichier** : `services/notification-service/src/realtime/socket.ts:51-56`

**Probleme** : Les arguments `city` et `tribeId` des events `join:city/join:tribe` ne sont pas valides (type, longueur, format). Un client malveillant peut envoyer des valeurs arbitraires.

---

### M6 — Error handler fuit des details en mode non-production
**Fichiers** : `services/auth-service/src/app.ts:45`, `services/community-service/src/app.ts:49`

**Probleme** : Le message d'erreur complet est renvoye quand `isTest` est vrai, mais la condition devrait etre `NODE_ENV === 'production'` pour plus de securite. En staging, les erreurs pourraient fuiter.

---

### M7 — ClamAV optionnel (simule en dev)
**Fichier** : `services/user-service/src/providers/clamav.provider.ts:9`

**Probleme** : Si `CLAMAV_HOST` n'est pas defini, le scan est simule et renvoie toujours `clean: true`. En production, si la variable est oubliee, les fichiers malveillants passent.

**Fix** : En production, refuser le demarrage si `CLAMAV_HOST` est absent.

---

### M8 — Pattern matching PUBLIC_PATHS trop permissif
**Fichier** : `apps/web/src/middleware.ts:16`

**Probleme** : `PUBLIC_PATHS.some(p => pathname.startsWith(p))` permet `/login-anything` car ca commence par `/login`. Il faudrait une correspondance exacte ou avec trailing slash.

---

## BASSE (4)

### B1 — dangerouslySetInnerHTML dans l'app mobile
**Fichier** : `apps/mobile/app/+html.tsx:22`

**Probleme** : Utilise `dangerouslySetInnerHTML` pour injecter un CSS de background. Le contenu est statique et controle (pas d'input utilisateur), donc le risque est minimal.

---

### B2 — Pas de limite de taille explicite sur les body des requetes
**Probleme** : Les services Fastify ne configurent pas explicitement `bodyLimit`. Fastify a un defaut de 1MB, ce qui est raisonnable, mais devrait etre explicite pour la documentation securite.

---

### B3 — Logs conservation max 12 mois non implementee
**Probleme** : Le CLAUDE.md exige une retention max de 12 mois pour les logs. Aucun mecanisme de rotation/purge n'est en place (depend de l'infra de logs).

---

### B4 — Pas de verification CRON_SECRET sur les cron jobs
**Probleme** : Si des cron jobs sont deployes, ils devraient verifier un header `CRON_SECRET` pour eviter les invocations non autorisees.

---

## CRITIQUE ADDITIONNEL — AUTHENTIFICATION (agent audit)

### C-AUTH-1 — MIDDLEWARE AUTH EST UN STUB : BYPASS TOTAL
**Fichier** : `services/api-gateway/src/middleware/auth.ts:33-40`

**Probleme** : Le middleware `requireAuth` est un **stub de developpement**. Toute requete avec un header `Bearer <n'importe quoi>` est authentifiee comme `stub-user-id` avec statut `verified`. Le commentaire dit "TODO(S1)".

```typescript
// TOUTE requete avec Bearer est "authentifiee" comme cet utilisateur
req.user = {
  id: 'stub-user-id',
  email: 'stub@yunicity.fr',
  profileType: 'yunicitizen',
  verificationStatus: 'verified',
};
```

**Impact** : **BYPASS TOTAL DE L'AUTHENTIFICATION**. Toute personne envoyant `Authorization: Bearer xxx` a un acces complet a toutes les routes protegees avec les permissions d'un utilisateur verifie.

**Fix** : Implementer la validation JWT via Better Auth :
```typescript
const session = await auth.api.getSession({
  headers: req.headers as Record<string, string>,
});
if (!session) return reply.status(401).send({ code: 'UNAUTHORIZED' });
req.user = session.user;
```

---

### C-AUTH-2 — Aucune protection CSRF
**Fichiers** : Toute la codebase

**Probleme** : Le projet utilise des cookies httpOnly pour l'authentification (bien), mais ne met en place AUCUNE protection CSRF. Un site malveillant peut forger des requetes POST/PUT/DELETE en exploitant les cookies de session de l'utilisateur.

**Impact** : Modification de profil, creation de posts, paiements — tout peut etre forge.

**Fix** : Activer la protection CSRF de Better Auth ou utiliser `@fastify/csrf-protection` avec le pattern double-submit cookie.

---

### C-AUTH-3 — Account lockout non implemente
**Fichier** : `packages/database/prisma/schema.prisma:104-105`

**Probleme** : Les champs `loginAttempts` et `lockedUntil` existent dans le schema User mais ne sont **JAMAIS lus ni mis a jour** par le code d'authentification. Aucun mecanisme de verrouillage de compte apres echecs repetitifs.

**Impact** : Brute force illimite sur les mots de passe.

**Fix** : Implementer dans Better Auth ou en middleware : incrementer `loginAttempts`, verrouiller apres 5 echecs, verifier `lockedUntil` avant chaque tentative.

---

### C-AUTH-4 — Refresh token rotation non explicite
**Fichier** : `services/auth-service/src/auth/index.ts:18-26`

**Probleme** : La config Better Auth definit `expiresIn: 900` (15min) et `updateAge: 300` (5min), mais ne configure pas explicitement la rotation de refresh token. Si un token est vole, l'attaquant peut rafraichir indefiniment.

**Fix** : Verifier et activer explicitement la rotation dans Better Auth v1.

---

## HAUTE ADDITIONNEL — AUTHENTIFICATION (agent audit)

### H-AUTH-1 — Validation de force du mot de passe jamais appelee
**Fichier** : `services/auth-service/src/auth/password.ts:24-35`

**Probleme** : `validatePasswordStrength()` existe mais n'est jamais appelee. Better Auth accepte donc n'importe quel mot de passe >= 12 caracteres sans complexite.

---

### H-AUTH-2 — Tokens de session stockes en clair en base
**Fichier** : `packages/database/prisma/schema.prisma:170`

**Probleme** : `token String @unique` — les tokens de session sont en clair dans PostgreSQL. Si la base est compromise, toutes les sessions actives sont utilisables.

---

### H-AUTH-3 — OTP rate limiting trop permissif
**Fichier** : `services/auth-service/src/auth/otp.ts`

**Probleme** : 5 tentatives / 15 minutes pour un code a 6 chiffres (1M combinaisons). Un attaquant peut tester 20 codes/heure, soit 14.400 codes/mois. C'est exploitable.

**Fix** : 3 tentatives / 5 minutes avec backoff exponentiel.

---

## MOYENNE ADDITIONNEL — AUTHENTIFICATION (agent audit)

### M-AUTH-1 — Redis error swallow silencieux
**Probleme** : Si Redis tombe, le rate limiting et l'OTP echouent silencieusement. Pas de fail-fast en production.

---

### M-AUTH-2 — X-Forwarded-For non valide
**Fichier** : `services/api-gateway/src/routes/proxy.ts:68`

**Probleme** : `trustProxy: true` est active mais sans configuration des proxies de confiance. Un attaquant peut spoofer son IP pour bypasser le rate limiting.

---

### M-AUTH-3 — resolveUserIdFromSession avale les erreurs
**Fichier** : `services/api-gateway/src/routes/proxy.ts:4-26`

**Probleme** : `catch { return undefined; }` masque les erreurs d'authentification et empeche le debug/audit des echecs.

---

## CRITIQUE ADDITIONNEL — INFRASTRUCTURE (agents)

### C6 — PostgreSQL expose sur le port public 5432
**Fichier** : `docker-compose.yml:245-246`

**Probleme** : Le service postgres expose `ports: - "5432:5432"` sur `0.0.0.0`, avec le mot de passe fallback `changeme_local`. Tout attaquant sur le reseau peut se connecter directement a la base.

**Fix** : Supprimer la directive `ports:` du service postgres. Garder uniquement le reseau Docker interne.

---

### C7 — Credentials fallback dans docker-compose.yml
**Fichier** : `docker-compose.yml:250,264,270`

**Probleme** :
```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme_local}
redis-server --requirepass ${REDIS_PASSWORD:-changeme_local}
```
Si les variables d'environnement ne sont pas definies, les services demarrent avec des credentials triviaux.

**Fix** : Retirer les fallbacks `:-changeme_local`. Le service doit refuser de demarrer sans credentials explicites.

---

## HAUTE ADDITIONNEL — INFRASTRUCTURE (agents)

### H8 — Images Docker non pinnees
**Fichier** : `docker-compose.yml:263,277`

**Probleme** : `redis:7-alpine` (flottant sur 7.x) et `clamav/clamav:stable` (tag mutable). Risque supply chain.

**Fix** : Pinner `redis:7.4.2-alpine`, `clamav/clamav:1.4.1`.

---

### H9 — CI audit ignore les vulnerabilites HIGH
**Fichiers** : `.github/workflows/ci.yml:61`, `.github/workflows/security-scan.yml:35`

**Probleme** : `pnpm audit --audit-level=critical` + `continue-on-error: true`. Les vulnerabilites HIGH passent sans bloquer le merge.

**Fix** : `--audit-level=high` et `continue-on-error: false`.

---

### H10 — Docker-compose utilise le stage builder au lieu de runner
**Fichier** : `docker-compose.yml` (target: builder)

**Probleme** : Les services sont buildes avec le stage `builder` qui n'a pas le user non-root et contient plus de fichiers que necessaire.

**Fix** : Utiliser `target: runner` pour les environnements similaires a la production.

---

## MOYENNE ADDITIONNEL — INFRASTRUCTURE (agents)

### M9 — Credentials de test hardcodes dans CI
**Fichier** : `.github/workflows/ci.yml:72-94`

**Probleme** : `AUTH_SECRET: test_secret_min_32_chars_yunicity_ci` et `DATABASE_URL` avec credentials en clair dans le YAML du workflow.

**Fix** : Utiliser des GitHub Secrets.

---

### M10 — Node.js non pinne dans CI
**Fichier** : `.github/workflows/ci.yml:26`

**Probleme** : `node-version: '22'` peut tirer 22.0 ou 22.99.

**Fix** : Pinner `node-version: '22.13.0'`.

---

### M11 — Pas d'isolation reseau inter-services
**Fichier** : `docker-compose.yml:3-7`

**Probleme** : Tous les microservices sur le meme reseau `internal` peuvent communiquer entre eux. Un service compromis peut pivoter.

---

### M12 — Pas de signature d'images Docker
**Probleme** : Aucune attestation de provenance (cosign, SLSA) sur les images buildees.

---

## BASSE ADDITIONNEL

### B5 — Pas de documentation IaC production
**Probleme** : Le dossier `infra/` ne contient que de la documentation, pas de manifestes Terraform/Kubernetes.

---

## CRITIQUE ADDITIONNEL — VALIDATION API (agent audit)

### C-API-1 — Endpoints KYC upload et push sans authentification
**Fichiers** :
- `services/user-service/src/routes/users.ts` (route `/users/:id/kyc/upload`)
- `services/notification-service/src/routes/push.ts` (route `/push/send`)

**Probleme** : Ces endpoints critiques ne verifient pas l'authentification de l'appelant. En combinaison avec C-AUTH-1 (stub auth), n'importe qui peut uploader des documents KYC pour n'importe quel utilisateur ou envoyer des notifications push arbitraires.

**Fix** : Ajouter `requireAuth` (une fois corrige) sur ces routes + verifier que `req.user.id === params.id` pour KYC.

---

## HAUTE ADDITIONNEL — VALIDATION API (agent audit)

### H-API-1 — Verification inter-services par presence de header uniquement
**Fichiers** :
- `services/community-service/src/middleware/internal.ts`
- `services/notification-service/src/middleware/internal.ts`
- `services/user-service/src/middleware/internal.ts`

**Probleme** : Ces services verifient uniquement que le header `X-Internal-Service` est present, sans valider sa valeur contre une liste autorisee ou un secret. Contrairement a `auth-service` qui a un schema `INTERNAL_SERVICE_NAMES`, ces services acceptent n'importe quel header.

**Fix** : Appliquer la meme validation que `auth-service` : verifier que la valeur du header est dans `INTERNAL_SERVICE_NAMES`, et a terme migrer vers HMAC (cf. H1).

---

### H-API-2 — Creation anonyme de tribus et posts
**Fichier** : `services/community-service/src/routes/tribes.ts`, `services/community-service/src/routes/posts.ts`

**Probleme** : Les endpoints `POST /tribes` et `POST /posts` acceptent un `userId` dans le body sans verifier qu'il correspond a l'utilisateur authentifie. Avec le stub auth actuel, cela permet la creation de contenu au nom de n'importe quel utilisateur.

**Fix** : Extraire `userId` depuis `req.user.id` (session), pas depuis le body de la requete.

---

### H-API-3 — ~9 endpoints sans validation Zod
**Fichiers** (exemples) :
- `services/community-service/src/routes/tribes.ts` (POST/PUT)
- `services/community-service/src/routes/posts.ts` (POST/PUT)
- `services/payment-service/src/routes/portal.ts` (query params)
- `services/user-service/src/routes/users.ts` (PUT body)

**Probleme** : Environ 9 endpoints acceptent les body/query sans validation Zod. Le CLAUDE.md exige une validation Zod sur 100% des endpoints.

**Impact** : Injection de donnees malformees, crash du service, potentiel NoSQL/SQL injection si les ORM ne sanitizent pas correctement.

**Fix** : Ajouter des schemas Zod pour chaque endpoint et valider avec `safeParse()` avant traitement.

---

## MOYENNE ADDITIONNEL — VALIDATION API (agent audit)

### M-API-1 — Query params du portail de paiement non valides
**Fichier** : `services/payment-service/src/routes/portal.ts`

**Probleme** : Les parametres de requete (`return_url`, `customerId`) ne sont pas valides. Un attaquant pourrait injecter une URL de redirection malveillante apres un paiement.

**Fix** : Valider `return_url` contre une whitelist de domaines autorises.

---

### M-API-2 — Pas de pagination forcee sur les endpoints de listing
**Fichiers** : `services/community-service/src/routes/posts.ts`, `services/community-service/src/routes/tribes.ts`

**Probleme** : Les endpoints GET de listing ne forcent pas de `limit` maximum. Un appel avec `limit=999999` pourrait charger toute la table en memoire.

**Fix** : Ajouter `z.coerce.number().max(100).default(20)` pour le parametre `limit`.

---

## CE QUI EST BIEN FAIT

| Aspect | Implementation | Fichier |
|--------|---------------|---------|
| Hashing mots de passe | Argon2id avec params OWASP 2025 | `auth-service/src/auth/password.ts` |
| Cookies auth | httpOnly, SameSite=Strict (prod), Secure, prefix `yunicity` | `auth-service/src/auth/index.ts` |
| Session expiration | 15min access, refresh avec rotation | `auth-service/src/auth/index.ts:20` |
| Env validation Zod | Toutes les variables validees au demarrage | `services/*/config/env.ts` |
| Helmet.js | Actif sur tous les services | `services/*/app.ts` |
| CORS whitelist | Origines explicites, pas de wildcard `*` | `api-gateway/src/plugins/cors.ts` |
| Rate limiting | Global + specifique auth (10 req/15min) | `api-gateway/src/middleware/` |
| R2 signed URLs | 1h expiration, jamais d'URL permanente | `user-service/src/providers/r2.provider.ts:61` |
| ClamAV scan | Avant chaque upload KYC | `user-service/src/services/kyc.service.ts` |
| Soft delete RGPD | `deletedAt` sur User, Tribe, Post, Partner | `schema.prisma` |
| Consentement RGPD | Granulaire (marketing, analytics) | `schema.prisma:122-125` |
| Security audit hook | Trace 401/403 avec IP et userId | `api-gateway/src/middleware/audit-log.ts` |
| Password policy | Min 12, max 128, upper+lower+digit | `auth-service/src/auth/password.ts` |
| Log redaction | Authorization, cookie, password redactes | `api-gateway/src/app.ts:21-26` |
| Email verification | Requis avant activation du compte | `auth-service/src/auth/index.ts:31` |
| 2FA | TOTP avec backup codes | `auth-service/src/auth/index.ts:42-45` |
| No localStorage JWT | Verifie — aucun usage de localStorage pour tokens | Grep resultat |
| No eval/Function | Verifie — aucun usage | Grep resultat |

---

## PLAN D'ACTION PRIORITAIRE

### Sprint 0 (BLOQUANT — deploiement interdit avant fix)
1. **C-AUTH-1** : IMPLEMENTER LA VALIDATION JWT — le middleware auth est un STUB
2. **C-AUTH-2** : Ajouter protection CSRF (double-submit cookie ou Better Auth CSRF)
3. **C-AUTH-3** : Implementer le lockout de compte (loginAttempts/lockedUntil)

### Sprint 1 (urgent — cette semaine)
4. **C1** : Retirer `NEXT_PUBLIC_ADMIN_KEY`, creer un proxy API server-side
5. **C5** : Retirer les defaults credentials dans les schemas Zod de prod
6. **C6** : Supprimer le port 5432 expose dans docker-compose.yml
7. **C7** : Retirer les fallbacks `changeme_local` dans docker-compose.yml
8. **C-AUTH-4** : Configurer explicitement la rotation refresh token
9. **H3** : `git rm --cached` les `.env.production` trackes
10. **H6** : Mettre a jour fastify vers >=5.8.3
11. **H9** : CI audit `--audit-level=high` + `continue-on-error: false`

### Sprint 2 (critique — semaine prochaine)
12. **C3** : Ajouter authentification Socket.io
13. **C2** : Implementer chiffrement AES-256-GCM pour les documents KYC
14. **C-API-1** : Ajouter auth sur `/users/:id/kyc/upload` et `/push/send`
15. **H1** : Remplacer le header inter-service par un secret HMAC
16. **H-API-1** : Aligner la validation inter-services (community/notification/user)
17. **H-API-2** : Extraire userId de la session, pas du body (tribus/posts)
18. **H-API-3** : Ajouter validation Zod sur les ~9 endpoints manquants
19. **H2** : Migrer le rate limiter auth vers Redis
20. **H-AUTH-1** : Appeler validatePasswordStrength() dans le flow auth
21. **H-AUTH-2** : Hasher les tokens de session en base
22. **H-AUTH-3** : Durcir le rate limiting OTP (3 tentatives/5min + backoff)
23. **H8** : Pinner toutes les images Docker (redis, clamav)
24. **H10** : Docker-compose target: runner au lieu de builder

### Sprint 3 (conformite — dans 2 semaines)
14. **C4** : Implementer endpoint `/api/gdpr/export`
15. **H5** : Ajouter cron de purge RGPD 30 jours
16. **H7** : Creer modele AuditLog et logger toutes les actions sensibles
17. **H4** : Activer CSP sur tous les microservices

### Sprint 4 (ameliorations)
18. **M1-M12** : Corriger les issues moyennes (CI creds, node pinning, network isolation, image signing)
19. **B1-B5** : Corriger les issues basses
20. Mettre a jour les dependances (picomatch)
