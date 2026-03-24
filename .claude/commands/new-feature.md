# /new-feature — Implémenter une feature Yunicity complète

Feature à implémenter : $ARGUMENTS

## Processus obligatoire (dans cet ordre)

### 1. Analyse & Design (avant d'écrire une ligne de code)
- Identifier le(s) service(s) concerné(s)
- Lister les endpoints nécessaires (méthode, path, auth requis)
- Définir les schemas Zod d'input/output
- Identifier les impacts sécurité (données sensibles ? KYC ? paiement ?)
- Identifier les jobs BullMQ asynchrones nécessaires

### 2. Types partagés (`packages/@yunicity/types`)
- Ajouter les interfaces TypeScript nécessaires
- Exporter proprement

### 3. Validators (`packages/@yunicity/validators`)
- Créer les schemas Zod
- Réutiliser les schemas existants

### 4. Repository (accès DB)
- Méthodes typées, projection explicite
- Index si nouvelle requête fréquente

### 5. Service (logique métier)
- Zéro dépendance Fastify
- Result pattern pour les erreurs
- Audit log sur les mutations

### 6. Route Fastify
- Schema JSON pour la doc auto
- Auth middleware si endpoint protégé
- Rate limit si endpoint sensible
- Validation Zod du body

### 7. Tests
- Unit test du service (mock repository)
- Integration test de la route (supertest)

### 8. Mise à jour OpenAPI
- Doc du nouvel endpoint

## Checklist de validation finale
- [ ] Zéro `any` TypeScript
- [ ] Validation Zod sur tous les inputs
- [ ] Rate limit si endpoint auth/sensible
- [ ] Audit log si mutation de données
- [ ] Tests écrits
- [ ] Pas de secret hardcodé
- [ ] RGPD : consentement vérifié si données personnelles