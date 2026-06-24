# React + SPFx Learning Portals — Setup Guide

Clone this repo on any machine and follow these steps to continue development or trigger a deploy.

---

## Quick Start (New Machine)

```bash
# 1. Clone
git clone https://github.com/sudharsank/react-spfx-learn.git
cd react-spfx-learn

# 2. Node version (MUST be 22 LTS)
nvm install 22
nvm use 22

# 3. Install pnpm if not already installed
npm install -g pnpm@latest

# 4. Install all dependencies
pnpm install

# 5. Create environment files
cp apps/react-portal/.env.local.example apps/react-portal/.env.local
cp apps/spfx-portal/.env.local.example apps/spfx-portal/.env.local
# Then fill in your Supabase values (see below)

# 6. Run both portals in dev mode
pnpm dev
#   React portal → http://localhost:3000
#   SPFx portal  → http://localhost:3001
```

---

## Actions Required Before Live Deploy

### Step 1 — Add Supabase Secrets to GitHub

Go to: **https://github.com/sudharsank/react-spfx-learn/settings/secrets/actions**

Add these two secrets:

| Secret name | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon / public key |

> **Recommended:** Create a new dedicated Supabase project for this at https://supabase.com (separate from existing exam portals).

### Step 2 — Add Supabase Redirect URLs

In your Supabase project → Authentication → URL Configuration, add these to **Redirect URLs**:

```
http://localhost:3000
http://localhost:3001
https://sudharsank.github.io/react-spfx-learn/react/
https://sudharsank.github.io/react-spfx-learn/spfx/
```

### Step 3 — Enable OAuth Providers in Supabase

In Supabase → Authentication → Providers:

- **GitHub**: Enable, add GitHub OAuth App credentials
  - Authorization callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
- **Azure (Microsoft)**: Enable, add Azure AD App credentials
  - Authorization callback URL: `https://<your-project>.supabase.co/auth/v1/callback`

### Step 4 — Enable GitHub Pages

Go to: **https://github.com/sudharsank/react-spfx-learn/settings/pages**

- Source: **GitHub Actions** (not a branch)

> This may already be configured — check before enabling.

### Step 5 — Trigger First Deploy

After secrets are added, trigger the workflow manually:

```bash
gh workflow run deploy-portals.yml --repo sudharsank/react-spfx-learn
```

Or push any change to `main` affecting `apps/**` or `packages/**`.

**Monitor the run:**
```bash
gh run list --repo sudharsank/react-spfx-learn --limit 5
gh run watch --repo sudharsank/react-spfx-learn
```

**Live URLs once deployed:**
- Root: https://sudharsank.github.io/react-spfx-learn/
- React portal: https://sudharsank.github.io/react-spfx-learn/react/
- SPFx portal: https://sudharsank.github.io/react-spfx-learn/spfx/

---

## Local Environment Files

Create `.env.local` in each portal app:

```bash
# apps/react-portal/.env.local
# apps/spfx-portal/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## SPFx Development (Additional Tools)

For SPFx lesson labs and deploy labs, install globally:

```bash
npm install @rushstack/heft yo @microsoft/generator-sharepoint --global
```

For Tauri 2 desktop app (Phase 3):

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cargo install tauri-cli
```

---

## Project Structure

```
react-spfx-learn/
├── apps/
│   ├── react-portal/     → React learning portal (port 3000)
│   └── spfx-portal/      → SPFx learning portal (port 3001)
├── packages/
│   ├── ui/               → Shared components (ConceptCard, AnnotatedCode, etc.)
│   ├── auth/             → Supabase client + localStorage fallback
│   ├── adaptive/         → Persona quiz engine + adaptive scoring
│   └── content/          → MDX type definitions
└── .github/workflows/
    └── deploy-portals.yml → Builds + deploys both portals to GitHub Pages
```

## Useful Commands

```bash
pnpm dev                          # Run both portals in dev mode
pnpm build                        # Build all apps
pnpm turbo run build --filter=react-portal   # Build React portal only
pnpm turbo run build --filter=spfx-portal    # Build SPFx portal only

gh workflow run deploy-portals.yml           # Trigger GitHub Pages deploy
gh run list --repo sudharsank/react-spfx-learn  # Check deploy status
```

## Design Spec & Implementation Plan

Full design spec and phase plan are in the `exam-learning` repo:
- Spec: `docs/superpowers/specs/2026-06-23-react-spfx-learning-portal-design.md`
- Plan: `docs/superpowers/plans/2026-06-24-react-spfx-portal-phase1.md`
- Repo: https://github.com/sudharsank/exam-learning
