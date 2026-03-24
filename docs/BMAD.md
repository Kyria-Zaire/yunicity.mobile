# BMAD — Méthode de Développement Yunicity
# Breakthrough Method for Agile Development

> **Version** : 1.0  
> **Projet** : Yunicity — Réseau Social Local  
> **Philosophie** : Livrer de la valeur réelle, sans dette technique, sans spaghetti, sans surprise.

---

## 🧭 Qu'est-ce que BMAD ?

BMAD est la méthode de travail structurée qui gouverne **tout le cycle de développement Yunicity**.
Elle définit comment passer d'une idée à du code en production de façon fiable, sécurisée et scalable.

**BMAD = 5 phases séquentielles :**

```
B — Blueprint      → Comprendre et concevoir avant de coder
M — Model          → Modéliser les données et les contrats d'API
A — Actualize      → Développer avec rigueur (TDD-first)
D — Deploy         → Livrer en continu avec confiance
+ Review Loop      → Améliorer en permanence
```

**Règle d'or** : On ne passe pas à la phase suivante sans avoir validé la précédente.

---

## 📐 Vue d'ensemble du cycle

```
   IDÉE / BESOIN
        │
        ▼
┌───────────────────┐
│  B — BLUEPRINT    │  PRD complet · Flows · Wireframes · Sécurité
│  (Conception)     │  Durée : 20% du temps total
└────────┬──────────┘
         │  ✅ PRD validé par PO
         ▼
┌───────────────────┐
│  M — MODEL        │  Schémas DB · Contrats API · Types TS · Validators
│  (Modélisation)   │  Durée : 15% du temps total
└────────┬──────────┘
         │  ✅ Schémas et API design revus par Tech Lead
         ▼
┌───────────────────┐
│  A — ACTUALIZE    │  TDD · Feature par feature · Code review
│  (Développement)  │  Durée : 50% du temps total
└────────┬──────────┘
         │  ✅ Tests passent · Code review approuvée
         ▼
┌───────────────────┐
│  D — DEPLOY       │  Staging · QA · Prod · Monitoring
│  (Déploiement)    │  Durée : 15% du temps total
└────────┬──────────┘
         │  ✅ Métriques de succès atteintes
         ▼
   ┌─────────────┐
   │ REVIEW LOOP │  Retro · Dette technique · Next iteration
   └─────────────┘
```

---

## 🔵 B — BLUEPRINT (Conception)

> **Objectif** : Savoir précisément QUOI construire et POURQUOI avant d'écrire une ligne de code.

### B.1 Activités obligatoires

#### B.1.1 — Rédiger le PRD
Utiliser le template `docs/PRD-template.md`.

