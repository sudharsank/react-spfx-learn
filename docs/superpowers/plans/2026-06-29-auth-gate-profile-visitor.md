# Auth Gate + Profile + Visitor Count — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a soft auth gate to both portals (lessons, quiz, labs, studio, projects, deploy-labs), persist the user's persona to Supabase via a `useProfile` hook, and display a daily visitor count in each portal's Header.

**Architecture:** `AuthGuard` is a single client component in `packages/auth` that shows a sign-in wall when no user is detected; it wraps gated content in both portals. `useProfile` upserts the persona to a `user_profiles` Supabase table on quiz completion and reads it back on load. `useVisitorCount` calls a Supabase RPC to increment a daily counter then reads back the total to show in the Header.

**Tech Stack:** Next.js 15.1.x App Router (`output: 'export'`), `@supabase/supabase-js` (NOT `@supabase/ssr`), TypeScript, Tailwind v4, pnpm 9.x workspaces.

## Global Constraints

- `@supabase/supabase-js` only — NOT `@supabase/ssr` (incompatible with `output: 'export'`)
- All hooks and gate components must be `'use client'` with `typeof window !== 'undefined'` guards for localStorage
- No server actions, no `next/headers`, no `redirect()` — gate is inline (shows sign-in wall, no redirect)
- Pages that use `generateStaticParams` (lesson, labs/[lab], projects/[project], deploy-labs/[lab]) MUST remain async server components — gate goes in their child client components instead
- `getSupabaseClient()` is already in `packages/auth/src/client.ts` — use it everywhere, do not `createClient()` directly
- Run `pnpm build` from the portal directory to verify each task (no separate test runner exists)
- `AuthGuard` lives in `packages/auth` (NOT `packages/ui`) to avoid adding a new cross-package dependency
- Commit message format: `feat: <description>`

---

## File Map

**New files:**
- `packages/auth/src/AuthGuard.tsx` — shared sign-in wall component
- `packages/auth/src/useProfile.ts` — persona read/write with Supabase + localStorage
- `packages/auth/src/useVisitorCount.ts` — daily visitor count RPC + read
- `docs/supabase-setup.sql` — SQL to run manually in Supabase dashboard (user_profiles + portal_stats tables)

**Modified files:**
- `packages/auth/src/index.ts` — export AuthGuard, useProfile, Persona, useVisitorCount
- `apps/react-portal/components/LessonLayout.tsx` — wrap content in AuthGuard
- `apps/react-portal/app/quiz/page.tsx` — wrap in AuthGuard + call setPersona on completion
- `apps/react-portal/components/Header.tsx` — add useVisitorCount display
- `apps/react-portal/app/labs/page.tsx` — add `'use client'` + AuthGuard
- `apps/react-portal/components/GuidedLab.tsx` — wrap JSX in AuthGuard
- `apps/react-portal/components/ChallengeMode.tsx` — wrap JSX in AuthGuard
- `apps/react-portal/components/StudioPage.tsx` — wrap JSX in AuthGuard
- `apps/react-portal/app/projects/page.tsx` — add `'use client'` + AuthGuard
- `apps/react-portal/components/ProjectWizard.tsx` — wrap JSX in AuthGuard
- `apps/spfx-portal/components/LessonLayout.tsx` — wrap content in AuthGuard
- `apps/spfx-portal/app/quiz/page.tsx` — wrap in AuthGuard + call setPersona
- `apps/spfx-portal/components/Header.tsx` — add useVisitorCount display
- `apps/spfx-portal/app/labs/page.tsx` — add `'use client'` + AuthGuard
- `apps/spfx-portal/components/SpfxLab.tsx` — wrap JSX in AuthGuard
- `apps/spfx-portal/components/StudioPage.tsx` — wrap JSX in AuthGuard
- `apps/spfx-portal/app/projects/page.tsx` — add `'use client'` + AuthGuard
- `apps/spfx-portal/components/SpfxProjectWizard.tsx` — wrap JSX in AuthGuard
- `apps/spfx-portal/app/deploy-labs/page.tsx` — add `'use client'` + AuthGuard
- `apps/spfx-portal/components/DeployLab.tsx` — wrap JSX in AuthGuard

---

### Task 1: AuthGuard component + Supabase SQL setup doc

**Files:**
- Create: `packages/auth/src/AuthGuard.tsx`
- Modify: `packages/auth/src/index.ts`
- Create: `docs/supabase-setup.sql`

