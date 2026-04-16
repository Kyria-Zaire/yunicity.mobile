# Audit sécurité global — Yunicity (consolidé)

**Date :** 17 avril 2026  
**Documents sources :**

- Backend : `infra/docs/security-audit-final.md` (référence historique + pistes P2/P3 ; l’état **post-remédiation** P0/P1 est validé en CI sur `main`, commit **e8114c5**).
- Frontend : `infra/docs/security-audit-frontend.md` (présent document complété par l’audit web/admin ci-dessus).

---

## Scores

| Couche | Score /100 | Commentaire |
| --- | ---: | --- |
| **Backend** (post P0/P1, CI vert) | **~80** | Failles critiques corrigées et couvertes par tests de régression ; résiduels principalement défense en profondeur, RGPD étendu, durcissement inter-services. |
| **Frontend** (`apps/web` + `apps/admin`) | **76** | Bonnes bases (pas de `dangerouslySetInnerHTML`, `NEXT_PUBLIC_` sans secrets, clé admin côté serveur) ; lacunes sur chemins auth publics, mock utilisateur, absence de CSP Next, admin sans garde d’accès applicative. |
| **Global estimé** | **78** | Moyenne pondérée (backend légèrement plus critique à l’exploitation une fois exposé ; frontend dépend fortement du cloisonnement admin et des mises à jour deps). |

*Le score global n’est pas une certification ; il sert au pilotage des backlog sécurité.*

---

## Top 5 priorités restantes (toutes couches)

1. **Admin Next (`apps/admin`)** — Aucune authentification avant les handlers **`/api/admin/*`** : toute personne atteignant l’origine admin peut déclencher des actions relayées avec `ADMIN_API_KEY` côté serveur. **Bloquant** si l’URL admin est sur Internet. → Middleware auth staff, VPN, IP allowlist, ou Basic Auth au bord.

2. **Middleware web `/verify-email`** — Absence de **`/verify-email`** dans `PUBLIC_PATHS` : risque de **casse du parcours OTP** et comportement imprévisible. → Ajuster la liste ou la stratégie de session post-inscription.

3. **Durcissement HTTP front** — Absence de **CSP / headers** dans `next.config.ts` (web + admin). → Introduire une CSP progressive, `frame-ancestors`, `Referrer-Policy`, etc.

4. **Hygiène dépendances frontend** — `pnpm audit --audit-level=high` : **Next.js &lt; 15.5.15** (admin), **defu** (via better-auth web), **picomatch** (chaîne tailwind admin). → Monter les versions / overrides documentés au monorepo.

5. **Qualité auth UX + fuite logique** — `use-current-user.ts` : **mock utilisateur** en absence de session / sur erreur API, et URL **`/users/users/`** incorrecte. → Désactiver le mock en prod et corriger le chemin pour éviter fallback silencieux vers des données fictives.

---

## Alignement CI / suivi

- Le pipeline **CI — Yunicity** vert sur **e8114c5** couvre les régressions **backend** associées aux correctifs sécurité récents.
- Pour le **frontend**, ajouter au minimum : tests sur **middleware** (routes publiques), et un test de **non-régression** sur l’URL `GET /users/me` / session (selon conventions d’API du projet).

---

## Références rapides

| Sujet | Fichier |
| --- | --- |
| Backend détaillé | `infra/docs/security-audit-final.md` |
| Frontend détaillé | `infra/docs/security-audit-frontend.md` |
| Proxy admin (clé serveur) | `apps/admin/src/app/api/admin/[...path]/route.ts` |
| Middleware session web | `apps/web/src/middleware.ts` |

---

*Document de synthèse ; mettre à jour les scores lors des prochains audits ou après remédiation des P0/P1 frontend.*
