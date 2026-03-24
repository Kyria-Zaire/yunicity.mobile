# /bmad — Vérifier la phase BMAD et guider l'étape suivante

Feature / Sprint : $ARGUMENTS

## Instructions

En t'appuyant sur la méthode `docs/BMAD.md`, analyse où en est la feature ou le sprint indiqué et guide la prochaine action.

### Ce que tu dois faire

1. **Identifier la phase actuelle**
   - Cherche le PRD correspondant dans `docs/prd/`
   - Vérifie les branches Git actives
   - Regarde l'état des tests et du code

2. **Évaluer la phase en cours**

   **Si Blueprint** : Le PRD est-il complet ?
   - Sections 1-6 remplies ?
   - User stories avec critères d'acceptation Gherkin ?
   - Analyse sécurité faite ?
   - PO sign-off obtenu ?

   **Si Model** : Les contrats sont-ils définis ?
   - Types TS dans `@yunicity/types` ?
   - Schemas Zod dans `@yunicity/validators` ?
   - Schema Mongoose + index justifiés ?
   - OpenAPI mis à jour ?

   **Si Actualize** : Le code respecte-t-il les standards ?
   - TDD respecté (tests avant code) ?
   - Coverage ≥ 80% sur les services modifiés ?
   - Zéro `any`, zéro `console.log`, zéro secret ?
   - Toutes les couches présentes (repo → service → route) ?

   **Si Deploy** : Le déploiement est-il sécurisé ?
   - Staging validé par le PO ?
   - Feature flag configuré ?
   - Monitoring en place ?

3. **Lister les blocages** (ce qui empêche de passer à la phase suivante)

4. **Donner les 3 prochaines actions prioritaires** avec l'ordre exact

### Format de réponse obligatoire

```
## Phase actuelle : [B/M/A/D] — [Nom de la phase]
## Progression : [X/Y checklist items complétés]

### ✅ Fait
- [Item]

### 🔴 Blocants (doit être résolu avant d'avancer)
- [Item]

### 🟡 À faire (dans cet ordre)
1. [Action prioritaire 1]
2. [Action prioritaire 2]
3. [Action prioritaire 3]

### Prochaine phase : [Nom] — Prêt à démarrer : Oui / Non (raison)
```