**Interfaces:**
- Produces: `AuthGuard` — `({ children }: { children: React.ReactNode }) => JSX.Element`

- [ ] **Step 1: Create `packages/auth/src/AuthGuard.tsx`**

```tsx
'use client';

import { useAuth } from './useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGitHub, signInWithMicrosoft } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Sign in to continue</h2>
        <p className="text-gray-500 max-w-sm">
          Create a free account to access lessons, labs, and your personalised learning path.
        </p>
        <div className="flex gap-3">
          <button
            onClick={signInWithGitHub}
            className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={signInWithMicrosoft}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Add export to `packages/auth/src/index.ts`**

The current file is:
```ts
export { getSupabaseClient } from './client';
export { getGuestProgress, setGuestProgress, clearGuestProgress } from './localStorage';
export { useAuth } from './useAuth';
export type { GuestProgress } from './localStorage';
```

Add ONE line at the end:
```ts
export { AuthGuard } from './AuthGuard';
```

Final file:
```ts
export { getSupabaseClient } from './client';
export { getGuestProgress, setGuestProgress, clearGuestProgress } from './localStorage';
export { useAuth } from './useAuth';
export type { GuestProgress } from './localStorage';
export { AuthGuard } from './AuthGuard';
```

- [ ] **Step 3: Create `docs/supabase-setup.sql`**

This file contains the SQL the user must run manually in the Supabase dashboard SQL editor.

```sql
-- =============================================================
-- Auth Gate — Supabase Setup
-- Run this in the Supabase SQL editor before deploying.
-- =============================================================

-- 1. user_profiles — stores each user's persona per portal
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

-- 2. portal_stats — daily visitor count per portal
create table if not exists portal_stats (
  portal  text not null,
  date    date not null default current_date,
  count   int  not null default 0,
  primary key (portal, date)
);

alter table portal_stats enable row level security;

create policy "Public read portal_stats"
  on portal_stats for select using (true);

-- 3. RPC for safe increment (security definer bypasses RLS)
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

- [ ] **Step 4: Commit**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
git add packages/auth/src/AuthGuard.tsx packages/auth/src/index.ts docs/supabase-setup.sql
git commit -m "feat: add AuthGuard component and Supabase setup SQL"
```

Expected: commit succeeds, no TypeScript errors.

---

### Task 2: useProfile and useVisitorCount hooks

**Files:**
- Create: `packages/auth/src/useProfile.ts`
- Create: `packages/auth/src/useVisitorCount.ts`
- Modify: `packages/auth/src/index.ts`

**Interfaces:**
- Consumes: `getSupabaseClient()` from `./client`, `useAuth()` from `./useAuth`
- Produces:
  - `Persona` — `'spark' | 'builder' | 'craftsman' | 'consultant' | 'architect' | 'explorer'`
  - `useProfile(portal: 'react' | 'spfx')` — returns `{ persona: Persona | null, setPersona: (p: Persona) => Promise<void>, loading: boolean }`
  - `useVisitorCount(portal: 'react' | 'spfx')` — returns `number | null`

- [ ] **Step 1: Create `packages/auth/src/useProfile.ts`**

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from './client';
import { useAuth } from './useAuth';

export type Persona = 'spark' | 'builder' | 'craftsman' | 'consultant' | 'architect' | 'explorer';

function lsKey(portal: string) {
  return `persona_${portal}`;
}

export function useProfile(portal: 'react' | 'spfx') {
  const { user } = useAuth();
  const [persona, setPersonaState] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(lsKey(portal)) as Persona | null;
    if (cached) setPersonaState(cached);

    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    supabase
      .from('user_profiles')
      .select('persona')
      .eq('portal', portal)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.persona) {
          setPersonaState(data.persona as Persona);
          localStorage.setItem(lsKey(portal), data.persona);
        }
        setLoading(false);
      });
  }, [user, portal]);

  const setPersona = useCallback(
    async (p: Persona) => {
      setPersonaState(p);
      if (typeof window !== 'undefined') {
        localStorage.setItem(lsKey(portal), p);
      }
      if (!user) return;
      const supabase = getSupabaseClient();
      await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, portal, persona: p }, { onConflict: 'user_id,portal' });
    },
    [user, portal]
  );

  return { persona, setPersona, loading };
}
```

