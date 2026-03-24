# Audit Sécurité — Sprint 5 — 2026-03-17

## Résumé

- Vulnérabilités trouvées : 5 (audit initial : 3 HIGH, 2 moderate)
- Vulnérabilités corrigées : 3 HIGH (via `pnpm.overrides` : kysely, fast-xml-parser)
- Exceptions documentées : 1 moderate résiduel (`infra/docs/security-exceptions.md`)

## OWASP Top 10

| #   | Catégorie                         | Statut | Notes |
| --- | --------------------------------- | ------ | ----- |
| A01 | Broken Access Control             | ✅     | `GET/PATCH /users/:id`, KYC, passport : contrôle `X-User-ID` / admin ; résolution session → `X-User-ID` sur `/users` dans l’API Gateway ; internes : liste blanche `X-Internal-Service`. |
| A02 | Cryptographic Failures            | ✅     | Argon2id inchangé ; `r2Key` retirée des réponses KYC + sanitization `verificationStatus.documents` ; session 15 min ; cookies `httpOnly`, `secure` en prod, `sameSite: strict` en prod. |
| A03 | Injection                         | ✅     | Validation `ObjectId` sur routes `:id` user-service ; Zod sur CRM / users ; pas d’interpolation non validée identifiée. |
| A04 | Insecure Design                   | ✅     | Rate limit OTP (Redis, 10/15 min/IP) sur verify-email/phone ; rate limit gateway sur chemins auth sensibles (10/15 min/IP). |
| A05 | Security Misconfiguration       | ✅     | `.gitignore` : `*.local` ajouté ; CORS / Helmet inchangés ; erreurs prod sans détail excessif côté services. |
| A06 | Vulnerable Components            | ✅     | `pnpm audit --audit-level=high` → 0 HIGH/CRITICAL après overrides ; moderate documenté. |
| A07 | Auth Failures                    | ⚠️     | Session 15 min OK (Better Auth) ; lockout après 5 échecs sur **User** Mongo non branché sur le flux Better Auth — à unifier (hook / table session). |
| A08 | Software & Data Integrity        | ✅     | Webhooks Stripe inchangés ; pas d’endpoint public identifié pour injecter des jobs BullMQ arbitraires. |
| A09 | Security Logging                 | ✅     | Hook `onResponse` gateway sur 401/403 ; logs OTP échoué / upload KYC (`[AUDIT]`). |
| A10 | SSRF                             | ✅     | Pas de `fetch` sur URL utilisateur identifié ; inter-services via `env`. |

## Actions correctives appliquées

1. **user-service** : contrôle d’accès `GET/PATCH /users/:id`, rate limit OTP, validation ObjectId, `sanitizeUserForApi`, KYC sans `r2Key` en réponse + contrôle `X-User-ID`.
2. **user-service** : `isTrustedInternalService` + `INTERNAL_SERVICE_NAMES` (env optionnel).
3. **auth-service** : même principe pour `/internal/verify-otp` ; cookies `sameSite: strict` en production.
4. **api-gateway** : résolution session (`/auth/session/verify` + cookie) → `X-User-ID` pour chemins `/users` ; audit 401/403 ; rate limit auth sensible.
5. **crm-service** : `POST /crm/partners` avec `source: "inscription"` (waitlist) sans `userId`/`companyName` obligatoires.
6. **Monorepo** : `pnpm.overrides` pour `kysely` et `fast-xml-parser`.

## Points d’attention pour la beta

- **Lockout login** : implémenter côté Better Auth / adaptateur Mongo aligné sur `User.security.loginAttempts` / `lockedUntil`.
- **notification-service / community-service** : renforcer `X-Internal-Service` avec la même liste blanche que user-service (actuellement header non vide).
- **Cookie cross-origin** : si le front (3010) appelle la gateway (3000), vérifier que les cookies de session sont bien transmis ou passer par un reverse proxy même origine.

## Validation S5-03

| Critère                         | Résultat |
| ------------------------------- | -------- |
| `pnpm audit --audit-level=high` | 0 HIGH/CRITICAL |
| `pnpm typecheck`                | À lancer en CI (`turbo run typecheck`) |
| Tests ciblés user/crm/gateway   | OK |
