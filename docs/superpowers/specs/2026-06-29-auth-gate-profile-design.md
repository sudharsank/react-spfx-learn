# Auth Gate + Profile + Visitor Count — Design Spec

**Date:** 2026-06-29  
**Portals:** react-portal, spfx-portal  
**Monorepo:** `/Users/sudharsank/Projects/react-spfx-learn`

---

## 1. Goal

Add a soft auth gate to both portals: guests see the landing page and module listing; all lesson content, quiz, labs, studio, and projects require login. After login, the user's persona (set via the quiz) is persisted to Supabase so it follows them across devices. A visitor counter increments on each page load and is displayed in the Header.

---

## 2. What's Free vs Gated

| Route | react-portal | spfx-portal | Rule |
|---|---|---|---|
| `/` | ✅ Free | ✅ Free | Landing page |
| `/learn` | ✅ Free | ✅ Free | Module listing (titles, lesson count) |
| `/learn/[module]/[lesson]` | 🔒 Gated | 🔒 Gated | Lesson content |
| `/quiz` | 🔒 Gated | 🔒 Gated | Sets persona — must be tied to account |
| `/labs` | 🔒 Gated | 🔒 Gated | |
| `/labs/[lab]` | 🔒 Gated | 🔒 Gated | |
| `/studio` | 🔒 Gated | 🔒 Gated | |
| `/projects` | 🔒 Gated | 🔒 Gated | |
| `/projects/[project]` | 🔒 Gated | 🔒 Gated | |
| `/deploy-labs` | — | 🔒 Gated | spfx-portal only |
| `/deploy-labs/[lab]` | — | 🔒 Gated | spfx-portal only |

---

## 3. AuthGuard Component

A client component (`'use client'`) placed at the top of each gated page. It uses `useAuth()` and renders either the page content or a sign-in wall — no redirect, no flash.

```tsx
// packages/ui/src/components/AuthGuard.tsx
'use client';

import { useAuth } from '@repo/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGitHub, signInWithMicrosoft } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading…</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Sign in to continue</h2>
        <p className="text-gray-500 max-w-sm">
          Create a free account to access lessons, labs, and your personalised learning path.
        </p>
        <div className="flex gap-3">
          <button onClick={signInWithGitHub} className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90">
            Sign in with GitHub
          </button>
          <button onClick={signInWithMicrosoft} className="px-6 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90">
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

**Usage on gated pages:**
```tsx
// e.g. app/quiz/page.tsx
import { AuthGuard } from '@repo/ui';

export default function QuizPage() {
  return <AuthGuard><QuizContent /></AuthGuard>;
}
```

`AuthGuard` is exported from `packages/ui` so both portals share one copy.

---

## 4. Supabase Tables

### 4a. `user_profiles`

Stores each user's persona per portal. One row per (user_id, portal) pair.

```sql
create table if not exists user_profiles (
  user_id    uuid references auth.users(id) on delete cascade not null,
  portal     text not null check (portal in ('react', 'spfx')),
  persona    text not null check (persona in ('spark', 'builder', 'craftsman', 'consultant', 'architect', 'explorer')),
  created_at timestamptz default now(),
  primary key (user_id, portal)
);

alter table user_profiles enable row level security;

create policy "Users read own profile"
  on user_profiles for select using (auth.uid() = user_id);

create policy "Users insert own profile"
  on user_profiles for insert with check (auth.uid() = user_id);

create policy "Users update own profile"
  on user_profiles for update using (auth.uid() = user_id);
```

### 4b. `portal_stats`

Daily visitor count per portal. Incremented via an RPC function (avoids needing service role key in the browser).

```sql
create table if not exists portal_stats (
  portal  text not null,
  date    date not null default current_date,
  count   int  not null default 0,
  primary key (portal, date)
);

-- Public read so the header can show the count
alter table portal_stats enable row level security;
create policy "Public read portal_stats" on portal_stats for select using (true);

-- RPC for safe increment (bypasses RLS, runs as definer)
create or replace function increment_portal_stat(p_portal text)
returns void
language plpgsql
security definer
as $$
begin
  insert into portal_stats (portal, date, count)
  values (p_portal, current_date, 1)
  on conflict (portal, date)
  do update set count = portal_stats.count + 1;
