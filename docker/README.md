# Images Docker (monorepo)

Tous les services Node utilisent **`docker/node-service.Dockerfile`** avec le **contexte de build à la racine** du repo.

| Variable compose | Exemple |
|------------------|---------|
| `SERVICE_DIR` | `user-service` |
| `EXPOSE_PORT` | `3002` |
| `PNPM_FILTER` | `@yunicity/user-service` (cible **runner** uniquement) |
| `RUNNER_HEALTH` | `0` pour le **worker** (pas de `/health`) |

Les scripts de build des dépendances natives listées dans `package.json` → `pnpm.onlyBuiltDependencies` sont exécutés pendant `pnpm install` (argon2, esbuild, etc.). Les paquets **Alpine** incluent `python3`, `make`, `g++` pour la compilation.
