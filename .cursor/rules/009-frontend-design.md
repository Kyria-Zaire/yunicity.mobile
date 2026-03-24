---
description: Design frontend Yunicity — composants UI, pages, DA, animations
globs: ["apps/web/**/*.tsx", "apps/mobile/**/*.tsx", "packages/@yunicity/ui/**"]
alwaysApply: false
---

# Frontend Design — Yunicity DA

> Skill activé : `frontend-design@claude-code`
> Génère du UI production-grade, distinctif, jamais générique AI-slop.

---

## 🎯 Direction Artistique Yunicity

Avant de coder la moindre ligne de UI, ancre-toi dans cette DA :

**Concept** : *"La ville vivante"* — énergie urbaine, connexion humaine, modernité accessible.
Yunicity n'est pas une app gouvernementale froide. C'est le pouls digital d'une ville.

**Ton** : Confiant, vibrant, ancré dans le réel. Ni startup Silicon Valley générique, ni service public ennuyeux.

**Inspiration** : Néo-brutalisme doux — structure géométrique forte, typographie expressive, couleur qui claque, animations purposeful.

---

## 🎨 Tokens Design — Source de vérité

```css
:root {
  /* Couleurs primaires */
  --color-primary:       #2A2FFF;
  --color-primary-dark:  #1A1ECC;
  --color-primary-light: #E8E9FF;
  --color-primary-mid:   #9395FF;
  --color-primary-glow:  rgba(42, 47, 255, 0.15);

  /* Neutres */
  --color-dark:          #0D0F2E;
  --color-dark-mid:      #1C1F4A;
  --color-gray:          #6B7280;
  --color-gray-light:    #F3F4F6;
  --color-gray-mid:      #D1D5DB;
  --color-white:         #FFFFFF;

  /* Statuts */
  --color-success:       #16A34A;
  --color-success-light: #DCFCE7;
  --color-warning:       #D97706;
  --color-warning-light: #FEF3C7;
  --color-error:         #DC2626;
  --color-error-light:   #FEE2E2;
  --color-info:          #2563EB;
  --color-info-light:    #DBEAFE;

  /* Typographie */
  --font-display:  'Syne', sans-serif;         /* Titres — géométrique, fort */
  --font-body:     'DM Sans', sans-serif;      /* Corps — lisible, moderne */
  --font-mono:     'JetBrains Mono', monospace; /* Code, tags, badges */

  /* Espacement (multiples de 4px) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Border radius */
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-xl:   32px;
  --radius-full: 9999px;

  /* Ombres */
  --shadow-sm:      0 1px 3px rgba(13,15,46,0.08), 0 1px 2px rgba(13,15,46,0.06);
  --shadow-md:      0 4px 16px rgba(13,15,46,0.10), 0 2px 6px rgba(13,15,46,0.07);
  --shadow-lg:      0 12px 40px rgba(13,15,46,0.14), 0 4px 12px rgba(13,15,46,0.08);
  --shadow-primary: 0 8px 32px rgba(42,47,255,0.25), 0 2px 8px rgba(42,47,255,0.15);
  --shadow-glow:    0 0 40px rgba(42,47,255,0.20);

  /* Transitions */
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 🔤 Typographie

```tsx
// Fonts à importer (Google Fonts ou self-hosted)
// Syne : géométrique, caractère fort pour les titres
// DM Sans : moderne et lisible pour le corps
// JetBrains Mono : code et badges techniques

