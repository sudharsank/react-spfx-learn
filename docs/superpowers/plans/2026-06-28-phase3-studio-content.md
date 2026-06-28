# Phase 3 — Studio, Project Builder, Deploy Labs & Content Enrichment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich all remaining lesson MDX files with Phase 2 components, add Code Studio (Monaco + Supabase persistence) to both portals, add Project Builder wizard to both portals, and add SPFx Deploy Labs to the spfx-portal.

**Architecture:** Content enrichment appends MicroAnimation/ConceptMap/DeepDive/TryItInline blocks to the 7 react and 9 spfx lessons that are currently plain MDX. Code Studio lives at `/studio` in each portal — Monaco editor, multi-file tabs, Supabase `studio_files` table for authed users, localStorage for guests. Project Builder lives at `/projects` — wizard steps with checkpoint saves. SPFx Deploy Labs lives at `/deploy-labs` — checklist-driven deployment walkthrough.

**Tech Stack:**
- Existing: Next.js 15.1.x, Tailwind v4, `@monaco-editor/react`, `@supabase/supabase-js`, `@repo/adaptive`, `@repo/ui`, `@repo/auth`, `motion/react`
- No new packages required

## Global Constraints

- Turborepo 2.x: `turbo.json` uses `tasks` key (NOT `pipeline`)
- pnpm 9.x: internal packages use `"workspace:*"` protocol
- Next.js 15.1.x: `output: 'export'`; `params`/`searchParams` are Promises (`await params`); no `next/headers`; no server actions
- Tailwind v4: CSS-first `@theme {}` in globals.css; no tailwind.config.js; postcss plugin is `@tailwindcss/postcss`
- `motion` NOT `framer-motion`; import from `motion/react` in client components
- `'use client'` required on all components using hooks, Monaco, or motion
- basePath: react-portal = `/react-spfx-learn/react`, spfx-portal = `/react-spfx-learn/spfx`
- ConceptMap node format: `{ id: string, label: string, active?: boolean, x: number, y: number }`
- ConceptMap edge format: `{ id: string, source: string, target: string, label?: string }`
- MicroAnimation scenes: `'render-cycle' | 'component-tree' | 'spfx-request-flow'`
- TryItInline `defaultCode`: React component named `App`, using `React.useState` (NOT import)
- DeepDive `title` + children (plain text or JSX)
- Phase 2 components (MicroAnimation, ConceptMap, DeepDive, TryItInline) are registered in `mdx-components.tsx` — NO import needed in MDX files
- Auto-commit AND `git push origin main` after EVERY task completion
- Monorepo root: `/Users/sudharsank/Projects/react-spfx-learn`
- Build verify command: `pnpm turbo run build --filter=react-portal` and `pnpm turbo run build --filter=spfx-portal`

---

### Task 1: React portal content enrichment — 7 MDX files

Append Phase 2 interactive blocks to the 7 react-portal lessons that currently only have Phase 1 components (ConceptCard, AnnotatedCode, AnalogyBridge, DangerZone). Do NOT remove or alter existing content — only append.

**Files:**
- Modify: `apps/react-portal/content/lessons/module-1-foundations/2-jsx-basics.mdx`
- Modify: `apps/react-portal/content/lessons/module-1-foundations/3-components.mdx`
- Modify: `apps/react-portal/content/lessons/module-2-hooks/2-use-effect.mdx`
- Modify: `apps/react-portal/content/lessons/module-2-hooks/3-custom-hooks.mdx`
- Modify: `apps/react-portal/content/lessons/module-3-patterns/1-props-and-state.mdx`
- Modify: `apps/react-portal/content/lessons/module-3-patterns/2-lifting-state.mdx`
- Modify: `apps/react-portal/content/lessons/module-3-patterns/3-composition.mdx`

**Interfaces:**
- Consumes: `MicroAnimation`, `ConceptMap`, `DeepDive`, `TryItInline` — all available globally via `mdx-components.tsx`, no import needed

- [ ] **Step 1: Append to `2-jsx-basics.mdx`**

Add this block at the very end of the file (after all existing content):

```mdx
## JSX Compilation Pipeline

<ConceptMap
  nodes={[
    { id: 'jsx', label: 'JSX source', active: true, x: 0, y: 60 },
    { id: 'compiler', label: 'Babel / SWC', x: 160, y: 60 },
    { id: 'createEl', label: 'React.createElement()', x: 320, y: 60 },
    { id: 'vdom', label: 'Virtual DOM', x: 480, y: 60 },
    { id: 'dom', label: 'Real DOM', x: 640, y: 60 },
  ]}
  edges={[
    { id: 'e1', source: 'jsx', target: 'compiler', label: 'compiles' },
    { id: 'e2', source: 'compiler', target: 'createEl', label: 'emits' },
    { id: 'e3', source: 'createEl', target: 'vdom', label: 'builds' },
    { id: 'e4', source: 'vdom', target: 'dom', label: 'commits' },
  ]}
/>

<MicroAnimation scene="component-tree" />

<DeepDive title="What Babel actually outputs for your JSX">
  JSX like `<h1 className="title">Hello</h1>` compiles to `React.createElement('h1', { className: 'title' }, 'Hello')`. With the new JSX transform (React 17+), it uses `import { jsx as _jsx } from 'react/jsx-runtime'` instead — this is why you no longer need `import React from 'react'` at the top of every file. The compiler handles the import automatically.
</DeepDive>
```

- [ ] **Step 2: Append to `3-components.mdx`**

Read the file first to find the end, then add:

```mdx
## Component Hierarchy

<MicroAnimation scene="component-tree" />

<ConceptMap
  nodes={[
    { id: 'app', label: 'App', active: true, x: 160, y: 0 },
    { id: 'header', label: 'Header', x: 40, y: 90 },
    { id: 'main', label: 'Main', x: 160, y: 90 },
    { id: 'footer', label: 'Footer', x: 280, y: 90 },
    { id: 'nav', label: 'Nav', x: 40, y: 180 },
    { id: 'content', label: 'Content', x: 160, y: 180 },
  ]}
  edges={[
    { id: 'e1', source: 'app', target: 'header' },
    { id: 'e2', source: 'app', target: 'main' },
    { id: 'e3', source: 'app', target: 'footer' },
    { id: 'e4', source: 'header', target: 'nav' },
    { id: 'e5', source: 'main', target: 'content' },
  ]}
/>

<DeepDive title="Pure components and why they matter">
  React assumes your components are pure functions — same props in, same output out, no side effects during render. This lets React safely re-render your component multiple times in development (Strict Mode does exactly this) to surface impurity bugs. If your component has side effects in the render body (like calling an API directly), you will see them triggered twice in development.
</DeepDive>
```

- [ ] **Step 3: Append to `2-use-effect.mdx`**

```mdx
## The Render → Effect Timeline

<MicroAnimation scene="render-cycle" />

## Try It: Timer with cleanup

<TryItInline
  defaultCode={`function App() {
  const [seconds, setSeconds] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div style={{textAlign:'center', marginTop:'40px', fontFamily:'system-ui'}}>
      <h2 style={{fontSize:'3rem', margin:'0 0 16px'}}>{seconds}s</h2>
      <button onClick={() => setRunning(r => !r)} style={{padding:'8px 24px', fontSize:'1rem', cursor:'pointer'}}>
        {running ? 'Pause' : 'Start'}
      </button>
      <button onClick={() => { setRunning(false); setSeconds(0); }} style={{marginLeft:'8px', padding:'8px 24px', fontSize:'1rem', cursor:'pointer'}}>
        Reset
      </button>
    </div>
  );
}`}
/>

<DeepDive title="Why useEffect cleanup prevents memory leaks">
  Every time React re-runs an effect (because a dependency changed), it calls the cleanup from the previous run first. Without cleanup, you would accumulate stale intervals, event listeners, and subscriptions — each still holding a reference to the old component's closed-over variables. This is one of the most common sources of memory leaks in React apps.
</DeepDive>
```

- [ ] **Step 4: Append to `3-custom-hooks.mdx`**

Read the file to find the end, then add:

