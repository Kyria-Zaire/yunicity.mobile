## Description

<!-- Décris brièvement ce que fait cette PR et pourquoi -->

## Type de changement

- [ ] `feat` — Nouvelle fonctionnalité
- [ ] `fix` — Correction de bug
- [ ] `refactor` — Refactoring (pas de changement fonctionnel)
- [ ] `security` — Correction de sécurité
- [ ] `test` — Ajout/modification de tests
- [ ] `chore` — Maintenance (deps, CI, config)
- [ ] `docs` — Documentation

## Checklist sécurité

- [ ] Aucun secret dans le code (`process.env.*` uniquement)
- [ ] Validation Zod sur tous les endpoints ajoutés/modifiés
- [ ] Pas de `any`, `@ts-ignore`, ou `@ts-nocheck`
- [ ] Pas de `console.log` — logger Fastify uniquement
- [ ] Rate limiting configuré sur les endpoints sensibles
- [ ] Données sensibles projetées (`select('-passwordHash')`)
- [ ] URLs signées pour tout accès fichier R2/S3

## Definition of Done

- [ ] TypeScript compile sans erreur (`pnpm typecheck`)
- [ ] Tests unitaires ajoutés et passent (`pnpm test`)
- [ ] Tests d'intégration passent si applicable
- [ ] Lint passe (`pnpm lint`)
- [ ] PR review par au moins 1 tech lead
- [ ] Pas de régression sur la couverture de tests

## Screenshots / Captures (si UI)

<!-- Ajoute des captures si pertinent -->
