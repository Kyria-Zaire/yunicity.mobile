# /security-audit — Audit de sécurité du code sélectionné

Effectue un audit de sécurité complet sur le code fourni ou le fichier $ARGUMENTS.

## Checklist d'audit à exécuter

### 🔐 Authentification & Autorisation
- [ ] JWT stocké en httpOnly cookie (pas localStorage)
- [ ] Expiration access token ≤ 15 min
- [ ] Refresh token rotation à chaque usage
- [ ] MFA vérifié sur les endpoints sensibles
- [ ] Vérification de l'ownership avant toute mutation (ex: user ne peut modifier que son propre profil)

### 🛡️ Validation des inputs
- [ ] Zod schema sur TOUS les paramètres (body, query, params, headers)
- [ ] Pas de `any` TypeScript
- [ ] Pas d'interpolation string dans les queries MongoDB
- [ ] Taille max définie sur les uploads
- [ ] Content-Type vérifié sur les uploads

### 🔑 Gestion des secrets
- [ ] Aucun secret hardcodé dans le code
- [ ] Toutes les clés via process.env (validées par Zod en config/env.ts)
- [ ] Pas de secret dans les logs
- [ ] Pas de données sensibles dans les URLs (query params)

### 🗄️ Base de données
- [ ] Mongoose strict mode activé
- [ ] Projection explicite sur les champs sensibles (pas de `.find()` nu)
- [ ] `.limit()` sur toutes les requêtes de liste
- [ ] Index créés pour les requêtes fréquentes
- [ ] Soft delete (`deletedAt`) au lieu de suppression physique

### 📁 Fichiers & Uploads
- [ ] Scan ClamAV avant stockage
- [ ] URL signées avec expiration (max 1h)
- [ ] Bucket R2 privé (pas d'URL publique)
- [ ] Validation du type MIME côté serveur
- [ ] Limite de taille enforced (pas seulement côté client)

### 🚦 Rate Limiting
- [ ] Rate limit sur les endpoints d'auth (10 tentatives / 15 min)
- [ ] Rate limit sur les endpoints publics
- [ ] Rate limit sur les uploads
- [ ] Implémenté avec Redis (sliding window)

### 🌐 Headers HTTP
- [ ] Helmet.js activé
- [ ] CSP défini (pas de `unsafe-inline` en prod)
- [ ] CORS strict (pas de `*`)
- [ ] HSTS configuré
- [ ] X-Frame-Options défini

### 📋 Logs & Audit
- [ ] Pas de données sensibles dans les logs (email, token, password)
- [ ] Audit log sur : auth, KYC, paiement, modération, suppression
- [ ] Logger structuré Pino (pas de console.log)

## Format de réponse

Pour chaque problème trouvé :
```
🔴 CRITIQUE | 🟠 HAUTE | 🟡 MOYENNE | 🟢 INFO

[CATÉGORIE] Description du problème
Ligne: X
Code actuel: `...`
Fix recommandé: `...`
```

Termine par un score /100 et les 3 actions prioritaires.