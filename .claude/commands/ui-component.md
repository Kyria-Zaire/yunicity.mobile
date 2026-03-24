# /ui-component — Créer un composant UI Yunicity

Composant à créer : $ARGUMENTS

## Processus obligatoire

### 1. Direction artistique AVANT le code
Réponds à ces questions avant d'écrire une ligne :
- **Contexte** : où ce composant apparaît-il ? (map, profil, dashboard, onboarding ?)
- **État émotionnel** : que doit ressentir l'utilisateur ? (confiance, excitation, clarté ?)
- **Différenciation** : qu'est-ce qui rendra ce composant mémorable et distinctif Yunicity ?

### 2. Tokens obligatoires
Utilise exclusivement les tokens du Design System Yunicity :
- Couleurs : `#2A2FFF` (primary), `#0D0F2E` (dark), tokens CSS vars
- Fonts : `Syne` (display/titres), `DM Sans` (body), `JetBrains Mono` (mono)
- Radius : 6px / 12px / 20px / 9999px
- Spacing : multiples de 4px

### 3. Ce que le composant DOIT avoir
- **États complets** : default, hover, focus, active, disabled, loading (si applicable)
- **Ombre expressive** sur les éléments interactifs primaires
- **Transition spring** sur les entrées : `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Focus visible** pour l'accessibilité WCAG AA
- **TypeScript strict** : props typées, pas de `any`
- **Responsive** : mobile-first

### 4. Livrables
Produis :
1. Le composant React + TypeScript complet
2. Les types/interface des props dans `@yunicity/types` si réutilisables
3. Les variantes (si applicable)
4. Un exemple d'utilisation commenté

### Checklist avant livraison
- [ ] Tokens Yunicity respectés (couleurs, fonts, spacing)
- [ ] Pas d'Inter/Arial/System font
- [ ] Pas de gradient purple générique
- [ ] États hover/focus/disabled implémentés
- [ ] Accessibilité : aria-labels, focus-visible, contrastes WCAG AA
- [ ] TypeScript strict : zéro `any`
- [ ] Animations purposeful (pas purement décoratives)
