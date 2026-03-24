# /review — Code review senior Yunicity

Effectue une code review complète du fichier ou diff $ARGUMENTS avec la posture d'un tech lead senior.

## Grille de review

### Architecture & Design
- Respect de la séparation des couches (route → service → repository) ?
- Logique métier dans le bon service (pas dans la route, pas dans le model) ?
- Pas d'import croisé entre services ?
- Types partagés dans `@yunicity/types` si réutilisables ?

### Qualité du code
- TypeScript strict respecté ? Zéro `any` ?
- Nommage explicite (pas de `data`, `res`, `tmp`) ?
- Fonctions courtes (< 50 lignes idéalement, < 100 max) ?
- Duplication évitée — DRY respecté ?
- Pas de code mort / commenté inutilement ?

### Sécurité
- Validation Zod sur tous les inputs ?
- Données sensibles protégées dans les logs ?
- Rate limiting si endpoint sensible ?
- Ownership vérifié avant mutation ?
- Secrets via env uniquement ?

### Performance
- Requêtes MongoDB avec index ? Avec `.limit()` ?
- N+1 queries évitées ?
- Jobs lourds en asynchrone (BullMQ) ?
- Cache Redis utilisé si pertinent ?

### Tests
- Tests ajoutés / mis à jour ?
- Cas d'erreur testés (pas seulement le happy path) ?

## Format de réponse

Structure obligatoire :
```
## ✅ Points positifs
...

## 🔴 Blocants (doit être corrigé avant merge)
...

## 🟠 Importants (fortement recommandé)
...

## 🟡 Suggestions (nice to have)
...

## 📊 Score global : X/10
```