// Hiérarchie typographique Yunicity
const typography = {
  'display-xl': 'font-display text-[64px] leading-[1.05] font-black tracking-[-0.03em]',
  'display-lg': 'font-display text-[48px] leading-[1.1]  font-black tracking-[-0.025em]',
  'display-md': 'font-display text-[36px] leading-[1.15] font-bold  tracking-[-0.02em]',
  'heading-lg': 'font-display text-[28px] leading-[1.2]  font-bold  tracking-[-0.015em]',
  'heading-md': 'font-display text-[22px] leading-[1.3]  font-semibold',
  'heading-sm': 'font-display text-[18px] leading-[1.35] font-semibold',
  'body-lg':    'font-body   text-[17px] leading-[1.65] font-normal',
  'body-md':    'font-body   text-[15px] leading-[1.6]  font-normal',
  'body-sm':    'font-body   text-[13px] leading-[1.55] font-normal',
  'caption':    'font-body   text-[12px] leading-[1.5]  font-medium  tracking-[0.01em]',
  'label':      'font-mono   text-[11px] leading-[1.4]  font-medium  tracking-[0.06em] uppercase',
};
```

---

## 🧩 Composants — Patterns obligatoires

### Button
```tsx
// Variants avec states complets — hover, focus, active, disabled, loading
const buttonVariants = {
  primary: `
    bg-[#2A2FFF] text-white font-semibold
    hover:bg-[#1A1ECC] active:scale-[0.97]
    shadow-[0_8px_32px_rgba(42,47,255,0.3)]
    hover:shadow-[0_12px_40px_rgba(42,47,255,0.4)]
    focus-visible:ring-2 focus-visible:ring-[#2A2FFF] focus-visible:ring-offset-2
    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
    transition-all duration-200 rounded-xl px-6 py-3
  `,
  secondary: `
    bg-[#E8E9FF] text-[#2A2FFF] font-semibold
    hover:bg-[#D4D5FF] active:scale-[0.97]
    transition-all duration-200 rounded-xl px-6 py-3
  `,
  ghost: `
    text-[#6B7280] font-medium
    hover:bg-[#F3F4F6] hover:text-[#0D0F2E]
    active:scale-[0.97] transition-all duration-200 rounded-xl px-6 py-3
  `,
};
```

### Card
```tsx
// Cards avec hover effects — pas de flat cards sans âme
const cardBase = `
  bg-white rounded-2xl border border-[#F3F4F6]
  shadow-[0_2px_12px_rgba(13,15,46,0.07)]
  hover:shadow-[0_8px_32px_rgba(13,15,46,0.12)]
  hover:-translate-y-0.5
  transition-all duration-300
  overflow-hidden
`;

