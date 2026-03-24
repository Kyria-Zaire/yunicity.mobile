---
description: Patterns Next.js 14 App Router — frontend web Yunicity
globs: ["apps/web/**/*.tsx", "apps/web/**/*.ts", "apps/admin/**/*.tsx"]
alwaysApply: false
---

# Next.js 14 — Patterns Yunicity

## Structure App Router obligatoire

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout — providers globaux
│   ├── page.tsx                # Landing page (Server Component)
│   ├── (auth)/                 # Route group — layout sans nav
│   │   ├── login/page.tsx
│   │   └── register/
│   │       ├── page.tsx
│   │       └── [profileType]/page.tsx  # Inscription par profil
│   ├── (app)/                  # Route group — layout avec nav + auth
│   │   ├── layout.tsx          # Vérifie auth + verification status
│   │   ├── dashboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── tribus/page.tsx
│   │   └── profil/[id]/page.tsx
│   └── api/                    # Route handlers Next.js (proxy léger vers services)
├── components/
│   ├── ui/                     # Design System (@yunicity/ui)
│   └── features/               # Composants métier
├── lib/
│   ├── auth-client.ts          # Better Auth client config
│   ├── api.ts                  # Fetch wrapper typé
│   └── utils.ts
└── middleware.ts               # Auth check sur routes protégées
```

## Server Components vs Client Components

```tsx
// ✅ Server Component par défaut — pas de 'use client'
// Fetch de données côté serveur, pas de state
export default async function DashboardPage() {
  // Fetch direct côté serveur (pas besoin de useEffect)
  const session = await getServerSession();
  if (!session) redirect('/login');

  const userData = await fetch(`${process.env.API_URL}/users/${session.userId}`, {
    headers: { Cookie: cookies().toString() }, // Forward les cookies auth
    cache: 'no-store', // Données utilisateur — pas de cache
  }).then(r => r.json());

  return <DashboardView user={userData} />;
}

// ✅ Client Component — seulement si nécessaire (state, events, browser APIs)
'use client';
import { useState } from 'react';

export function TribesFilter({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [active, setActive] = useState('');
  // ...
}
```

## Middleware d'authentification

```typescript
// middleware.ts — à la racine de apps/web
import { NextRequest, NextResponse } from 'next/server';
import { authClient } from './lib/auth-client';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const isPublic = PUBLIC_ROUTES.some(route => request.nextUrl.pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  const session = await authClient.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Bloquer si profil non vérifié sur certaines routes
  const protectedRoutes = ['/tribus', '/map', '/dashboard'];
  const isProtected = protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r));

  if (isProtected && session.user.verificationStatus !== 'verified') {
    return NextResponse.redirect(new URL('/verification-pending', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## Fetch API typé

```typescript
// lib/api.ts — wrapper fetch avec types
import type { ApiResponse } from '@yunicity/types';

class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: 'include', // Envoyer les cookies auth
    });

    if (!res.ok) {
      const error = await res.json();
      throw new ApiError(error.code, error.message, res.status);
    }

    return res.json();
  }

  async post<T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new ApiError(error.code, error.message, res.status);
    }

    return res.json();
  }
}

export const api = new ApiClient();
```

## Formulaires — React Hook Form + Zod

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '@yunicity/validators';
import type { z } from 'zod';

type FormData = z.infer<typeof createUserSchema>;

export function RegisterForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(createUserSchema), // Validation Zod côté client aussi
    defaultValues: { profileType: 'yunicitizen' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await api.post('/users', data);
      // Redirect ou toast success
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_EXISTS') {
        form.setError('email', { message: 'Cet email est déjà utilisé' });
      }
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {/* Champs du formulaire */}
    </form>
  );
}
```

## Règles Next.js Yunicity
- **Server Components par défaut** — 'use client' seulement si requis
- **Pas de `useEffect` pour le fetch** — utiliser les Server Components
- **Metadata** obligatoire sur chaque page (`generateMetadata`)
- **Image Next.js** pour toutes les images (`next/image`)
- **Loading.tsx** et **error.tsx** dans chaque route group
- **Suspense** autour des composants async
- **Jamais de `.env.local` dans le repo** — Doppler pour les secrets
