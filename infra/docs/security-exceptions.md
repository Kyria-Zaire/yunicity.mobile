# Exceptions sécurité — dépendances

| Date       | Package | Gravité  | Raison |
| ---------- | ------- | -------- | ------ |
| 2026-03-17 | (voir `pnpm audit`) | moderate | Vulnérabilités résiduelles sous le seuil HIGH — revue à chaque `pnpm audit`. |

## Overrides appliqués (S5-03)

- `kysely >= 0.28.14` — transitif via `better-auth` (correctifs SQL).
- `fast-xml-parser >= 5.5.6` — transitif via `@aws-sdk/*` (user-service R2).
