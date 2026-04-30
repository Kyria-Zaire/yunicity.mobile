# Auth + Onboarding (Mobile) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète du flow auth mobile (Welcome → Register/Login → OTP → Onboarding 3 steps → App) en utilisant les endpoints réels `/users`, `/auth/sign-in/email`, `/users/:id/verify-email`, `/users/:id/resend-otp`.

**Architecture:** 5 écrans Expo Router dans `apps/mobile/app/(auth)/` + redirect `apps/mobile/app/index.tsx` vers `/(auth)/welcome` quand non connecté. Les appels réseau passent via `apps/mobile/lib/api.ts` (login/register/verify/resend) et un stockage `AsyncStorage` pour `yunicity_pending_user_id` + onboarding local.

**Tech Stack:** Expo Router, React Native, `expo-linear-gradient`, `@expo/vector-icons/Ionicons`, Zustand (`auth.store`), `AsyncStorage`.

---

### Task 1: Routing entrypoint (welcome)

**Files:**
- Modify: `apps/mobile/app/index.tsx`

- [ ] **Step 1: Update redirect**

Change non-authenticated redirect:

```ts
if (user) return <Redirect href="/(app)" />;
return <Redirect href="/(auth)/welcome" />;
```

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 2: Welcome screen

**Files:**
- Create: `apps/mobile/app/(auth)/welcome.tsx`

- [ ] **Step 1: Create `welcome.tsx`**

Implement full-screen image background (pexels URL), gradient overlay to `#0D0F2E`, bottom CTA section with:
- Primary button → `router.push('/(auth)/register')`
- Secondary button → `router.push('/(auth)/login')`

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 3: Register screen (endpoints réels)

**Files:**
- Modify: `apps/mobile/app/(auth)/register.tsx`
- Modify: `apps/mobile/lib/api.ts` (already contains `registerApi`) if needed

- [ ] **Step 1: Replace existing register UI**

Implement register form with:
- firstName/name, email, password (>= 12), profileType selection (5 cards)
- local validation (no error raw)
- call `registerApi({ email, password, name, profileType })`
- on success: store pending id in `AsyncStorage('yunicity_pending_user_id')`
- navigate to OTP with params `{ userId, email }`

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 4: Login screen (endpoints réels)

**Files:**
- Create: `apps/mobile/app/(auth)/login.tsx`

- [ ] **Step 1: Implement login UI**

Call `useAuthStore().login(email, password)` (uses `/auth/sign-in/email`), map errors to human messages, success → `router.replace('/(app)')`.

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 5: OTP screen (verify + resend)

**Files:**
- Create: `apps/mobile/app/(auth)/otp.tsx`

- [ ] **Step 1: Implement 6-digit OTP input**

Features:
- 6 inputs, auto-advance, backspace to previous, paste 6 digits
- verify button disabled until 6 digits
- verify calls `verifyOtpApi(userId, code)` (from `lib/api.ts`)
- resend calls `resendOtpApi(userId, email)` (from `lib/api.ts`) with 60s local timer
- on verify success: remove `yunicity_pending_user_id`, go to onboarding

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 6: Onboarding screen (3 steps + PATCH)

**Files:**
- Create: `apps/mobile/app/(auth)/onboarding.tsx`
- Modify: `apps/mobile/lib/api.ts` (add helper PATCH if needed)

- [ ] **Step 1: Implement 3-step onboarding**

Step 0: welcome dark gradient, CTA “Commencer”  
Step 1: quartier selection (+ “Autre” input)  
Step 2: interests multi-select min 2, submit:
- write `{ quartier, interests }` to AsyncStorage
- PATCH `/users/:id` (using pending user id if available) with `{ quartier, interests }`
- `router.replace('/(app)')`

- [ ] **Step 2: Typecheck mobile**

Run: `pnpm --filter @yunicity/mobile typecheck`  
Expected: exit 0

---

### Task 7: Verification

**Files:**
- None

- [ ] **Step 1: Typecheck backend + mobile**

Run:
- `pnpm --filter "./services/auth-service" typecheck`
- `pnpm --filter "./services/user-service" typecheck`
- `pnpm --filter @yunicity/mobile typecheck`

Expected: all exit 0

