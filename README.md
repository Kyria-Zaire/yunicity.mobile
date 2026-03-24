# Yunicity — Réseau Social Local Phygital

## Structure du monorepo

```
yunicity/
├── apps/              # Applications (web, mobile, admin)
├── services/          # Microservices Fastify
├── packages/          # Packages partagés
│   ├── types/         # @yunicity/types — Interfaces TypeScript
│   ├── validators/    # @yunicity/validators — Schemas Zod
│   ├── config/        # @yunicity/config — Constantes & feature flags
│   └── ui/            # @yunicity/ui — Design system & tokens
├── infra/             # Docker, K8s, Terraform
└── .github/           # Templates PR, CODEOWNERS
```

## Prérequis

- **Node.js** >= 20
- **pnpm** >= 9

## Commandes

| Commande | Description |
|----------|-------------|
| `pnpm install` | Installer les dépendances |
| `pnpm build` | Build tous les packages |
| `pnpm dev` | Lancer en mode développement |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm lint` | Linter le code |
| `pnpm test` | Lancer les tests |
| `pnpm clean` | Nettoyer les builds |

## Stack technique

- **Backend** : Node.js + Fastify + TypeScript
- **Frontend Web** : Next.js 14 App Router
- **Mobile** : React Native + Expo SDK 51
- **Auth** : Better Auth v1
- **BDD** : MongoDB Atlas (Mongoose)
- **Cache/Queue** : Redis (Upstash) + BullMQ
- **Temps réel** : Socket.io
- **Fichiers** : Cloudflare R2
- **Paiements** : Stripe
- **IA** : OpenAI API (GPT-4o)

## Conventions Git

```
feat(scope): description
fix(scope): description
refactor(scope): description
security(scope): description
test(scope): description
chore(scope): description
```
