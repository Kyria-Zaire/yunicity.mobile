# Audit sécurité frontend — Yunicity (`apps/web`, `apps/admin`)

**Date :** 17 avril 2026  
**Type :** revue statique du code + `pnpm audit` (niveau high)  
**Périmètre :** Next.js 15 (web + admin), middleware, fetch client/serveur, variables d’environnement publiques, dépendances directes du workspace concernées.

---

## Score global : **76 / 100**

| Axe | Sous-score |
| --- | ---------- |
| Exposition données / env | 16 / 18 |
| XSS & contenu dynamique | 17 / 20 |
| CSRF & cookies | 14 / 16 |
| Auth côté client | 12 / 16 |
| Dépendances (audit) | 9 / 12 |
| Headers CSP / durcissement Next | 4 / 10 |
| Admin & secrets | 10 / 12 |

---

## 1. Exposition de données sensibles

### `NEXT_PUBLIC_*`

| Fichier | Observation |
| --- | --- |
| `apps/web/src/lib/config.ts` **L1** | `NEXT_PUBLIC_API_URL` — URL de gateway uniquement, **pas** de clé secrète. |
| `apps/web/src/components/waitlist-form.tsx` **L5** | Idem. |
| `apps/web/src/components/community/post-card.tsx` **L53, L70** | Idem. |
| `apps/web/src/components/tribes/create-tribe-modal.tsx` **L56** | Idem. |
| `apps/web/src/app/(auth)/verify-email/verify-email-form.tsx` **L61** | Idem. |
| `apps/admin/src/lib/config.ts` **L1** | Idem. |
| `apps/admin/src/app/api/admin/[...path]/route.ts` **L3** | `NEXT_PUBLIC_API_URL` pour construire l’URL backend ; **L4** `ADMIN_API_KEY` est **sans** préfixe `NEXT_PUBLIC_` → réservé serveur. |

**Verdict :** aucune clé API secrète exposée via `NEXT_PUBLIC_` relevée. Le préfixe `NEXT_PUBLIC_` sur l’URL du gateway est **attendu** (bundle client).

### Fichiers `.env.production`

Les fichiers `apps/web/.env.production` et `apps/admin/.env.production` **ne sont pas versionnés** dans le dépôt (absents du tree — conforme aux bonnes pratiques). **Recommandation :** maintenir des `.env.example` / documentation Railway sans secrets.

---

## 2. XSS

### `dangerouslySetInnerHTML`

Recherche globale sous `apps/web` et `apps/admin` : **aucune** occurrence de `dangerouslySetInnerHTML`.

### HTML injecté via le DOM

| Niveau | Fichier:lignes | Impact | Correction |
| --- | --- | --- | --- |
| **FAIBLE** | `apps/web/src/components/map/yunicity-map.tsx` **L57–L79** | `el.innerHTML = iconSvg[actor.profileType]` avec SVG **statique** par type. Les types viennent des données carte ; risque DOM XSS **faible** si une valeur hors enum était injectée côté API. | Conserver un `switch` / map **strictement typée** ou créer les nœuds via `createElement` + `textContent` pour éliminer toute ambiguïté. |

### Liens dynamiques (`href`, `router.push`)

- `notifications/page.tsx` **L85–86** : `href={n.url}` — données **mock locales** aujourd’hui ; en prod, **valider** les URLs (schéma `https:`, hôte autorisé) avant rendu.
- `about-tab.tsx` **L245** : `href={link}` depuis profil — risque **javascript:** / ouverture malveillante si `link` vient du serveur sans validation.
- `verification-pending-content.tsx` **L29** : query string construite avec `userId` / `profileType` — si jamais contrôlés par un tiers, risque d’**open redirect** limité au même site ; préférer `encodeURIComponent`.
- `map/page.tsx` **L367** : `href={/profil/${selected.id}}` — `id` typé côté app ; acceptable si IDs sont des cuid serveur.