// Card acteur local — avec accent color
const cardActor = `
  ${cardBase}
  before:content-[''] before:absolute before:top-0 before:left-0
  before:right-0 before:h-[3px] before:bg-[#2A2FFF]
  relative
`;
```

### Badge / Pill — statuts vérification
```tsx
const badgeVariants = {
  verified:    'bg-[#DCFCE7] text-[#16A34A] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  pending:     'bg-[#FEF3C7] text-[#D97706] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  rejected:    'bg-[#FEE2E2] text-[#DC2626] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  commercial:  'bg-[#E8E9FF] text-[#2A2FFF] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  association: 'bg-[#F0FDF4] text-[#16A34A] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  freelance:   'bg-[#FFF7ED] text-[#D97706] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
  ecole:       'bg-[#EFF6FF] text-[#2563EB] font-mono text-[11px] uppercase tracking-widest px-3 py-1 rounded-full',
};
```

---

## ✨ Animations — Purposeful, jamais décoratives

```tsx
// Tailwind config — animations Yunicity custom
const animationConfig = {
  // Entrée des éléments — stagger pour les listes
  'fade-up':     'animate-[fadeUp_0.5s_cubic-bezier(0.4,0,0.2,1)_forwards]',
  'fade-in':     'animate-[fadeIn_0.3s_ease_forwards]',
  'scale-in':    'animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',

  // Skeleton loading
  'shimmer':     'animate-[shimmer_2s_linear_infinite]',

  // Notification / toast
  'slide-in-right': 'animate-[slideInRight_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]',

  // Carte map — hotspot pulse
  'pulse-primary': 'animate-[pulsePrimary_2s_ease-in-out_infinite]',
};

// Keyframes (@layer base dans globals.css)
/*
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulsePrimary {
  0%, 100% { box-shadow: 0 0 0 0 rgba(42,47,255,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(42,47,255,0); }
}
*/

// Stagger sur les listes
function StaggerList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={i}
          className="opacity-0 animate-[fadeUp_0.5s_ease_forwards]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📐 Layouts — Composition spatiale

```tsx
// Pas de layouts centrés génériques — utiliser l'asymétrie et l'espace

// Hero page — composition bold
const HeroSection = () => (
  <section className="relative min-h-screen bg-[#0D0F2E] overflow-hidden">
    {/* Background géométrique — pas de gradient purple générique */}
    <div className="absolute inset-0">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full
                      bg-[#2A2FFF] opacity-10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full
                      bg-[#9395FF] opacity-8 blur-[100px]" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#2A2FFF 1px, transparent 1px), linear-gradient(90deg, #2A2FFF 1px, transparent 1px)',
                    backgroundSize: '40px 40px' }} />
    </div>

    <div className="relative z-10 max-w-[1280px] mx-auto px-6 pt-32 pb-24">
      {/* Asymétrie intentionnelle */}
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-7">
          {/* Label technique — style mono */}
          <span className="font-mono text-[11px] text-[#9395FF] uppercase tracking-widest">
            Réseau social local · Reims · 2026
          </span>
          <h1 className="font-display text-[72px] font-black text-white leading-[1.02]
                         tracking-[-0.03em] mt-4">
            Ta ville,<br />
            <span className="text-[#2A2FFF]">vraiment</span><br />
            connectée.
          </h1>
        </div>
        <div className="col-span-5 relative">
          {/* Illustration / mockup app */}
        </div>
      </div>
    </div>
  </section>
);
```

---

## 🚫 Ce qui est INTERDIT dans le UI Yunicity

| Interdit | Raison | Alternative |
|----------|--------|-------------|
| `font-family: Inter, Arial` | Trop générique | Syne (display) + DM Sans (body) |
| Gradient `purple → white` | AI-slop cliché | Bleu Yunicity `#2A2FFF` + dark `#0D0F2E` |
| Cards plates sans ombre | Sans vie | `shadow-md` + `hover:shadow-lg` + `-translate-y` |
| Boutons `rounded-full` génériques | Bootstrap vibes | `rounded-xl` avec `shadow-primary` |
| Layouts 100% centrés | Ennuyeux | Grilles asymétriques, overlap, offset |
| Animations `transition-all 0.3s ease` | Trop basique | Cubic-bezier, spring, stagger |
| Icônes Heroicons sans contexte | Générique | Lucide + custom SVG pour les features clés |
| `text-gray-500` sur fond blanc | Fade | Contraste WCAG AA minimum sur tout |
| `max-w-md mx-auto` partout | Sans personnalité | Grilles full-width avec padding contrôlé |

---

## ♿ Accessibilité — Non négociable

```tsx
// WCAG AA minimum — ratio contraste 4.5:1 pour le texte

// Focus visible obligatoire
'focus-visible:ring-2 focus-visible:ring-[#2A2FFF] focus-visible:ring-offset-2'

// Aria labels sur les boutons icon-only
<button aria-label="Voir le profil de Marie Dupont">
  <UserIcon />
</button>

// Rôles sémantiques corrects
<nav aria-label="Navigation principale">
<main>
<aside aria-label="Filtres carte">

// Skip link en haut de chaque page
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 ...">
  Aller au contenu principal
</a>

// Images avec alt descriptif
<img src={actor.logo} alt={`Logo ${actor.businessName}`} />
// Ou décoratif :
<img src={pattern} alt="" aria-hidden="true" />
```

---

## 📱 Mobile First — React Native

```tsx
// Même DA sur mobile — tokens identiques via @yunicity/ui
// StyleSheet avec les mêmes couleurs et espacements

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Pas de styles inline partout — StyleSheet pour les perfs
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0D0F2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4, // Android
  },
  primaryButton: {
    backgroundColor: '#2A2FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    // Ombre bleue signature
    shadowColor: '#2A2FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
```
