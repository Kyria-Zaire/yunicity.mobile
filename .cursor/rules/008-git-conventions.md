---
description: Conventions Git et workflow Yunicity
globs: ["**/.gitignore", "**/.gitattributes"]
alwaysApply: true
---

# Git — Conventions Yunicity

## Branches

```
main          # Production — protégée, force push interdit
develop       # Développement — intégration continue
feat/*        # Nouvelles features
fix/*         # Corrections de bugs
refactor/*    # Refactoring sans changement de comportement
security/*    # Corrections de sécurité — merge urgent
chore/*       # Maintenance, deps, config
docs/*        # Documentation uniquement
```

## Conventional Commits (obligatoire)

```bash
# Format : type(scope): description courte en français ou anglais
# Scope = service ou package concerné

# Features
feat(user): add KYC document upload for commercial profiles
feat(auth): implement TOTP MFA for commercial accounts
feat(map): add 3D Mapbox layer with Yunicity theme

# Fixes
fix(auth): resolve JWT refresh token rotation race condition
fix(payment): handle Stripe webhook signature verification failure

# Sécurité (priorité haute — merge rapide)
security(auth): enforce Argon2id — remove bcrypt dependency
security(upload): add ClamAV scan before R2 storage

# Refactoring
refactor(user): extract KYC service from user service
refactor(community): split tribe routes into separate plugin

# Tests
test(auth): add integration tests for login rate limiting
test(kyc): add unit tests for document validation service

# Chore
chore(deps): update fastify to 4.28.0
chore(docker): switch base image to node:20-alpine
chore(ci): add security audit step to GitHub Actions pipeline

# Docs
docs(api): add OpenAPI spec for KYC endpoints
docs(env): update .env.example with R2 variables
```

## Workflow Pull Request

1. **Branch depuis `develop`** (jamais depuis `main`)
2. **Commits atomiques** — un commit = une modification logique
3. **PR title = Conventional Commit** du changement principal
4. **PR description** obligatoire :
   - Contexte et motivation
   - Changements effectués
   - Tests ajoutés
   - Checklist sécurité si endpoint/auth modifié
5. **Review obligatoire** — au moins 1 approbation avant merge
6. **CI doit passer** (typecheck + lint + tests + security audit)
7. **Squash merge** sur `main` et `develop` — historique propre

## .gitignore Yunicity

```gitignore
# Dépendances
node_modules/
.pnpm-store/

# Build
dist/
build/
.next/
.expo/

# Environnement — JAMAIS committer
.env
.env.local
.env.development.local
.env.production.local
.env.staging.local
*.env

# Logs
logs/
*.log
npm-debug.log*

# Tests
coverage/
.vitest/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json  # (garder .vscode/extensions.json)
.idea/
*.swp

# Docker
.docker/

# Secrets — ne jamais committer
*.pem
*.key
*.p12
secrets/
```

## Branch Protection Rules (GitHub)

Configurer sur `main` et `develop` :
- ✅ Require pull request before merging
- ✅ Require at least 1 approving review
- ✅ Dismiss stale PR reviews when new commits are pushed
- ✅ Require status checks to pass (CI pipeline)
- ✅ Require branches to be up to date
- ✅ Do not allow force pushes
- ✅ Do not allow deletions