---

## 3. CSRF

- Les mutations `fetch(..., { credentials: 'include' })` **alignent** l’envoi des cookies de session vers le gateway (ex. `use-current-user.ts` **L113–115**, `post-card.tsx` **L57, L74**, `create-tribe-modal.tsx` **L60**, `onboarding/page.tsx` **L77**, `premium/page.tsx` **L80**, `follow-button.tsx` **L27**, `direct-message-modal.tsx` **L41**, `dashboard/page.tsx` **L121**, `passport/page.tsx` **L109**).
- Le **gateway** applique une protection **Origin / Referer** sur les méthodes mutantes avec cookie (`services/api-gateway/src/middleware/csrf.ts` — référence backend). **Point d’attention :** si `Origin` et `Referer` sont absents, la requête est **laissée passer** (documenté côté API).

| Niveau | Sujet | Correction priorisée |
| --- | --- | --- |
| **MOYENNE** | Dépendance au couple cookie + CORS + SameSite sans token CSRF dédié. | Évaluer un **double submit cookie** ou token synchronizer pour actions sensibles (paiement, suppression compte). |

---

## 4. Authentification côté client

### Middleware (`apps/web/src/middleware.ts`)

- Vérification du cookie `yunicity.session_token` **L30–32** ; redirection `/login` si absent (**L31–32**).
- Chemins publics : **L3–8** (`/`, `/login`, `/register`, `/verification-pending`, `/privacy`).

| Niveau | Fichier:lignes | Impact | Correction |
| --- | --- | --- |
| **HAUTE** | `middleware.ts` **L3–8** vs routes `(auth)` | **`/verify-email` n’est pas dans `PUBLIC_PATHS`**. Un utilisateur **sans** cookie de session (inscription fraîche) peut être **redirigé vers `/login`** avant de saisir l’OTP. | Ajouter `/verify-email` (et autres flux auth publics nécessaires) à `PUBLIC_PATHS`, ou émettre une session limitée post-inscription. |
| **MOYENNE** | `use-current-user.ts` **L103–107**, **L120–125** | En absence de `userId` session ou si l’API échoue, le hook charge **`MOCK_USER`** avec email/téléphone fictifs — risque de **confusion** ou d’affichage de données de démo si un trou dans le middleware existait. | En production : `setUser(null)` sans mock ; mock uniquement si `NODE_ENV === 'development'`. |
| **MOYENNE** | `use-current-user.ts` **L113** | URL `${API_URL}/users/users/${userId}` — segment **`users` en double** ; risque de 404 et fallback mock. | Corriger le chemin (`/users/${userId}` selon contrat gateway). |

### Tokens hors `localStorage`

- Pas de stockage de **token de session** Better Auth dans `localStorage` / `sessionStorage` pour l’auth (hors clé UX `onboarding_done` : `onboarding/page.tsx` **L88, L97**, `onboarding-gate.tsx` **L23** — non sensible).
- **Verdict :** aligné avec cookies **httpOnly** côté auth.

---

## 5. Dépendances (`pnpm audit --audit-level=high`)

Commande exécutée depuis `apps/web` puis `apps/admin` : le graphe **workspace** peut remonter des chemins hors app ; vulnérabilités **pertinentes** pour le frontend :

| Sévérité | Paquet / chemin typique | Action |
| --- | --- | --- |
| **High** | `defu` via `better-auth` (`apps__web>better-auth>defu`) — prototype pollution | Mettre à jour **better-auth** / override `defu >= 6.1.5` au niveau monorepo si nécessaire. |
| **High** | `next` DoS Server Components (`apps__admin>next`, GHSA-q4gf-8mx6-v5v3) | Monter **Next.js** vers **≥ 15.5.15** (web + admin alignés). |
| **High** | `picomatch` via **tailwind** (`apps__admin>tailwindcss>…`) | Mettre à jour chaîne **tailwind / chokidar** ou overrides `picomatch`. |

