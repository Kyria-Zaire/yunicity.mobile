# PRD — Product Requirements Document
# Yunicity · [NOM DE LA FEATURE]

> **Version** : 0.1 — Draft  
> **Statut** : 🟡 En rédaction | 🟠 En review | 🟢 Validé | 🔴 Bloqué  
> **Auteur** : [Nom]  
> **Dernière mise à jour** : [Date]  
> **Service(s) concerné(s)** : [ex: user-service, community-service]  

---

## 📋 Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Contexte & Problématique](#2-contexte--problématique)
3. [Objectifs & Métriques de succès](#3-objectifs--métriques-de-succès)
4. [Utilisateurs cibles](#4-utilisateurs-cibles)
5. [Périmètre — In Scope / Out of Scope](#5-périmètre--in-scope--out-of-scope)
6. [User Stories](#6-user-stories)
7. [Spécifications fonctionnelles](#7-spécifications-fonctionnelles)
8. [Spécifications techniques](#8-spécifications-techniques)
9. [Sécurité & RGPD](#9-sécurité--rgpd)
10. [Design & UX](#10-design--ux)
11. [Dépendances](#11-dépendances)
12. [Risques & Mitigations](#12-risques--mitigations)
13. [Plan de déploiement](#13-plan-de-déploiement)
14. [Critères d'acceptation](#14-critères-dacceptation)
15. [Questions ouvertes](#15-questions-ouvertes)

---

## 1. Vue d'ensemble

### 1.1 Résumé exécutif
<!-- 3-5 phrases max. Quoi, pourquoi, pour qui, valeur business. -->

**Quoi** : [Description courte de la feature]  
**Pourquoi** : [Problème résolu ou opportunité saisie]  
**Pour qui** : [Profil(s) concerné(s) parmi : yunicitizen, commercial, association, freelance, ecole]  
**Valeur** : [Impact mesurable attendu — utilisateurs, revenus, rétention]  

### 1.2 Lien avec la vision Yunicity
<!-- Comment cette feature sert la mission : reconnecter les habitants à leur ville -->

- [ ] Renforce la cohésion sociale locale
- [ ] Valorise les acteurs locaux
- [ ] Augmente l'engagement sur la plateforme
- [ ] Génère du revenu (phase : 1 / 2 / 3)
- [ ] Prépare le scaling vers d'autres villes

---

## 2. Contexte & Problématique

### 2.1 Contexte
<!-- Situation actuelle. Pourquoi maintenant ? Qu'est-ce qui rend cette feature nécessaire ? -->

### 2.2 Problème à résoudre
<!-- Décrire le pain point précis avec des données si possible -->

**Problème utilisateur** :  
> _"[Verbatim ou reformulation du problème tel que l'utilisateur le vit]"_

**Données / observations qui confirment le problème** :
- [Métrique, retour terrain, observation, data landing page...]

### 2.3 Opportunité
<!-- Ce qu'on peut accomplir en résolvant ce problème -->

---

## 3. Objectifs & Métriques de succès

### 3.1 Objectifs (OKR format)

| Objectif | Résultat clé | Mesure | Cible |
|----------|-------------|--------|-------|
| [Objectif 1] | [KR 1.1] | [Comment mesurer] | [Valeur cible] |
| [Objectif 1] | [KR 1.2] | [Comment mesurer] | [Valeur cible] |
| [Objectif 2] | [KR 2.1] | [Comment mesurer] | [Valeur cible] |

### 3.2 Métriques de succès

**Métriques primaires** (go/no-go) :
- [ ] [Métrique 1] : atteindre [X] en [délai]
- [ ] [Métrique 2] : atteindre [X] en [délai]

**Métriques secondaires** (suivi) :
- [Métrique de rétention, engagement, performance...]

### 3.3 Définition of Done (DoD)
<!-- Feature = "terminée" quand : -->
- [ ] Tous les critères d'acceptation passent
- [ ] Tests unitaires ≥ 80% couverture
- [ ] Tests d'intégration sur tous les endpoints
- [ ] Review sécurité validée
- [ ] RGPD compliance vérifié
- [ ] Documentation API mise à jour
- [ ] Déployé en staging + validé
- [ ] Monitoring / alertes en place

---

## 4. Utilisateurs cibles

### 4.1 Profils concernés

| Profil | Impact | Priorité |
|--------|--------|----------|
| 🟣 Yunicitizen | [Description de l'impact] | Primaire / Secondaire / Hors scope |
| 🔵 Commercial | [Description de l'impact] | Primaire / Secondaire / Hors scope |
| 🟢 Association | [Description de l'impact] | Primaire / Secondaire / Hors scope |
| 🟡 Freelance | [Description de l'impact] | Primaire / Secondaire / Hors scope |
| 🔴 École / Entité | [Description de l'impact] | Primaire / Secondaire / Hors scope |

### 4.2 Personas

#### Persona 1 — [Nom fictif]
- **Profil** : [yunicitizen / commercial / ...]
- **Situation** : [Description courte]
- **Besoin** : [Ce qu'il/elle veut accomplir]
- **Frustration actuelle** : [Ce qui bloque ou frustre]
- **Succès** : [À quoi ressemble le succès pour lui/elle ?]

#### Persona 2 — [Nom fictif]
- **Profil** : ...
- **Situation** : ...
- **Besoin** : ...
- **Frustration actuelle** : ...
- **Succès** : ...

---

## 5. Périmètre — In Scope / Out of Scope

### ✅ In Scope (V1)
<!-- Ce que cette version livre OBLIGATOIREMENT -->
- [ ] [Fonctionnalité 1]
- [ ] [Fonctionnalité 2]
- [ ] [Fonctionnalité 3]

### 🚫 Out of Scope (V1)
<!-- Ce qui est explicitement exclu de cette version — à documenter pour éviter le scope creep -->
- [Fonctionnalité reportée à V2 — raison]
- [Intégration exclue — raison]
- [Cas d'usage non traité — raison]

### 🔮 Future (V2+)
<!-- Idées à garder en tête pour les prochaines itérations -->
- [Idée V2]
- [Idée V3]

---

## 6. User Stories

### Format : `En tant que [profil], je veux [action] afin de [bénéfice]`

### Epic 1 : [Nom de l'épic]

---

#### US-001 — [Titre court]
**En tant que** [profil]  
**Je veux** [action]  
**Afin de** [bénéfice]

**Priorité** : 🔴 Must Have | 🟠 Should Have | 🟡 Could Have | ⚪ Won't Have (this time)  
**Estimation** : [XS / S / M / L / XL]  
**Sprint cible** : S[N]

**Critères d'acceptation** :
```gherkin
Scénario : [Cas nominal]
  Étant donné [contexte initial]
  Quand [action de l'utilisateur]
  Alors [résultat attendu]
  Et [autre résultat attendu]

Scénario : [Cas d'erreur]
  Étant donné [contexte]
  Quand [action qui échoue]
  Alors [message d'erreur approprié]
```

**Notes techniques** :
- [Contrainte ou précision technique]

---

#### US-002 — [Titre court]
**En tant que** [profil]  
**Je veux** [action]  
**Afin de** [bénéfice]

**Priorité** : 🔴 Must Have  
**Estimation** : [taille]  
**Sprint cible** : S[N]

**Critères d'acceptation** :
```gherkin
Scénario : [Cas nominal]
  Étant donné [contexte]
  Quand [action]
  Alors [résultat]
```

---

### Epic 2 : [Nom de l'épic]

#### US-00X — [Titre court]
<!-- Répéter le pattern pour chaque story -->

---

## 7. Spécifications fonctionnelles

### 7.1 Description des flux principaux

#### Flux 1 — [Nom du flux]
```
[Étape 1] → [Étape 2] → [Étape 3] → [Résultat]
     ↓ (erreur)
[Gestion d'erreur]
```

**Description détaillée** :
1. L'utilisateur [action]
2. Le système [réponse]
3. Si [condition], alors [comportement A], sinon [comportement B]

#### Flux 2 — [Nom du flux]
<!-- Répéter pour chaque flux métier -->

### 7.2 Règles métier

| ID | Règle | Priorité |
|----|-------|----------|
| BR-001 | [Description de la règle] | Bloquante |
| BR-002 | [Description de la règle] | Importante |
| BR-003 | [Description de la règle] | Optionnelle |

### 7.3 États et transitions

```
[État initial]
  ├─ [Condition A] → [État B]
  ├─ [Condition B] → [État C]
  └─ [Condition C] → [État terminal]

[État B]
  └─ [Condition] → [État terminal]
```

### 7.4 Notifications & Communications

| Déclencheur | Canal | Destinataire | Contenu |
|-------------|-------|--------------|---------|
| [Événement 1] | Email / Push / SMS | [Qui] | [Sujet + corps résumé] |
| [Événement 2] | Push | [Qui] | [Message] |

---

## 8. Spécifications techniques

### 8.1 Endpoints API

#### `[MÉTHODE] /[path]`
**Description** : [Ce que fait l'endpoint]  
**Auth requise** : Oui / Non  
**Profils autorisés** : [yunicitizen / commercial / tous / admin]  
**Rate limit** : [X req/min]

**Request body** :
```typescript
interface [NomRequest] {
  field1: string;    // Description, contraintes
  field2: number;    // Min, max, optionnel ?
  field3?: string;   // Optionnel
}
```

**Response 200** :
```typescript
interface [NomResponse] {
  id: string;
  // ...
}
```

**Codes d'erreur** :
| Code HTTP | Code métier | Cause |
|-----------|-------------|-------|
| 400 | VALIDATION_ERROR | Input invalide |
| 401 | UNAUTHORIZED | Token manquant ou expiré |
| 403 | FORBIDDEN | Profil non autorisé |
| 404 | NOT_FOUND | Ressource inexistante |
| 409 | CONFLICT | [Conflit spécifique] |
| 429 | RATE_LIMIT_EXCEEDED | Trop de requêtes |

---

#### `[MÉTHODE] /[path]`
<!-- Répéter pour chaque endpoint -->

### 8.2 Modèle de données

#### Collection : `[nom_collection]`
```typescript
interface [NomDocument] {
  _id: ObjectId;
  // Champs obligatoires
  fieldA: string;            // [Description]
  fieldB: 'val1' | 'val2';  // [Description]
  // Champs optionnels
  fieldC?: string;           // [Description]
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;    // Soft delete
}
```

**Index** :
```typescript
// [Justification de chaque index]
collection.index({ fieldA: 1 }, { unique: true });
collection.index({ fieldB: 1, createdAt: -1 });
```

### 8.3 Jobs asynchrones (BullMQ)

| Queue | Job | Déclencheur | Délai | Retry |
|-------|-----|-------------|-------|-------|
| [queue-name] | [job-name] | [Événement] | [Immédiat / Différé] | [X fois] |

### 8.4 Événements temps réel (Socket.io)

| Événement | Émetteur | Récepteur | Payload |
|-----------|----------|-----------|---------|
| `[event:name]` | Serveur | [Qui] | `{ field: type }` |

### 8.5 Performance & Scalabilité

- **Temps de réponse cible** : p95 < [Xms]
- **Charge prévue** : [X req/s] en phase [1/2/3]
- **Cache Redis** : [Quelles données, TTL]
- **Index MongoDB** : [Listés en 8.2]
- **Pagination** : cursor-based, limit [X] par défaut

---

## 9. Sécurité & RGPD

### 9.1 Analyse de sécurité

**Données sensibles traitées** :
- [ ] Données personnelles (nom, email, téléphone)
- [ ] Documents KYC (Kbis, RNA, SIRET)
- [ ] Données de géolocalisation
- [ ] Données financières
- [ ] Contenu généré par les utilisateurs

**Mesures de sécurité spécifiques à cette feature** :
- [ ] Validation Zod sur tous les inputs
- [ ] Rate limiting : [détail]
- [ ] Vérification d'ownership : [détail]
- [ ] Chiffrement : [si données sensibles]
- [ ] Audit log : [actions à loguer]

### 9.2 Modèle de menaces

| Menace | Vecteur | Impact | Mitigation |
|--------|---------|--------|------------|
| [Menace 1] | [Comment] | Élevé / Moyen / Faible | [Contre-mesure] |
| [Menace 2] | [Comment] | [Impact] | [Contre-mesure] |

### 9.3 RGPD

**Base légale** : Contrat / Consentement / Intérêt légitime / Obligation légale  
**Données collectées** : [Quelles données, pourquoi]  
**Durée de conservation** : [Combien de temps]  
**Droit à l'effacement** : [Comment géré pour cette feature]  
**Consentement requis** : Oui / Non — [Détails si oui]  

---

## 10. Design & UX

### 10.1 Principes UX pour cette feature

- [Principe 1 — ex: "L'utilisateur doit comprendre son statut en < 3 secondes"]
- [Principe 2]
- [Principe 3]

### 10.2 Wireframes / Maquettes

> Lier les maquettes Figma ou décrire les écrans clés

**Écran 1 — [Nom]** :
- [Description de ce que l'utilisateur voit]
- [Actions disponibles]
- [États à gérer : vide, chargement, erreur, succès]

**Écran 2 — [Nom]** :
- ...

### 10.3 Design System Yunicity

- Couleurs : Primary `#2A2FFF`, Dark `#0D0F2E`
- Fonts : Syne (titres), DM Sans (corps)
- Composants à utiliser : [Lister les composants `@yunicity/ui`]
- Nouveaux composants à créer : [Si besoin]

### 10.4 Accessibilité

- [ ] Contrastes WCAG AA sur tous les textes
- [ ] Navigation clavier complète
- [ ] Aria-labels sur les éléments interactifs
- [ ] États focus-visible visibles
- [ ] Messages d'erreur associés aux champs de formulaire

---

## 11. Dépendances

### 11.1 Dépendances internes

| Service / Package | Type | Nature |
|-------------------|------|--------|
| [auth-service] | Requise | [Pourquoi — ex: vérification JWT] |
| [user-service] | Requise | [Pourquoi] |
| [@yunicity/types] | Requise | [Types partagés à ajouter] |

### 11.2 Dépendances externes

| Service tiers | Usage | Clé API requise |
|---------------|-------|----------------|
| [Stripe] | [Paiements] | Oui — déjà configuré |
| [Twilio] | [SMS OTP] | Oui — déjà configuré |
| [API Sirene INSEE] | [Vérif SIRET] | Non — API publique |
| [Nouveau service] | [Usage] | À configurer |

### 11.3 Dépendances bloquantes (doit être fait avant)

- [ ] [Feature ou service prérequis]
- [ ] [Configuration infra nécessaire]

---

## 12. Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation | Owner |
|--------|-------------|--------|------------|-------|
| [Risque technique] | Élevée / Moyenne / Faible | Élevé | [Plan B] | [Qui] |
| [Risque produit] | Moyenne | Moyen | [Plan B] | [Qui] |
| [Risque externe] | Faible | Élevé | [Plan B] | [Qui] |

---

## 13. Plan de déploiement

### 13.1 Stratégie de déploiement

- [ ] Feature flag activé (déploiement progressif)
- [ ] Déploiement direct (feature non critique)
- [ ] Migration de données requise

### 13.2 Étapes de déploiement

```
1. [Étape] — Responsable : [Qui] — Durée : [Estimation]
2. [Étape]
3. [Étape]
4. Validation staging
5. Go/No-go décision
6. Déploiement prod
7. Monitoring 24h
```

### 13.3 Rollback plan

En cas de problème en production :
1. [Étape de rollback 1]
2. [Étape de rollback 2]
3. Communication aux utilisateurs si impact visible

### 13.4 Monitoring post-déploiement

**Métriques à surveiller pendant 48h** :
- [Métrique 1 — seuil d'alerte]
- [Métrique 2 — seuil d'alerte]
- Taux d'erreur (seuil : < 1%)
- Temps de réponse p95 (seuil : < Xms)

---

## 14. Critères d'acceptation

### Definition of Ready (DoR)
_La feature peut entrer en développement quand :_
- [ ] PRD validé par le Product Owner
- [ ] Maquettes validées
- [ ] Dépendances identifiées et disponibles
- [ ] Estimations faites
- [ ] Questions ouvertes résolues (section 15)

### Definition of Done (DoD)
_La feature est "terminée" quand :_
- [ ] Toutes les User Stories complètes et testées
- [ ] Code review approuvée (≥ 1 reviewer)
- [ ] Tests unitaires ≥ 80% couverture sur les services concernés
- [ ] Tests d'intégration passent sur tous les endpoints
- [ ] Audit sécurité validé (via `/security-audit`)
- [ ] RGPD compliance vérifié
- [ ] Documentation API (OpenAPI) mise à jour
- [ ] Déployé et validé en staging
- [ ] Monitoring en place (Sentry + Grafana)
- [ ] Feature flag configuré (si applicable)
- [ ] PO a signé la validation finale

### Tests d'acceptation (UAT)

| Scénario | Profil testeur | Résultat attendu | Statut |
|----------|---------------|------------------|--------|
| [Scénario 1] | [Profil] | [Résultat] | ⏳ / ✅ / ❌ |
| [Scénario 2] | [Profil] | [Résultat] | ⏳ / ✅ / ❌ |

---

## 15. Questions ouvertes

> Ces questions doivent être résolues avant que la feature passe en état "Validé"

| # | Question | Responsable | Deadline | Statut |
|---|----------|-------------|----------|--------|
| Q1 | [Question technique ou produit] | [Nom] | [Date] | ⏳ Ouvert |
| Q2 | [Question] | [Nom] | [Date] | ✅ Résolu — [Réponse] |
| Q3 | [Question] | [Nom] | [Date] | ⏳ Ouvert |

---

## 📎 Annexes

### A. Glossaire
| Terme | Définition |
|-------|-----------|
| Triple A | Label Yunicity : Acteur, Ambassadeur, Accueillant |
| Tribu | Groupe thématique de Yunicitizens |
| Passeport Yunicity | Système de points et réductions |
| KYC | Know Your Customer — vérification d'identité |
| Hub | Page centralisée d'une ville ou d'un quartier |

### B. Références
- Cahier des charges Yunicity v1
- Architecture CTO v1
- Design System Yunicity
- [Autres docs pertinents]

### C. Historique des révisions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 0.1 | [Date] | [Nom] | Création initiale |
| 0.2 | [Date] | [Nom] | [Ce qui a changé] |
| 1.0 | [Date] | [Nom] | Validation finale |