- [ ] **Step 2: Create `packages/auth/src/useVisitorCount.ts`**

```ts
'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from './client';

export function useVisitorCount(portal: 'react' | 'spfx') {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().slice(0, 10);

    supabase.rpc('increment_portal_stat', { p_portal: portal });

    supabase
      .from('portal_stats')
      .select('count')
      .eq('portal', portal)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCount(data.count as number);
      });
  }, [portal]);

  return count;
}
```

- [ ] **Step 3: Add exports to `packages/auth/src/index.ts`**

Add two lines at the end. Final file:
```ts
export { getSupabaseClient } from './client';
export { getGuestProgress, setGuestProgress, clearGuestProgress } from './localStorage';
export { useAuth } from './useAuth';
export type { GuestProgress } from './localStorage';
export { AuthGuard } from './AuthGuard';
export { useProfile } from './useProfile';
export type { Persona } from './useProfile';
export { useVisitorCount } from './useVisitorCount';
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn/packages/auth
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
git add packages/auth/src/useProfile.ts packages/auth/src/useVisitorCount.ts packages/auth/src/index.ts
git commit -m "feat: add useProfile and useVisitorCount hooks"
```

---

### Task 3: Gate lessons + quiz, visitor count in Header — react-portal

**Files:**
- Modify: `apps/react-portal/components/LessonLayout.tsx`
- Modify: `apps/react-portal/app/quiz/page.tsx`
- Modify: `apps/react-portal/components/Header.tsx`

**Interfaces:**
- Consumes: `AuthGuard` from `@repo/auth`, `useProfile` from `@repo/auth`, `useVisitorCount` from `@repo/auth`

- [ ] **Step 1: Add AuthGuard to `apps/react-portal/components/LessonLayout.tsx`**

Current import block (lines 1–9):
```tsx
'use client';

import type { ModuleDefinition, LessonDefinition } from '@repo/content';
import { Sidebar } from './Sidebar';
import { MODULES } from '../content/modules';
import Link from 'next/link';
import { useAdaptive } from '@repo/adaptive';
import dynamic from 'next/dynamic';
import { useState } from 'react';
```

Replace with:
```tsx
'use client';

import type { ModuleDefinition, LessonDefinition } from '@repo/content';
import { Sidebar } from './Sidebar';
import { MODULES } from '../content/modules';
import Link from 'next/link';
import { useAdaptive } from '@repo/adaptive';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AuthGuard } from '@repo/auth';
```

Then wrap the return value. The current return (line 33) is:
```tsx
  return (
    <div className="flex min-h-screen">
      {pendingBadge && <BadgeMoment badge={pendingBadge.emoji} onDone={dismissBadge} />}
      <Sidebar modules={MODULES} />
      ...
    </div>
  );
```

Change to:
```tsx
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {pendingBadge && <BadgeMoment badge={pendingBadge.emoji} onDone={dismissBadge} />}
        <Sidebar modules={MODULES} />
        <main className="flex-1 max-w-3xl mx-auto px-8 py-10">
          <p className="text-xs text-[var(--color-brand)] font-bold uppercase tracking-widest mb-2">
            {mod.title}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
          <p className="text-gray-500 text-sm mb-8">{lesson.duration} read</p>
          <div className="prose prose-gray max-w-none">{children}</div>
          <div className="mt-8">
            <button
              onClick={handleMarkComplete}
              disabled={lessonMarked}
              className="px-5 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-default"
            >
              {lessonMarked ? '✓ Lesson Complete' : 'Mark as Complete'}
            </button>
          </div>
          <div className="mt-8 pt-8 border-t flex justify-between">
            {prev ? (
              <Link href={`/learn/${mod.slug}/${prev.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
                ← {prev.title}
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/learn/${mod.slug}/${next.slug}`} className="text-sm text-[var(--color-brand)] hover:underline">
                {next.title} →
              </Link>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
```

- [ ] **Step 2: Update `apps/react-portal/app/quiz/page.tsx` — add AuthGuard + setPersona**

The current file is a `'use client'` component. Replace the entire file with:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  REACT_QUIZ,
  scoreQuiz,
  pickPersona,
} from '@repo/adaptive';
import { setGuestProgress, AuthGuard, useProfile } from '@repo/auth';