```mdx
## Hook Composition Map

<ConceptMap
  nodes={[
    { id: 'custom', label: 'useLocalStorage', active: true, x: 160, y: 0 },
    { id: 'state', label: 'useState', x: 60, y: 100 },
    { id: 'effect', label: 'useEffect', x: 260, y: 100 },
    { id: 'storage', label: 'localStorage', x: 260, y: 200 },
  ]}
  edges={[
    { id: 'e1', source: 'custom', target: 'state', label: 'uses' },
    { id: 'e2', source: 'custom', target: 'effect', label: 'uses' },
    { id: 'e3', source: 'effect', target: 'storage', label: 'syncs' },
  ]}
/>

<TryItInline
  defaultCode={`function useCounter(initial = 0) {
  const [count, setCount] = React.useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

function App() {
  const { count, increment, decrement, reset } = useCounter(0);
  return (
    <div style={{textAlign:'center', marginTop:'40px', fontFamily:'system-ui'}}>
      <h2 style={{fontSize:'2.5rem', margin:'0 0 16px'}}>{count}</h2>
      <button onClick={decrement} style={{padding:'8px 20px', fontSize:'1rem', marginRight:'8px'}}>−</button>
      <button onClick={reset} style={{padding:'8px 20px', fontSize:'1rem', marginRight:'8px'}}>Reset</button>
      <button onClick={increment} style={{padding:'8px 20px', fontSize:'1rem'}}>+</button>
    </div>
  );
}`}
/>

<DeepDive title="The Rules of Hooks — why they exist">
  React tracks hook state using an array indexed by call order. If you put a hook inside an if block, the array index shifts on the next render and React reads the wrong state for every subsequent hook. The linter rule `react-hooks/rules-of-hooks` enforces this statically. Custom hooks are just functions — they inherit the rules because they call the same built-in hooks internally.
</DeepDive>
```

- [ ] **Step 5: Append to `1-props-and-state.mdx`**

```mdx
## Re-render Flow

<MicroAnimation scene="render-cycle" />

<ConceptMap
  nodes={[
    { id: 'parent', label: 'Parent', x: 160, y: 0 },
    { id: 'props', label: 'Props (read-only)', active: true, x: 60, y: 100 },
    { id: 'state', label: 'State (local)', active: true, x: 260, y: 100 },
    { id: 'render', label: 'Re-render', x: 160, y: 200 },
  ]}
  edges={[
    { id: 'e1', source: 'parent', target: 'props', label: 'passes down' },
    { id: 'e2', source: 'state', target: 'render', label: 'triggers' },
    { id: 'e3', source: 'props', target: 'render', label: 'used in' },
  ]}
/>

<DeepDive title="When to use props vs state">
  Use **props** when: the value is decided by the parent, it never changes from the child's perspective, or multiple components need the same data. Use **state** when: the value can change over time due to user interaction, it belongs to exactly one component, and no other component needs to read it. When two sibling components need the same value, lift it to their common parent as state and pass it down as props.
</DeepDive>
```

- [ ] **Step 6: Append to `2-lifting-state.mdx`**

Read the file to find the end, then add:

```mdx
## Data Flow: Lifting State Up

<ConceptMap
  nodes={[
    { id: 'parent', label: 'Parent (holds state)', active: true, x: 160, y: 0 },
    { id: 'childA', label: 'Child A (reads)', x: 60, y: 110 },
    { id: 'childB', label: 'Child B (reads)', x: 260, y: 110 },
    { id: 'setter', label: 'Setter callback', x: 60, y: 220 },
  ]}
  edges={[
    { id: 'e1', source: 'parent', target: 'childA', label: 'state as prop' },
    { id: 'e2', source: 'parent', target: 'childB', label: 'state as prop' },
    { id: 'e3', source: 'childA', target: 'setter', label: 'calls' },
    { id: 'e4', source: 'setter', target: 'parent', label: 'updates' },
  ]}
/>

<MicroAnimation scene="component-tree" />

<DeepDive title="Why not just use a global variable?">
  A global variable changes do not trigger React re-renders. React only knows to re-render when you call a state setter. Even if the global variable holds the right value, React will still display the stale UI. State lifting keeps data in React's ownership — when the parent's setter is called, React re-renders the parent and all its children automatically, keeping the UI in sync.
</DeepDive>
```

- [ ] **Step 7: Append to `3-composition.mdx`**

```mdx
## Composition Pattern Map

<ConceptMap
  nodes={[
    { id: 'container', label: 'Container', active: true, x: 160, y: 0 },
    { id: 'children', label: 'children prop', x: 60, y: 110 },
    { id: 'slots', label: 'Named slots', x: 260, y: 110 },
    { id: 'caller', label: 'Caller decides', x: 160, y: 220 },
  ]}
  edges={[
    { id: 'e1', source: 'container', target: 'children', label: 'accepts' },
    { id: 'e2', source: 'container', target: 'slots', label: 'accepts' },
    { id: 'e3', source: 'caller', target: 'children', label: 'provides' },
    { id: 'e4', source: 'caller', target: 'slots', label: 'provides' },
  ]}
/>

<MicroAnimation scene="component-tree" />

<TryItInline
  defaultCode={`function Card({ title, footer, children }) {
  return (
    <div style={{border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', fontFamily:'system-ui', maxWidth:'320px', margin:'0 auto'}}>
      <div style={{padding:'12px 16px', borderBottom:'1px solid #e2e8f0', fontWeight:700}}>{title}</div>
      <div style={{padding:'16px'}}>{children}</div>
      {footer && <div style={{padding:'12px 16px', borderTop:'1px solid #e2e8f0', color:'#64748b', fontSize:'14px'}}>{footer}</div>}
    </div>
  );
}

function App() {
  return (
    <div style={{padding:'32px'}}>
      <Card title="My Profile" footer="Joined 2018">
        <p style={{margin:0}}>Azure Architect · SharePoint MVP</p>
      </Card>
    </div>
  );
}`}
/>

<DeepDive title="Composition vs render props vs HOCs">
  Children and slot props (composition) are the modern React pattern — they are readable, tree-shakeable, and TypeScript-friendly. Render props (`renderHeader={() => <div/>}`) are older and harder to read. Higher-Order Components (HOCs) wrap a component in a function — still used in libraries but avoid writing your own. For sharing logic (not UI structure), custom hooks are always the right choice over render props or HOCs.
</DeepDive>
```

- [ ] **Step 8: Build react-portal to verify all MDX compiles**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=react-portal
```

Expected: `react-portal:build` succeeds, shows page count ≥ 20. Zero TypeScript errors.

- [ ] **Step 9: Commit and push**

```bash
git add apps/react-portal/content/lessons
git commit -m "content: enrich react-portal lessons with Phase 2 interactive blocks"
git push origin main
```

---

### Task 2: SPFx portal content enrichment — 9 MDX files

Append Phase 2 interactive blocks to all 9 spfx-portal lessons.

**Files:**
- Modify: `apps/spfx-portal/content/lessons/module-1-spfx-intro/1-what-is-spfx.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-1-spfx-intro/2-dev-environment.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-1-spfx-intro/3-first-webpart.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-2-react-in-spfx/1-react-primer.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-2-react-in-spfx/2-scaffold-project.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-2-react-in-spfx/3-pnpjs-basics.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-3-deployment/1-app-catalog.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-3-deployment/2-heft-build.mdx`
- Modify: `apps/spfx-portal/content/lessons/module-3-deployment/3-tenant-deploy.mdx`

**Interfaces:**
- Consumes: `MicroAnimation`, `ConceptMap`, `DeepDive` — available globally via `apps/spfx-portal/mdx-components.tsx`, no import needed

- [ ] **Step 1: Append to `1-what-is-spfx.mdx`**

```mdx
## SPFx Request Flow

<MicroAnimation scene="spfx-request-flow" />

<ConceptMap
  nodes={[
    { id: 'sp', label: 'SharePoint Page', active: true, x: 0, y: 60 },
    { id: 'wp', label: 'Web Part instance', x: 160, y: 60 },
    { id: 'react', label: 'React tree', x: 320, y: 60 },
    { id: 'graph', label: 'Graph API', x: 320, y: 160 },
    { id: 'dom', label: 'DOM element', x: 480, y: 60 },
  ]}
  edges={[
    { id: 'e1', source: 'sp', target: 'wp', label: 'loads' },
    { id: 'e2', source: 'wp', target: 'react', label: 'mounts' },
    { id: 'e3', source: 'react', target: 'graph', label: 'calls' },
    { id: 'e4', source: 'react', target: 'dom', label: 'renders into' },
  ]}
/>

<DeepDive title="The SPFx load lifecycle in detail">
  When SharePoint renders a page, it reads the page's manifest JSON to discover which web parts are included. It downloads your `.js` bundle, calls your web part class's `onInit()` method (where you can set up services like PnPjs), then calls `render()` which is where you mount your React tree. On page unload, `onDispose()` is called — this is where you should call `ReactDom.unmountComponentAtNode(this.domElement)` to prevent memory leaks.
</DeepDive>
```

- [ ] **Step 2: Append to `2-dev-environment.mdx`**

Read the file to find the end, then add:

```mdx
## SPFx Toolchain

<ConceptMap
  nodes={[
    { id: 'node', label: 'Node.js 22 LTS', active: true, x: 160, y: 0 },
    { id: 'yo', label: 'Yeoman + SPFx generator', x: 60, y: 100 },
    { id: 'gulp', label: 'Gulp 4', x: 260, y: 100 },
    { id: 'heft', label: 'Heft (Rush Stack)', x: 160, y: 100 },
    { id: 'webpack', label: 'Webpack 5', x: 160, y: 200 },
  ]}
  edges={[
    { id: 'e1', source: 'node', target: 'yo', label: 'runs' },
    { id: 'e2', source: 'node', target: 'heft', label: 'runs' },
    { id: 'e3', source: 'heft', target: 'webpack', label: 'orchestrates' },
    { id: 'e4', source: 'node', target: 'gulp', label: 'runs (legacy)' },
  ]}
/>

<DeepDive title="Why Node 22 LTS and not the latest?">
  SPFx 1.21+ officially supports Node.js 22 LTS. The SPFx toolchain pins to specific Node versions because the Yeoman generator, Heft, and Webpack have transitive dependencies that fail on odd-numbered (non-LTS) releases. Always check the SPFx release notes for the supported Node range before upgrading. Use `nvm` (macOS/Linux) or `nvs` (Windows) to switch between Node versions per-project.
</DeepDive>
```

- [ ] **Step 3: Append to `3-first-webpart.mdx`**

Read the file to find the end, then add:

```mdx
## Web Part Lifecycle

<MicroAnimation scene="spfx-request-flow" />

<ConceptMap
  nodes={[
    { id: 'manifest', label: 'manifest.json', active: true, x: 0, y: 60 },
    { id: 'bundle', label: '.js bundle', x: 160, y: 60 },
    { id: 'init', label: 'onInit()', x: 320, y: 0 },
    { id: 'render', label: 'render()', x: 320, y: 60 },
    { id: 'dispose', label: 'onDispose()', x: 320, y: 120 },
  ]}
  edges={[
    { id: 'e1', source: 'manifest', target: 'bundle', label: 'points to' },
    { id: 'e2', source: 'bundle', target: 'init', label: '1st' },
    { id: 'e3', source: 'bundle', target: 'render', label: '2nd' },
    { id: 'e4', source: 'bundle', target: 'dispose', label: 'on unload' },
  ]}
/>

<DeepDive title="What lives in manifest.json">
  Every SPFx web part has a `<webpartname>.manifest.json` file that SharePoint reads before loading your bundle. It declares the component ID (a GUID), the display name shown in the web part toolbox, the preconfigured entries (default property values), and the bundle path. The GUID must be unique and stable — changing it after deployment breaks existing page references.
</DeepDive>
```

- [ ] **Step 4: Append to `1-react-primer.mdx`**

Read the file to find the end, then add:

```mdx
## React in SPFx vs Standalone React

<MicroAnimation scene="render-cycle" />

<ConceptMap
  nodes={[
    { id: 'standalone', label: 'Standalone React', x: 60, y: 0 },
    { id: 'spfx', label: 'React in SPFx', active: true, x: 260, y: 0 },
    { id: 'cra', label: 'index.tsx entrypoint', x: 60, y: 110 },
    { id: 'wp', label: 'render() in WebPart', x: 260, y: 110 },
    { id: 'div', label: 'document.getElementById()', x: 60, y: 220 },
    { id: 'dome', label: 'this.domElement', x: 260, y: 220 },
  ]}
  edges={[
    { id: 'e1', source: 'standalone', target: 'cra' },
    { id: 'e2', source: 'spfx', target: 'wp' },
    { id: 'e3', source: 'cra', target: 'div', label: 'mounts into' },
    { id: 'e4', source: 'wp', target: 'dome', label: 'mounts into' },
  ]}
/>

<DeepDive title="React version inside SPFx">
  SPFx 1.21 ships with React 17 internally. You can use React 18 or 19 by adding it as a dependency and adjusting your webpack config, but the SPFx team only tests against the bundled version. For production web parts, stick with the SPFx-bundled React unless you have a specific reason to upgrade, to avoid bundle size increases from shipping a second copy of React.
</DeepDive>
```

- [ ] **Step 5: Append to `2-scaffold-project.mdx`**

Read the file to find the end, then add:

```mdx
## Scaffolded Project Structure

<ConceptMap
  nodes={[
    { id: 'src', label: 'src/', active: true, x: 160, y: 0 },
    { id: 'webparts', label: 'webparts/', x: 60, y: 100 },
    { id: 'components', label: 'components/', x: 260, y: 100 },
    { id: 'wp', label: 'HelloWorldWebPart.ts', x: 60, y: 200 },
    { id: 'manifest', label: 'manifest.json', x: 0, y: 300 },
    { id: 'helloworld', label: 'HelloWorld.tsx', x: 260, y: 200 },
  ]}
  edges={[
    { id: 'e1', source: 'src', target: 'webparts' },
    { id: 'e2', source: 'src', target: 'components' },
    { id: 'e3', source: 'webparts', target: 'wp' },
    { id: 'e4', source: 'wp', target: 'manifest', label: 'has' },
    { id: 'e5', source: 'components', target: 'helloworld' },
  ]}
/>

<DeepDive title="config/ folder — what each file controls">
  The `config/` folder has four key files: `package-solution.json` controls your app package version and whether it is tenant-wide or site-collection-scoped; `deploy-azure-storage.json` is for CDN hosting (rarely needed for SharePoint Online); `serve.json` tells `heft start` which SharePoint site URL to open for local testing; `write-manifests.json` controls where Heft writes the final bundle manifests. You will edit `package-solution.json` on every release to bump the version.
</DeepDive>
```

- [ ] **Step 6: Append to `3-pnpjs-basics.mdx`**

Read the file to find the end, then add:

```mdx
## PnPjs Request Flow

<MicroAnimation scene="spfx-request-flow" />

<ConceptMap
  nodes={[
    { id: 'pnp', label: 'PnPjs', active: true, x: 160, y: 0 },
    { id: 'sp', label: '@pnp/sp', x: 60, y: 100 },
    { id: 'graph', label: '@pnp/graph', x: 260, y: 100 },
    { id: 'spRest', label: 'SP REST API', x: 60, y: 200 },
    { id: 'graphApi', label: 'MS Graph API', x: 260, y: 200 },
  ]}
  edges={[
    { id: 'e1', source: 'pnp', target: 'sp', label: 'includes' },
    { id: 'e2', source: 'pnp', target: 'graph', label: 'includes' },
    { id: 'e3', source: 'sp', target: 'spRest', label: 'wraps' },
    { id: 'e4', source: 'graph', target: 'graphApi', label: 'wraps' },
  ]}
/>

<DeepDive title="Why initialize PnPjs in onInit, not in the component">
  PnPjs needs the SPFx `context` object to read the current site URL and attach the user's authentication token to every request. The `context` is only available in your `BaseClientSideWebPart` class. Initialize PnPjs once in `onInit()`, then pass a preconfigured `sp` instance to your React components as a prop. Initializing PnPjs inside a React component risks creating multiple unconfigured instances.
</DeepDive>
```

- [ ] **Step 7: Append to `1-app-catalog.mdx`**

Read the file to find the end, then add:

```mdx
## App Catalog Scope

<ConceptMap
  nodes={[
    { id: 'tenant', label: 'Tenant App Catalog', active: true, x: 160, y: 0 },
    { id: 'site', label: 'Site Collection Catalog', x: 160, y: 110 },
    { id: 'all', label: 'All Sites', x: 60, y: 220 },
    { id: 'one', label: 'One Site Only', x: 260, y: 220 },
  ]}
  edges={[
    { id: 'e1', source: 'tenant', target: 'all', label: 'deploys to' },
    { id: 'e2', source: 'site', target: 'one', label: 'deploys to' },
  ]}
/>

<DeepDive title="Admin consent for API permissions">
  If your web part calls the Microsoft Graph API, SharePoint requires an admin to explicitly approve each permission scope (e.g. `User.Read`, `Files.Read.All`) in the SharePoint Admin Center under **API Access**. Until approved, API calls fail with a 403. This approval is per-tenant and per-scope — you cannot approve permissions programmatically from the web part itself. Document the required permissions in your web part's README so tenant admins know what to approve.
</DeepDive>
```

- [ ] **Step 8: Append to `2-heft-build.mdx`**

Read the file to find the end, then add:

```mdx
## Heft Build Pipeline

<ConceptMap
  nodes={[
    { id: 'heft', label: 'heft build', active: true, x: 160, y: 0 },
    { id: 'ts', label: 'TypeScript compile', x: 60, y: 100 },
    { id: 'webpack', label: 'Webpack bundle', x: 260, y: 100 },
    { id: 'manifests', label: 'Write manifests', x: 160, y: 200 },
    { id: 'sppkg', label: '.sppkg package', x: 160, y: 300 },
  ]}
  edges={[
    { id: 'e1', source: 'heft', target: 'ts', label: 'runs' },
    { id: 'e2', source: 'heft', target: 'webpack', label: 'runs' },
    { id: 'e3', source: 'webpack', target: 'manifests', label: 'then' },
    { id: 'e4', source: 'manifests', target: 'sppkg', label: 'packages into' },
  ]}
/>

<DeepDive title="Debug vs production build differences">
  `heft build` (debug) skips minification and tree-shaking for faster iteration — the resulting bundle is 3–5× larger. `heft build --production` enables full Webpack optimization: minification, dead code elimination, and chunk splitting. Always use `--production` before packaging for upload to the App Catalog. The `.sppkg` file size difference is significant: a production bundle for a typical web part is 100–300 KB, while a debug bundle can exceed 1 MB.
</DeepDive>
```

- [ ] **Step 9: Append to `3-tenant-deploy.mdx`**

Read the file to find the end, then add:

```mdx
## Deployment Pipeline

<MicroAnimation scene="spfx-request-flow" />

<ConceptMap
  nodes={[
    { id: 'sppkg', label: '.sppkg file', active: true, x: 0, y: 60 },
    { id: 'catalog', label: 'App Catalog', x: 160, y: 60 },
    { id: 'api', label: 'API Permissions', x: 320, y: 0 },
    { id: 'deploy', label: 'Tenant Deploy', x: 320, y: 60 },
    { id: 'site', label: 'Add to Site', x: 480, y: 60 },
    { id: 'page', label: 'Add to Page', x: 640, y: 60 },
  ]}
  edges={[
    { id: 'e1', source: 'sppkg', target: 'catalog', label: 'upload' },
    { id: 'e2', source: 'catalog', target: 'api', label: 'review' },
    { id: 'e3', source: 'catalog', target: 'deploy', label: 'approve' },
    { id: 'e4', source: 'deploy', target: 'site', label: 'then' },
    { id: 'e5', source: 'site', target: 'page', label: 'then' },
  ]}
/>

<DeepDive title="Tenant-wide vs manual site deployment">
  When you check **Make this solution available to all sites in the organization** in the App Catalog, SharePoint automatically makes the web part available in every site's web part toolbox — no "Add an app" step required on each site. Without this flag, admins must visit each site and add the app manually. Tenant-wide deployment is the right choice for most enterprise web parts. The downside: you cannot roll back to a site-by-site basis once tenant-wide is enabled without removing the solution entirely.
</DeepDive>
```

- [ ] **Step 10: Build spfx-portal to verify all MDX compiles**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=spfx-portal
```

Expected: `spfx-portal:build` succeeds, shows page count ≥ 19. Zero TypeScript errors.

- [ ] **Step 11: Commit and push**

```bash
git add apps/spfx-portal/content/lessons
git commit -m "content: enrich spfx-portal lessons with Phase 2 interactive blocks"
git push origin main
```

---

### Task 3: Supabase `studio_files` table + storage hook

Create the Supabase table for Code Studio persistence and a `useStudioStorage` hook in `packages/adaptive`.

**Files:**
- Create: `packages/adaptive/src/useStudioStorage.ts`
- Create: `docs/studio-supabase-migration.sql`
- Modify: `packages/adaptive/src/index.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface StudioFile { name: string; content: string }
  export function useStudioStorage(portal: 'react' | 'spfx'): {
    files: StudioFile[];
    setFiles: (files: StudioFile[]) => void;
    loading: boolean;
  }
  ```

- [ ] **Step 1: Create `docs/studio-supabase-migration.sql`**

This file documents the table to create in the Supabase dashboard (SQL editor). The implementer does NOT run it automatically — it is for the developer to run once.

```sql
-- Run this in the Supabase SQL editor for the project
create table if not exists studio_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  portal text not null check (portal in ('react', 'spfx')),
  filename text not null,
  content text not null default '',
  updated_at timestamptz default now(),
  unique(user_id, portal, filename)
);

alter table studio_files enable row level security;

create policy "Users can read own files"
  on studio_files for select
  using (auth.uid() = user_id);

create policy "Users can upsert own files"
  on studio_files for insert
  with check (auth.uid() = user_id);

create policy "Users can update own files"
  on studio_files for update
  using (auth.uid() = user_id);

create policy "Users can delete own files"
  on studio_files for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 2: Create `packages/adaptive/src/useStudioStorage.ts`**

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface StudioFile {
  name: string;
  content: string;
}

const LS_KEY = (portal: string) => `studio_files_${portal}`;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function useStudioStorage(portal: 'react' | 'spfx') {
  const [files, setFilesState] = useState<StudioFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = getSupabase();
    if (!supabase) {
      const raw = localStorage.getItem(LS_KEY(portal));
      setFilesState(raw ? JSON.parse(raw) : []);
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        const raw = localStorage.getItem(LS_KEY(portal));
        setFilesState(raw ? JSON.parse(raw) : []);
        setLoading(false);
        return;
      }
      supabase
        .from('studio_files')
        .select('filename, content')
        .eq('portal', portal)
        .then(({ data: rows }) => {
          if (rows) {
            setFilesState(rows.map((r) => ({ name: r.filename, content: r.content })));
          }
          setLoading(false);
        });
    });
  }, [portal]);

  const setFiles = useCallback(
    (next: StudioFile[]) => {
      setFilesState(next);
      if (typeof window === 'undefined') return;
      const supabase = getSupabase();
      if (!supabase) {
        localStorage.setItem(LS_KEY(portal), JSON.stringify(next));
        return;
      }
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) {
          localStorage.setItem(LS_KEY(portal), JSON.stringify(next));
          return;
        }
        const upserts = next.map((f) => ({
          user_id: data.user!.id,
          portal,
          filename: f.name,
          content: f.content,
          updated_at: new Date().toISOString(),
        }));
        supabase.from('studio_files').upsert(upserts, { onConflict: 'user_id,portal,filename' });
      });
    },
    [portal]
  );

  return { files, setFiles, loading };
}
```

- [ ] **Step 3: Export from `packages/adaptive/src/index.ts`**

Add to the existing exports:

```ts
export { useStudioStorage } from './useStudioStorage';
export type { StudioFile } from './useStudioStorage';
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm --filter @repo/adaptive type-check
```

Expected: 0 errors.

- [ ] **Step 5: Add `@supabase/supabase-js` to `packages/adaptive/package.json` dependencies**

Open `packages/adaptive/package.json`. Add to `"dependencies"`:

```json
"@supabase/supabase-js": "^2.0.0"
```

Then from the monorepo root:

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm install
```

Expected: lockfile updated, no errors.

- [ ] **Step 6: Type-check again after install**

```bash
pnpm --filter @repo/adaptive type-check
```

Expected: 0 errors.

- [ ] **Step 7: Commit and push**

```bash
git add packages/adaptive/package.json packages/adaptive/src/useStudioStorage.ts packages/adaptive/src/index.ts docs/studio-supabase-migration.sql pnpm-lock.yaml
git commit -m "feat: add useStudioStorage hook and Supabase studio_files migration"
git push origin main
```

---

### Task 4: react-portal Code Studio (`/studio` route)

Add a full-screen Monaco code studio to react-portal with file tabs, srcdoc live preview, and Supabase/localStorage persistence.

**Files:**
- Create: `apps/react-portal/app/studio/page.tsx`
- Create: `apps/react-portal/components/StudioPage.tsx`
- Modify: `apps/react-portal/components/Header.tsx` (add Studios nav link)

**Interfaces:**
- Consumes: `useStudioStorage, StudioFile` from `@repo/adaptive`
- Consumes: `@monaco-editor/react` (already in `packages/ui`, available in portal)

- [ ] **Step 1: Create `apps/react-portal/app/studio/page.tsx`**

```tsx
import dynamic from 'next/dynamic';

const StudioPage = dynamic(() => import('../../components/StudioPage'), { ssr: false });

export default function Studio() {
  return <StudioPage />;
}
```

- [ ] **Step 2: Create `apps/react-portal/components/StudioPage.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useStudioStorage } from '@repo/adaptive';

const DEFAULT_FILES = [
  {
    name: 'App.tsx',
    content: `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{fontFamily:'system-ui', padding:'32px', textAlign:'center'}}>
      <h1>React Studio</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}`,
  },
  {
    name: 'styles.css',
    content: `body { margin: 0; background: #f8fafc; }`,
  },
];

function buildSrcdoc(files: { name: string; content: string }[]): string {
  const app = files.find((f) => f.name === 'App.tsx')?.content ?? '';
  const css = files.find((f) => f.name === 'styles.css')?.content ?? '';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}<\/style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel">
${app}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
<\/script>
</body>
</html>`;
}

export default function StudioPage() {
  const { files: savedFiles, setFiles: persistFiles, loading } = useStudioStorage('react');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [preview, setPreview] = useState('');
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!loading && !bootstrapped.current) {
      bootstrapped.current = true;
      if (savedFiles.length > 0) setFiles(savedFiles);
    }
  }, [loading, savedFiles]);

  const activeContent = files.find((f) => f.name === activeFile)?.content ?? '';

  const handleChange = (value: string | undefined) => {
    const updated = files.map((f) =>
      f.name === activeFile ? { ...f, content: value ?? '' } : f
    );
    setFiles(updated);
  };

  const handleRun = () => {
    setPreview(buildSrcdoc(files));
    persistFiles(files);
  };

  const handleSave = () => persistFiles(files);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">Loading studio…</div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-white/10">
        <span className="text-white/70 text-sm font-semibold mr-4">React Studio</span>
        {files.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFile(f.name)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeFile === f.name
                ? 'bg-[var(--color-brand)] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {f.name}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded text-xs bg-white/10 text-white/70 hover:bg-white/20"
          >
            Save
          </button>
          <button
            onClick={handleRun}
            className="px-3 py-1 rounded text-xs bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-white/10">
          <Editor
            height="100%"
            language={activeFile.endsWith('.css') ? 'css' : 'typescript'}
            theme="vs-dark"
            value={activeContent}
            onChange={handleChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
            }}
          />
        </div>
        <div className="w-1/2 bg-white">
          {preview ? (
            <iframe
              sandbox="allow-scripts"
              srcDoc={preview}
              className="w-full h-full border-none"
              title="Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Press <kbd className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">▶ Run</kbd> to see your output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Studio link to `apps/react-portal/components/Header.tsx`**

Find the `<nav>` section and add a Studio link alongside the existing Learn and Labs links:

```tsx
<Link href="/studio" className="text-sm text-gray-600 hover:text-[var(--color-brand)] transition-colors">
  Studio
</Link>
```

- [ ] **Step 4: Build react-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=react-portal
```

Expected: page count includes `/studio/`. Zero TypeScript errors.

- [ ] **Step 5: Commit and push**

```bash
git add apps/react-portal/app/studio apps/react-portal/components/StudioPage.tsx apps/react-portal/components/Header.tsx
git commit -m "feat: add Code Studio to react-portal with Monaco editor and srcdoc preview"
git push origin main
```

---

### Task 5: spfx-portal Code Studio (`/studio` route)

Add a code studio to spfx-portal. SPFx code cannot run in the browser so there is no live preview — the studio is Monaco + multi-file tabs + save, useful for practice writing SPFx TypeScript.

**Files:**
- Create: `apps/spfx-portal/app/studio/page.tsx`
- Create: `apps/spfx-portal/components/StudioPage.tsx`
- Modify: `apps/spfx-portal/components/Header.tsx` (add Studio nav link)

**Interfaces:**
- Consumes: `useStudioStorage, StudioFile` from `@repo/adaptive`

- [ ] **Step 1: Create `apps/spfx-portal/app/studio/page.tsx`**

```tsx
import dynamic from 'next/dynamic';

const StudioPage = dynamic(() => import('../../components/StudioPage'), { ssr: false });

export default function Studio() {
  return <StudioPage />;
}
```

- [ ] **Step 2: Create `apps/spfx-portal/components/StudioPage.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useStudioStorage } from '@repo/adaptive';

const DEFAULT_FILES = [
  {
    name: 'HelloWorldWebPart.ts',
    content: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import HelloWorld from './components/HelloWorld';

export default class HelloWorldWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(HelloWorld, {
      description: this.properties.description,
      context: this.context,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
  },
  {
    name: 'components/HelloWorld.tsx',
    content: `import * as React from 'react';

interface IHelloWorldProps {
  description: string;
}

const HelloWorld: React.FC<IHelloWorldProps> = ({ description }) => {
  return (
    <div>
      <h2>Hello SPFx!</h2>
      <p>{description}</p>
    </div>
  );
};

export default HelloWorld;`,
  },
];

export default function StudioPage() {
  const { files: savedFiles, setFiles: persistFiles, loading } = useStudioStorage('spfx');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('HelloWorldWebPart.ts');
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!loading && !bootstrapped.current) {
      bootstrapped.current = true;
      if (savedFiles.length > 0) setFiles(savedFiles);
    }
  }, [loading, savedFiles]);

  const activeContent = files.find((f) => f.name === activeFile)?.content ?? '';

  const handleChange = (value: string | undefined) => {
    const updated = files.map((f) =>
      f.name === activeFile ? { ...f, content: value ?? '' } : f
    );
    setFiles(updated);
  };

  const handleSave = () => persistFiles(files);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">Loading studio…</div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#13131f] border-b border-white/10">
        <span className="text-white/70 text-sm font-semibold mr-4">SPFx Studio</span>
        {files.map((f) => (
          <button
            key={f.name}
            onClick={() => setActiveFile(f.name)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeFile === f.name
                ? 'bg-[var(--color-brand)] text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {f.name.split('/').pop()}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded text-xs bg-[var(--color-accent)] text-white font-semibold hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor — full width, no preview for SPFx */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full">
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={activeContent}
            onChange={handleChange}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
            }}
          />
        </div>
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 bg-[#13131f] border-t border-white/10 text-white/40 text-xs">
        SPFx code cannot run in the browser — use this studio for practice. Run locally with <code className="font-mono">heft start</code>.
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Studio link to `apps/spfx-portal/components/Header.tsx`**

Find the `<nav>` section and add:

```tsx
<Link href="/studio" className="text-sm text-gray-600 hover:text-[var(--color-brand)] transition-colors">
  Studio
</Link>
```

- [ ] **Step 4: Build spfx-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=spfx-portal
```

Expected: `/studio/` appears in page count. Zero TypeScript errors.

- [ ] **Step 5: Commit and push**

```bash
git add apps/spfx-portal/app/studio apps/spfx-portal/components/StudioPage.tsx apps/spfx-portal/components/Header.tsx
git commit -m "feat: add Code Studio to spfx-portal with Monaco editor and save persistence"
git push origin main
```

---

### Task 6: react-portal Project Builder (`/projects` route)

Add a guided Project Builder wizard to react-portal. The user builds a full "Task Manager App" across 5 steps, with Monaco editor, srcdoc preview, and localStorage checkpoint saves.

**Files:**
- Create: `apps/react-portal/content/projects.ts`
- Create: `apps/react-portal/app/projects/page.tsx`
- Create: `apps/react-portal/app/projects/[project]/page.tsx`
- Create: `apps/react-portal/components/ProjectWizard.tsx`
- Modify: `apps/react-portal/components/Header.tsx` (add Projects link)

**Interfaces:**
- Produces: `REACT_PROJECTS: Project[]`
- Consumes: `@monaco-editor/react`, `useAdaptive` from `@repo/adaptive`

- [ ] **Step 1: Create `apps/react-portal/content/projects.ts`**

```ts
export interface ProjectStep {
  title: string;
  instruction: string;
  starterCode: string;
  hint: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate';
  steps: ProjectStep[];
}

export const REACT_PROJECTS: Project[] = [
  {
    slug: 'task-manager',
    title: 'Task Manager App',
    description: 'Build a full task manager with add, complete, and delete — step by step.',
    difficulty: 'beginner',
    steps: [
      {
        title: 'Step 1 — Render a static task list',
        instruction: 'Create an App component that renders a hardcoded list of 3 tasks. Each task is a string in an array. Map over the array and render each task in a <li>.',
        hint: 'Use tasks.map((task, i) => <li key={i}>{task}</li>) inside a <ul>.',
        starterCode: `function App() {
  const tasks = ['Buy groceries', 'Walk the dog', 'Read a book'];

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <ul>
        {/* map over tasks here */}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 2 — Add a task with useState',
        instruction: 'Replace the hardcoded array with useState. Add an <input> and a button. When the button is clicked, push the input value into the tasks array (as a new state — never mutate). Clear the input after adding.',
        hint: 'Use setTasks(prev => [...prev, newTask]) to avoid mutation. Use a separate useState for the input value.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState(['Buy groceries', 'Walk the dog', 'Read a book']);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    // 1. push input to tasks (immutably)
    // 2. clear input
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul>
        {tasks.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 3 — Mark tasks complete',
        instruction: 'Change tasks from strings to objects: { text: string, done: boolean }. Add a checkbox to each task. When the checkbox changes, toggle the done property (immutably — use map). Style done tasks with a line-through.',
        hint: 'setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t)) toggles one task without mutating.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState([
    { text: 'Buy groceries', done: false },
    { text: 'Walk the dog', done: false },
    { text: 'Read a book', done: false },
  ]);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTask = (idx) => {
    // toggle tasks[idx].done immutably
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 4 — Delete tasks',
        instruction: 'Add a Delete button next to each task. When clicked, remove that task from the array using filter.',
        hint: 'setTasks(tasks.filter((_, i) => i !== idx)) removes the task at index idx.',
        starterCode: `function App() {
  const [tasks, setTasks] = React.useState([
    { text: 'Buy groceries', done: false },
    { text: 'Walk the dog', done: false },
    { text: 'Read a book', done: false },
  ]);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };

  const toggleTask = (idx) => {
    setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (idx) => {
    // remove tasks[idx] immutably
  };

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{flex:1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
            <button onClick={() => deleteTask(i)} style={{padding:'4px 8px', borderRadius:'4px', background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:'12px'}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
      {
        title: 'Step 5 — Persist to localStorage',
        instruction: 'Use useEffect to save tasks to localStorage whenever they change. On mount, read the stored tasks and use them as the initial state (with a fallback to the default list). Now your tasks survive page refresh.',
        hint: 'Pass a function to useState as the initial value: useState(() => { const raw = localStorage.getItem("tasks"); return raw ? JSON.parse(raw) : defaultTasks; }). Use useEffect(() => { localStorage.setItem("tasks", JSON.stringify(tasks)); }, [tasks]) to sync.',
        starterCode: `const DEFAULT_TASKS = [
  { text: 'Buy groceries', done: false },
  { text: 'Walk the dog', done: false },
  { text: 'Read a book', done: false },
];

function App() {
  const [tasks, setTasks] = React.useState(() => {
    // read from localStorage here, fallback to DEFAULT_TASKS
    return DEFAULT_TASKS;
  });
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    // save tasks to localStorage here
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks(prev => [...prev, { text: input.trim(), done: false }]);
    setInput('');
  };
  const toggleTask = (idx) => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const deleteTask = (idx) => setTasks(tasks.filter((_, i) => i !== idx));

  return (
    <div style={{fontFamily:'system-ui', padding:'32px', maxWidth:'400px', margin:'0 auto'}}>
      <h1>My Tasks</h1>
      <p style={{color:'#64748b', fontSize:'14px'}}>
        {tasks.filter(t => t.done).length}/{tasks.length} done
      </p>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="New task..." style={{flex:1, padding:'8px', borderRadius:'6px', border:'1px solid #e2e8f0'}} />
        <button onClick={addTask} style={{padding:'8px 16px', borderRadius:'6px', background:'#6366f1', color:'white', border:'none', cursor:'pointer'}}>Add</button>
      </div>
      <ul style={{listStyle:'none', padding:0}}>
        {tasks.map((t, i) => (
          <li key={i} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #f1f5f9'}}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
            <span style={{flex:1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : 'inherit'}}>{t.text}</span>
            <button onClick={() => deleteTask(i)} style={{padding:'4px 8px', borderRadius:'4px', background:'#fee2e2', color:'#dc2626', border:'none', cursor:'pointer', fontSize:'12px'}}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    ],
  },
];
```

- [ ] **Step 2: Create `apps/react-portal/app/projects/page.tsx`**

```tsx
import Link from 'next/link';
import { REACT_PROJECTS } from '../../content/projects';

export default function ProjectsPage() {
  return (
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
  );
}
```

- [ ] **Step 3: Create `apps/react-portal/app/projects/[project]/page.tsx`**

```tsx
import { REACT_PROJECTS } from '../../../content/projects';
import ProjectWizard from '../../../components/ProjectWizard';

export function generateStaticParams() {
  return REACT_PROJECTS.map((p) => ({ project: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const proj = REACT_PROJECTS.find((p) => p.slug === slug);
  if (!proj) return <div className="p-8 text-gray-500">Project not found.</div>;
  return <ProjectWizard project={proj} />;
}
```

- [ ] **Step 4: Create `apps/react-portal/components/ProjectWizard.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAdaptive } from '@repo/adaptive';
import type { Project } from '../content/projects';

const CK_KEY = (slug: string) => `project_checkpoint_${slug}`;

function buildSrcdoc(code: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@19/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<script type="text/babel">
${code}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
<\/script>
</body></html>`;
}

export default function ProjectWizard({ project }: { project: Project }) {
  const { onLabComplete } = useAdaptive('react');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(project.steps[0].starterCode);
  const [preview, setPreview] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(project.slug));
    if (raw) {
      const ck = JSON.parse(raw) as { step: number; completed: number[] };
      setStep(ck.step);
      setCompleted(ck.completed);
      setCode(project.steps[ck.step].starterCode);
    }
  }, [project]);

  const saveCheckpoint = (nextStep: number, nextCompleted: number[]) => {
    localStorage.setItem(CK_KEY(project.slug), JSON.stringify({ step: nextStep, completed: nextCompleted }));
  };

  const handleRun = () => setPreview(buildSrcdoc(code));

  const handleNext = () => {
    const nextCompleted = completed.includes(step) ? completed : [...completed, step];
    const nextStep = Math.min(step + 1, project.steps.length - 1);
    setCompleted(nextCompleted);
    setStep(nextStep);
    setCode(project.steps[nextStep].starterCode);
    setPreview('');
    setShowHint(false);
    saveCheckpoint(nextStep, nextCompleted);
    if (nextCompleted.length === project.steps.length) {
      onLabComplete(project.slug);
    }
  };

  const handleStepClick = (i: number) => {
    setStep(i);
    setCode(project.steps[i].starterCode);
    setPreview('');
    setShowHint(false);
  };

  const currentStep = project.steps[step];
  const allDone = completed.length === project.steps.length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-sm">{project.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{completed.length}/{project.steps.length} steps done</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {project.steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => handleStepClick(i)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${
                  i === step ? 'bg-[var(--color-brand)] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                  completed.includes(i) ? 'bg-green-500 border-green-500 text-white' : 'border-current'
                }`}>
                  {completed.includes(i) ? '✓' : i + 1}
                </span>
                <span className="truncate">{s.title.replace(/^Step \d+ — /, '')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className="flex flex-col w-1/2 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-800 text-sm">{currentStep.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{currentStep.instruction}</p>
            {showHint && (
              <p className="text-sm text-[var(--color-accent)] mt-2 bg-[var(--color-accent)]/10 rounded-lg p-2">
                💡 {currentStep.hint}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowHint(h => !h)} className="text-xs text-gray-500 hover:text-gray-700 underline">
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
            />
          </div>
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 justify-between">
            <button onClick={handleRun} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90">
              ▶ Run
            </button>
            {allDone ? (
              <span className="text-sm text-green-600 font-semibold self-center">🎉 Project complete!</span>
            ) : (
              <button onClick={handleNext} className="px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90">
                {step < project.steps.length - 1 ? 'Next step →' : 'Finish'}
              </button>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className="w-1/2 bg-white">
          {preview ? (
            <iframe sandbox="allow-scripts" srcDoc={preview} className="w-full h-full border-none" title="Preview" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Press <kbd className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">▶ Run</kbd> to see your output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add Projects link to `apps/react-portal/components/Header.tsx`**

Add alongside existing nav links:

```tsx
<Link href="/projects" className="text-sm text-gray-600 hover:text-[var(--color-brand)] transition-colors">
  Projects
</Link>
```

- [ ] **Step 6: Build react-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=react-portal
```

Expected: `/projects/` and `/projects/task-manager/` in page count. Zero TypeScript errors.

- [ ] **Step 7: Commit and push**

```bash
git add apps/react-portal/content/projects.ts apps/react-portal/app/projects apps/react-portal/components/ProjectWizard.tsx apps/react-portal/components/Header.tsx
git commit -m "feat: add Project Builder wizard to react-portal"
git push origin main
```

---

### Task 7: spfx-portal Project Builder (`/projects` route)

Add a Project Builder to spfx-portal. The user builds a "Team Calendar Web Part" across 5 steps. No live preview — steps show code to write, Monaco for practice, and a "Mark done" checkpoint per step.

**Files:**
- Create: `apps/spfx-portal/content/projects.ts`
- Create: `apps/spfx-portal/app/projects/page.tsx`
- Create: `apps/spfx-portal/app/projects/[project]/page.tsx`
- Create: `apps/spfx-portal/components/SpfxProjectWizard.tsx`
- Modify: `apps/spfx-portal/components/Header.tsx` (add Projects link)

**Interfaces:**
- Produces: `SPFX_PROJECTS: SpfxProject[]`
- Consumes: `useAdaptive` from `@repo/adaptive`, `@monaco-editor/react`

- [ ] **Step 1: Create `apps/spfx-portal/content/projects.ts`**

```ts
export interface SpfxProjectStep {
  title: string;
  instruction: string;
  codeFile: string;
  code: string;
  hint: string;
}

export interface SpfxProject {
  slug: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate';
  steps: SpfxProjectStep[];
}

export const SPFX_PROJECTS: SpfxProject[] = [
  {
    slug: 'team-calendar-webpart',
    title: 'Team Calendar Web Part',
    description: 'Build an SPFx web part that displays SharePoint calendar events using PnPjs.',
    difficulty: 'intermediate',
    steps: [
      {
        title: 'Step 1 — Scaffold the web part class',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Create the web part class that extends BaseClientSideWebPart. Implement render() to mount a React component into this.domElement, and onDispose() to unmount it.',
        hint: 'Use ReactDom.render(React.createElement(TeamCalendar, { context: this.context }), this.domElement) in render().',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import TeamCalendar from './components/TeamCalendar';

export default class TeamCalendarWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
      },
      {
        title: 'Step 2 — Initialize PnPjs in onInit',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Override onInit() to configure PnPjs with the SPFx context. Import spfi and SPFx from @pnp/sp and @pnp/sp/presets/all. Call spfi().using(SPFx(this)) and store the result on the class.',
        hint: 'protected async onInit(): Promise<void> { await super.onInit(); this.sp = spfi().using(SPFx(this)); }',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/presets/all';
import TeamCalendar from './components/TeamCalendar';

export default class TeamCalendarWebPart extends BaseClientSideWebPart<{}> {
  private sp: ReturnType<typeof spfi>;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.sp = spfi().using(SPFx(this));
  }

  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
      sp: this.sp,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}`,
      },
      {
        title: 'Step 3 — Create the React component',
        codeFile: 'src/webparts/teamCalendar/components/TeamCalendar.tsx',
        instruction: 'Create a TeamCalendar functional component. It receives context and sp as props. On mount, fetch events from a SharePoint list called "Team Calendar" using sp.web.lists.getByTitle("Team Calendar").items(). Store them in state.',
        hint: 'Use useEffect with an async IIFE: useEffect(() => { (async () => { const items = await sp.web.lists.getByTitle("Team Calendar").items(); setEvents(items); })(); }, []);',
        code: `import * as React from 'react';
import { spfi } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface ITeamCalendarProps {
  context: WebPartContext;
  sp: ReturnType<typeof spfi>;
}

interface ICalendarEvent {
  Id: number;
  Title: string;
  EventDate: string;
  EndDate: string;
}

const TeamCalendar: React.FC<ITeamCalendarProps> = ({ sp }) => {
  const [events, setEvents] = React.useState<ICalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const items = await sp.web.lists
          .getByTitle('Team Calendar')
          .items
          .select('Id', 'Title', 'EventDate', 'EndDate')();
        setEvents(items);
      } catch (e) {
        console.error('Failed to fetch events', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (events.length === 0) return <div>No events found in "Team Calendar" list.</div>;

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui', padding: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Team Calendar</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map((e) => (
          <li key={e.Id} style={{ padding: '10px 0', borderBottom: '1px solid #edebe9' }}>
            <strong>{e.Title}</strong>
            <br />
            <span style={{ fontSize: '13px', color: '#605e5c' }}>
              {new Date(e.EventDate).toLocaleDateString()} – {new Date(e.EndDate).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamCalendar;`,
      },
      {
        title: 'Step 4 — Add property pane for list name',
        codeFile: 'src/webparts/teamCalendar/TeamCalendarWebPart.ts',
        instruction: 'Add a listName property to the web part properties interface so admins can configure which list to read events from. Implement getPropertyPaneConfiguration() with a PropertyPaneTextField for "listName".',
        hint: 'Import { PropertyPaneConfiguration, PropertyPaneTextField } from @microsoft/sp-property-pane. Return them from getPropertyPaneConfiguration().',
        code: `import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  PropertyPaneConfiguration,
  PropertyPaneTextField,
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/presets/all';
import TeamCalendar from './components/TeamCalendar';

export interface ITeamCalendarWebPartProps {
  listName: string;
}

export default class TeamCalendarWebPart extends BaseClientSideWebPart<ITeamCalendarWebPartProps> {
  private sp: ReturnType<typeof spfi>;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.sp = spfi().using(SPFx(this));
  }

  public render(): void {
    const element = React.createElement(TeamCalendar, {
      context: this.context,
      sp: this.sp,
      listName: this.properties.listName || 'Team Calendar',
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configure Team Calendar' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('listName', {
                  label: 'Calendar List Name',
                  description: 'The name of the SharePoint list containing calendar events',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}`,
      },
      {
        title: 'Step 5 — Package and prepare for deployment',
        codeFile: 'config/package-solution.json',
        instruction: 'Update package-solution.json to version 1.0.0.0 and set isDomainIsolated to false for tenant deployment. Add the required permissions for SharePoint access under webApiPermissionRequests.',
        hint: 'Set "version": "1.0.0.0" and "skipFeatureDeployment": true for tenant-wide deployment. Add "webApiPermissionRequests": [{"resource": "SharePoint", "scope": "AllSites.Read"}].',
        code: `{
  "$schema": "https://developer.microsoft.com/json-schemas/core-build/package-solution/2017-02/package-solution.schema.json",
  "solution": {
    "name": "team-calendar-client-side-solution",
    "id": "your-unique-guid-here",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "",
      "websiteUrl": "",
      "privacyUrl": "",
      "termsOfUseUrl": "",
      "mpnId": "Undefined-1.18.1"
    },
    "webApiPermissionRequests": [
      {
        "resource": "SharePoint",
        "scope": "AllSites.Read"
      }
    ],
    "metadata": {
      "shortDescription": { "default": "Team Calendar Web Part" },
      "longDescription": { "default": "Displays SharePoint calendar events" },
      "screenshotPaths": [],
      "videoUrl": "",
      "categories": []
    },
    "features": []
  },
  "paths": {
    "zippedPackage": "solution/team-calendar.sppkg"
  }
}`,
      },
    ],
  },
];
```

- [ ] **Step 2: Create `apps/spfx-portal/app/projects/page.tsx`**

```tsx
import Link from 'next/link';
import { SPFX_PROJECTS } from '../../content/projects';

export default function ProjectsPage() {
  return (
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
  );
}
```

- [ ] **Step 3: Create `apps/spfx-portal/app/projects/[project]/page.tsx`**

```tsx
import { SPFX_PROJECTS } from '../../../content/projects';
import SpfxProjectWizard from '../../../components/SpfxProjectWizard';

export function generateStaticParams() {
  return SPFX_PROJECTS.map((p) => ({ project: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project: slug } = await params;
  const proj = SPFX_PROJECTS.find((p) => p.slug === slug);
  if (!proj) return <div className="p-8 text-gray-500">Project not found.</div>;
  return <SpfxProjectWizard project={proj} />;
}
```

- [ ] **Step 4: Create `apps/spfx-portal/components/SpfxProjectWizard.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAdaptive } from '@repo/adaptive';
import type { SpfxProject } from '../content/projects';

const CK_KEY = (slug: string) => `spfx_project_checkpoint_${slug}`;

export default function SpfxProjectWizard({ project }: { project: SpfxProject }) {
  const { onLabComplete } = useAdaptive('spfx');
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(project.steps[0].code);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(project.slug));
    if (raw) {
      const ck = JSON.parse(raw) as { step: number; completed: number[] };
      setStep(ck.step);
      setCompleted(ck.completed);
      setCode(project.steps[ck.step].code);
    }
  }, [project]);

  const saveCheckpoint = (nextStep: number, nextCompleted: number[]) => {
    localStorage.setItem(CK_KEY(project.slug), JSON.stringify({ step: nextStep, completed: nextCompleted }));
  };

  const handleMarkDone = () => {
    const nextCompleted = completed.includes(step) ? completed : [...completed, step];
    const nextStep = Math.min(step + 1, project.steps.length - 1);
    setCompleted(nextCompleted);
    saveCheckpoint(nextStep, nextCompleted);
    if (nextCompleted.length === project.steps.length) {
      onLabComplete(project.slug);
    }
    if (step < project.steps.length - 1) {
      setStep(nextStep);
      setCode(project.steps[nextStep].code);
      setShowHint(false);
    }
  };

  const handleStepClick = (i: number) => {
    setStep(i);
    setCode(project.steps[i].code);
    setShowHint(false);
  };

  const currentStep = project.steps[step];
  const allDone = completed.length === project.steps.length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-sm">{project.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{completed.length}/{project.steps.length} steps done</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-2">
          {project.steps.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => handleStepClick(i)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${
                  i === step ? 'bg-[var(--color-brand)] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                  completed.includes(i) ? 'bg-green-500 border-green-500 text-white' : 'border-current'
                }`}>
                  {completed.includes(i) ? '✓' : i + 1}
                </span>
                <span className="truncate">{s.title.replace(/^Step \d+ — /, '')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main: full-width editor (no preview for SPFx) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">{currentStep.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{currentStep.instruction}</p>
              {showHint && (
                <p className="text-sm text-[var(--color-accent)] mt-2 bg-[var(--color-accent)]/10 rounded-lg p-2">
                  💡 {currentStep.hint}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono flex-shrink-0">{currentStep.codeFile}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowHint(h => !h)} className="text-xs text-gray-500 hover:text-gray-700 underline">
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={currentStep.codeFile.endsWith('.json') ? 'json' : 'typescript'}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{ fontSize: 13, minimap: { enabled: true }, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 } }}
          />
        </div>

        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <p className="text-xs text-gray-400">
            SPFx cannot run in the browser. Test locally with <code className="font-mono">heft start</code>.
          </p>
          {allDone ? (
            <span className="text-sm text-green-600 font-semibold">🎉 Project complete!</span>
          ) : (
            <button
              onClick={handleMarkDone}
              className="px-4 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:opacity-90"
            >
              {step < project.steps.length - 1 ? 'Mark done & next →' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add Projects link to `apps/spfx-portal/components/Header.tsx`**

```tsx
<Link href="/projects" className="text-sm text-gray-600 hover:text-[var(--color-brand)] transition-colors">
  Projects
</Link>
```

- [ ] **Step 6: Build spfx-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=spfx-portal
```

Expected: `/projects/` and `/projects/team-calendar-webpart/` in page count. Zero TypeScript errors.

- [ ] **Step 7: Commit and push**

```bash
git add apps/spfx-portal/content/projects.ts apps/spfx-portal/app/projects apps/spfx-portal/components/SpfxProjectWizard.tsx apps/spfx-portal/components/Header.tsx
git commit -m "feat: add Project Builder wizard to spfx-portal"
git push origin main
```

---

### Task 8: spfx-portal SPFx Deploy Labs (`/deploy-labs` route)

Add a checklist-driven deployment walkthrough to spfx-portal. Users work through the 5 real deployment steps — build, package, upload, approve, add to site — marking each done. Progress saved to localStorage.

**Files:**
- Create: `apps/spfx-portal/content/deployLabs.ts`
- Create: `apps/spfx-portal/app/deploy-labs/page.tsx`
- Create: `apps/spfx-portal/components/DeployLab.tsx`
- Modify: `apps/spfx-portal/components/Header.tsx` (add Deploy Labs link)

**Interfaces:**
- Produces: `DEPLOY_LABS: DeployLab[]`
- Consumes: `useAdaptive` from `@repo/adaptive`

- [ ] **Step 1: Create `apps/spfx-portal/content/deployLabs.ts`**

```ts
export interface DeployStep {
  title: string;
  description: string;
  command?: string;
  adminNote?: string;
}

export interface DeployLab {
  slug: string;
  title: string;
  description: string;
  steps: DeployStep[];
}

export const DEPLOY_LABS: DeployLab[] = [
  {
    slug: 'tenant-deploy',
    title: 'Deploy to Tenant App Catalog',
    description: 'Walk through the full pipeline: build your web part, upload to the App Catalog, approve permissions, and add to a SharePoint site.',
    steps: [
      {
        title: 'Build the production bundle',
        description: 'Run the production build to generate the minified bundle. This creates the .sppkg file in the sharepoint/solution/ folder.',
        command: 'heft build --production && gulp bundle --ship && gulp package-solution --ship',
        adminNote: 'The --ship flag enables production optimizations. Your .sppkg will be in sharepoint/solution/.',
      },
      {
        title: 'Upload .sppkg to Tenant App Catalog',
        description: 'Go to your SharePoint Admin Center → Apps → App Catalog → Apps for SharePoint. Click Upload and select your .sppkg file. When prompted, check "Make this solution available to all sites in the organization" for tenant-wide deployment.',
        adminNote: 'You need SharePoint Admin or Global Admin privileges for this step.',
      },
      {
        title: 'Approve API permissions',
        description: 'In the SharePoint Admin Center, go to Advanced → API access. Your pending permission requests from webApiPermissionRequests in package-solution.json appear here. Approve each one.',
        adminNote: 'If no permissions appear, your web part does not request API access — skip this step.',
      },
      {
        title: 'Add the web part to a site',
        description: 'If you did NOT use tenant-wide deployment, go to the target SharePoint site → Site Contents → Add an app → find your solution and install it. For tenant-wide, the web part is already available in every site.',
      },
      {
        title: 'Add the web part to a page',
        description: 'Edit a SharePoint page → click the + button to add a web part → find your web part by name in the web part picker → select it. Configure properties in the property pane on the right. Save and publish the page.',
        adminNote: 'The web part may take up to 5 minutes to appear in the picker after deployment.',
      },
    ],
  },
  {
    slug: 'update-version',
    title: 'Update and Redeploy',
    description: 'Update your web part version, rebuild, re-upload, and verify the update propagates to existing pages.',
    steps: [
      {
        title: 'Bump the version in package-solution.json',
        description: 'Open config/package-solution.json. Increment the "version" field (e.g. "1.0.0.0" → "1.1.0.0"). SharePoint uses this version to detect updates.',
        command: '# Edit config/package-solution.json manually\n# Change "version": "1.0.0.0" to "version": "1.1.0.0"',
      },
      {
        title: 'Also bump the version in package.json',
        description: 'Open package.json at the project root. Update "version" to match (e.g. "1.1.0"). Keeping both in sync prevents confusion.',
        command: 'npm version minor --no-git-tag-version',
      },
      {
        title: 'Rebuild and repackage',
        description: 'Run the full production build again to generate a new .sppkg with the updated version.',
        command: 'heft build --production && gulp bundle --ship && gulp package-solution --ship',
      },
      {
        title: 'Re-upload to App Catalog',
        description: 'Upload the new .sppkg to the App Catalog. When prompted to replace the existing solution, click Replace. SharePoint will push the update to all sites automatically (for tenant-wide deployments).',
        adminNote: 'Pages already using the web part get the update automatically. No need to re-add the web part to pages.',
      },
      {
        title: 'Verify the update',
        description: 'Go to a page using your web part and do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R). Open the browser devtools Network tab, filter by your bundle name, and confirm the response headers show the new version.',
      },
    ],
  },
];
```

- [ ] **Step 2: Create `apps/spfx-portal/app/deploy-labs/page.tsx`**

```tsx
import Link from 'next/link';
import { DEPLOY_LABS } from '../../content/deployLabs';

export default function DeployLabsPage() {
  return (
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
  );
}
```

- [ ] **Step 3: Create route `apps/spfx-portal/app/deploy-labs/[lab]/page.tsx`**

```tsx
import { DEPLOY_LABS } from '../../../content/deployLabs';
import DeployLab from '../../../components/DeployLab';

export function generateStaticParams() {
  return DEPLOY_LABS.map((l) => ({ lab: l.slug }));
}

export default async function DeployLabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = DEPLOY_LABS.find((l) => l.slug === slug);
  if (!lab) return <div className="p-8 text-gray-500">Lab not found.</div>;
  return <DeployLab lab={lab} />;
}
```

- [ ] **Step 4: Create `apps/spfx-portal/components/DeployLab.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdaptive } from '@repo/adaptive';
import type { DeployLab as IDeployLab } from '../content/deployLabs';

const CK_KEY = (slug: string) => `deploy_lab_${slug}`;

export default function DeployLab({ lab }: { lab: IDeployLab }) {
  const { onLabComplete } = useAdaptive('spfx');
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CK_KEY(lab.slug));
    if (raw) setChecked(JSON.parse(raw));
  }, [lab.slug]);

  const toggle = (i: number) => {
    const next = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
    setChecked(next);
    localStorage.setItem(CK_KEY(lab.slug), JSON.stringify(next));
    if (next.length === lab.steps.length) {
      onLabComplete(lab.slug);
    }
  };

  const reset = () => {
    setChecked([]);
    localStorage.removeItem(CK_KEY(lab.slug));
  };

  const allDone = checked.length === lab.steps.length;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{lab.title}</h1>
          <p className="text-gray-500 mt-1">{lab.description}</p>
        </div>
        <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline mt-1">
          Reset
        </button>
      </div>

      {allDone && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 font-semibold text-sm">
          🎉 All steps complete! Your web part is deployed.
        </div>
      )}

      <div className="space-y-4">
        {lab.steps.map((step, i) => {
          const done = checked.includes(i);
          return (
            <div
              key={i}
              className={`rounded-xl border-2 p-5 transition-colors ${
                done ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(i)}
                  className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-[var(--color-brand)]'
                  }`}
                >
                  {done && <span className="text-xs">✓</span>}
                </button>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm mb-1 ${done ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    Step {i + 1}: {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.command && (
                    <pre className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {step.command}
                    </pre>
                  )}
                  {step.adminNote && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
                      ⚠️ {step.adminNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        {checked.length}/{lab.steps.length} steps completed — progress saved automatically
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Add Deploy Labs link to `apps/spfx-portal/components/Header.tsx`**

```tsx
<Link href="/deploy-labs" className="text-sm text-gray-600 hover:text-[var(--color-brand)] transition-colors">
  Deploy Labs
</Link>
```

- [ ] **Step 6: Build spfx-portal**

```bash
cd /Users/sudharsank/Projects/react-spfx-learn
pnpm turbo run build --filter=spfx-portal
```

Expected: `/deploy-labs/`, `/deploy-labs/tenant-deploy/`, `/deploy-labs/update-version/` in page count. Zero TypeScript errors.

- [ ] **Step 7: Commit and push**

```bash
git add apps/spfx-portal/content/deployLabs.ts apps/spfx-portal/app/deploy-labs apps/spfx-portal/components/DeployLab.tsx apps/spfx-portal/components/Header.tsx
git commit -m "feat: add SPFx Deploy Labs checklist to spfx-portal"
git push origin main
```

---

## Progress Ledger

File: `/Users/sudharsank/Projects/react-spfx-learn/.superpowers/sdd/progress.md`

Append to the ledger after each task:
```
# Phase 3 + Content Gaps
Task 1: complete (commits <base7>..<head7>, review clean)
Task 2: complete (...)
...
```