*Les entrées `vite` / `fastify` via `services__ai-service` concernent surtout le backend/outillage test — suivre le même `pnpm audit` racine.*

---

## 6. Headers CSP / sécurité Next

| Niveau | Fichiers | Observation |
| --- | --- | --- |
| **MOYENNE** | `apps/web/next.config.ts` **L1–15** | **Aucun** bloc `headers()` (CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). Next + `helmet` côté API ne couvrent pas les en-têtes **document** du front. |
| **MOYENNE** | `apps/admin/next.config.ts` **L1–9** | Idem. |

**Correction priorisée :** ajouter dans les deux `next.config.ts` des en-têtes de sécurité (CSP progressive, `frame-ancestors 'none'` pour l’admin, etc.) et `outputFileTracingRoot` si besoin (warning lockfile parent déjà observé en dev).

---

## 7. Données hardcodées (grep ciblé)

Recherche de motifs type `sk_live`, `sk_test`, `AIza`, mots de passe en clair, `ADMIN_API_KEY=` dans le code source `apps/web` et `apps/admin` : **rien** de critique dans les sources auditées. Les **mots de passe** dans les formulaires sont des champs Zod / état React uniquement (`login/page.tsx`, `register/page.tsx`).

**Mock utilisateur** dans `use-current-user.ts` **L51–78** : données fictives — à **désactiver en prod** (voir §4).

---

## 8. Admin panel

| Élément | Fichier:lignes | Verdict |
| --- | --- | --- |
| Clé admin | `route.ts` **L4**, **L44–47** | `ADMIN_API_KEY` lue **côté serveur** uniquement ; ajoutée en **`X-Admin-Key`** vers le backend — **non** exposée au navigateur. |
| Appels UI | `lib/api.ts` **L30–82** | Le navigateur appelle **`/api/admin/*`** (même origine), pas le gateway avec la clé. |
| Contrôle d’accès UI | Aucun `middleware.ts` sous `apps/admin` | **Toute personne** qui atteint l’URL du déploiement admin peut invoquer **`/api/admin/*`** ; le serveur Next relaie avec **pleins pouvoirs admin**. |

| Niveau | Impact | Correction |
| --- | --- | --- |
| **CRITIQUE** (si admin exposé sur Internet) | Absence d’auth (session, mTLS, IP allowlist, Basic Auth) **avant** le proxy = **surface d’administration ouverte**. | Protéger l’app admin : **middleware** Next (session staff + JWT), **VPN**, **Basic Auth** reverse-proxy, ou hébergement non routable publiquement. |
| **FAIBLE** | `getAdminStats` / `getAdminUsers` masquent les erreurs (retour tableaux vides) — peut masquer des **échecs auth** silencieux. | Journaliser côté serveur et distinguer 401/403 côté UI. |

---

## Synthèse des corrections priorisées (frontend)

| Priorité | Action |
| --- | --- |
| **P0** | Sécuriser l’**accès à l’app admin** (auth réseau ou applicative) avant toute exposition publique. |
| **P0** | Corriger **`PUBLIC_PATHS`** pour inclure **`/verify-email`** (flux OTP sans session). |
| **P1** | Supprimer le **mock utilisateur** en production ; corriger l’URL **`/users/users/`** dans `use-current-user.ts`. |
| **P1** | Mettre à jour **Next ≥ 15.5.15** et traiter **defu** / **picomatch** (audit high). |
| **P2** | Ajouter **headers de sécurité** (CSP, etc.) dans `next.config.ts` (web + admin). |
| **P2** | Valider les **URLs** issues de l’API avant `href` / `router.push` (notifications, profil). |
| **P3** | Remplacer `innerHTML` des marqueurs carte par construction DOM sûre. |

---

*Rapport produit en revue statique ; compléter par tests E2E (auth, admin, CSRF cross-origin) et scan DAST en préproduction.*
