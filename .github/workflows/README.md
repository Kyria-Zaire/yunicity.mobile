# CI/CD — Yunicity

## Pipelines

| Workflow | Déclencheur | Jobs | Bloquant |
|----------|-------------|------|----------|
| `ci.yml` | PR + push develop | quality, security, test, build-check | security oui, autres non en S0 |
| `security-scan.yml` | Lundi 8h + push main | audit | Oui |

## Secrets GitHub requis

(à configurer dans Settings → Secrets → Actions)

| Secret | Description | Requis pour |
|--------|-------------|-------------|
| `SLACK_WEBHOOK_URL` | Webhook Slack #deployments | deploy (S0-03+) |
| `GHCR_TOKEN` | GitHub Container Registry | build Docker (S1+) |

## Branch Protection (à configurer manuellement sur GitHub)

Pour `main` et `develop` :
- ✅ Require PR before merging
- ✅ Require status checks: quality, security
- ✅ Dismiss stale reviews
- ✅ No force push
- ✅ No deletion