end;
$$;
```

---

## 5. `useProfile` Hook

Lives in `packages/auth/src/useProfile.ts`. Wraps persona read/write with Supabase + localStorage fallback.

```ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from './client';
import { useAuth } from './useAuth';

export type Persona = 'spark' | 'builder' | 'craftsman' | 'consultant' | 'architect' | 'explorer';

const LS_KEY = (portal: string) => `persona_${portal}`;

export function useProfile(portal: 'react' | 'spfx') {
  const { user } = useAuth();
  const [persona, setPersonaState] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Always load localStorage first for instant render
    const cached = localStorage.getItem(LS_KEY(portal)) as Persona | null;
    if (cached) setPersonaState(cached);

    if (!user) { setLoading(false); return; }

    // Fetch from Supabase, overwrite localStorage if present
    const supabase = getSupabaseClient();
    supabase
      .from('user_profiles')
      .select('persona')
      .eq('portal', portal)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.persona) {
          setPersonaState(data.persona as Persona);
          localStorage.setItem(LS_KEY(portal), data.persona);
        }
        setLoading(false);
      });
  }, [user, portal]);

  const setPersona = useCallback(async (p: Persona) => {
    setPersonaState(p);
    localStorage.setItem(LS_KEY(portal), p);
    if (!user) return;
    const supabase = getSupabaseClient();
    await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, portal, persona: p }, { onConflict: 'user_id,portal' });
  }, [user, portal]);

  return { persona, setPersona, loading };
}
```

Export from `packages/auth/src/index.ts`: add `export { useProfile } from './useProfile'; export type { Persona } from './useProfile';`

---

## 6. Visitor Count

### useVisitorCount hook (in `packages/auth/src/useVisitorCount.ts`)

```ts
'use client';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from './client';

export function useVisitorCount(portal: 'react' | 'spfx') {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabaseClient();
    // Increment this session's visit
    supabase.rpc('increment_portal_stat', { p_portal: portal });
    // Read today's total
    supabase
      .from('portal_stats')
      .select('count')
      .eq('portal', portal)
      .eq('date', new Date().toISOString().slice(0, 10))
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCount(data.count);
      });
  }, [portal]);

  return count;
}
```

### Header display

In both `Header.tsx` files, add after the existing nav links:

```tsx
const count = useVisitorCount('react'); // or 'spfx'
// ...
{count !== null && (
  <span className="text-xs text-gray-400">{count.toLocaleString()} learners today</span>
)}
```

---

## 7. Quiz Page — Profile Save Wiring

The quiz already calls `useAdaptive` and produces a persona result. After quiz completion, call `setPersona(result)` from `useProfile` to persist to Supabase.

Both portals' `app/quiz/page.tsx` need:
1. `AuthGuard` wrapper (gate the quiz)
2. `useProfile(portal)` imported and `setPersona` called on quiz completion alongside the existing adaptive scoring

---

## 8. Gated Page Changes — Summary

**Both portals — wrap with `<AuthGuard>`:**
- `app/learn/[module]/[lesson]/page.tsx` (or its LessonLayout)
- `app/quiz/page.tsx`
- `app/labs/page.tsx` + `app/labs/[lab]/page.tsx`
- `app/studio/page.tsx`
- `app/projects/page.tsx` + `app/projects/[project]/page.tsx`

**spfx-portal additionally:**
- `app/deploy-labs/page.tsx` + `app/deploy-labs/[lab]/page.tsx`

**Cleanest approach:** wrap `<AuthGuard>` in `LessonLayout.tsx` (covers all lessons) and individually on the other route pages.

---

## 9. Tech Constraints

- `@supabase/supabase-js` only (NOT `@supabase/ssr` — incompatible with `output: 'export'`)
- `'use client'` on AuthGuard and all hooks
- No server actions, no `next/headers`
- `getSupabaseClient()` is already in `@repo/auth` — use it everywhere
- `AuthGuard` exported from `packages/ui` (already a dependency of both portals)
- `useProfile` + `useVisitorCount` exported from `packages/auth`
- Both portals already depend on `@repo/auth` and `@repo/ui`

---

## 10. Supabase Setup Checklist (manual steps in Supabase dashboard)

1. Run `user_profiles` DDL (Section 4a)
2. Run `portal_stats` DDL + `increment_portal_stat` function (Section 4b)
3. Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in both portals' `.env.local` and GitHub Actions secrets