Checklist PRD avant de passer à M :
- [ ] Sections 1 à 6 complètes (vue d'ensemble, contexte, OKR, personas, scope, user stories)
- [ ] Toutes les user stories ont des critères d'acceptation Gherkin
- [ ] In Scope / Out of Scope clairement définis
- [ ] Questions ouvertes (section 15) résolues ou assumées

#### B.1.2 — Cartographier les flux utilisateurs
Pour chaque user story principale, dessiner le flux complet :
```
[Utilisateur] → [Action] → [Système] → [Réponse] → [État suivant]
                                  ↓ (erreur)
                           [Gestion erreur]
```

Questions à se poser pour chaque flux :
- Qu'est-ce qui peut mal tourner ?
- Quel est le comportement attendu hors-ligne ?
- L'utilisateur comprend-il où il en est dans le processus ?
- Y a-t-il des données sensibles dans ce flux ? (→ RGPD + sécu)

#### B.1.3 — Analyse de sécurité dès la conception
**Ne jamais ajouter la sécurité après coup.**

Pour chaque feature, répondre à :
1. Quelles données personnelles sont collectées/traitées ?
2. Qui peut accéder à quoi ? (matrice des permissions)
3. Quelles sont les surfaces d'attaque ? (inputs, uploads, webhooks...)
4. Quelles menaces sont spécifiques à cette feature ?
5. Quelle est la base légale RGPD ?

**Matrice de permissions Yunicity** :

| Action | Yunicitizen | Commercial | Association | Freelance | École | Admin |
|--------|------------|------------|-------------|-----------|-------|-------|
| Voir son profil | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Voir les autres profils vérifiés | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rejoindre une tribu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer une tribu | ✅ (vérifié) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publier sur le mur | ✅ (vérifié) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Page acteur local | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer un événement | ✅ (vérifié) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Programme fidélité | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Accès dashboard CRM | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modération contenu | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### B.1.4 — Estimation & Planification

**Tailles d'estimation Yunicity** :

| Taille | Points | Durée estimée | Description |
|--------|--------|---------------|-------------|
| XS | 1 | < 2h | Modification simple, pas de nouveau endpoint |
| S | 2 | ½ journée | Un endpoint, logique métier légère |
| M | 3 | 1 journée | Feature complète avec 2-3 endpoints |
| L | 5 | 2-3 jours | Feature complexe, plusieurs services |
| XL | 8 | 1 semaine | Epic complet, refactoring majeur |
| XXL | 13 | > 1 semaine | Décomposer obligatoirement en sous-features |

**Règle** : Toute story > XL doit être décomposée avant d'entrer en développement.

### B.2 Livrables Blueprint
- [ ] `docs/prd/[feature-name]-prd.md` complété et validé
- [ ] Diagrammes de flux (dans le PRD ou Figma)
- [ ] Analyse de sécurité documentée
- [ ] Backlog des user stories estimées dans GitHub Projects
- [ ] Décision Go / No-Go du PO

---

## 🟣 M — MODEL (Modélisation)

> **Objectif** : Définir les contrats de données et d'API avant de coder. Ce qui est flou en conception devient un bug en production.

### M.1 Activités obligatoires

#### M.1.1 — Modèles de données MongoDB
Pour chaque collection nouvelle ou modifiée :

```typescript
// 1. Interface TypeScript complète dans @yunicity/types
interface INouvelleDonnee {
  _id: ObjectId;
  // tous les champs typés
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // soft delete obligatoire
}

// 2. Schema Mongoose avec index
// 3. Migration si modification d'un schema existant
```

Checklist modèle de données :
- [ ] Interface TypeScript dans `@yunicity/types`
- [ ] Schema Mongoose avec validations
- [ ] Index justifiés et documentés (chaque index = une requête réelle)
- [ ] Soft delete (`deletedAt`) inclus
- [ ] Script de migration si modification d'un schema existant

#### M.1.2 — Contrats API (API-First Design)
Définir les contrats AVANT de coder les handlers.

Pour chaque endpoint :
```typescript
// Dans @yunicity/validators — schemas Zod

// Request
export const createTribeSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500),
  category: z.enum(TRIBE_CATEGORIES),
  isPrivate: z.boolean().default(false),
});

// Response
export const tribeResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... jamais de passwordHash, jamais de données sensibles
});

// Types inférés
export type CreateTribePayload = z.infer<typeof createTribeSchema>;
export type TribeResponse = z.infer<typeof tribeResponseSchema>;
```

#### M.1.3 — Review du modèle

Avant de passer à Actualize, le Tech Lead valide :
- Les schémas ne contiennent pas de données redondantes
- Les index couvrent les requêtes du PRD
- Les contrats API sont cohérents entre services
- Aucun champ sensible n'est exposé dans les réponses

#### M.1.4 — Documentation OpenAPI
Mettre à jour `docs/api/openapi.yaml` avec les nouveaux endpoints.

### M.2 Livrables Model
- [ ] Types dans `packages/@yunicity/types`
- [ ] Schemas Zod dans `packages/@yunicity/validators`
- [ ] Schema Mongoose + index dans le service concerné
- [ ] Script de migration si nécessaire (`infra/migrations/`)
- [ ] OpenAPI spec mise à jour
- [ ] Review Tech Lead validée

---

## 🟢 A — ACTUALIZE (Développement)

> **Objectif** : Coder avec rigueur. TDD-first, couche par couche, jamais de spaghetti.

### A.1 Ordre de développement obligatoire

```
1. Tests unitaires (écrire AVANT le code — TDD)
      ↓
2. Repository (accès DB uniquement)
      ↓
3. Service (logique métier pure)
      ↓
4. Route Fastify (handler HTTP)
      ↓
5. Tests d'intégration
      ↓
6. Frontend (composant / page)
      ↓
7. Code review
```

**Règle TDD Yunicity** :
- Écrire le test qui échoue → Écrire le code minimal qui passe → Refactorer
- Minimum 3 tests par fonction de service : cas nominal, cas d'erreur, cas limite
- Les tests de sécurité sont aussi importants que les tests fonctionnels

### A.2 Conventions de développement

#### Structure d'un commit de feature

```bash
# 1. Commit types + models
git commit -m "feat(types): add Tribe interface and CreateTribePayload"

# 2. Commit repository
git commit -m "feat(community): add TribeRepository with CRUD methods"

# 3. Commit service + tests unitaires
git commit -m "feat(community): add TribeService with create/join/leave logic"
git commit -m "test(community): add unit tests for TribeService"

# 4. Commit route + tests intégration
git commit -m "feat(community): add POST /tribes endpoint with auth + rate limit"
git commit -m "test(community): add integration tests for tribes routes"

# 5. Commit frontend
git commit -m "feat(web): add TribeCard component with Yunicity DA"
git commit -m "feat(web): add /tribus page with map integration"
```

#### Checklist avant chaque commit

```bash
# Lancer avant tout commit
pnpm typecheck    # Zéro erreur TypeScript
pnpm lint         # Zéro warning ESLint
pnpm test         # Tous les tests passent
pnpm audit        # Pas de vulnérabilité HIGH/CRITICAL
```

#### Checklist avant d'ouvrir une PR

- [ ] Tous les critères d'acceptation de la US couverts
- [ ] Tests unitaires ≥ 80% couverture sur les services modifiés
- [ ] Tests d'intégration sur tous les nouveaux endpoints
- [ ] Zéro `any` TypeScript
- [ ] Zéro `console.log` dans les services (utiliser `req.log` ou `logger`)
- [ ] Zéro secret hardcodé
- [ ] Rate limiting sur les endpoints sensibles
- [ ] Audit log sur les mutations sensibles
- [ ] Données sensibles non exposées dans les réponses API
- [ ] RGPD : consentement vérifié si collecte de nouvelles données personnelles

### A.3 Workflow des branches

```bash
# Partir toujours de develop
git checkout develop
git pull origin develop

# Créer la branche de feature
git checkout -b feat/tribe-creation

# Développer...
# Commits atomiques et conventionnels

# Avant la PR — mettre à jour depuis develop
git fetch origin
git rebase origin/develop

# Ouvrir la PR vers develop
# Title : feat(community): add tribe creation feature
# Description : lien vers la US du PRD
```

### A.4 Code Review — Standards Yunicity

**Reviewer** : toujours au moins 1 autre dev  
**Délai max** : 24h pour une review (bloquer une PR > 24h n'est pas acceptable)

Le reviewer vérifie :
1. **Sécurité** : validation inputs, pas de données sensibles exposées, rate limiting
2. **Architecture** : séparation des couches respectée, pas d'import croisé entre services
3. **Qualité** : pas de duplication, nommage explicite, fonctions courtes
4. **Tests** : cas d'erreur couverts, pas seulement le happy path
5. **Performance** : index MongoDB, pas de N+1, pagination sur les listes

**Labels PR Yunicity** :
- `🔴 security` — problème de sécurité bloquant
- `🟠 blocking` — bug ou violation d'architecture bloquant
- `🟡 suggestion` — amélioration non bloquante
- `✅ approved` — LGTM

### A.5 Feature Flags

Pour toute feature qui touche à l'expérience utilisateur :

```typescript
// packages/@yunicity/config/src/feature-flags.ts
export const FEATURE_FLAGS = {
  TRIBE_CREATION: process.env.FF_TRIBE_CREATION === 'true',
  AI_YU_RECOMMENDATIONS: process.env.FF_AI_YU === 'true',
  PREMIUM_SUBSCRIPTION: process.env.FF_PREMIUM === 'true',
  // ...
} as const;

// Usage dans le code
import { FEATURE_FLAGS } from '@yunicity/config';

if (!FEATURE_FLAGS.TRIBE_CREATION) {
  return reply.status(503).send({ code: 'FEATURE_DISABLED' });
}
```

### A.6 Gestion de la dette technique

**Règle du Boy Scout** : Laisser le code plus propre qu'on ne l'a trouvé.

Tagger la dette technique :
```typescript
// TODO(yunicity): [Description courte] — Sprint S[N]
// FIXME(yunicity): [Bug connu, non bloquant] — priorité: haute/moyenne/faible
// HACK(yunicity): [Pourquoi ce workaround] — à refactorer quand [condition]
// SECURITY(yunicity): [Point d'attention sécu] — à auditer
```

Règle : Toute dette taguée doit être dans GitHub Issues avec une estimation.

### A.7 Livrables Actualize
- [ ] Code développé et pushé
- [ ] Tests unitaires écrits et passants (≥ 80%)
- [ ] Tests d'intégration passants
- [ ] PR ouverte avec description complète
- [ ] Code review approuvée (≥ 1 reviewer)
- [ ] CI/CD pipeline vert (typecheck + lint + tests + security audit)
- [ ] Documentation mise à jour si API modifiée

---

## 🔴 D — DEPLOY (Déploiement)

> **Objectif** : Livrer en production de façon contrôlée, avec rollback possible et monitoring en place.

### D.1 Environnements Yunicity

```
local      → Docker Compose local — développeur
development → Branche develop — auto-deploy sur push
staging    → Branche release/* — validation QA + PO
production → Branche main — déploiement manuel avec approbation
```

### D.2 Pipeline CI/CD — GitHub Actions

```yaml
# Déclencheurs automatiques :
On PR → develop    : lint + typecheck + tests + security audit
On merge → develop : build + deploy development
On push → release  : build + deploy staging + notification QA
On merge → main    : build + deploy production (avec approbation manuelle)
```

### D.3 Checklist pré-déploiement staging

- [ ] Tous les tests passent en CI
- [ ] Security audit propre (zéro HIGH / CRITICAL)
- [ ] Migration de données préparée et testée (si applicable)
- [ ] Feature flags configurés pour staging
- [ ] Variables d'environnement staging vérifiées
- [ ] Rollback plan documenté

### D.4 Processus de déploiement en production

```
1. QA valide en staging (PO sign-off)
      ↓
2. Merge de release → main après approbation
      ↓
3. GitHub Actions build et push les images Docker
      ↓
4. Déploiement rolling (K8s / Docker) — zéro downtime
      ↓
5. Smoke tests automatiques post-déploiement
      ↓
6. Monitoring 48h (Sentry + Grafana)
      ↓
7. Désactivation du feature flag ou validation définitive
```

### D.5 Rollback plan standard

**Déclencheurs de rollback** :
- Taux d'erreur > 1% sur 5 minutes
- Temps de réponse p95 > 2× la baseline
- Alerte Sentry critique non résolue en < 30 min
- Signal terrain urgent (utilisateur impacté)

**Procédure de rollback** :
```bash
# 1. Identifier la dernière version stable
docker images yunicity/[service] | grep stable

# 2. Rollback immédiat
kubectl rollout undo deployment/[service-name]
# ou Docker Compose :
docker-compose up -d --force-recreate [service-name]:[previous-tag]

# 3. Vérifier la santé
curl http://[service]/health

# 4. Post-mortem dans les 24h
# Fichier : docs/postmortems/[date]-[incident].md
```

### D.6 Monitoring post-déploiement

**Dashboards à surveiller** :
1. **Sentry** : nouveaux types d'erreurs, régression
2. **Grafana** : req/s, latence p50/p95/p99, taux d'erreur
3. **Logs Loki** : erreurs critiques, patterns suspects

**Alertes configurées** :
| Condition | Seuil | Action |
|-----------|-------|--------|
| Taux d'erreur 5xx | > 1% sur 5min | PagerDuty → équipe on-call |
| Latence p95 | > 2s | Slack #alerts |
| Erreur Sentry nouvelle | Severité : fatal | Slack #alerts |
| Tentatives auth suspectes | > 100/min par IP | Slack #security |
| Upload fichier infecté | Tout cas | Slack #security immédiat |

### D.7 Post-mortem (obligatoire sur tout incident P1/P2)

Template `docs/postmortems/TEMPLATE.md` :
```markdown
# Post-mortem : [Titre de l'incident]
Date : [Date]
Durée : [Début → Fin]
Sévérité : P1 (critique) / P2 (élevée) / P3 (moyenne)
Auteur : [Nom]

## Résumé
[2-3 phrases]

## Timeline
- [HH:MM] Détection
- [HH:MM] Début investigation
- [HH:MM] Root cause identifiée
- [HH:MM] Résolution

## Root Cause
[Cause racine — pas juste les symptômes]

## Impact
- Utilisateurs affectés : [X]
- Services impactés : [Liste]
- Durée de l'impact : [Durée]

## Ce qui a bien fonctionné
[Monitoring, réactivité...]

## Actions correctives
| Action | Owner | Deadline | Statut |
|--------|-------|----------|--------|
| [Action] | [Nom] | [Date] | ⏳ |

## Leçons apprises
[Ce qu'on ne fera plus / Ce qu'on fera différemment]
```

### D.8 Livrables Deploy
- [ ] Feature déployée en staging et validée
- [ ] PO sign-off obtenu
- [ ] Feature déployée en production
- [ ] Smoke tests passants
- [ ] Monitoring 48h sans alerte critique
- [ ] Métriques de succès du PRD vérifiées à J+7

---

## 🔄 REVIEW LOOP (Amélioration continue)

> **Objectif** : Ne pas répéter les mêmes erreurs et améliorer le système en continu.

### RL.1 Sprint Review (fin de sprint)

**Participants** : Toute l'équipe  
**Durée** : 1h max  
**Format** :

1. **Demo** : chaque dev montre ce qu'il a livré (5 min/personne)
2. **Métriques** : revue des métriques de succès des features livrées
3. **Backlog** : priorisation du prochain sprint

### RL.2 Sprint Retrospective

**Format Start / Stop / Continue** :
- **Start** : Qu'est-ce qu'on devrait commencer à faire ?
- **Stop** : Qu'est-ce qui ralentit l'équipe ou crée de la dette ?
- **Continue** : Ce qui fonctionne bien et qu'on garde

**Règle** : Chaque retro produit ≥ 1 action concrète avec un owner et une deadline.

### RL.3 Architecture Review mensuelle

Chaque mois, le Tech Lead anime une revue technique :
- Dette technique accumulée (issues taguées `TODO` / `FIXME`)
- Performance des services (métriques 30 derniers jours)
- Dépendances à mettre à jour (sécurité en priorité)
- Préparation au scaling (prochain palier : Reims → Grand Est → National)

### RL.4 Security Review trimestrielle

Tous les 3 mois :
- [ ] `pnpm audit` sur tous les packages — zéro HIGH/CRITICAL
- [ ] Revue des logs d'audit (tentatives suspectes, patterns anormaux)
- [ ] Test de pénétration sur les endpoints critiques (auth, KYC, paiement)
- [ ] Revue des accès (qui a accès à quoi — principe du moindre privilège)
- [ ] Rotation des clés API et secrets

---

## 📊 BMAD en pratique — Exemple concret

### Feature : "Création d'une Tribu"

```
B — BLUEPRINT (2 jours)
    ├─ PRD rédigé : docs/prd/tribe-creation-prd.md
    ├─ User stories : US-001 à US-005 (Yunicitizen crée tribu)
    ├─ Sécurité : qui peut créer ? rate limit ? modération ?
    └─ Estimation : L (5 points, ~2-3 jours de dev)

M — MODEL (1 jour)
    ├─ Interface ITribe dans @yunicity/types
    ├─ Schema Zod createTribeSchema dans @yunicity/validators
    ├─ Schema Mongoose + index (name, category, location)
    └─ Endpoints définis : POST /tribes, GET /tribes, GET /tribes/:id

A — ACTUALIZE (3 jours)
    ├─ Jour 1 : Tests unitaires TribeService (RED) + TribeRepository
    ├─ Jour 2 : TribeService (GREEN) + Route POST /tribes + Tests intégration
    ├─ Jour 3 : Composant TribeCard + Page /tribus + Code review
    └─ PR ouverte → review → merge develop

D — DEPLOY (1 jour)
    ├─ Auto-deploy staging depuis develop
    ├─ QA validation + PO sign-off
    ├─ Feature flag FF_TRIBE_CREATION=true en prod
    └─ Monitoring 48h → métriques OK

Total estimé : ~7 jours pour une feature L proprement livrée
```

---

## 🚦 Indicateurs de santé du projet

### Métriques d'équipe (à suivre chaque sprint)

| Indicateur | Cible | Alerte |
|------------|-------|--------|
| Couverture tests services critiques | ≥ 80% | < 70% |
| PRs ouvertes > 24h sans review | 0 | > 2 |
| Issues taguées FIXME/TODO sans ticket | 0 | > 5 |
| Vulnérabilités npm HIGH/CRITICAL | 0 | Toute |
| Temps moyen PR → merge | < 48h | > 72h |
| Taux d'erreur prod 5xx | < 0.1% | > 0.5% |
| Stories livrées sans tous les critères DoD | 0 | Toute |

### Signaux d'alarme (escalade immédiate)

🔴 **Stop the line** — bloquer les nouvelles features :
- Vulnérabilité de sécurité exploitable découverte
- Taux d'erreur prod > 2%
- Données utilisateurs exposées (fuite, mauvaise projection)
- Test coverage < 60% sur auth-service ou user-service
- Incident RGPD détecté

---

## 📁 Structure des fichiers BMAD dans le projet

```
yunicity/
├── docs/
│   ├── PRD-template.md          ← Template réutilisable
│   ├── BMAD.md                  ← Ce fichier
│   ├── prd/
│   │   ├── tribe-creation-prd.md
│   │   ├── kyc-verification-prd.md
│   │   └── [feature]-prd.md     ← Un PRD par feature
│   ├── api/
│   │   └── openapi.yaml          ← Spec OpenAPI maintenue à jour
│   ├── adr/                      ← Architecture Decision Records
│   │   └── ADR-001-better-auth.md
│   └── postmortems/
│       └── [date]-[incident].md
```

---

## ✅ Checklist rapide BMAD par phase

### Blueprint ✓
```
□ PRD sections 1-6 complètes
□ Flux utilisateurs cartographiés
□ Analyse sécurité faite
□ Stories estimées
□ PO sign-off
```

### Model ✓
```
□ Types TS dans @yunicity/types
□ Schemas Zod dans @yunicity/validators
□ Schema Mongoose + index
□ OpenAPI mis à jour
□ Tech Lead review
```

### Actualize ✓
```
□ Tests écrits avant le code (TDD)
□ Repository → Service → Route → Frontend
□ Coverage ≥ 80%
□ Zéro any, zéro console.log, zéro secret
□ PR avec description + lien PRD
□ Code review approuvée
□ CI vert
```

### Deploy ✓
```
□ Staging déployé et validé
□ PO sign-off
□ Feature flag configuré
□ Production déployé
□ Monitoring 48h
□ Métriques PRD vérifiées à J+7
```

### Review Loop ✓
```
□ Sprint review faite
□ Retro avec ≥ 1 action concrète
□ Dette technique traitée
□ Security review si trimestre écoulé
```