function QuizContent() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const { setPersona } = useProfile('react');

  const q = REACT_QUIZ[step];
  const isLast = step === REACT_QUIZ.length - 1;

  function handleSelect(optId: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }

  async function handleNext() {
    if (!answers[q.id]) return;
    if (isLast) {
      const scores = scoreQuiz(answers, REACT_QUIZ);
      const persona = pickPersona(scores);
      setGuestProgress({ persona });
      await setPersona(persona);
      router.push(`/learn?persona=${persona}`);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="flex gap-1 mb-8">
          {REACT_QUIZ.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[var(--color-brand)]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">{q.text}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all ${
                answers[q.id] === opt.id
                  ? 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)] font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={!answers[q.id]}
          className="mt-6 w-full py-3 bg-[var(--color-brand)] text-white rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLast ? 'See My Learning Path →' : 'Next →'}
        </button>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}
```

Note: `REACT_PERSONAS` import was unused in the original — do not re-add it.

- [ ] **Step 3: Add visitor count to `apps/react-portal/components/Header.tsx`**

Add `useVisitorCount` import. Current import block (lines 1–6):
```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@repo/auth';
import { getHintTokens } from '@repo/adaptive';
import { useEffect, useState } from 'react';
```

Replace with:
```tsx
'use client';

import Link from 'next/link';
import { useAuth, useVisitorCount } from '@repo/auth';
import { getHintTokens } from '@repo/adaptive';
import { useEffect, useState } from 'react';
```

Then inside `Header()`, after the `useAuth` call (line 9), add:
```tsx
  const visitorCount = useVisitorCount('react');
```

Then in the nav JSX, after the hint token `<span>` and before the sign-in buttons, add:
```tsx
          {visitorCount !== null && (
            <span className="text-xs text-gray-400">{visitorCount.toLocaleString()} learners today</span>
          )}
```

- [ ] **Step 4: Build react-portal to verify**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn/apps/react-portal
pnpm build
```

Expected: build succeeds, same page count as before (no new pages added in this task).

- [ ] **Step 5: Commit**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
git add apps/react-portal/components/LessonLayout.tsx apps/react-portal/app/quiz/page.tsx apps/react-portal/components/Header.tsx
git commit -m "feat: add auth gate to react-portal lessons, quiz, and visitor count in Header"
```

---

### Task 4: Gate labs + studio + projects — react-portal

**Files:**
- Modify: `apps/react-portal/app/labs/page.tsx`
- Modify: `apps/react-portal/components/GuidedLab.tsx`
- Modify: `apps/react-portal/components/ChallengeMode.tsx`
- Modify: `apps/react-portal/components/StudioPage.tsx`
- Modify: `apps/react-portal/app/projects/page.tsx`
- Modify: `apps/react-portal/components/ProjectWizard.tsx`

**Interfaces:**
- Consumes: `AuthGuard` from `@repo/auth`

- [ ] **Step 1: Gate `apps/react-portal/app/labs/page.tsx`**

Replace the entire file with:
```tsx
'use client';

import Link from 'next/link';
import { LABS } from '../../content/labs';
import { AuthGuard } from '@repo/auth';

