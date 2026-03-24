# /prd — Créer un PRD complet pour une feature Yunicity

Feature à documenter : $ARGUMENTS

## Instructions

En utilisant le template `docs/PRD-template.md`, génère un PRD complet pour la feature demandée.

### Contexte à intégrer systématiquement
- Projet : Yunicity — réseau social local phygital
- Ville pilote : Reims (Phase 1) → Grand Est (Phase 2) → National (Phase 3)
- Stack : Fastify + MongoDB + Better Auth + Next.js + React Native
- 5 profils : yunicitizen, commercial, association, freelance, ecole
- Vérification obligatoire avant toute interaction sociale

### Ce que tu dois produire

1. **Section 1** — Vue d'ensemble avec lien explicite à la mission Yunicity
2. **Section 2** — Problématique avec données chiffrées si disponibles
3. **Section 3** — OKR avec métriques mesurables (pas de "améliorer l'expérience")
4. **Section 4** — Personas réalistes basés sur les 5 profils Yunicity
5. **Section 5** — Scope précis — tout ce qui n'est PAS dans V1 est explicitement listé
6. **Section 6** — User stories en format Gherkin avec critères d'acceptation testables
7. **Section 7** — Flows détaillés incluant les cas d'erreur
8. **Section 8** — Spécifications techniques : endpoints, schémas DB, jobs async
9. **Section 9** — Analyse sécurité OBLIGATOIRE + base légale RGPD
10. **Section 10** — Guidance UI avec les tokens Yunicity (Syne, DM Sans, #2A2FFF)
11. **Section 11** — Dépendances inter-services
12. **Section 12** — Risques réalistes avec mitigations concrètes
13. **Section 13** — Plan de déploiement avec feature flag
14. **Section 14** — DoR + DoD + table UAT
15. **Section 15** — Questions ouvertes que tu identifies

### Règles de rédaction
- Chaque US doit avoir au moins 2 scénarios Gherkin (nominal + erreur)
- Chaque endpoint doit avoir ses codes d'erreur listés
- La sécurité n'est jamais "à voir plus tard" — elle est dans le PRD
- Les métriques doivent être mesurables et datées

### Output
Créer le fichier : `docs/prd/[feature-kebab-case]-prd.md`