export default function LabsPage() {
  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Labs</h1>
        <p className="text-gray-500 mb-10">Hands-on exercises — guided walkthroughs and open challenges.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {LABS.map((lab) => (
            <Link
              key={lab.slug}
              href={`/labs/${lab.slug}`}
              className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
                </span>
                <span className="text-xs text-gray-400">{lab.duration}</span>
              </div>
              <h2 className="font-bold text-gray-800 mb-1">{lab.title}</h2>
              <p className="text-sm text-gray-500">{lab.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
```

- [ ] **Step 2: Gate `apps/react-portal/components/GuidedLab.tsx`**

`GuidedLab` is already a `'use client'` component. Add the import to its import block:
```tsx
import { AuthGuard } from '@repo/auth';
```

Then wrap its return JSX. The current return starts with:
```tsx
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
```

Change to:
```tsx
  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* ... all existing JSX ... */}
      </div>
    </AuthGuard>
  );
```

To be precise: wrap only the outermost `<div>` — keep ALL existing JSX unchanged inside it.

- [ ] **Step 3: Gate `apps/react-portal/components/ChallengeMode.tsx`**

Same pattern as GuidedLab: add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 4: Gate `apps/react-portal/components/StudioPage.tsx`**

`StudioPage` is already a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap its entire return JSX in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 5: Gate `apps/react-portal/app/projects/page.tsx`**

Replace the entire file with:
```tsx
'use client';

import Link from 'next/link';
import { REACT_PROJECTS } from '../../content/projects';
import { AuthGuard } from '@repo/auth';

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Builder</h1>
        <p className="text-gray-500 mb-10">Build complete mini-apps step by step.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {REACT_PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {p.difficulty}
              </span>
              <h2 className="font-bold text-gray-800 mt-1 mb-2">{p.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{p.description}</p>
              <p className="text-xs text-[var(--color-brand)] font-medium">
                {p.steps.length} steps →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
```

- [ ] **Step 6: Gate `apps/react-portal/components/ProjectWizard.tsx`**

`ProjectWizard` is already a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap its return JSX outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 7: Build react-portal to verify**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn/apps/react-portal
pnpm build
```

Expected: build succeeds with same page count.

- [ ] **Step 8: Commit**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
git add apps/react-portal/app/labs/page.tsx apps/react-portal/components/GuidedLab.tsx apps/react-portal/components/ChallengeMode.tsx apps/react-portal/components/StudioPage.tsx apps/react-portal/app/projects/page.tsx apps/react-portal/components/ProjectWizard.tsx
git commit -m "feat: add auth gate to react-portal labs, studio, and projects"
```

---

### Task 5: Gate all gated routes + visitor count — spfx-portal

**Files:**
- Modify: `apps/spfx-portal/components/LessonLayout.tsx`
- Modify: `apps/spfx-portal/app/quiz/page.tsx`
- Modify: `apps/spfx-portal/components/Header.tsx`
- Modify: `apps/spfx-portal/app/labs/page.tsx`
- Modify: `apps/spfx-portal/components/SpfxLab.tsx`
- Modify: `apps/spfx-portal/components/StudioPage.tsx`
- Modify: `apps/spfx-portal/app/projects/page.tsx`
- Modify: `apps/spfx-portal/components/SpfxProjectWizard.tsx`
- Modify: `apps/spfx-portal/app/deploy-labs/page.tsx`
- Modify: `apps/spfx-portal/components/DeployLab.tsx`

**Interfaces:**
- Consumes: `AuthGuard`, `useProfile`, `useVisitorCount` from `@repo/auth`

- [ ] **Step 1: Read `apps/spfx-portal/components/LessonLayout.tsx`**

Read the file first to find the exact import block and return structure, then apply the same pattern as Task 3 Step 1 — add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 2: Update `apps/spfx-portal/app/quiz/page.tsx` — add AuthGuard + setPersona**

Replace the entire file with:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SPFX_QUIZ,
  scoreQuiz,
  pickPersona,
} from '@repo/adaptive';
import { setGuestProgress, AuthGuard, useProfile } from '@repo/auth';

function QuizContent() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const { setPersona } = useProfile('spfx');

  const q = SPFX_QUIZ[step];
  const isLast = step === SPFX_QUIZ.length - 1;

  function handleSelect(optId: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  }

  async function handleNext() {
    if (!answers[q.id]) return;
    if (isLast) {
      const scores = scoreQuiz(answers, SPFX_QUIZ);
      const persona = pickPersona(scores);
      setGuestProgress({ persona });
      await setPersona(persona);
      router.push(`/learn?persona=${persona}`);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="flex gap-1 mb-8">
          {SPFX_QUIZ.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[var(--color-brand)]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">{q.text}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all ${
                answers[q.id] === opt.id
                  ? 'border-[var(--color-brand)] bg-[oklch(0.97_0.02_250)] font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={!answers[q.id]}
          className="mt-6 w-full py-3 bg-[var(--color-brand)] text-white rounded-xl font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLast ? 'See My Learning Path →' : 'Next →'}
        </button>
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <AuthGuard>
      <QuizContent />
    </AuthGuard>
  );
}
```

Note: `SPFX_PERSONAS` import was unused in the original — do not re-add it.

- [ ] **Step 3: Add visitor count to `apps/spfx-portal/components/Header.tsx`**

Same pattern as Task 3 Step 3 but for spfx-portal:
- Add `useVisitorCount` to the `@repo/auth` import
- Add `const visitorCount = useVisitorCount('spfx');` inside the component
- Add `{visitorCount !== null && <span className="text-xs text-gray-400">{visitorCount.toLocaleString()} learners today</span>}` in the nav after the hint token span

- [ ] **Step 4: Gate `apps/spfx-portal/app/labs/page.tsx`**

Replace the entire file with:
```tsx
'use client';

import Link from 'next/link';
import { SPFX_LABS } from '../../content/labs';
import { AuthGuard } from '@repo/auth';

export default function LabsPage() {
  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SPFx Labs</h1>
        <p className="text-gray-500 mb-10">Hands-on exercises using real SPFx tools.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {SPFX_LABS.map((lab) => (
            <Link
              key={lab.slug}
              href={`/labs/${lab.slug}`}
              className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lab.type === 'guided' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {lab.type === 'guided' ? '📖 Guided' : '⚡ Challenge'}
                </span>
                <span className="text-xs text-gray-400">{lab.duration}</span>
              </div>
              <h2 className="font-bold text-gray-800 mb-1">{lab.title}</h2>
              <p className="text-sm text-gray-500">{lab.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
```

- [ ] **Step 5: Gate `apps/spfx-portal/components/SpfxLab.tsx`**

Read the file first. It's a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 6: Gate `apps/spfx-portal/components/StudioPage.tsx`**

Read the file first. It's a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 7: Gate `apps/spfx-portal/app/projects/page.tsx`**

Replace the entire file with:
```tsx
'use client';

import Link from 'next/link';
import { SPFX_PROJECTS } from '../../content/projects';
import { AuthGuard } from '@repo/auth';

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Builder</h1>
        <p className="text-gray-500 mb-10">Build complete SPFx web parts step by step.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {SPFX_PROJECTS.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {p.difficulty}
              </span>
              <h2 className="font-bold text-gray-800 mt-1 mb-2">{p.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{p.description}</p>
              <p className="text-xs text-[var(--color-brand)] font-medium">
                {p.steps.length} steps →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
```

- [ ] **Step 8: Gate `apps/spfx-portal/components/SpfxProjectWizard.tsx`**

Read the file first. It's a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 9: Gate `apps/spfx-portal/app/deploy-labs/page.tsx`**

Replace the entire file with:
```tsx
'use client';

import Link from 'next/link';
import { DEPLOY_LABS } from '../../content/deployLabs';
import { AuthGuard } from '@repo/auth';

export default function DeployLabsPage() {
  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Deploy Labs</h1>
        <p className="text-gray-500 mb-10">Step-by-step walkthroughs for deploying SPFx web parts to production.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {DEPLOY_LABS.map((lab) => (
            <Link
              key={lab.slug}
              href={`/deploy-labs/${lab.slug}`}
              className="block rounded-2xl border-2 border-gray-100 p-6 hover:border-[var(--color-brand)] hover:shadow-md transition-all"
            >
              <h2 className="font-bold text-gray-800 mb-2">{lab.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{lab.description}</p>
              <p className="text-xs text-[var(--color-brand)] font-medium">
                {lab.steps.length} steps →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
```

- [ ] **Step 10: Gate `apps/spfx-portal/components/DeployLab.tsx`**

Read the file first. It's a `'use client'` component. Add `import { AuthGuard } from '@repo/auth';` and wrap the return's outermost element in `<AuthGuard>...</AuthGuard>`.

- [ ] **Step 11: Build spfx-portal to verify**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn/apps/spfx-portal
pnpm build
```

Expected: build succeeds with same page count as before (25 pages).

- [ ] **Step 12: Commit**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
git add apps/spfx-portal/components/LessonLayout.tsx apps/spfx-portal/app/quiz/page.tsx apps/spfx-portal/components/Header.tsx apps/spfx-portal/app/labs/page.tsx apps/spfx-portal/components/SpfxLab.tsx apps/spfx-portal/components/StudioPage.tsx apps/spfx-portal/app/projects/page.tsx apps/spfx-portal/components/SpfxProjectWizard.tsx apps/spfx-portal/app/deploy-labs/page.tsx apps/spfx-portal/components/DeployLab.tsx
git commit -m "feat: add auth gate to all gated spfx-portal routes and visitor count in Header"
```

---

## Manual Supabase Step (User Action Required)

After all tasks are committed and before pushing:

1. Open the Supabase dashboard for the project used by both portals
2. Go to **SQL Editor**
3. Paste and run the contents of `docs/supabase-setup.sql`
4. Confirm both tables (`user_profiles`, `portal_stats`) appear in the Table Editor
5. Confirm the `increment_portal_stat` function appears under Database → Functions
